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
    const requestId = Number(req.params.id);
    const approvedBy = req.user.id;

    // Start transaction to ensure inventory consistency
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock the borrow request row
      const [reqRows] = await conn.query('SELECT * FROM borrow_requests WHERE request_id = ? FOR UPDATE', [requestId]);
      if (!reqRows || reqRows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ success: false, message: 'Borrow request not found' });
      }

      const requestRow = reqRows[0];
      if (requestRow.status !== 'pending') {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ success: false, message: 'Request is not pending' });
      }

      const instrumentId = requestRow.instrument_id;
      const qtyRequested = Number(requestRow.quantity) || 0;

      // Lock instrument row
      const [instRows] = await conn.query('SELECT * FROM instruments WHERE instrument_id = ? FOR UPDATE', [instrumentId]);
      if (!instRows || instRows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ success: false, message: 'Instrument not found' });
      }

      const instrument = instRows[0];
      const available = Number(instrument.quantity) || 0;
      if (available < qtyRequested) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ success: false, message: 'Insufficient quantity in inventory' });
      }

      // Decrement inventory
      await conn.query('UPDATE instruments SET quantity = quantity - ? WHERE instrument_id = ?', [qtyRequested, instrumentId]);

      // Mark request approved
      await conn.query('UPDATE borrow_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE request_id = ?', ['approved', approvedBy, requestId]);

      await conn.commit();
      conn.release();

      res.json({ success: true, message: 'Borrow request approved' });
    } catch (txErr) {
      console.error('Transaction error approving borrow request:', txErr);
      try { await conn.rollback(); } catch (e) {}
      conn.release();
      res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
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
    const requestId = Number(req.params.id);
    const approvedBy = req.user.id;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock rent request
      const [reqRows] = await conn.query('SELECT * FROM rent_requests WHERE request_id = ? FOR UPDATE', [requestId]);
      if (!reqRows || reqRows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ success: false, message: 'Rent request not found' });
      }
      const requestRow = reqRows[0];
      if (requestRow.status !== 'pending') {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ success: false, message: 'Request is not pending' });
      }

      const instrumentId = requestRow.instrument_id;
      const qtyRequested = Number(requestRow.quantity) || 0;

      // Lock instrument
      const [instRows] = await conn.query('SELECT * FROM instruments WHERE instrument_id = ? FOR UPDATE', [instrumentId]);
      if (!instRows || instRows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ success: false, message: 'Instrument not found' });
      }

      const instrument = instRows[0];
      const available = Number(instrument.quantity) || 0;
      if (available < qtyRequested) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ success: false, message: 'Insufficient quantity in inventory' });
      }

      // Decrement inventory
      await conn.query('UPDATE instruments SET quantity = quantity - ? WHERE instrument_id = ?', [qtyRequested, instrumentId]);

      // Mark rent request approved
      await conn.query('UPDATE rent_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE request_id = ?', ['approved', approvedBy, requestId]);

      await conn.commit();
      conn.release();

      res.json({ success: true, message: 'Rent request approved' });
    } catch (txErr) {
      console.error('Transaction error approving rent request:', txErr);
      try { await conn.rollback(); } catch (e) {}
      conn.release();
      res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
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

// Get all instruments - FIXED VERSION with better error handling
// This is mounted at /api/instruments/ in server.js
router.get('/', async (req, res) => {
  try {
    console.log('Fetching instruments from database...'); // Debug log
    
    const [rows] = await pool.query(`
      SELECT 
        instrument_id,
        name,
        category,
        subcategory,
        brand,
        condition_status,
        availability_status,
        quantity,
        price_per_day,
        location,
        notes,
        is_archived,
        created_at,
        updated_at
      FROM instruments 
      WHERE is_archived = FALSE
      ORDER BY category, name
    `);
    
    console.log(`Successfully fetched ${rows.length} instruments`); // Debug log
    if (rows.length > 0) {
      console.log('Sample instrument:', rows[0]); // Debug: show first instrument
    }
    
    res.json({ 
      success: true, 
      instruments: rows,
      count: rows.length 
    });
  } catch (error) {
    console.error('Error fetching instruments:', error);
    console.error('Error stack:', error.stack); // More detailed error
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch instruments',
      error: error.message // Include error message for debugging
    });
  }
});

// Get available instrument types for signup form
router.get('/types', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT DISTINCT subcategory 
      FROM instruments 
      WHERE is_archived = 0 AND subcategory IS NOT NULL AND subcategory != ''
      ORDER BY subcategory
    `);
    const types = rows.map(r => r.subcategory);
    res.json({ success: true, types });
  } catch (error) {
    console.error('Error fetching instrument types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instrument types' });
  }
});

module.exports = router;