const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/payments - Simulated payment processing
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('--- PAYMENT ATTEMPT ---');
    console.log('Request body:', req.body);
    const { bookingId, amount, totalAmount, paymentType, paymentMethod, cardholderName, cardNumber, gcashNumber, referenceNumber } = req.body;
    console.log('💳 Payment request received:', { bookingId, amount, totalAmount, paymentType, paymentMethod, user: req.user.id });
    
    // Check booking status
    const [bookingRows] = await pool.query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [bookingId]
    );
    
    if (!bookingRows.length) {
      console.error('❌ Booking not found:', bookingId);
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const booking = bookingRows[0];
    console.log('📋 Booking found:', { id: booking.booking_id, status: booking.status });
    
    if (booking.status !== 'approved') {
      console.error('❌ Booking not approved:', booking.status);
      return res.status(400).json({ message: `Booking is not approved for payment (current status: ${booking.status})` });
    }
    
    // Find the invoice for this booking
    const [invoiceRows] = await pool.query(
      `SELECT * FROM invoices 
       WHERE description LIKE ? 
       AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
      [`%Booking for ${booking.service}%${booking.date}%`]
    );
    
    let invoiceId = null;
    if (invoiceRows.length > 0) {
      invoiceId = invoiceRows[0].invoice_id;
      console.log('📄 Invoice found:', invoiceId);
      
      // Create payment record
      // Use user ID or default to 1 (admin) if not available
      const processedBy = req.user?.id || 1;
      const paymentNote = paymentType === 'downpayment' 
        ? `Down payment (50%) for reservation ID ${bookingId} - ₱${amount.toLocaleString()}. Remaining: ₱${((totalAmount || amount * 2) - amount).toLocaleString()}`
        : `Full payment for reservation ID ${bookingId} - Customer self-payment`;
        
      const [paymentResult] = await pool.query(
        'INSERT INTO payments (invoice_id, amount_paid, payment_method, processed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [invoiceId, amount, paymentMethod || 'card', processedBy, paymentNote]
      );
      
      console.log('✅ Payment record created:', paymentResult.insertId);
      
      // Update invoice status to paid
      await pool.query(
        'UPDATE invoices SET status = ? WHERE invoice_id = ?',
        ['paid', invoiceId]
      );
      
      console.log('✅ Invoice status updated to paid');
    } else {
      console.log('⚠️ No invoice found for booking, creating direct payment');
    }
    
    // Update booking status to Paid
    await pool.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      ['paid', bookingId]
    );
    
    console.log('✅ Booking status updated to paid');
    
    // Format date for notification
    let formattedDate = booking.date;
    try {
      const dateStr = typeof booking.date === 'string' ? booking.date.split('T')[0] : booking.date;
      const dateObj = new Date(dateStr + 'T00:00:00');
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    
    res.json({ 
      success: true,
      message: 'Payment successful. The reservation has been marked as paid.',
      bookingId: bookingId,
      invoiceId: invoiceId,
      booking: {
        id: booking.booking_id,
        service: booking.service,
        date: formattedDate,
        email: booking.email,
        amount: amount,
        paymentMethod: paymentMethod
      }
    });
  } catch (err) {
    console.error('❌ Payment error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Payment failed', 
      error: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
