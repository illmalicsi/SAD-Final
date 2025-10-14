# 🔍 DEBUGGING GUIDE - Booking Persistence

## ✅ Current Status
- Backend: Running on port 5000 ✅
- Frontend: Running on port 3000 ✅
- Database: Fixed (user_id can be NULL) ✅
- Logging: Enhanced for debugging ✅

---

## 🧪 STEP-BY-STEP TEST

### Step 1: Open the Application
1. Open: **http://localhost:3000**
2. Press **F12** to open Developer Tools
3. Go to **Console** tab (this will show all logs)

### Step 2: Create a Booking
1. Go to **"Booking"** page
2. Fill in the form:
   - Service: "Band Gigs"
   - Name: "Test Booking"
   - Email: "test@example.com"
   - Phone: "+63 912 345 6789"
   - Location: "Test Location"
   - Date: (choose tomorrow's date)
   - Start Time: "14:00"
   - End Time: "18:00"
3. Click **"Submit Booking Request"**
4. **Check Console** for logs
5. **Check Backend Terminal** - should show booking created

### Step 3: Login as Admin
1. Click **Login**
2. Email: `ivanlouiemalicsi@gmail.com`
3. Password: `Admin123!`
4. Click Login

### Step 4: Go to Booking Management
1. Click **"Booking Management"** in menu
2. **Check Console** - should show:
   ```
   BookingManagement: Loading bookings from API...
   BookingManagement: API Response: {success: true, bookings: [...]}
   ```
3. You should see your test booking

### Step 5: Approve the Booking (CRITICAL TEST)
1. Find your test booking in the list
2. Click the **green "Approve" button**
3. **Watch the Console** - you should see:
   ```
   BookingManagement: Updating booking X to status: approved
   BookingManagement: Sending PUT request to API...
   BookingManagement: API Response: {...}
   BookingManagement: Reloading bookings from API...
   ```
4. **Watch the Backend Terminal** - you should see:
   ```
   📝 Updating booking X to status: approved by user X
   ✅ Update result - Affected rows: 1
   ✅ Updated booking: {...}
   ```
5. The booking status should change to "Approved"

### Step 6: Refresh Test (THE MAIN TEST)
1. **Press F5** to refresh the page
2. **Check Console** - should show:
   ```
   BookingManagement: Loading bookings from API...
   BookingManagement: API Response: {success: true, bookings: [...]}
   ```
3. **VERIFY:** The booking should **STILL show as "Approved"**

---

## 🐛 TROUBLESHOOTING

### If booking reverts to "pending" after refresh:

#### Check 1: Browser Console Errors
**Look for:**
- Red error messages in Console
- Failed API requests in Network tab (F12 → Network)
- Authentication errors

#### Check 2: Backend Terminal
**Look for:**
- Did you see `📝 Updating booking...` when you clicked Approve?
- Did you see `✅ Update result - Affected rows: 1`?
- Any error messages?

#### Check 3: Database
**Run this command:**
```powershell
cd "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main\backend"
node -e "const {pool} = require('./config/database'); pool.query('SELECT booking_id, customer_name, status, approved_by FROM bookings ORDER BY booking_id DESC LIMIT 5').then(([rows]) => { console.table(rows); process.exit(); });"
```

**Expected:** You should see your booking with `status: 'approved'` and `approved_by` with a user ID.

**If status is still 'pending':**
- The UPDATE query didn't work
- Check if token is valid
- Check if user is authenticated

#### Check 4: API Request
**In Browser Console, paste this:**
```javascript
// Check what the API returns
fetch('http://localhost:5000/api/bookings')
  .then(r => r.json())
  .then(data => console.table(data.bookings))
```

**Expected:** You should see all bookings with their current statuses from database.

---

## 🔧 MANUAL DATABASE CHECK

### Check if the booking exists:
```powershell
cd "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main\backend"
node -e "const {pool} = require('./config/database'); pool.query('SELECT * FROM bookings').then(([rows]) => { console.log('Total bookings:', rows.length); rows.forEach(b => console.log(`ID: ${b.booking_id}, Name: ${b.customer_name}, Status: ${b.status}, ApprovedBy: ${b.approved_by}`)); process.exit(); });"
```

### Manually approve a booking (if needed):
```powershell
cd "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main\backend"
node -e "const {pool} = require('./config/database'); pool.query('UPDATE bookings SET status = ?, approved_by = 1, approved_at = NOW() WHERE booking_id = ?', ['approved', 1]).then(() => { console.log('✅ Manually approved booking 1'); process.exit(); });"
```
(Replace `1` in the WHERE clause with your booking ID)

---

## 📊 EXPECTED LOG FLOW

### When Approving:
**Frontend Console:**
```
BookingManagement: Updating booking 1 to status: approved
BookingManagement: Sending PUT request to API...
BookingManagement: API Response: {success: true, ...}
BookingManagement: Reloading bookings from API...
BookingManagement: Loading bookings from API...
BookingManagement: API Response: {success: true, bookings: [{..., status: 'approved', ...}]}
```

**Backend Terminal:**
```
📝 Updating booking 1 to status: approved by user 1
✅ Update result - Affected rows: 1
✅ Updated booking: {booking_id: 1, status: 'approved', ...}
```

### When Refreshing:
**Frontend Console:**
```
BookingManagement: Loading bookings from API...
BookingManagement: API Response: {success: true, bookings: [{..., status: 'approved', ...}]}
```

**Backend Terminal:**
```
(no logs - just serving the GET request)
```

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:
1. ✅ You see all the logs in console
2. ✅ Backend shows "Update result - Affected rows: 1"
3. ✅ Booking changes to "Approved" immediately
4. ✅ After F5 refresh, booking is STILL "Approved"
5. ✅ Database query shows `status: 'approved'`
6. ✅ Calendar updates to show the booking

---

## 🆘 IF STILL NOT WORKING

Please share:
1. **Browser Console logs** (when you click Approve)
2. **Backend Terminal logs** (when you click Approve)
3. **Database status** (run the SELECT query above)
4. **Any error messages** (red text in console or terminal)

This will help me pinpoint exactly where the issue is!

---

**Now please test again and let me know what you see in the logs!** 🔍
