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

    // Allow improved admin notification formatting for certain types
    const formatted = formatAdminNotification(type, title, message, data);
    const dataJson = formatted.data ? JSON.stringify(formatted.data) : null;

    // Insert notification for each admin (preserve delivered_at as NOW)
    for (const admin of admins) {
      await pool.execute(
        `INSERT INTO notifications (user_email, type, title, message, data, delivered_at, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [admin.email, type, formatted.title, formatted.message, dataJson]
      );
    }

    console.log(`✅ Notified ${admins.length} admin(s): ${type} - ${formatted.title}`);
  } catch (error) {
    console.error('❌ Error notifying admins:', error);
  }
}

// Helper: format amounts in PHP with grouping
function formatCurrencyPhp(value) {
  try {
    return Number(value || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
  } catch (e) {
    return `₱${Number(value || 0).toFixed(2)}`;
  }
}

// Build better admin-facing title/message/data for known notification types
function formatAdminNotification(type, title, message, data) {
  try {
    // Default passthrough
    const out = { title: title || '', message: message || '', data: data || null };

    if (type === 'payment_received') {
      // Expect data: { invoiceId, invoiceNumber, amountPaid, totalPaid, invoiceAmount, userName, bookingLabel }
      const userName = (data && (data.userName || data.name)) || '';
      const amt = data && (data.amountPaid || data.totalPaid || data.invoiceAmount) ? (data.amountPaid || data.totalPaid || data.invoiceAmount) : null;
      const amountStr = amt ? formatCurrencyPhp(amt) : '';
      const invoiceRef = (data && (data.invoiceNumber || data.invoiceId)) ? (data.invoiceNumber || `#${data.invoiceId}`) : '';
      const bookingLabel = data && data.bookingLabel ? ` for ${data.bookingLabel}` : '';

      out.title = 'Payment Received';
      out.message = userName ? `${userName} paid ${amountStr}${bookingLabel || ` for Invoice ${invoiceRef}`}` : message || `Payment received: ${invoiceRef} - ${amountStr}`;
      out.data = Object.assign({}, data, { amount_formatted: amountStr });
      return out;
    }

    if (type === 'booking_request' || type === 'rental_request') {
      // Expect data: { requestId, service, date, userName }
      const service = data && data.service ? data.service : '';
      const date = data && data.date ? data.date : null;
      const when = date ? ` on ${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : '';
      out.title = title || 'New Booking Request';
      out.message = data && data.userName ? `${data.userName} requested ${service}${when}` : message || out.message;
      return out;
    }

    if (type === 'new_customer') {
      const name = data && (data.name || data.userName) ? (data.name || data.userName) : '';
      out.title = title || 'New Customer Registered';
      out.message = name ? `${name} has registered as a new customer` : out.message;
      return out;
    }

    if (type === 'receipt_ready') {
      const inv = data && (data.invoiceNumber || data.invoiceId) ? (data.invoiceNumber || `#${data.invoiceId}`) : '';
      out.title = title || 'Receipt Ready';
      out.message = inv ? `Receipt for ${inv} is now available` : out.message;
      return out;
    }

    return out;
  } catch (e) {
    return { title: title || '', message: message || '', data: data || null };
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
