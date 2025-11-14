const { pool } = require('../config/database');

/**
 * Send notification to all admin users
 * @param {string} type - Notification type (e.g., 'new_member', 'booking_request', 'rental_request', 'payment')
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data (JSON)
 */
async function notifyAllAdmins(type, title, message, data = null) {
  try {
    // Get all admin emails
    const [admins] = await pool.execute(
      `SELECT DISTINCT u.email 
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE r.role_name = 'admin' AND u.is_active = 1 AND u.is_blocked = 0`
    );

    if (admins.length === 0) {
      console.log('⚠️  No active admins found to notify');
      return;
    }

    const dataJson = data ? JSON.stringify(data) : null;

    // Insert notification for each admin
    for (const admin of admins) {
      await pool.execute(
        `INSERT INTO notifications (user_email, type, title, message, data, delivered_at, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [admin.email, type, title, message, dataJson]
      );
    }

    console.log(`✅ Notified ${admins.length} admin(s): ${type} - ${title}`);
  } catch (error) {
    console.error('❌ Error notifying admins:', error);
  }
}

/**
 * Send notification to a specific user
 * @param {string} userEmail - User email
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data (JSON)
 */
async function notifyUser(userEmail, type, title, message, data = null) {
  try {
    const dataJson = data ? JSON.stringify(data) : null;

    await pool.execute(
      `INSERT INTO notifications (user_email, type, title, message, data, delivered_at, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userEmail, type, title, message, dataJson]
    );

    console.log(`✅ Notified user ${userEmail}: ${type} - ${title}`);
  } catch (error) {
    console.error('❌ Error notifying user:', error);
  }
}

module.exports = {
  notifyAllAdmins,
  notifyUser
};
