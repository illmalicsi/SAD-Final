import React, { useState } from 'react';
import { FaEnvelope, FaTimes, FaCheckCircle } from '../icons/fa';
import authService from '../services/authService';

const ForgotPassword = ({ onBack, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        if (response.resetUrl) {
          setResetUrl(response.resetUrl);
        }
      } else {
        setError(response.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
      padding: 32,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    },
    card: {
      width: '100%',
      maxWidth: 480,
      background: '#ffffff',
      borderRadius: 16,
      padding: '48px 40px',
      boxShadow: '0 10px 36px rgba(11, 59, 120, 0.09)',
      color: '#1e293b',
      position: 'relative'
    },
    close: {
      position: 'absolute',
      top: 16,
      right: 16,
      background: 'transparent',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      padding: 8,
      borderRadius: 8,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s'
    },
    header: {
      textAlign: 'center',
      marginBottom: 32
    },
    title: {
      fontSize: 32,
      fontWeight: 700,
      color: '#0f172a',
      marginBottom: 8,
      letterSpacing: '-0.02em'
    },
    subtitle: {
      color: '#64748b',
      fontSize: 15,
      fontWeight: 400,
      lineHeight: 1.6
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },
    label: {
      fontSize: 15,
      color: '#334155',
      fontWeight: 600
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    icon: {
      position: 'absolute',
      left: 16,
      color: '#94a3b8',
      fontSize: 18,
      pointerEvents: 'none'
    },
    input: {
      width: '100%',
      padding: '14px 16px 14px 48px',
      fontSize: 15,
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      outline: 'none',
      background: '#f8fafc',
      color: '#1e293b',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
    },
    button: {
      padding: '14px 24px',
      fontSize: 16,
      fontWeight: 600,
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      background: 'linear-gradient(135deg, #0b4f8a 0%, #0a3d6b 100%)',
      color: '#ffffff',
      transition: 'all 0.3s',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    },
    error: {
      padding: '12px 16px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 8,
      color: '#dc2626',
      fontSize: 14,
      textAlign: 'center'
    },
    success: {
      padding: '16px',
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: 8,
      color: '#15803d',
      fontSize: 14,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'center'
    },
    devLink: {
      padding: '12px',
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      borderRadius: 8,
      marginTop: 12,
      fontSize: 13
    },
    linkText: {
      color: '#0b4f8a',
      wordBreak: 'break-all',
      fontFamily: 'monospace',
      fontSize: 12
    },
    backLink: {
      textAlign: 'center',
      marginTop: 16,
      fontSize: 14,
      color: '#64748b'
    },
    link: {
      color: '#0b4f8a',
      cursor: 'pointer',
      fontWeight: 600,
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button
          style={styles.close}
          onClick={onBack}
          title="Close"
          onMouseEnter={(e) => e.currentTarget.style.color = '#0b4f8a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <FaTimes size={18} />
        </button>

        <div style={styles.header}>
          <div style={styles.title}>Forgot Password?</div>
          <div style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </div>
        </div>

        {success ? (
          <div style={styles.success}>
            <FaCheckCircle size={48} />
            <div>
              <strong>Check your email!</strong>
              <p style={{ margin: '8px 0 0 0' }}>
                If an account exists with that email, we've sent password reset instructions.
              </p>
            </div>
          </div>
        ) : (
          <>
            {error && <div style={styles.error}>{error}</div>}

            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <FaEnvelope style={styles.icon} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0b4f8a';
                      e.target.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...styles.button,
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <div style={styles.backLink}>
          Remember your password?{' '}
          <span
            style={styles.link}
            onClick={onSwitchToLogin || onBack}
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
