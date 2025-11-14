const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter using Gmail
    // For production, use OAuth2 or App-specific password
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
      }
    });
  }

  async sendPasswordResetEmail(toEmail, resetUrl, userName) {
    try {
      const mailOptions = {
        from: `"Davao Blue Eagles" <${process.env.EMAIL_USER}>`,
        to: toEmail,
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
              .button {
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #0b4f8a 0%, #0a3d6b 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .button:hover {
                background: linear-gradient(135deg, #0a3d6b 0%, #0b4f8a 100%);
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #666;
                font-size: 12px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .link-fallback {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                word-break: break-all;
                margin: 15px 0;
                font-size: 12px;
                color: #0b4f8a;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🎺 Davao Blue Eagles</div>
                <p style="color: #666; margin: 0;">Band Management System</p>
              </div>
              
              <div class="content">
                <h2 style="color: #0b4f8a;">Password Reset Request</h2>
                
                <p>Hello ${userName || 'there'},</p>
                
                <p>We received a request to reset your password for your Davao Blue Eagles account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Your Password</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <div class="link-fallback">
                  ${resetUrl}
                </div>
                
                <p><strong>Didn't request a password reset?</strong></p>
                <p>If you didn't make this request, you can safely ignore this email. Your password will not be changed.</p>
              </div>
              
              <div class="footer">
                <p>This email was sent by Davao Blue Eagles Band Management System</p>
                <p>If you have any questions, please contact our support team.</p>
                <p style="margin-top: 15px; color: #999;">
                  © ${new Date().getFullYear()} Davao Blue Eagles. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

// Send an email with attachments (attachments can be objects accepted by nodemailer)
EmailService.prototype.sendEmailWithAttachment = async function(toEmail, subject, htmlBody, attachments = []) {
  try {
    const mailOptions = {
      from: `"Davao Blue Eagles" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlBody,
      attachments
    };
    const info = await this.transporter.sendMail(mailOptions);
    console.log('✅ Email with attachment sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Error sending email with attachment:', err);
    throw err;
  }
};
