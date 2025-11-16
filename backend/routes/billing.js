const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const billingService = require('../services/billingService');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/billing/invoices - Create a new invoice (authenticated user)
router.post('/invoices', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    console.log(`📝 Creating invoice - User: ${req.user.id}, Amount: ${amount}, Description: ${description}`);
    
    if (!amount || !description) {
      console.log(`❌ Missing required fields - amount: ${amount}, description: ${description}`);
      return res.status(400).json({ success: false, message: 'amount and description are required' });
    }
    const userId = req.user.id;
    const invoice = await billingService.generateInvoice(userId, amount, description);
    console.log(`✅ Invoice created - ID: ${invoice.invoice_id}, Number: ${invoice.invoice_number}, Status: ${invoice.status}`);
    res.json({ success: true, invoice });
  } catch (err) {
    console.error('❌ Error creating invoice:', err);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

// DELETE /api/billing/invoices/:invoiceId - Delete an invoice (admin or owner)
router.delete('/invoices/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    // Only allow if admin or invoice owner
    const [rows] = await require('../config/database').pool.execute(
      `SELECT user_id FROM invoices WHERE invoice_id = ?`,
      [invoiceId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    const ownerId = rows[0].user_id;
    if (req.user.role !== 'admin' && req.user.id !== ownerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this invoice' });
    }
    await require('../config/database').pool.execute(
      `DELETE FROM invoices WHERE invoice_id = ?`,
      [invoiceId]
    );
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ success: false, message: 'Failed to delete invoice' });
  }
});

