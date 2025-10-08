const express = require('express');
const router = express.Router();
const billingService = require('../services/billingService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/billing/invoices - Generate a new invoice (admin/treasurer)
router.post('/invoices', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const invoice = await billingService.generateInvoice(userId, amount, description);
    res.json({ success: true, invoice });
  } catch (err) {
    console.error('Error generating invoice:', err);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
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
    const { invoiceId, amountPaid } = req.body;
    // processedBy is the current user id
    const processedBy = req.user.id;
    const payment = await billingService.processPayment(invoiceId, processedBy, amountPaid);
    res.json({ success: true, payment });
  } catch (err) {
    console.error('Error processing payment:', err);
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

module.exports = router;
