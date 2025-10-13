const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all borrow requests
router.get('/borrow-requests', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        br.*,
        u.first_name AS userName,
        u.email AS userEmail,
        CONCAT(u.first_name, ' ', u.last_name) AS fullName
      FROM borrow_requests br
      JOIN users u ON br.user_id = u.id
      ORDER BY br.request_date DESC
    `);
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch borrow requests' });
  }
});

// Get all rent requests
router.get('/rent-requests', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        rr.*,
        u.first_name AS userName,
        u.email AS userEmail,
        CONCAT(u.first_name, ' ', u.last_name) AS fullName
      FROM rent_requests rr
      JOIN users u ON rr.user_id = u.id
      ORDER BY rr.request_date DESC
    `);
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error fetching rent requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rent requests' });
  }
});

// Get user's own requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [borrowRequests] = await pool.query(
      'SELECT *, "borrow" as type FROM borrow_requests WHERE user_id = ? ORDER BY request_date DESC',
      [userId]
    );

    const [rentRequests] = await pool.query(
      'SELECT *, "rent" as type FROM rent_requests WHERE user_id = ? ORDER BY request_date DESC',
      [userId]
    );

    res.json({ 
      success: true, 
      borrowRequests,
      rentRequests,
      allRequests: [...borrowRequests, ...rentRequests].sort((a, b) => 
        new Date(b.request_date) - new Date(a.request_date)
      )
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your requests' });
  }
});

// Create borrow request
router.post('/borrow-request', authenticateToken, async (req, res) => {
  try {
    const { instrumentId, instrumentName, instrumentType, quantity, startDate, endDate, purpose, notes } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO borrow_requests 
       (user_id, instrument_id, instrument_name, instrument_type, quantity, start_date, end_date, purpose, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, instrumentId, instrumentName, instrumentType, quantity, startDate, endDate, purpose, notes]
    );

    res.json({ 
      success: true, 
      message: 'Borrow request submitted successfully',
      requestId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating borrow request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit borrow request' });
  }
});

// Create rent request
router.post('/rent-request', authenticateToken, async (req, res) => {
  try {
    const { instrumentId, instrumentName, instrumentType, quantity, startDate, endDate, purpose, notes, rentalFee } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO rent_requests 
       (user_id, instrument_id, instrument_name, instrument_type, quantity, start_date, end_date, purpose, notes, rental_fee) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, instrumentId, instrumentName, instrumentType, quantity, startDate, endDate, purpose, notes, rentalFee]
    );

    res.json({ 
      success: true, 
      message: 'Rent request submitted successfully',
      requestId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating rent request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit rent request' });
  }
});

// Approve borrow request
router.put('/borrow-request/:id/approve', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const approvedBy = req.user.id;

    await pool.query(
      'UPDATE borrow_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE request_id = ?',
      ['approved', approvedBy, requestId]
    );

    res.json({ success: true, message: 'Borrow request approved' });
  } catch (error) {
    console.error('Error approving borrow request:', error);
    res.status(500).json({ success: false, message: 'Failed to approve request' });
  }
});

// Reject borrow request
router.put('/borrow-request/:id/reject', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const approvedBy = req.user.id;

    await pool.query(
      'UPDATE borrow_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE request_id = ?',
      ['rejected', approvedBy, requestId]
    );

    res.json({ success: true, message: 'Borrow request rejected' });
  } catch (error) {
    console.error('Error rejecting borrow request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
});

// Approve rent request
router.put('/rent-request/:id/approve', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const approvedBy = req.user.id;

    await pool.query(
      'UPDATE rent_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE request_id = ?',
      ['approved', approvedBy, requestId]
    );

    res.json({ success: true, message: 'Rent request approved' });
  } catch (error) {
    console.error('Error approving rent request:', error);
    res.status(500).json({ success: false, message: 'Failed to approve request' });
  }
});

// Reject rent request
router.put('/rent-request/:id/reject', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const approvedBy = req.user.id;

    await pool.query(
      'UPDATE rent_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE request_id = ?',
      ['rejected', approvedBy, requestId]
    );

    res.json({ success: true, message: 'Rent request rejected' });
  } catch (error) {
    console.error('Error rejecting rent request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
});

// Get all instruments
router.get('/instruments', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM instruments 
      WHERE is_archived = FALSE AND availability_status = 'Available'
      ORDER BY category, name
    `);
    res.json({ success: true, instruments: rows });
  } catch (error) {
    console.error('Error fetching instruments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instruments' });
  }
});

module.exports = router;