// GET /api/billing/my-invoices - Get invoices for the logged-in user
router.get('/my-invoices', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const invoices = await billingService.getInvoicesByUser(userId);
    res.json({ success: true, invoices });
  } catch (err) {
    console.error('Error fetching user invoices:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// PUT /api/billing/invoices/:invoiceId/payment-status - Update payment status (authenticated users can update their own invoices, admins can update any)
router.put('/invoices/:invoiceId/payment-status', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { payment_status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role_name === 'admin' || req.user.role === 'admin';

    console.log(`📝 Payment status update request - Invoice: ${invoiceId}, New Status: ${payment_status}, User: ${userId}, IsAdmin: ${isAdmin}, Role: ${req.user.role_name || req.user.role}`);

    if (!['unpaid', 'partial', 'paid'].includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status. Must be: unpaid, partial, or paid' });
    }

    // Check if invoice exists and verify ownership (unless admin)
    const [invoices] = await pool.execute(
      `SELECT user_id, amount, payment_status FROM invoices WHERE invoice_id = ?`,
      [invoiceId]
    );
    
    if (invoices.length === 0) {
      console.log(`❌ Invoice ${invoiceId} not found`);
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    const invoice = invoices[0];
    
    // Only check ownership if not admin
    if (!isAdmin && invoice.user_id !== userId) {
      console.log(`❌ User ${userId} tried to update invoice ${invoiceId} owned by ${invoice.user_id}`);
      return res.status(403).json({ success: false, message: 'You can only update your own invoices' });
    }
    
    if (isAdmin) {
      console.log(`✅ Admin ${userId} updating invoice ${invoiceId} owned by user ${invoice.user_id}`);
    } else {
      console.log(`✅ Ownership verified - User ${userId} owns invoice ${invoiceId}`);
    }

    // If admin is marking as paid/partial and payment_status is changing, create a transaction
    if (isAdmin && payment_status !== invoice.payment_status && (payment_status === 'paid' || payment_status === 'partial')) {
      console.log(`💰 Admin marking invoice as ${payment_status}, creating transaction record...`);
      
      // Calculate payment amounts
      const invoiceAmount = parseFloat(invoice.amount);
      let paymentAmount = 0;
      
      // Get existing payments for this invoice
      const [payments] = await pool.execute(
        `SELECT COALESCE(SUM(amount_paid), 0) as total_paid FROM payments WHERE invoice_id = ?`,
        [invoiceId]
      );
      const totalPaid = parseFloat(payments[0]?.total_paid || 0);
      
      if (payment_status === 'paid') {
        // Pay the remaining balance
        paymentAmount = invoiceAmount - totalPaid;
      } else if (payment_status === 'partial') {
        // If nothing paid yet, pay 50%, otherwise pay what's needed to reach partial
        if (totalPaid === 0) {
          paymentAmount = invoiceAmount * 0.5;
        } else {
          // Just record what was already paid if marking as partial
          paymentAmount = 0; // Don't create duplicate payment
        }
      }
      
      // Only create payment record if there's an amount to pay
      if (paymentAmount > 0) {
        const payment = await billingService.processPayment(
          invoiceId, 
          userId, 
          paymentAmount, 
          'cash', 
          `Admin marked invoice as ${payment_status}`
        );
        console.log(`✅ Payment and transaction created - Amount: ₱${paymentAmount.toFixed(2)}`);
      }
    }

    await pool.execute(
      `UPDATE invoices SET payment_status = ? WHERE invoice_id = ?`,
      [payment_status, invoiceId]
    );
    
    console.log(`✅ Payment status updated to '${payment_status}' for invoice ${invoiceId}`);
    
    // Also update invoice status to 'paid' if payment_status is 'paid'
    if (payment_status === 'paid') {
      await pool.execute(
        `UPDATE invoices SET status = 'paid' WHERE invoice_id = ?`,
        [invoiceId]
      );
      console.log(`✅ Invoice status also updated to 'paid' for invoice ${invoiceId}`);
    }
    
    res.json({ success: true, message: `Payment status updated to ${payment_status}` });
  } catch (err) {
    console.error('❌ Error updating payment status:', err);
    res.status(500).json({ success: false, message: 'Failed to update payment status' });
  }
});

// PUT /api/billing/invoices/:invoiceId/status - Update invoice status (admin or owner)
router.put('/invoices/:invoiceId/status', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating invoice status - Invoice: ${invoiceId}, New Status: ${status}, User: ${req.user.id}`);
    
    if (!['unpaid', 'partial', 'paid', 'approved', 'rejected', 'pending'].includes(status)) {
      console.log(`❌ Invalid status: ${status}`);
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    // Check ownership
    const [rows] = await pool.execute(`SELECT user_id, status as current_status FROM invoices WHERE invoice_id = ?`, [invoiceId]);
    if (rows.length === 0) {
      console.log(`❌ Invoice ${invoiceId} not found`);
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    const ownerId = rows[0].user_id;
    console.log(`📄 Invoice ${invoiceId} - Current Status: ${rows[0].current_status}, Owner: ${ownerId}`);
    
    const isAdmin = req.user.role_name === 'admin' || req.user.role === 'admin';
    if (!isAdmin && req.user.id !== ownerId) {
      console.log(`❌ User ${req.user.id} not authorized to update invoice owned by ${ownerId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to update this invoice' });
    }
    await pool.execute(`UPDATE invoices SET status = ? WHERE invoice_id = ?`, [status, invoiceId]);
    console.log(`✅ Invoice ${invoiceId} status updated from '${rows[0].current_status}' to '${status}'`);
    res.json({ success: true, message: 'Invoice status updated' });
  } catch (err) {
    console.error('❌ Error updating invoice status:', err);
    res.status(500).json({ success: false, message: 'Failed to update invoice status' });
  }
});

// PUT /api/billing/invoices/:invoiceId/approve - Approve an invoice (admin/treasurer)
router.put('/invoices/:invoiceId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const ok = await billingService.approveInvoice(invoiceId);
    if (ok) {
      res.json({ success: true, message: 'Invoice approved' });
    } else {
      res.status(404).json({ success: false, message: 'Invoice not found' });
    }
  } catch (err) {
    console.error('Error approving invoice:', err);
    res.status(500).json({ success: false, message: 'Failed to approve invoice' });
  }
});

// POST /api/billing/payments - Process payment for an invoice (admin/treasurer)
router.post('/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { invoiceId, amountPaid, paymentMethod, forceFull } = req.body;
    // processedBy is the current user id
    const processedBy = req.user.id;
    const payment = await billingService.processPayment(invoiceId, processedBy, amountPaid, paymentMethod, null, !!forceFull);
    // If billingService included a receipt, surface it to the client
    if (payment && payment.receipt) {
      res.json({ success: true, payment, receipt: payment.receipt });
    } else {
      res.json({ success: true, payment });
    }
  } catch (err) {
    console.error('Error processing payment:', err);
    if (err && err.status) return res.status(err.status).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
});

