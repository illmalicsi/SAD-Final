// SendGrid Email Service (Recommended for Production)
// Free tier: 100 emails/day forever
// No password needed, just API key

const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    // Set API key from environment variable
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@davaobleagles.com';
  }

  async sendPasswordResetEmail(toEmail, resetUrl, userName) {
    try {
      const msg = {
        to: toEmail,
        from: {
          email: this.fromEmail,
          name: 'Davao Blue Eagles'
        },
        subject: 'Password Reset Request - Davao Blue Eagles',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #0b4f8a;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #0b4f8a;
                margin-bottom: 10px;
              }
              .content {
                padding: 30px 0;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 20px;
              }
              .message {
                margin-bottom: 30px;
                color: #666;
              }
              .button {
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #0b4f8a 0%, #1a75d2 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
              }
              .button:hover {
                background: linear-gradient(135deg, #094070 0%, #1562b5 100%);
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 2px solid #e0e0e0;
                color: #999;
                font-size: 12px;
              }
              .link {
                color: #0b4f8a;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🦅 Davao Blue Eagles</div>
                <p style="margin: 0; color: #666;">Music Instrument Rental System</p>
              </div>
              
              <div class="content">
                <div class="greeting">Hello ${userName || 'there'},</div>
                
                <div class="message">
                  We received a request to reset your password for your Davao Blue Eagles account.
                  Click the button below to create a new password:
                </div>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <div class="warning">
                  <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
                </div>
                
                <div class="message">
                  If the button doesn't work, copy and paste this link into your browser:
                  <br><br>
                  <a href="${resetUrl}" class="link">${resetUrl}</a>
                </div>
                
                <div class="message">
                  If you didn't request a password reset, please ignore this email. 
                  Your password will remain unchanged.
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated message from Davao Blue Eagles Music Instrument Rental System.</p>
                <p>© ${new Date().getFullYear()} Davao Blue Eagles. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hello ${userName || 'there'},

We received a request to reset your password for your Davao Blue Eagles account.

Reset your password here: ${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email.

© ${new Date().getFullYear()} Davao Blue Eagles
        `.trim()
      };

      const result = await sgMail.send(msg);
      console.log('✅ Password reset email sent successfully via SendGrid');
      return result;

    } catch (error) {
      console.error('❌ Failed to send email via SendGrid:', error);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      throw error;
    }
  }

  async testConnection() {
    console.log('SendGrid API Key configured:', !!process.env.SENDGRID_API_KEY);
    return !!process.env.SENDGRID_API_KEY;
  }
}

module.exports = new EmailService();
