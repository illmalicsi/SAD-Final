const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const LOG_FILE = path.join(__dirname, '..', 'logs', 'notifications.log');
try { fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true }); } catch (e) {}

// Create notification (allows unauthenticated create to support guest flows)
router.post('/', async (req, res) => {
  try {
    const { userEmail, type, title, message, data } = req.body || {};
  const payloadLog = { userEmail, type, title, hasData: !!data, time: new Date().toISOString() };
  console.log('POST /api/notifications payload:', payloadLog);
  try { fs.appendFileSync(LOG_FILE, `POST ${JSON.stringify(payloadLog)}\n`); } catch (e) {}
    if (!userEmail || !title) return res.status(400).json({ success: false, message: 'userEmail and title are required' });

    const normalizedEmail = String(userEmail).toLowerCase().trim();
    const payloadData = data ? JSON.stringify(data) : null;

    const [result] = await pool.query(
      `INSERT INTO notifications (user_email, type, title, message, data, delivered_at, created_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [normalizedEmail, type || 'info', title, message || null, payloadData]
    );
  console.log('Inserted notification id=', result.insertId);
  try { fs.appendFileSync(LOG_FILE, `INSERTED id=${result.insertId} time=${new Date().toISOString()}\n`); } catch (e) {}

    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  console.log('Returning created notification row count=', rows.length);
  try { fs.appendFileSync(LOG_FILE, `RETURNED rows=${rows.length} id=${result.insertId}\n`); } catch (e) {}
    res.json({ success: true, notification: rows[0] });
  } catch (error) {
    console.error('Error creating notification:', error);
    try { fs.appendFileSync(LOG_FILE, `ERROR ${new Date().toISOString()} ${String(error && error.stack ? error.stack : error)}\n`); } catch (e) {}
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Fetch notifications for a user (requires authentication)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const emailQuery = req.query.email || (req.user && req.user.email);
    console.log('GET /api/notifications?email=', emailQuery, 'requested by', req.user && req.user.email);
    if (!emailQuery) return res.status(400).json({ success: false, message: 'Email is required' });

    const email = String(emailQuery).toLowerCase().trim();
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_email = ? ORDER BY created_at DESC LIMIT 500', [email]);
    // Parse JSON data field for convenience. Be defensive: some rows may already have object data
    const parsed = rows.map(r => {
      let parsedData = null;
      try {
        if (r.data) {
          if (typeof r.data === 'string') {
            parsedData = JSON.parse(r.data);
          } else {
            // mysql2 may already return JSON columns as objects
            parsedData = r.data;
          }
        }
      } catch (e) {
        console.warn('Warning: failed to parse notification.data for id', r.id, 'data=', r.data, 'error=', e && e.message);
        try { fs.appendFileSync(LOG_FILE, `WARN parse data id=${r.id} data=${String(r.data)}\n`); } catch (e) {}
        parsedData = null;
      }
      return { ...r, data: parsedData };
    });
    console.log('Fetched notifications count=', parsed.length, 'for', email);
    res.json({ success: true, notifications: parsed });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Mark a notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: 'Invalid id' });

    await pool.query('UPDATE notifications SET read_at = NOW() WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// Mark all notifications for a user as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const emailQuery = req.query.email || (req.user && req.user.email);
    if (!emailQuery) return res.status(400).json({ success: false, message: 'Email is required' });

    const email = String(emailQuery).toLowerCase().trim();
    const [result] = await pool.query('UPDATE notifications SET read_at = NOW() WHERE user_email = ? AND read_at IS NULL', [email]);
    // result.affectedRows contains number of updated rows for mysql2
    res.json({ success: true, affectedRows: (result && (result.affectedRows || result.affected_rows)) || 0 });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

// Delete a notification (admin/auth required)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: 'Invalid id' });

    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

module.exports = router;
