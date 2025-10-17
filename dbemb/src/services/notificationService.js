// Notification Service for customer notifications

const NOTIFICATION_STORAGE_KEY = 'userNotifications';

class NotificationService {
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
    
    const totalAmount = booking.estimatedValue || 5000;
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
      message: `Your booking for "${booking.service}" on ${formattedDate} has been confirmed. ${booking.invoice_id ? `Invoice #${booking.invoice_id} has been generated.` : ''} Please proceed with <payment-link>payment</payment-link>.`,
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
