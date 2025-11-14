# Gmail Setup for Password Reset Emails

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click on **2-Step Verification**
4. Follow the prompts to enable 2-Factor Authentication

## Step 2: Create App-Specific Password

1. After enabling 2FA, go back to Security settings
2. Under "Signing in to Google", click on **App passwords**
3. You may need to sign in again
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Enter a name like "Davao Blue Eagles Backend"
7. Click **Generate**
8. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

## Step 3: Update .env File

Open `backend/.env` and update these lines with YOUR Gmail and app password:

```env
EMAIL_USER=your.actual.email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Important:** 
- Remove spaces from the app password
- Use your actual Gmail address
- Keep this password secret (never commit .env to git)

## Step 4: Restart Backend Server

After updating the .env file:

```powershell
cd backend
npm start
```

## Step 5: Test the Feature

1. Go to login page
2. Click "Forgot password?"
3. Enter an email address from your database
4. Check your Gmail inbox (and spam folder) for the reset email

## Troubleshooting

### Email not arriving?

1. **Check spam folder** - Gmail might filter it
2. **Verify credentials** - Make sure EMAIL_USER and EMAIL_PASSWORD are correct
3. **Check backend console** - Look for error messages
4. **Test email service** - The console will show if email sending failed

### "Less secure app access" error?

- You need to use App Password (not your regular Gmail password)
- Make sure 2-Factor Authentication is enabled first

### Still not working?

1. Check backend console for error messages
2. Verify the email exists in your database
3. The development reset URL will still show in the UI for testing

## Alternative: Use Development Mode

If you can't set up Gmail right now, the system will:
- Still show the reset URL in the frontend (development mode)
- Log the URL to backend console
- You can copy/paste the URL to test the feature

Just update .env:
```env
NODE_ENV=development
```

The reset URL will appear directly in the success message on the forgot password page!
