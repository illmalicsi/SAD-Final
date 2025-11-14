# Production Email Setup Guide

## 🚀 Best Options for Deployed Systems

### Option 1: SendGrid (RECOMMENDED) ⭐

**Why SendGrid?**
- ✅ FREE tier: 100 emails/day forever
- ✅ No password needed (just API key)
- ✅ Professional delivery (99% inbox rate)
- ✅ Better than Gmail for production
- ✅ Email tracking & analytics

**Setup Steps:**

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com/
   - Create free account
   - Verify your email

2. **Get API Key**
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name: "Davao Blue Eagles Backend"
   - Permissions: "Full Access" or "Mail Send"
   - Copy the API key (starts with `SG.`)

3. **Install SendGrid Package**
   ```bash
   npm install @sendgrid/mail
   ```

4. **Update Your Code**
   - Rename `emailService.js` to `emailService.gmail.js` (backup)
   - Rename `emailService.sendgrid.js` to `emailService.js`

5. **Set Environment Variables** (in hosting platform):
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

6. **Verify Domain (Optional but recommended)**
   - SendGrid → Settings → Sender Authentication
   - Verify your domain for better deliverability

---

### Option 2: Mailgun

**Free tier:** 5,000 emails/month for 3 months

```bash
npm install mailgun.js form-data
```

```javascript
// emailService.mailgun.js
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

// Environment variables needed:
// MAILGUN_API_KEY=your-api-key
// MAILGUN_DOMAIN=yourdomain.com
// EMAIL_FROM=noreply@yourdomain.com
```

---

### Option 3: AWS SES (Simple Email Service)

**Best for:** Large scale (50,000 emails/month free)

```bash
npm install @aws-sdk/client-ses
```

**Environment variables:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_FROM=noreply@yourdomain.com
```

---

### Option 4: Resend (Modern Alternative)

**Free tier:** 3,000 emails/month

```bash
npm install resend
```

```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Environment variable:
// RESEND_API_KEY=re_xxxxx
```

---

## 🔒 Security Best Practices

### For Vercel/Netlify/Railway:
```
1. Go to project settings
2. Environment Variables section
3. Add variables (NOT in code)
4. Redeploy
```

### For AWS/DigitalOcean:
```bash
# Set in server environment
export SENDGRID_API_KEY="SG.xxxxx"
export EMAIL_FROM="noreply@yourdomain.com"

# Or use .env file with restricted permissions
chmod 600 .env
```

### For Docker:
```yaml
# docker-compose.yml
environment:
  - SENDGRID_API_KEY=${SENDGRID_API_KEY}
  - EMAIL_FROM=${EMAIL_FROM}
```

---

## 📧 Email From Address

**Options:**

1. **Generic (works immediately):**
   ```
   EMAIL_FROM=noreply@davaobleagles.com
   ```

2. **Verified domain (better deliverability):**
   - Verify domain in SendGrid
   - Use: `noreply@yourdomain.com`

3. **No custom domain?**
   - SendGrid allows: `yourusername@sendgrid.net`
   - Or use: `noreply@trial-xxxxx.sendgrid.net`

---

## 🧪 Testing in Production

```javascript
// Test endpoint (remove after testing)
router.post('/test-email', async (req, res) => {
  try {
    await emailService.sendPasswordResetEmail(
      'your-test-email@gmail.com',
      'https://example.com/reset?token=test123',
      'Test User'
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🆚 Comparison

| Service | Free Tier | Setup Difficulty | Deliverability |
|---------|-----------|------------------|----------------|
| **SendGrid** | 100/day | Easy | Excellent |
| Gmail | Unlimited | Easy | Good (but risky) |
| Mailgun | 5k/3mo | Easy | Excellent |
| AWS SES | 50k/mo | Medium | Excellent |
| Resend | 3k/mo | Easy | Excellent |

---

## ⚠️ Why NOT Gmail in Production?

1. Daily sending limits (500-2000/day)
2. Can get flagged as spam
3. Account can be suspended
4. App passwords can be revoked
5. Not designed for transactional emails
6. No delivery tracking

---

## 🎯 Recommended Solution

**For your project:** Use **SendGrid Free Tier**

1. No credit card required
2. 100 emails/day = enough for password resets
3. Professional delivery
4. Just one API key (no password)
5. Easy to upgrade later

**Setup time:** 10 minutes
**Cost:** $0 forever

---

## 📝 Final .env for Production

```env
# SendGrid (RECOMMENDED)
SENDGRID_API_KEY=SG.your_actual_api_key_here
EMAIL_FROM=noreply@davaobleagles.com
FRONTEND_URL=https://your-deployed-frontend.vercel.app

# Database (keep your existing)
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=dbemb

# JWT (keep your existing)
JWT_SECRET=your-secret-key

# Node Environment
NODE_ENV=production
```

**Remember:** NEVER commit .env to git!

Add to `.gitignore`:
```
.env
.env.local
.env.production
```