// POST /api/billing/payments/customer - Customer pays their own invoice (requires auth)
router.post('/payments/customer', authenticateToken, async (req, res) => {
  try {
    const { invoiceId, amountPaid, paymentMethod, notes } = req.body;
    
    console.log(`💳 Payment request - Invoice: ${invoiceId}, Amount: ${amountPaid}, Method: ${paymentMethod}, User: ${req.user.id}`);
    
    if (!invoiceId || !amountPaid) {
      console.log(`❌ Missing required fields - invoiceId: ${invoiceId}, amountPaid: ${amountPaid}`);
      return res.status(400).json({ success: false, message: 'invoiceId and amountPaid are required' });
    }

    // Validate that the invoice belongs to the current user and is approved
    const [rows] = await require('../config/database').pool.execute(
      `SELECT invoice_id, user_id, amount, status FROM invoices WHERE invoice_id = ?`,
      [invoiceId]
    );
    if (rows.length === 0) {
      console.log(`❌ Invoice ${invoiceId} not found`);
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    const inv = rows[0];
    console.log(`📄 Invoice details - ID: ${inv.invoice_id}, User: ${inv.user_id}, Amount: ${inv.amount}, Status: ${inv.status}`);
    
    if (inv.user_id !== req.user.id) {
      console.log(`❌ User ${req.user.id} tried to pay invoice owned by ${inv.user_id}`);
      return res.status(403).json({ success: false, message: 'You are not allowed to pay this invoice' });
    }
    if (inv.status !== 'approved') {
      console.log(`❌ Invoice ${invoiceId} status is '${inv.status}', must be 'approved'`);
      return res.status(400).json({ success: false, message: `Invoice must be approved before payment (status: ${inv.status})` });
    }

    // Allow partial payments by default; method is optional and defaults to 'cash'
    try {
      console.log(`✅ Creating payment record...`);
      const forceFull = !!req.body.forceFull;
      const payment = await billingService.processPayment(invoiceId, req.user.id, amountPaid, paymentMethod, notes, forceFull);
      console.log(`✅ Payment created successfully - Payment ID: ${payment.payment_id}`);
      res.json({ success: true, payment });
    } catch (pErr) {
      console.error('❌ Payment validation error:', pErr && pErr.message);
      if (pErr && pErr.status) return res.status(pErr.status).json({ success: false, message: pErr.message });
      throw pErr;
    }
  } catch (err) {
    console.error('❌ Error processing customer payment:', err);
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
});

// GET /api/billing/transactions - Get transaction history (authenticated user)
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role_name === 'admin';
    
    console.log(`📊 Fetching transactions for user ${userId} (role: ${req.user.role || req.user.role_name}, admin: ${isAdmin})`);
    
    // If admin, get all transactions; otherwise get only user's transactions
    let transactions;
    if (isAdmin) {
      console.log('🔍 Calling getAllTransactions...');
      transactions = await billingService.getAllTransactions();
      console.log(`✅ Found ${transactions.length} total transactions (admin view)`);
    } else {
      console.log('🔍 Calling getUserTransactions...');
      transactions = await billingService.getUserTransactions(userId);
      console.log(`✅ Found ${transactions.length} transactions for user ${userId}`);
    }
    
    if (transactions.length > 0) {
      console.log('Sample transaction:', transactions[0]);
    }
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('❌ Error fetching transactions:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

// GET /api/billing/receipts - List receipts (admin sees all, otherwise user's receipts)
router.get('/receipts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role_name === 'admin';
    let receipts;
    if (isAdmin) {
      receipts = await billingService.getAllReceipts();
      console.log(`✅ Admin fetched ${receipts.length} receipts`);
    } else {
      receipts = await billingService.getUserReceipts(userId);
      console.log(`✅ Found ${receipts.length} receipts for user ${userId}`);
    }
    res.json({ success: true, receipts });
  } catch (err) {
    console.error('❌ Error fetching receipts:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch receipts' });
  }
});

