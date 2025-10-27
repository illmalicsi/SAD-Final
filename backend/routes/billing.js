const express = require('express');
const router = express.Router();
const billingService = require('../services/billingService');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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

// NOTE: Manual invoice creation endpoint has been disabled to ensure invoices
// are only created automatically via booking approval flows. If you need to
// re-enable manual invoice creation for administrative workflows, add a
// controlled route here and ensure audit logging/authorization is present.

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
    const { invoiceId, amountPaid, paymentMethod } = req.body;
    // processedBy is the current user id
    const processedBy = req.user.id;
    const payment = await billingService.processPayment(invoiceId, processedBy, amountPaid, paymentMethod);
    res.json({ success: true, payment });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
});

// POST /api/billing/payments/customer - Customer pays their own invoice (requires auth)
router.post('/payments/customer', authenticateToken, async (req, res) => {
  try {
    const { invoiceId, amountPaid, paymentMethod } = req.body;
    if (!invoiceId || !amountPaid) {
      return res.status(400).json({ success: false, message: 'invoiceId and amountPaid are required' });
    }

    // Validate that the invoice belongs to the current user and is approved
    const [rows] = await require('../config/database').pool.execute(
      `SELECT invoice_id, user_id, amount, status FROM invoices WHERE invoice_id = ?`,
      [invoiceId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    const inv = rows[0];
    if (inv.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not allowed to pay this invoice' });
    }
    if (inv.status !== 'approved') {
      return res.status(400).json({ success: false, message: `Invoice must be approved before payment (status: ${inv.status})` });
    }

    // Allow partial payments; method is optional and defaults to 'cash'
    const payment = await billingService.processPayment(invoiceId, req.user.id, amountPaid, paymentMethod);
    res.json({ success: true, payment });
  } catch (err) {
    console.error('Error processing customer payment:', err);
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
});

// GET /api/billing/transactions - Get transaction history (authenticated user)
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await billingService.getUserTransactions(userId);
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
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
      const password = 'password123'; // for demo/school use
      const [ins] = await pool.execute(
        `INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_active, is_blocked, created_at)
         VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`,
        [firstName, lastName, email, password, roleId]
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

  return res.json({ success: true, message: 'Payment recorded', invoiceId, payment, reservationId: booking.booking_id });
  } catch (err) {
    console.error('❌ Error in /api/billing/pay-booking:', err);
    res.status(500).json({ success: false, message: 'Failed to pay booking' });
  }
});
