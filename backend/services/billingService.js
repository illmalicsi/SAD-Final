// Get invoices for a specific user
async function getInvoicesByUser(userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}
const { pool } = require('../config/database');
const { notifyAllAdmins, notifyUser } = require('./notificationService');
const fs = require('fs');
const path = require('path');
const emailService = require('./emailService');

// Helper: format invoice number as INV-YYYYMMDD-000NNN using invoiceId and date
function formatInvoiceNumber(invoiceId, dateInput) {
  const now = dateInput ? new Date(dateInput) : new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const idPart = String(invoiceId).padStart(6, '0');
  return `INV-${y}${m}${d}-${idPart}`;
}

// Send a PDF file as an attachment via SendGrid (lazy-require).
// Requires environment variable: SENDGRID_API_KEY. Optional: SENDGRID_FROM
async function sendPdfViaSendGrid(filePath, toEmail, opts = {}) {
  try {
    if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY not set');
    let sgMail = null;
    try {
      sgMail = require('@sendgrid/mail');
    } catch (e) {
      console.warn('SendGrid client not installed (npm install @sendgrid/mail) — skipping send');
      return false;
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const fileBuffer = fs.readFileSync(filePath);
    const content = fileBuffer.toString('base64');
    const filename = opts.filename || path.basename(filePath);
    const from = process.env.SENDGRID_FROM || process.env.EMAIL_USER || 'no-reply@example.com';
    const msg = {
      to: toEmail,
      from,
      subject: opts.subject || `Your receipt ${opts.receiptNumber || ''}`,
      text: opts.text || 'Please find attached your payment receipt.',
      html: opts.html || `<p>Hi,</p><p>Your payment receipt is attached to this email.</p>`,
      attachments: [
        {
          content,
          filename,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);
    return true;
  } catch (err) {
    console.warn('sendPdfViaSendGrid failed:', err && err.message);
    return false;
  }
}

// Generate a new invoice
async function generateInvoice(userId, amount, description) {
  // Defensive logging: warn when amount is missing or non-positive so it's
  // visible in server logs for debugging. We do not modify behavior; this is
  // non-breaking and only helps identify flows that pass 0 or null amounts.
  if (amount == null || Number(amount) <= 0) {
    console.warn(`billingService.generateInvoice called with non-positive amount=${amount} for userId=${userId}. Review caller.`);
  }

  // Insert minimal row first, then set a human-friendly invoice_number using the insertId
  const [result] = await pool.execute(
    `INSERT INTO invoices (user_id, amount, description, status, payment_status) VALUES (?, ?, ?, 'pending', 'unpaid')`,
    [userId, amount, description]
  );
  const invoiceId = result.insertId;

  // Generate invoice number (e.g., INV-20251027-000123)
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const invoiceNumber = `INV-${y}${m}${d}-${String(invoiceId).padStart(6, '0')}`;

  await pool.execute(
    `UPDATE invoices SET invoice_number = ?, issue_date = NOW() WHERE invoice_id = ?`,
    [invoiceNumber, invoiceId]
  );

  const [rows] = await pool.execute(
    `SELECT * FROM invoices WHERE invoice_id = ?`,
    [invoiceId]
  );
  return rows[0];
}

// Record an expense
async function addExpense(amount, category, description, incurredBy = null) {
  const [result] = await pool.execute(
    `INSERT INTO expenses (amount, category, description, incurred_by) VALUES (?, ?, ?, ?)`,
    [amount, category, description, incurredBy]
  );
  const expenseId = result.insertId;
  const [rows] = await pool.execute(`SELECT * FROM expenses WHERE expense_id = ?`, [expenseId]);
  return rows[0];
}

// Get expenses (admin view) with optional date range
async function getExpenses(fromDate = null, toDate = null) {
  if (fromDate && toDate) {
    const [rows] = await pool.execute(`SELECT * FROM expenses WHERE DATE(incurred_at) BETWEEN ? AND ? ORDER BY incurred_at DESC`, [fromDate, toDate]);
    return rows;
  }
  const [rows] = await pool.execute(`SELECT * FROM expenses ORDER BY incurred_at DESC`);
  return rows;
}

// Generate a simple financial report (income, expenses, profit) for a date range
async function getFinancialReport(fromDate = null, toDate = null) {
  // Income: sum of invoice amounts (approved/paid) within date range
  let incomeQuery = `SELECT COALESCE(SUM(amount),0) AS total_income FROM invoices WHERE status IN ('approved','paid')`;
  let expenseQuery = `SELECT COALESCE(SUM(amount),0) AS total_expenses FROM expenses`;
  const params = [];
  const params2 = [];
  if (fromDate && toDate) {
    incomeQuery += ' AND DATE(issue_date) BETWEEN ? AND ?';
    expenseQuery += ' WHERE DATE(incurred_at) BETWEEN ? AND ?';
    params.push(fromDate, toDate);
    params2.push(fromDate, toDate);
  }
  const [[inc]] = await pool.execute(incomeQuery, params);
  const [[exp]] = await pool.execute(expenseQuery, params2);
  const income = Number(inc?.total_income || 0);
  const expenses = Number(exp?.total_expenses || 0);
  const profit = income - expenses;
  return { income, expenses, profit, fromDate, toDate };
}

// Approve an existing invoice
async function approveInvoice(invoiceId) {
  const [result] = await pool.execute(
    `UPDATE invoices SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE invoice_id = ?`,
    [invoiceId]
  );
  return result.affectedRows > 0;
}

// Process payment for an invoice (supports partial payments)
async function processPayment(invoiceId, processedBy, amountPaid, paymentMethod = 'cash', notes = null, forceFull = false) {
  // Defensive step: ensure invoice.amount is present and non-zero. If invoice.amount is 0
  // (legacy/repair case), attempt to compute a sensible amount from a linked rent_request
  // before inserting a payment. This helps payments apply correctly for historical rows.
  const [[invRow]] = await pool.execute(
    `SELECT i.amount AS invoice_amount, rr.request_id, rr.total_amount, rr.rental_fee, rr.start_date, rr.end_date, rr.quantity
       FROM invoices i
       LEFT JOIN rent_requests rr ON rr.invoice_id = i.invoice_id
      WHERE i.invoice_id = ?`,
    [invoiceId]
  );

  let invoiceAmount = Number(invRow?.invoice_amount || 0);
  const linkedRequestId = invRow?.request_id || null;

  if ((!invoiceAmount || invoiceAmount <= 0) && linkedRequestId) {
    // Try to derive a total from the rent_request row
    let computed = null;
    if (invRow.total_amount && Number(invRow.total_amount) > 0) {
      computed = Number(invRow.total_amount);
    } else if (invRow.rental_fee && invRow.start_date && invRow.end_date) {
      try {
        const [[daysRow]] = await pool.execute(
          `SELECT (TIMESTAMPDIFF(DAY, ?, ?) + 1) AS days`,
          [invRow.start_date, invRow.end_date]
        );
        const days = Number(daysRow?.days) || 1;
        const qty = Number(invRow.quantity) || 1;
        computed = Number(invRow.rental_fee) * days * qty;
      } catch (dErr) {
        computed = null;
      }
    }

    if (computed && computed > 0) {
      console.log(`🔧 Repairing invoice ${invoiceId} amount using linked rent_request ${linkedRequestId}: setting amount = ${computed}`);
      await pool.execute(`UPDATE invoices SET amount = ? WHERE invoice_id = ?`, [computed, invoiceId]);
      invoiceAmount = computed;
    }
  }

  // Before inserting, compute current total paid to determine outstanding balance
  const [[paidRow]] = await pool.execute(
    `SELECT COALESCE(SUM(p.amount_paid),0) AS total_paid FROM payments p WHERE p.invoice_id = ?`,
    [invoiceId]
  );
  const currentTotalPaid = Number(paidRow?.total_paid || 0);
  const outstandingBefore = Math.max(0, invoiceAmount - currentTotalPaid);

  // Enforce full payment when requested: reject partial payments if forceFull is true
  if (forceFull && Number(amountPaid) < outstandingBefore) {
    const err = new Error('Full payment required by reminder; partial/down payments are not allowed.');
    err.status = 400;
    throw err;
  }

  // Insert payment record (with method and notes)
  const [payRes] = await pool.execute(
    `INSERT INTO payments (invoice_id, amount_paid, payment_method, processed_by, notes) VALUES (?, ?, ?, ?, ?)`,
    [invoiceId, amountPaid, paymentMethod, processedBy, notes]
  );

  // Compute total paid vs invoice amount
  // Compute invoice amount and total paid using a subquery to avoid GROUP BY issues
  const [[sumRow]] = await pool.execute(
    `SELECT i.amount AS invoice_amount,
            COALESCE((SELECT SUM(p.amount_paid) FROM payments p WHERE p.invoice_id = i.invoice_id), 0) AS total_paid
       FROM invoices i
      WHERE i.invoice_id = ?`,
    [invoiceId]
  );

  invoiceAmount = Number(sumRow?.invoice_amount || 0);
  const totalPaid = Number(sumRow?.total_paid || 0);

  // Fallback: if invoice amount is still missing or zero, use totalPaid (sum of payments)
  // as the invoice amount so the UI can display a sensible 'Amount Required'. This
  // covers cases where legacy invoices were created with amount = 0 and no linked
  // rent_request could provide a computed total. We update the invoice record once.
  if ((!invoiceAmount || invoiceAmount <= 0) && totalPaid > 0) {
    try {
      await pool.execute(`UPDATE invoices SET amount = ? WHERE invoice_id = ?`, [totalPaid, invoiceId]);
      invoiceAmount = totalPaid;
      console.log(`🔧 Backfilled invoice ${invoiceId} amount from payments: ${invoiceAmount}`);
    } catch (uErr) {
      console.warn('Failed to backfill invoice amount from payments:', uErr && uErr.message);
    }
  }

  // Mark invoice paid only when fully covered
  if (totalPaid >= invoiceAmount && invoiceAmount > 0) {
    await pool.execute(
      `UPDATE invoices SET status = 'paid' WHERE invoice_id = ?`,
      [invoiceId]
    );
  }

  // Update the invoice.payment_status field based on totals so customer payments reflect correctly
  try {
    let newPaymentStatus = 'unpaid';
    if (invoiceAmount > 0 && totalPaid >= invoiceAmount) newPaymentStatus = 'paid';
    else if (totalPaid > 0) newPaymentStatus = 'partial';
    await pool.execute(`UPDATE invoices SET payment_status = ? WHERE invoice_id = ?`, [newPaymentStatus, invoiceId]);
    console.log(`[processPayment] invoice ${invoiceId} payment_status set to ${newPaymentStatus}`);
  } catch (psErr) {
    console.warn('Failed to update invoice.payment_status:', psErr && psErr.message);
  }

  // Insert transaction record
  console.log(`💰 Creating transaction record for invoice ${invoiceId}, amount: ${amountPaid}`);
  const [transRes] = await pool.execute(
    `INSERT INTO transactions (user_id, invoice_id, amount, transaction_type, status, description, payment_method) VALUES (
      (SELECT user_id FROM invoices WHERE invoice_id = ?),
      ?, ?, 'payment', 'completed', ?, ?
    )`,
    [invoiceId, invoiceId, amountPaid, (paymentMethod ? `Payment via ${paymentMethod}` : (notes || null)), (paymentMethod || null)]
  );
  console.log(`✅ Transaction created - ID: ${transRes.insertId}`);
  // Create a receipt record so there's a first-class receipt persisted in DB.
  let receiptObj = null;
  try {
    // Compute priorPaid to determine receipt_type
    const priorPaid = Math.max(0, (totalPaid || 0) - Number(amountPaid));
    let receiptType = 'downpayment';
    if (priorPaid === 0 && (Number(amountPaid) >= invoiceAmount)) {
      receiptType = 'full_payment';
    } else if (priorPaid > 0 && (Number(totalPaid) >= invoiceAmount)) {
      receiptType = 'final_payment';
    } else if (priorPaid === 0 && Number(amountPaid) < invoiceAmount) {
      receiptType = 'downpayment';
    }

    // Insert minimal receipt row; PDF generation and file save will be handled separately
    const [rc] = await pool.execute(
      `INSERT INTO receipts (receipt_number, user_id, rent_request_id, invoice_id, receipt_type, amount_paid, payment_method, transaction_reference, total_amount, remaining_balance, pdf_path, issued_by)
       VALUES (?, (SELECT user_id FROM invoices WHERE invoice_id = ?),
         (SELECT request_id FROM rent_requests WHERE invoice_id = ? LIMIT 1), ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [
        // receipt_number placeholder, will update after insert with human-friendly number
        'TBD',
        invoiceId,
        invoiceId,
        invoiceId,
        receiptType,
        Number(amountPaid),
        paymentMethod || 'cash',
        null,
        Number(invoiceAmount || 0),
        Math.max(0, Number(invoiceAmount || 0) - Number(totalPaid || 0))
      ]
    );

    const receiptId = rc.insertId;
    if (receiptId) {
      // Generate a readable receipt number and update
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const receiptNumber = `RCPT-${y}${m}${d}-${String(receiptId).padStart(6,'0')}`;
      await pool.execute(`UPDATE receipts SET receipt_number = ? WHERE receipt_id = ?`, [receiptNumber, receiptId]);
      console.log(`✅ Receipt created - ID: ${receiptId}, Number: ${receiptNumber}`);
      receiptObj = { receipt_id: receiptId, receipt_number: receiptNumber };

      // Attempt to generate a PDF receipt (uses pdfkit if installed). Falls back gracefully.
      try {
        const [[invoiceInfo]] = await pool.execute(
          `SELECT i.*, u.first_name, u.last_name, u.email FROM invoices i JOIN users u ON i.user_id = u.id WHERE i.invoice_id = ? LIMIT 1`,
          [invoiceId]
        );

        let pdfPath = null;
        // Lazy-require pdfkit so server can run without installing it during dev
        let PDFDocument = null;
        try {
          PDFDocument = require('pdfkit');
        } catch (e) {
          console.warn('pdfkit not installed, skipping PDF generation. To enable, run: npm install pdfkit');
        }

        if (PDFDocument) {
          try {
            const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
            fs.mkdirSync(receiptsDir, { recursive: true });
            const safeInvoice = invoiceInfo && invoiceInfo.invoice_number ? invoiceInfo.invoice_number.replace(/[^a-zA-Z0-9-_\.]/g,'') : `inv-${invoiceId}`;
            const filename = `receipt-${receiptNumber || receiptId}-${safeInvoice}.pdf`;
            const outPath = path.join(receiptsDir, filename);

            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const stream = fs.createWriteStream(outPath);
            doc.pipe(stream);

            // Try to include logo from frontend public folder (dbemb/public/logo.png)
            const logoPath = path.join(__dirname, '..', 'dbemb', 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
              try { doc.image(logoPath, 40, 30, { width: 120 }); } catch (imErr) { /* ignore */ }
            } else {
              // Draw company name as fallback
              doc.fontSize(20).text('DAVAO BLUE EAGLES', { align: 'left' });
            }

            // Header
            doc.fontSize(18).text('Payment Receipt', { align: 'center' });
            doc.moveDown(0.5);

            // Use invoice number prominently (user requested)
            const invNumber = (invoiceInfo && invoiceInfo.invoice_number)
              ? invoiceInfo.invoice_number
              : formatInvoiceNumber(invoiceId, invoiceInfo && invoiceInfo.issue_date);
            doc.fontSize(12).text(`Invoice: ${invNumber}`, { align: 'right' });
            doc.fontSize(12).text(`Receipt: ${receiptNumber}`, { align: 'right' });

            doc.moveDown();
            // Customer and payment info
            const customerName = `${invoiceInfo?.first_name || ''} ${invoiceInfo?.last_name || ''}`.trim();
            doc.fontSize(12).text(`Customer: ${customerName}`);
            const paidAt = new Date();
            doc.text(`Date: ${paidAt.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);

            doc.moveDown(1);
            // Amount section with separator and nicer styling
            const formattedAmount = Number(amountPaid || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#166534').text('Amount Paid', { continued: false });
            doc.moveDown(0.2);
            doc.fontSize(20).fillColor('#059669').text(formattedAmount);

            doc.moveDown(1);
            // Optional details block
            if (invoiceInfo && invoiceInfo.description) {
              doc.fontSize(10).fillColor('#374151').text(`Description: ${invoiceInfo.description}`);
            }

            doc.moveDown(2);
            doc.fontSize(10).fillColor('#6b7280').text('This is a computer-generated receipt.', { align: 'center' });

            doc.end();

            await new Promise((resolve, reject) => stream.on('finish', resolve).on('error', reject));
            pdfPath = `/uploads/receipts/${filename}`;
            await pool.execute(`UPDATE receipts SET pdf_path = ? WHERE receipt_id = ?`, [pdfPath, receiptId]);
            console.log(`✅ Receipt PDF generated: ${pdfPath}`);

            // If SendGrid is configured, try sending the PDF as an email attachment
            try {
              if (process.env.SENDGRID_API_KEY && invoiceInfo && invoiceInfo.email) {
                const fullPath = path.join(__dirname, '..', 'uploads', 'receipts', filename);
                const sent = await sendPdfViaSendGrid(fullPath, invoiceInfo.email, { filename, receiptNumber, subject: `Your receipt ${receiptNumber}`, receiptNumber });
                if (sent) console.log(`✅ Receipt emailed to ${invoiceInfo.email} via SendGrid`);
              }
            } catch (sgErr) {
              console.warn('Failed to send receipt via SendGrid:', sgErr && sgErr.message);
            }

            // Notify customer with receipt URL so it appears as a downloadable notification
            try {
              if (invoiceInfo && invoiceInfo.email) {
                const origin = process.env.PUBLIC_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;
                const receiptUrl = `${origin}${pdfPath}`;
                await notifyUser(String(invoiceInfo.email).toLowerCase().trim(), 'success', 'Your Payment Receipt', `Your receipt is ready. You can download it here.`, { receiptId, receiptUrl, invoiceId, invoiceNumber: invoiceInfo.invoice_number || null });
                console.log(`ℹ️ Receipt notification created for ${invoiceInfo.email} (receiptUrl=${receiptUrl})`);
              }
            } catch (notifErr) {
              console.warn('Failed to create receipt notification for user:', notifErr && notifErr.message);
            }
          } catch (pdfErr) {
            console.warn('Failed to generate receipt PDF:', pdfErr && pdfErr.message);
            await pool.execute(`UPDATE receipts SET pdf_path = ? WHERE receipt_id = ?`, [null, receiptId]);
          }
        } else {
          // pdfkit not installed: leave pdf_path null but still notify user via simple email
          await pool.execute(`UPDATE receipts SET pdf_path = ? WHERE receipt_id = ?`, [null, receiptId]);
          try {
            if (invoiceInfo && invoiceInfo.email) {
              const to = invoiceInfo.email;
              const subject = `Your receipt ${receiptNumber}`;
              const htmlBody = `<p>Hi ${invoiceInfo.first_name || ''},</p><p>Your payment has been received and a receipt (${receiptNumber}) was created in our system. You can view it through your account.</p>`;
              await emailService.sendEmailWithAttachment(to, subject, htmlBody, []);
              console.log(`ℹ️ Receipt notification emailed to ${to} (no PDF attached)`);
            }
          } catch (mailErr) {
            console.warn('Failed to email receipt notification:', mailErr && mailErr.message);
          }
        }
      } catch (genErr) {
        console.warn('Error while creating receipt and PDF:', genErr && genErr.message);
      }
    }
  } catch (rErr) {
    console.warn('Failed to create receipt record:', rErr && rErr.message);
  }

  // Notify admins about payment received
  const [[invoiceInfo]] = await pool.execute(
    `SELECT i.*, u.first_name, u.last_name, u.email FROM invoices i
     JOIN users u ON i.user_id = u.id WHERE i.invoice_id = ?`,
    [invoiceId]
  );
  
  if (invoiceInfo) {
    const invoiceNumber = invoiceInfo.invoice_number || null;
    const invoiceRef = invoiceNumber || formatInvoiceNumber(invoiceId, invoiceInfo && invoiceInfo.issue_date);

    // Prefer a linked booking's service name + formatted date for admin messages
    let bookingLabel = null;
    try {
      const [[bkInfo]] = await pool.execute(`SELECT service, date FROM bookings WHERE invoice_id = ? LIMIT 1`, [invoiceId]);
      if (bkInfo && bkInfo.service) {
        const formattedDate = bkInfo.date ? new Date(bkInfo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
        bookingLabel = bkInfo.service + (formattedDate ? ` on ${formattedDate}` : '');
      }
    } catch (bkErr) {
      // ignore booking lookup errors and fall back to invoice reference
    }

    const adminMessage = bookingLabel
      ? `${invoiceInfo.first_name} ${invoiceInfo.last_name} paid ₱${amountPaid} for ${bookingLabel}`
      : `${invoiceInfo.first_name} ${invoiceInfo.last_name} paid ₱${amountPaid} for Invoice ${invoiceRef}`;

    await notifyAllAdmins(
      'payment_received',
      'Payment Received',
      adminMessage,
      { invoiceId, invoiceNumber, amountPaid, totalPaid, invoiceAmount, userName: `${invoiceInfo.first_name} ${invoiceInfo.last_name}` }
    );
  }

  const [paymentRows] = await pool.execute(
    `SELECT * FROM payments WHERE payment_id = ?`,
    [payRes.insertId]
  );

  // If this invoice is linked to a rent_request, update that rent_request's payment tracking
  try {
    const [[rr]] = await pool.execute(
      `SELECT request_id FROM rent_requests WHERE invoice_id = ? LIMIT 1`,
      [invoiceId]
    );
    console.log('[processPayment] rent_request lookup for invoice', invoiceId, 'result:', rr);
    if (rr && rr.request_id) {
      const requestId = rr.request_id;
      // Fetch current rent_request details to handle edge cases and get instrument/user info
        const [[requestCheck]] = await pool.execute(`SELECT status, instrument_id, user_id, instrument_name, start_date, end_date FROM rent_requests WHERE request_id = ? LIMIT 1`, [requestId]);
        const currentStatus = requestCheck?.status || null;
      // Update payment_amount and remaining_balance on rent_requests
      const [[paidRow]] = await pool.execute(
        `SELECT COALESCE(SUM(amount_paid),0) AS total_paid FROM payments WHERE invoice_id = ?`,
        [invoiceId]
      );
      const paid = Number(paidRow?.total_paid || 0);
      const remaining = Math.max(0, invoiceAmount - paid);
      const [updateRes] = await pool.execute(`UPDATE rent_requests SET payment_amount = ?, remaining_balance = ? WHERE request_id = ?`, [paid, remaining, requestId]);
      console.log('[processPayment] Updated rent_request payment_amount/remaining_balance:', updateRes);

      // BUSINESS RULE: As soon as any payment is made, transition reserved → approved and update items
      if (paid > 0) {
        try {
          if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
            console.warn(`[processPayment] Rent request ${requestId} is ${currentStatus}; payment recorded but request is not active`);
          } else {
            // For all other cases (pending/approved/paid/etc) mark as approved and set paid_at
            const [statusRes] = await pool.execute(`UPDATE rent_requests SET status = 'approved', paid_at = CURRENT_TIMESTAMP, updated_at = NOW() WHERE request_id = ?`, [requestId]);
            console.log('[processPayment] Ensured rent_request status=approved and set paid_at:', statusRes);
          }

          // Mark instrument_items reserved for this request as Rented (if currently Reserved)
          try {
            const [itemRes] = await pool.execute(`UPDATE instrument_items SET status = 'Rented', updated_at = NOW() WHERE current_rental_id = ?`, [requestId]);
            console.log('[processPayment] Updated instrument_items to Rented:', itemRes);
          } catch (itemErr) {
            console.warn('Failed to mark instrument_items as Rented after downpayment:', itemErr && itemErr.message);
          }

          // Update instruments availability for affected instruments conservatively
          try {
            const [affected] = await pool.execute(`SELECT DISTINCT instrument_id FROM instrument_items WHERE current_rental_id = ?`, [requestId]);
            for (const a of (affected || [])) {
              try {
                const [[sumRow]] = await pool.execute(`SELECT COALESCE(SUM(quantity),0) AS total FROM instrument_inventory WHERE instrument_id = ?`, [a.instrument_id]);
                const remaining = Number(sumRow?.total || 0);
                const newStatus = remaining > 0 ? 'Available' : 'Rented';
                let safeStatus = newStatus;
                if (safeStatus === 'Reserved') safeStatus = 'Rented';
                const allowed = new Set(['Available','Rented','Borrowed','Maintenance','Unavailable']);
                if (!allowed.has(safeStatus)) safeStatus = 'Available';
                await pool.execute(`UPDATE instruments SET availability_status = ?, updated_at = NOW() WHERE instrument_id = ?`, [safeStatus, a.instrument_id]);
              } catch (e) {
                // ignore per-instrument
              }
            }
          } catch (availErr) {
            console.warn('Failed to update instruments availability after rent downpayment:', availErr && availErr.message);
          }

          // Send customer notification (if invoiceInfo exists)
          try {
            const userEmail = invoiceInfo?.email || null;
              if (userEmail) {
              const startDateFormatted = requestCheck?.start_date ? new Date(requestCheck.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
              const endDateFormatted = requestCheck?.end_date ? new Date(requestCheck.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
              const invoiceNumber = invoiceInfo?.invoice_number || null;
              await notifyUser(String(userEmail).toLowerCase().trim(), 'success', 'Payment Confirmed - Rental Active', `Your payment has been received. Your rental of "${requestCheck?.instrument_name || ''}" is now active${startDateFormatted && endDateFormatted ? ` from ${startDateFormatted} to ${endDateFormatted}` : ''}.`, { requestId, invoiceId, invoiceNumber, status: 'approved' });
            }
          } catch (notifErr) {
            console.warn('Failed to send payment confirmation notification to user:', notifErr && notifErr.message);
          }
        } catch (e) {
          console.warn('Error handling rent_request status transition after payment:', e && e.message);
        }
      }
    } else {
      console.warn('[processPayment] No rent_request linked to invoice', invoiceId);
    }
  } catch (rrErr) {
    console.warn('Failed to update linked rent_request payment tracking:', rrErr && rrErr.message);
  }

  // If no rent_request linkage handled the invoice, try bookings linkage (some flows create invoices for bookings)
  try {
    const [[bk]] = await pool.execute(`SELECT booking_id, instrument_item_ids FROM bookings WHERE invoice_id = ? LIMIT 1`, [invoiceId]);
    console.log('[processPayment] booking lookup for invoice', invoiceId, 'result:', bk);
    if (bk && bk.booking_id) {
      const bookingId = bk.booking_id;
      // Mark booking as paid/rented per business rule
      const [bkRes] = await pool.execute(`UPDATE bookings SET status = 'paid' WHERE booking_id = ?`, [bookingId]);
      console.log('[processPayment] Updated booking status to paid:', bkRes);

      // If instrument_item_ids present, mark those items as Rented
      let itemIds = [];
      if (bk.instrument_item_ids) {
        try {
          if (Array.isArray(bk.instrument_item_ids)) itemIds = bk.instrument_item_ids;
          else if (typeof bk.instrument_item_ids === 'string') itemIds = bk.instrument_item_ids.split(',').map(id => id.trim()).filter(Boolean);
        } catch (parseErr) {
          console.warn('Failed to parse booking.instrument_item_ids:', parseErr && parseErr.message);
        }
      }
      if (itemIds.length > 0) {
        const placeholders = itemIds.map(() => '?').join(',');
        const [itemRes] = await pool.execute(`UPDATE instrument_items SET status = 'Rented', updated_at = NOW() WHERE item_id IN (${placeholders})`, itemIds);
        console.log('[processPayment] Marked booking instrument_items as Rented:', itemRes);
      } else {
        console.log('[processPayment] No instrument_item_ids found for booking', bookingId);
      }
    }
  } catch (bkErr) {
    console.warn('Failed to update linked booking after payment:', bkErr && bkErr.message);
  }

  // If invoice fully paid and linked to a rent_request, finalize reservation: mark request as 'approved' and finalize items
  try {
    const [[rr2]] = await pool.execute(`SELECT request_id FROM rent_requests WHERE invoice_id = ? LIMIT 1`, [invoiceId]);
    if (rr2 && rr2.request_id && totalPaid >= invoiceAmount && invoiceAmount > 0) {
      const requestId = rr2.request_id;
      try {
        // Mark rent_request as approved (active rental), clear reserved_until and set paid_at
        await pool.execute(`UPDATE rent_requests SET status = 'approved', paid_at = CURRENT_TIMESTAMP, updated_at = NOW() WHERE request_id = ?`, [requestId]);

        // Mark any instrument_items linked to this request as Rented
        try {
          await pool.execute(`UPDATE instrument_items SET status = 'Rented', updated_at = NOW() WHERE current_rental_id = ?`, [requestId]);
        } catch (itemErr) {
          console.warn('Failed to mark instrument_items as Rented after payment:', itemErr && itemErr.message);
        }

        // Update instruments availability_status conservatively where items were rented
        try {
          const [affected] = await pool.execute(`SELECT DISTINCT instrument_id FROM instrument_items WHERE current_rental_id = ?`, [requestId]);
          for (const a of (affected || [])) {
            try {
              const [[sumRow]] = await pool.execute(`SELECT COALESCE(SUM(quantity),0) AS total FROM instrument_inventory WHERE instrument_id = ?`, [a.instrument_id]);
              const remaining = Number(sumRow?.total || 0);
              const newStatus = remaining > 0 ? 'Available' : 'Rented';
              let safeStatus = newStatus;
              if (safeStatus === 'Reserved') safeStatus = 'Rented';
              const allowed2 = new Set(['Available','Rented','Borrowed','Maintenance','Unavailable']);
              if (!allowed2.has(safeStatus)) safeStatus = 'Available';
              await pool.execute(`UPDATE instruments SET availability_status = ?, updated_at = NOW() WHERE instrument_id = ?`, [safeStatus, a.instrument_id]);
            } catch (e) {
              // ignore per-instrument
            }
          }
        } catch (availErr) {
          console.warn('Failed to update instruments availability after rent payment:', availErr && availErr.message);
        }

        // Attempt to notify customer of completed payment if possible
        try {
          const [[rrInfo]] = await pool.execute(`SELECT rr.instrument_name, rr.start_date, rr.end_date, u.email FROM rent_requests rr LEFT JOIN users u ON u.id = rr.user_id WHERE rr.request_id = ? LIMIT 1`, [requestId]);
          if (rrInfo && rrInfo.email) {
            const startDateFormatted = rrInfo.start_date ? new Date(rrInfo.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
            const endDateFormatted = rrInfo.end_date ? new Date(rrInfo.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
            await notifyUser(String(rrInfo.email).toLowerCase().trim(), 'success', 'Payment Confirmed - Rental Active', `Your payment has been confirmed! Your rental of "${rrInfo.instrument_name || ''}" is now active${startDateFormatted && endDateFormatted ? ` from ${startDateFormatted} to ${endDateFormatted}` : ''}.`, { requestId, invoiceId, status: 'approved' });
          }
        } catch (nErr) {
          console.warn('Failed to notify user after finalizing rent_request payment:', nErr && nErr.message);
        }
      } catch (e) {
        console.warn('Failed to finalize rent_request after payment:', e && e.message);
      }
    }
  } catch (finalizeErr) {
    console.warn('Failed to finalize rent_request after payment:', finalizeErr && finalizeErr.message);
  }

  // Return payment plus updated totals and receipt info (if created)
  const ret = { ...paymentRows[0], total_paid: totalPaid, invoice_amount: invoiceAmount };
  if (receiptObj) ret.receipt = receiptObj;
  return ret;
}

// Get transactions for a user
async function getUserTransactions(userId) {
  const [rows] = await pool.execute(
    `SELECT t.*, i.amount AS invoice_amount, i.status AS invoice_status
       FROM transactions t
       LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
    [userId]
  );
  return rows;
}

// Get all transactions (admin view)
async function getAllTransactions() {
  const [rows] = await pool.execute(
    `SELECT t.*, i.amount AS invoice_amount, i.status AS invoice_status, i.description,
            CONCAT(u.first_name, ' ', u.last_name) AS user_name, u.email AS user_email
       FROM transactions t
       LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
  );
  return rows;
}

// Get all invoices (admin view)
async function getAllInvoices() {
  const [rows] = await pool.execute(
    `SELECT * FROM invoices ORDER BY created_at DESC`
  );
  return rows;
}

module.exports = {
  generateInvoice,
  approveInvoice,
  processPayment,
  getUserTransactions,
  getAllTransactions,
  getAllInvoices,
  getInvoicesByUser
};

// Get receipts for a user
async function getUserReceipts(userId) {
  const [rows] = await pool.execute(
    `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name, i.description AS invoice_description
       FROM receipts r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN invoices i ON r.invoice_id = i.invoice_id
       WHERE r.user_id = ?
       ORDER BY r.issued_at DESC`,
    [userId]
  );
  return rows;
}

// Get all receipts (admin)
async function getAllReceipts() {
  const [rows] = await pool.execute(
    `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name, i.description AS invoice_description
       FROM receipts r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN invoices i ON r.invoice_id = i.invoice_id
       ORDER BY r.issued_at DESC`
  );
  return rows;
}

// Get single receipt by id
async function getReceiptById(receiptId) {
  const [rows] = await pool.execute(
    `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS user_name, u.email AS user_email, i.description AS invoice_description
       FROM receipts r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN invoices i ON r.invoice_id = i.invoice_id
       WHERE r.receipt_id = ? LIMIT 1`,
    [receiptId]
  );
  return rows[0] || null;
}

// export new functions
module.exports.getUserReceipts = getUserReceipts;
module.exports.getAllReceipts = getAllReceipts;
module.exports.getReceiptById = getReceiptById;

// Generate or regenerate a PDF for an existing receipt row. Returns the pdf path or null.
async function generateReceiptPdf(receiptId) {
  try {
    const receipt = await getReceiptById(receiptId);
    if (!receipt) throw new Error('Receipt not found');

    const [[invoiceInfo]] = await pool.execute(
      `SELECT i.*, u.first_name, u.last_name, u.email FROM invoices i JOIN users u ON i.user_id = u.id WHERE i.invoice_id = ? LIMIT 1`,
      [receipt.invoice_id]
    );

    // Lazy require pdfkit
    let PDFDocument = null;
    try { PDFDocument = require('pdfkit'); } catch (e) { throw new Error('pdfkit not installed'); }

    const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
    fs.mkdirSync(receiptsDir, { recursive: true });
    const safeInvoice = invoiceInfo && invoiceInfo.invoice_number ? invoiceInfo.invoice_number.replace(/[^a-zA-Z0-9-_\.]/g,'') : `inv-${receipt.invoice_id}`;
    const filename = `receipt-${receipt.receipt_number || receipt.receipt_id}-${safeInvoice}.pdf`;
    const outPath = path.join(receiptsDir, filename);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    const logoPath = path.join(__dirname, '..', 'dbemb', 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, 40, 30, { width: 120 }); } catch (imErr) { /* ignore */ }
    } else {
      doc.fontSize(20).text('DAVAO BLUE EAGLES', { align: 'left' });
    }

    doc.fontSize(18).text('Payment Receipt', { align: 'center' });
    doc.moveDown(0.5);

    const invNumber = (invoiceInfo && invoiceInfo.invoice_number) ? invoiceInfo.invoice_number : `#${receipt.invoice_id}`;
    doc.fontSize(12).text(`Invoice: ${invNumber}`, { align: 'right' });
    doc.fontSize(12).text(`Receipt: ${receipt.receipt_number || receipt.receipt_id}`, { align: 'right' });

    doc.moveDown();
    const customerName = `${receipt.user_name || ''}`.trim();
    doc.fontSize(12).text(`Customer: ${customerName}`);
    const paidAt = receipt.issued_at ? new Date(receipt.issued_at) : new Date();
    doc.text(`Date: ${paidAt.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);

    doc.moveDown(1);
    const formattedAmount = Number(receipt.amount_paid || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#166534').text('Amount Paid', { continued: false });
    doc.moveDown(0.2);
    doc.fontSize(20).fillColor('#059669').text(formattedAmount);

    doc.moveDown(1);
    if (invoiceInfo && invoiceInfo.description) doc.fontSize(10).fillColor('#374151').text(`Description: ${invoiceInfo.description}`);

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#6b7280').text('This is a computer-generated receipt.', { align: 'center' });

    doc.end();
    await new Promise((resolve, reject) => stream.on('finish', resolve).on('error', reject));

    const pdfPath = `/uploads/receipts/${filename}`;
    await pool.execute(`UPDATE receipts SET pdf_path = ? WHERE receipt_id = ?`, [pdfPath, receiptId]);
    // Optionally send via SendGrid when configured
    try {
      if (process.env.SENDGRID_API_KEY && invoiceInfo && invoiceInfo.email) {
        const fullPath = path.join(__dirname, '..', 'uploads', 'receipts', filename);
        const sent = await sendPdfViaSendGrid(fullPath, invoiceInfo.email, { filename, receiptNumber: receipt.receipt_number || receipt.receipt_id, subject: `Your receipt ${receipt.receipt_number || receipt.receipt_id}` });
        if (sent) console.log(`✅ Receipt emailed to ${invoiceInfo.email} via SendGrid`);
      }
    } catch (sgErr) {
      console.warn('Failed to send receipt via SendGrid:', sgErr && sgErr.message);
    }

    return pdfPath;
  } catch (e) {
    console.warn('generateReceiptPdf failed:', e && e.message);
    return null;
  }
}

module.exports.generateReceiptPdf = generateReceiptPdf;