// GET /api/billing/receipts/:receiptId - Get a single receipt's data
router.get('/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await billingService.getReceiptById(receiptId);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

    const isAdmin = req.user.role === 'admin' || req.user.role_name === 'admin';
    if (!isAdmin && receipt.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this receipt' });
    }

    res.json({ success: true, receipt });
  } catch (err) {
    console.error('❌ Error fetching receipt:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch receipt' });
  }
});

// POST /api/billing/receipts/:receiptId/generate - Regenerate PDF for a receipt (owner or admin)
router.post('/receipts/:receiptId/generate', authenticateToken, async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await billingService.getReceiptById(receiptId);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

    const isAdmin = req.user.role === 'admin' || req.user.role_name === 'admin';
    if (!isAdmin && receipt.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to generate this receipt' });
    }

    const pdfPath = await billingService.generateReceiptPdf(receiptId);
    if (pdfPath) {
      return res.json({ success: true, pdfPath });
    }
    return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF (ensure pdfkit is installed on server)' });
  } catch (err) {
    console.error('❌ Error generating receipt PDF:', err);
    res.status(500).json({ success: false, message: 'Failed to generate receipt PDF' });
  }
});

// GET /api/billing/invoices - Get all invoices (admin)
router.get('/invoices', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const invoices = await billingService.getAllInvoices();
    res.json({ success: true, invoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// GET /api/billing/invoices/:invoiceId/payments - Get all payments for an invoice
router.get('/invoices/:invoiceId/payments', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const [payments] = await pool.execute(
      `SELECT * FROM payments WHERE invoice_id = ? ORDER BY processed_at DESC`,
      [invoiceId]
    );
    res.json({ success: true, payments });
  } catch (err) {
    console.error('Error fetching invoice payments:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// POST /api/billing/expenses - Create an expense (admin)
router.post('/expenses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    if (!amount || !category) return res.status(400).json({ success: false, message: 'amount and category required' });
    const expense = await billingService.addExpense(amount, category, description, req.user.id);
    res.json({ success: true, expense });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ success: false, message: 'Failed to create expense' });
  }
});

// GET /api/billing/expenses - List expenses (admin)
router.get('/expenses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const expenses = await billingService.getExpenses(from || null, to || null);
    res.json({ success: true, expenses });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
});

