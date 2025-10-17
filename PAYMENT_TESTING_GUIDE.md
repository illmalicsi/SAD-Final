# Payment Testing Guide 🧪

## Complete End-to-End Payment Flow Testing

### Prerequisites
1. Backend server running (`npm start` in backend folder)
2. Frontend running (`npm start` in dbemb folder)
3. Database with proper tables (run the migration script if needed)
4. Two user accounts:
   - **Admin account**: `ivanlouiemalicsi@gmail.com` / `Admin123!`
   - **User account**: Create one via Member Signup

---

## Step-by-Step Testing

### 1️⃣ Create a User Account (If You Don't Have One)

1. Go to the **Home page**
2. Click **"Register Now"**
3. Fill in the Member Signup form:
   - First Name: John
   - Last Name: Doe
   - Email: johndoe@test.com
   - Password: test123
   - Phone: 09171234567
   - Birthday: 1990-01-01
   - Instrument: Trumpet
   - Address: 123 Test St, Davao City
   - Upload an identity proof (any image/PDF)
4. Click **"Sign Up"**
5. You should see a success message

---

### 2️⃣ Approve the Member (Admin Task)

1. **Login as Admin**:
   - Email: `ivanlouiemalicsi@gmail.com`
   - Password: `Admin123!`

2. Go to **Dashboard** → **Membership Approval**

3. Find the new member (John Doe) and click the **▼ chevron** to expand details

4. Review all the submitted information

5. Click **"Approve"** button

6. The user is now approved and can make bookings!

---

### 3️⃣ Make a Booking (User Task)

1. **Logout** from admin account

2. **Login as the user**:
   - Email: `johndoe@test.com`
   - Password: `test123`

3. From the **Home page**, go to the **Services** section

4. Click **"Book Now"** on any service (this opens in a new tab)

5. Fill in the booking form:
   - Service: Band Gigs
   - Date: Pick any future date
   - Start Time: 14:00
   - End Time: 18:00
   - Location: SM Lanang Premier
   - Notes: Test booking for payment flow
   
6. Click **"Submit Booking"**

7. You should see a success message

---

### 4️⃣ Approve the Booking (Admin Task)

1. **Logout** from user account

2. **Login as Admin** again

3. Go to **Dashboard** → **Customers & Bookings**

4. Find the booking you just created

5. Click **"Approve"** button

6. ✨ **Magic happens**: An invoice is automatically created for this booking!

---

### 5️⃣ View Invoice (User Task)

1. **Logout** from admin account

2. **Login as the user** (`johndoe@test.com`)

3. Go to **Dashboard** → **My Invoices** (in the Finance section)

4. You should see the invoice for your approved booking:
   - Status: **"Approved - Awaiting Payment"**
   - Amount: ₱5,000.00 (default estimated value)
   - Description: "Booking for Band Gigs on [date]"

---

### 6️⃣ Process Payment (Admin Task)

1. **Logout** from user account

2. **Login as Admin**

3. Go to **Dashboard** → **Process Payments** (in the Finance section)

4. You should see the approved invoice in the list with:
   - User details (name and email)
   - Invoice amount
   - Description

5. Click **"Process Payment"** button

6. A modal appears asking for:
   - Payment Method (Cash, Bank Transfer, GCash, Credit/Debit Card)
   
7. Select a payment method (e.g., "Cash")

8. Click **"Confirm Payment"**

9. ✨ **Payment is processed!**

10. A **Receipt Dialog** appears showing:
    - Invoice number
    - User details
    - Amount paid
    - Payment method
    - Date and time

11. Click **"Close"** on the receipt

---

### 7️⃣ Verify Payment (User Task)

1. **Logout** from admin account

2. **Login as the user** (`johndoe@test.com`)

3. Go to **Dashboard** → **My Invoices**

4. The invoice status should now show: **"Paid"** ✅

5. The invoice is marked as completed!

---

## What Gets Created/Updated in Database

### When Booking is Approved:
- `invoices` table: New invoice record with status = 'approved'
- `bookings` table: Booking status = 'approved'

### When Payment is Processed:
- `payments` table: New payment record with payment method and amount
- `invoices` table: Invoice status updated to 'paid'
- `transactions` table: New transaction record logged

---

## Quick Test Commands

### Check Invoices in Database:
```sql
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5;
```

### Check Payments in Database:
```sql
SELECT * FROM payments ORDER BY processed_at DESC LIMIT 5;
```

### Check Transactions in Database:
```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5;
```

---

## Troubleshooting

### "No invoices showing for user"
- Make sure the user has an account in the database
- Check that the booking was approved
- Verify the invoice was created (check backend logs)

### "Cannot process payment"
- Ensure you're logged in as admin
- Check that backend server is running
- Verify the invoice status is 'approved'

### "User details not showing in Payment view"
- Backend needs to have `/api/users/:id` endpoint working
- Check browser console for errors

---

## Summary

✅ User signs up → Admin approves member  
✅ User books service → Admin approves booking  
✅ Invoice auto-created with 'approved' status  
✅ User sees invoice in their dashboard  
✅ Admin processes payment with method selection  
✅ Receipt shown with transaction details  
✅ Invoice marked as 'paid'  
✅ User can verify payment was recorded  

**The complete payment flow is now working! 🎉**
