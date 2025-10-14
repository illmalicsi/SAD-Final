# Booking Notification System - Quick Start Guide

## How to Test the Notification Feature

### Step 1: Start the Application
```bash
# In the dbemb directory
npm start
```

### Step 2: Create a Test Booking (as Customer)

1. Go to the home page
2. Navigate to the booking section
3. Fill out the booking form:
   - Service: Any service (e.g., "Band Gigs")
   - Name: Your name
   - Email: **Important** - Use the same email you'll log in with
   - Phone: Any phone number
   - Location: Any location
   - Date: Pick a future date
   - Time: Select start and end time
4. Submit the booking

### Step 3: Log in as Admin

1. Click "Login" or "Dashboard"
2. Log in with admin credentials
3. You should now be in the Dashboard

### Step 4: Approve the Booking

1. In the Dashboard sidebar, click **"Bookings"** (under Management section)
2. You'll see your test booking with status "Pending"
3. Click the **"Approve & Notify"** button
4. You should see a success message: "Booking approved and customer notified!"

### Step 5: Check Notifications (as Customer)

1. Log out from admin account
2. Log in with the **same email** you used when creating the booking
3. Go to Dashboard
4. Look at the bell icon in the top right - it should show a badge with "1"
5. Click **"Notifications"** in the sidebar (or click the bell icon)
6. You should see your notification:
   - Title: "Booking Confirmed! 🎉"
   - Message with booking details
   - Green color indicating success

### Step 6: Interact with Notifications

You can:
- Click on an unread notification to mark it as read
- Click the "X" button to delete a notification
- Click "Mark all as read" to mark all as read at once

## Quick Test Script

If you want to test quickly without going through the UI:

1. Open browser console (F12)
2. Run this code to create a test notification:

```javascript
// Import the notification service in your component or run in console
const testBooking = {
  id: 12345,
  service: "Band Gigs",
  name: "Test User",
  email: "test@example.com", // Use your login email
  date: "2025-10-20",
  startTime: "14:00",
  endTime: "18:00",
  location: "Test Location"
};

// Create notification service
const NotificationService = {
  createNotification: (userEmail, notification) => {
    const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    const newNotification = {
      id: Date.now(),
      userEmail: userEmail.toLowerCase().trim(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    window.dispatchEvent(new Event('notificationsUpdated'));
    return newNotification;
  }
};

// Send test notification
NotificationService.createNotification('test@example.com', {
  type: 'success',
  title: 'Booking Confirmed! 🎉',
  message: 'Your booking for "Band Gigs" on October 20, 2025 has been confirmed.',
  data: { bookingId: 12345, service: 'Band Gigs', date: '2025-10-20' }
});

alert('Test notification created! Check Dashboard → Notifications');
```

## Troubleshooting

### Notification not appearing?

1. **Check email match**: The email used in the booking must match the email you're logged in with
2. **Refresh the page**: Try refreshing the dashboard
3. **Check localStorage**: Open console and run:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('userNotifications')));
   ```
4. **Clear and retry**: Clear localStorage and try again:
   ```javascript
   localStorage.removeItem('userNotifications');
   ```

### Badge not updating?

1. The dashboard polls for notifications every 10 seconds
2. Try clicking the "Notifications" menu item to trigger a refresh
3. Refresh the entire page

### Admin can't see Bookings menu?

1. Make sure you're logged in as admin (role: 'admin')
2. Check user object in console:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('davaoBlueEaglesUser')));
   ```

## Demo Accounts

If you don't have test accounts, you can create them or use these localStorage commands:

```javascript
// Create a test customer
localStorage.setItem('davaoBlueEaglesUser', JSON.stringify({
  id: 1,
  email: 'customer@test.com',
  firstName: 'John',
  lastName: 'Customer',
  role: 'customer'
}));

// Create a test admin
localStorage.setItem('davaoBlueEaglesUser', JSON.stringify({
  id: 2,
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
}));
```

## Expected Behavior

✅ **When booking is approved:**
- Admin sees success message
- Customer gets notification with:
  - Green success indicator
  - Title: "Booking Confirmed! 🎉"
  - Details about service, date, time, location
  - Unread badge on bell icon

✅ **When booking is rejected:**
- Admin sees info message
- Customer gets notification with:
  - Red error indicator
  - Title: "Booking Not Approved"
  - Information about the rejection

✅ **Real-time updates:**
- Notifications appear without page refresh
- Badge count updates automatically
- Mark as read works instantly

Enjoy testing the new notification system! 🎉