// GET /api/billing/reports/financial - Get financial report (admin)
router.get('/reports/financial', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const report = await billingService.getFinancialReport(from || null, to || null);
    res.json({ success: true, report });
  } catch (err) {
    console.error('Error generating financial report:', err);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

module.exports = router;

// Public endpoint: Pay a booking by bookingId and email, recording to Finance
// Note: kept below module.exports for readability; Express will still register above exports in actual code execution
router.post('/pay-booking', async (req, res) => {
  try {
    const { bookingId, email, paymentOption = 'fullpayment', paymentMethod = 'cash' } = req.body || {};
    if (!bookingId || !email) {
      return res.status(400).json({ success: false, message: 'bookingId and email are required' });
    }

    // 1) Find the booking and validate email matches
    const [bookRows] = await pool.execute(
      `SELECT * FROM bookings WHERE booking_id = ?`,
      [bookingId]
    );
    if (bookRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    const booking = bookRows[0];
    // Prevent duplicate payments: if booking is already marked paid, refuse further payments
    if (String(booking.status).toLowerCase() === 'paid') {
      console.warn(`Attempt to pay already-paid booking ${bookingId}`);
      return res.status(400).json({ success: false, message: 'This reservation has already been paid.' });
    }
    if ((booking.email || '').toLowerCase() !== String(email).toLowerCase()) {
  return res.status(403).json({ success: false, message: 'Email does not match reservation' });
    }

    // 2) Ensure there is a user for this email; create basic user if missing
    const [userRows] = await pool.execute(`SELECT id FROM users WHERE email = ?`, [email]);
    let userId;
    if (userRows.length > 0) {
      userId = userRows[0].id;
    } else {
      const [roleRows] = await pool.execute(`SELECT role_id FROM roles WHERE role_name = 'user'`);
      const roleId = roleRows[0]?.role_id || 3;
      const names = (booking.customer_name || '').split(' ');
      const firstName = names.slice(0, -1).join(' ') || booking.customer_name || 'Customer';
      const lastName = names.slice(-1).join(' ') || 'User';
      const tempPassword = 'password123'; // temporary password for demo/school use
      // Hash the password before storing
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      const [ins] = await pool.execute(
        `INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_active, is_blocked, created_at)
         VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`,
        [firstName, lastName, email, passwordHash, roleId]
      );
      userId = ins.insertId;
    }

    // 3) Determine amount based on service price (booking.estimated_value)
    const baseAmount = Number(booking.estimated_value || 0);
    if (!(baseAmount > 0)) {
      return res.status(400).json({ success: false, message: 'Reservation has no estimated amount' });
    }
    const toPay = paymentOption === 'downpayment' ? Math.round(baseAmount * 0.5) : baseAmount;

    // 4) Prevent duplicate invoice/payment: if there's already a paid invoice for this booking, refuse
    const paidCheckDesc = `%Booking #${booking.booking_id}%`;
    const [paidInvRows] = await pool.execute(
      `SELECT * FROM invoices WHERE user_id = ? AND description LIKE ? AND status = 'paid' LIMIT 1`,
      [userId, paidCheckDesc]
    );
    if (paidInvRows.length > 0) {
  console.warn(`Attempt to pay booking ${bookingId} but invoice ${paidInvRows[0].invoice_id} is already paid`);
  return res.status(400).json({ success: false, message: 'An invoice for this reservation is already marked as paid.' , invoiceId: paidInvRows[0].invoice_id});
    }

    // Find or create an invoice for this booking (only consider pending/approved invoices)
  const description = `Reservation ID ${booking.booking_id} - ${booking.service} on ${booking.date}`;
    const [existInv] = await pool.execute(
      `SELECT * FROM invoices WHERE user_id = ? AND description LIKE ? AND status IN ('pending','approved') ORDER BY created_at DESC LIMIT 1`,
  [userId, `%Booking #${booking.booking_id}%`]
    );
    let invoiceId;
    if (existInv.length > 0) {
      invoiceId = existInv[0].invoice_id;
      // Update amount to match service price if needed (use baseAmount)
      await pool.execute(`UPDATE invoices SET amount = ?, status = 'approved' WHERE invoice_id = ?`, [baseAmount, invoiceId]);
    } else {
      const invoice = await billingService.generateInvoice(userId, baseAmount, description);
      invoiceId = invoice.invoice_id;
      // Mark as approved to allow payment
      await pool.execute(`UPDATE invoices SET status = 'approved' WHERE invoice_id = ?`, [invoiceId]);
    }

    // 5) Record payment to Finance (processed_by = userId)
    const payment = await billingService.processPayment(invoiceId, userId, toPay, paymentMethod);

    // 6) Mark all instrument items in this booking as 'Rented'
    // Assumes booking has a field instrument_item_ids as a comma-separated string or array
    let itemIds = [];
    if (booking.instrument_item_ids) {
      if (Array.isArray(booking.instrument_item_ids)) {
        itemIds = booking.instrument_item_ids;
      } else if (typeof booking.instrument_item_ids === 'string') {
        itemIds = booking.instrument_item_ids.split(',').map(id => id.trim()).filter(Boolean);
      }
    }
    if (itemIds.length > 0) {
      await pool.query(
        `UPDATE instrument_items SET status = 'Rented' WHERE item_id IN (${itemIds.map(() => '?').join(',')})`,
        itemIds
      );
      console.log(`✅ Marked instrument items as 'Rented':`, itemIds);
    } else {
      console.warn('⚠️ No instrument_item_ids found for booking', booking.booking_id);
    }

    return res.json({ success: true, message: 'Payment recorded', invoiceId, payment, reservationId: booking.booking_id });
  } catch (err) {
    console.error('❌ Error in /api/billing/pay-booking:', err);
    res.status(500).json({ success: false, message: 'Failed to pay booking' });
  }
});
