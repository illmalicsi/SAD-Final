// Notification Service for customer/admin notifications stored in localStorage

const NOTIFICATION_STORAGE_KEY = 'userNotifications';
const ADMIN_RECIPIENTS_KEY = 'adminRecipients';

class NotificationService {
  // Configure admin recipients (optional utility)
  static setAdminRecipients(emails = []) {
    try {
      const list = Array.isArray(emails) ? emails : [];
      localStorage.setItem(ADMIN_RECIPIENTS_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Error setting admin recipients:', e);
      return false;
    }
  }

  static getAdminRecipients() {
    try {
      const stored = localStorage.getItem(ADMIN_RECIPIENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {
      console.error('Error reading admin recipients:', e);
    }
    // Fallback default admin inbox
    return ['admin@blueeagles.com'];
  }

  static createAdminNotification(notification) {
    const admins = this.getAdminRecipients();
    admins.forEach(email => this.createNotification(email, notification));
    return admins.length;
  }
  // Create a notification
  static createNotification(userEmail, notification) {
    try {
      const notifications = this.getAllNotifications();
      
      const newNotification = {
        id: Date.now(),
        userEmail: userEmail.toLowerCase().trim(),
        type: notification.type || 'info', // 'success', 'info', 'warning', 'error'
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        read: false,
        createdAt: new Date().toISOString()
      };

      console.log('📬 Creating notification with data:', {
        title: newNotification.title,
        data: newNotification.data,
        bookingId: newNotification.data?.bookingId,
        amount: newNotification.data?.amount
      });

      notifications.push(newNotification);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('notificationsUpdated', {
        detail: { userEmail, notification: newNotification }
      }));

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Get all notifications
  static getAllNotifications() {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Get notifications for a specific user
  static getUserNotifications(userEmail) {
    try {
      const allNotifications = this.getAllNotifications();
      return allNotifications.filter(n => n.userEmail === userEmail.toLowerCase().trim());
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Notify admins and customer about a new booking request
  static notifyNewBooking(booking) {
    // Safe date formatting
    let formattedDate = 'the scheduled date';
    if (booking.date) {
      try {
        const dateStr = typeof booking.date === 'string' ? booking.date.split('T')[0] : booking.date;
        const dateObj = new Date(dateStr + 'T00:00:00');
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          });
        }
      } catch (e) {
        console.error('Error formatting date (new booking):', e);
      }
    }

    const amount = booking.estimatedValue || booking.estimated_value || 5000;

    // Customer notification: confirmation that request was received
    this.createNotification((booking.email || '').toLowerCase(), {
      type: 'info',
      title: 'Booking Request Received ✅',
      message: `We received your booking request for "${booking.service}" on ${formattedDate}. Our team will review it and notify you once approved.`,
      data: {
        bookingId: booking.booking_id || booking.id,
        service: booking.service,
        date: booking.date,
        startTime: booking.start_time || booking.startTime,
        endTime: booking.end_time || booking.endTime,
        location: booking.location,
        estimated_value: amount
      }
    });

    // Admin notification: new booking awaiting review
    this.createAdminNotification({
      type: 'warning',
      title: 'New Booking Request 📨',
      message: `${booking.customer_name || booking.customerName} requested "${booking.service}" on ${formattedDate}. Please review and approve/reject.`,
      data: {
        bookingId: booking.booking_id || booking.id,
        customer: booking.customer_name || booking.customerName,
        email: booking.email,
        phone: booking.phone,
        service: booking.service,
        date: booking.date,
        startTime: booking.start_time || booking.startTime,
        endTime: booking.end_time || booking.endTime,
        location: booking.location,
        estimated_value: amount,
        status: booking.status || 'pending'
      }
    });
  }

  // Get unread notifications for a user
  static getUnreadNotifications(userEmail) {
    try {
      const userNotifications = this.getUserNotifications(userEmail);
      return userNotifications.filter(n => !n.read);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static markAsRead(notificationId) {
    try {
      const notifications = this.getAllNotifications();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
      
      window.dispatchEvent(new Event('notificationsUpdated'));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark notification as unread
  static markAsUnread(notificationId) {
    try {
      const notifications = this.getAllNotifications();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: false } : n
      );
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
      
      window.dispatchEvent(new Event('notificationsUpdated'));
      return true;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      return false;
    }
  }

  // Mark all user notifications as read
  static markAllAsRead(userEmail) {
    try {
      const notifications = this.getAllNotifications();
      const updated = notifications.map(n => 
        n.userEmail === userEmail.toLowerCase().trim() ? { ...n, read: true } : n
      );
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
      
      window.dispatchEvent(new Event('notificationsUpdated'));
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  static deleteNotification(notificationId) {
    try {
      const notifications = this.getAllNotifications();
      const filtered = notifications.filter(n => n.id !== notificationId);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(filtered));
      
      window.dispatchEvent(new Event('notificationsUpdated'));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Clear all notifications for a user
  static clearUserNotifications(userEmail) {
    try {
      const notifications = this.getAllNotifications();
      const filtered = notifications.filter(n => n.userEmail !== userEmail.toLowerCase().trim());
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(filtered));
      
      window.dispatchEvent(new Event('notificationsUpdated'));
      return true;
    } catch (error) {
      console.error('Error clearing user notifications:', error);
      return false;
    }
  }

  // Notify about booking confirmation
  static notifyBookingConfirmed(booking) {
    console.log('📬 NotificationService: Creating booking confirmation for:', booking);
    console.log('💰 Invoice ID:', booking.invoice_id);
    
    // Prefer booking.estimated_value, then booking.estimatedValue, then fallback
    let totalAmount = 0;
    if (typeof booking.estimated_value === 'number' && booking.estimated_value > 0) {
      totalAmount = booking.estimated_value;
    } else if (typeof booking.estimatedValue === 'number' && booking.estimatedValue > 0) {
      totalAmount = booking.estimatedValue;
    } else {
      // Try to compute from package/instrument if possible
      if (booking.service && booking.notes) {
        // Band/Parade
        if (booking.service === 'Band Gigs' || booking.service === 'Parade Events') {
          const m = String(booking.notes).match(/Package:\s*([^\n]+)/i);
          const label = m ? m[1].trim() : null;
          const bandPrices = {
            '20 Players (with Food & Transport)': 15000,
            '20 Players (without Food & Transport)': 20000,
            '30 Players (with Food & Transport)': 25000,
            '30 Players (without Food & Transport)': 30000,
            'Full Band': 35000
          };
          if (label && bandPrices[label]) totalAmount = bandPrices[label];
        }
        // Instrument Rentals
        if (booking.service === 'Instrument Rentals') {
          const mi = String(booking.notes).match(/Instrument:\s*([^\n]+)/i);
          const instrumentLabel = mi ? mi[1].trim() : null;
          const mdays = String(booking.notes).match(/\((\d+)\s*days?\)/i);
          let days = mdays ? parseInt(mdays[1], 10) : 0;
          const instrumentPrices = {
            'Trumpet': 500,
            'Trombone': 500,
            'French Horn': 500,
            'Tuba': 500,
            'Flute': 500,
            'Clarinet': 500,
            'Saxophone': 500,
            'Yamaha Snare Drum': 1000,
            'Pearl Snare Drum': 1000,
            'Bass Drum': 500,
            'Cymbals': 500
          };
          if (instrumentLabel && instrumentPrices[instrumentLabel] && days > 0) {
            totalAmount = instrumentPrices[instrumentLabel] * days;
          }
        }
        // Music Arrangement
        if (booking.service === 'Music Arrangement') {
          const m = String(booking.notes).match(/Number\s+of\s+Pieces:\s*(\d+)/i);
          const pieces = m ? parseInt(m[1], 10) : 1;
          totalAmount = 3000 * pieces;
        }
        // Music Workshops
        if (booking.service === 'Music Workshops') {
          totalAmount = 5000;
        }
      }
      // Fallback if still not found
      if (!totalAmount) totalAmount = 5000;
    }
  const downPayment = Math.round(totalAmount * 0.5); // 50% down payment
    
    // Format date safely - handle both date objects and strings
    let formattedDate = 'the scheduled date';
    if (booking.date) {
      try {
        // If it's already a formatted string (YYYY-MM-DD), parse it
        const dateStr = typeof booking.date === 'string' ? booking.date.split('T')[0] : booking.date;
        const dateObj = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
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
    }
    
    return this.createNotification(booking.email, {
      type: 'success',
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for "${booking.service}" on ${formattedDate} has been confirmed. Please proceed with <payment-link>payment</payment-link>.`,
      data: {
        bookingId: booking.booking_id || booking.id,
        amount: totalAmount,
        invoiceId: booking.invoice_id || null,
        service: booking.service,
        date: booking.date,
        startTime: booking.startTime || booking.start_time,
        endTime: booking.endTime || booking.end_time,
        location: booking.location,
        paymentDetails: {
          totalAmount: totalAmount,
          downPayment: downPayment,
          fullPayment: totalAmount,
          accountName: 'Davao Blue Eagles Music Studio',
          accountNumber: '1234-5678-9012',
          bankName: 'Bank of the Philippine Islands (BPI)',
          gcashNumber: '0917-123-4567',
          gcashName: 'Davao Blue Eagles',
          paymentOptions: [
            { type: 'Down Payment (50%)', amount: downPayment },
            { type: 'Full Payment (100%)', amount: totalAmount }
          ],
          instructions: 'Please send proof of payment via email or upload to the customer portal.'
        }
      }
    });
  }

  // Notify about booking rejection
  static notifyBookingRejected(booking) {
    // Format date safely
    let formattedDate = 'the scheduled date';
    if (booking.date) {
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
    }
    
    return this.createNotification(booking.email, {
      type: 'error',
      title: 'Booking Not Approved',
      message: `Unfortunately, your booking for "${booking.service}" on ${formattedDate} could not be approved.`,
      data: {
        bookingId: booking.id,
        service: booking.service,
        date: booking.date
      }
    });
  }

  // Notify about booking cancellation
  static notifyBookingCancelled(booking) {
    // Format date safely
    let formattedDate = 'the scheduled date';
    if (booking.date) {
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
    }
    
    return this.createNotification(booking.email, {
      type: 'warning',
      title: 'Booking Cancelled',
      message: `Your booking for "${booking.service}" on ${formattedDate} has been cancelled.`,
      data: {
        bookingId: booking.id,
        service: booking.service,
        date: booking.date
      }
    });
  }
}

export default NotificationService;
