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
    const totalAmount = booking.estimatedValue || 5000;
    const downPayment = Math.round(totalAmount * 0.5); // 50% down payment
    
    return this.createNotification(booking.email, {
      type: 'success',
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for "${booking.service}" on ${new Date(booking.date).toLocaleDateString()} has been confirmed. Please proceed with payment.`,
      data: {
        bookingId: booking.id,
        service: booking.service,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
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
    return this.createNotification(booking.email, {
      type: 'error',
      title: 'Booking Not Approved',
      message: `Unfortunately, your booking for "${booking.service}" on ${new Date(booking.date).toLocaleDateString()} could not be approved.`,
      data: {
        bookingId: booking.id,
        service: booking.service,
        date: booking.date
      }
    });
  }

  // Notify about booking cancellation
  static notifyBookingCancelled(booking) {
    return this.createNotification(booking.email, {
      type: 'warning',
      title: 'Booking Cancelled',
      message: `Your booking for "${booking.service}" on ${new Date(booking.date).toLocaleDateString()} has been cancelled.`,
      data: {
        bookingId: booking.id,
        service: booking.service,
        date: booking.date
      }
    });
  }
}

export default NotificationService;
