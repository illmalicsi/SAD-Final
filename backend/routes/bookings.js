const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');
// Removed timezone utils as board endpoint is no longer needed
const billingService = require('../services/billingService');

// Get all bookings (public endpoint for calendar display)
router.get('/', async (req, res) => {
  try {
    // Disable caching to always get fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const [bookings] = await pool.query(
      `SELECT b.*, 
              u.first_name, u.last_name,
              approver.first_name AS approver_first_name,
              approver.last_name AS approver_last_name
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN users approver ON b.approved_by = approver.id
       ORDER BY b.created_at DESC`
    );
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bookings',
      error: error.message 
    });
  }
});

// Removed board endpoint (/api/bookings/board)

// Get bookings by user email (for customers)
router.get('/user/:email', async (req, res) => {
  try {
    // Disable caching to always get fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const { email } = req.params;
    const [bookings] = await pool.query(
      `SELECT b.*, 
              approver.first_name AS approver_first_name,
              approver.last_name AS approver_last_name
       FROM bookings b
       LEFT JOIN users approver ON b.approved_by = approver.id
       WHERE b.email = ?
       ORDER BY b.created_at DESC`,
      [email]
    );
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bookings',
      error: error.message 
    });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      customerName,
      email,
      phone,
      service,
      date,
      startTime,
      endTime,
      location,
      estimatedValue,
      notes,
      status
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !phone || !service || !date || !startTime || !endTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Allow status to be set (for migration), default to 'pending'
    const bookingStatus = status || 'pending';

    // Use the date string directly from the request to avoid any timezone conversions.
    const formattedDate = date;

    console.log('📅 Backend received booking date:', formattedDate);
    console.log('   Full booking data:', { customerName, service, date: formattedDate, startTime, endTime });

    const [result] = await pool.query(
      `INSERT INTO bookings 
       (user_id, customer_name, email, phone, service, date, start_time, end_time, location, estimated_value, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, customerName, email, phone, service, formattedDate, startTime, endTime, location, estimatedValue || 5000, notes || null, bookingStatus]
    );

    const [newBooking] = await pool.query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [result.insertId]
    );

    console.log('✅ Booking created with date:', newBooking[0].date);
    console.log('   Stored date type:', typeof newBooking[0].date);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Update booking status (approve/reject)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const approvedBy = req.user.id;

    console.log(`📝 Updating booking ${id} to status: ${status} by user ${approvedBy}`);

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      console.log('❌ Invalid status value:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const [result] = await pool.query(
      `UPDATE bookings 
       SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW()
       WHERE booking_id = ?`,
      [status, approvedBy, id]
    );

    console.log(`✅ Update result - Affected rows: ${result.affectedRows}`);

    if (result.affectedRows === 0) {
      console.log('❌ Booking not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const [updatedBooking] = await pool.query(
      `SELECT b.*, 
              approver.first_name AS approver_first_name,
              approver.last_name AS approver_last_name
       FROM bookings b
       LEFT JOIN users approver ON b.approved_by = approver.id
       WHERE b.booking_id = ?`,
      [id]
    );

    console.log('✅ Updated booking:', updatedBooking[0]);

    // If booking was approved, automatically create an invoice
    if (status === 'approved' && updatedBooking[0]) {
      try {
        const booking = updatedBooking[0];
        const amount = booking.estimated_value || 5000;
        const description = `Booking for ${booking.service} on ${booking.date}`;
        
        // Find user by email (if they have an account)
        const [userResult] = await pool.query(
          'SELECT id FROM users WHERE email = ?',
          [booking.email]
        );
        
        if (userResult.length > 0) {
          const userId = userResult[0].id;
          console.log(`💰 Creating invoice for user ${userId}, amount: ₱${amount}`);
          
          const invoice = await billingService.generateInvoice(userId, amount, description);
          console.log(`✅ Invoice #${invoice.invoice_id} created successfully`);
          
          // Add invoice info to response
          updatedBooking[0].invoice_id = invoice.invoice_id;
        } else {
          console.log(`⚠️ No user account found for email: ${booking.email}, skipping invoice creation`);
        }
      } catch (invoiceError) {
        console.error('❌ Error creating invoice:', invoiceError);
        // Don't fail the booking approval if invoice creation fails
      }
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBooking[0]
    });
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
});

// Delete a booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM bookings WHERE booking_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

module.exports = router;
