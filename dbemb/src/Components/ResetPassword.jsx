import React, { useState, useEffect } from 'react';
import { FaLock, FaTimes, FaEye, FaEyeSlash, FaCheckCircle } from '../icons/fa';
import authService from '../services/authService';

const ResetPassword = ({ onBack, onSwitchToLogin }) => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('No reset token provided');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else {
            window.location.href = '/';
          }
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
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
      gap: 20
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
    eyeIcon: {
      position: 'absolute',
      right: 16,
      color: '#94a3b8',
      fontSize: 18,
      cursor: 'pointer',
      transition: 'color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4
    },
    input: {
      width: '100%',
      padding: '14px 48px 14px 48px',
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
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      marginTop: 8
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
      padding: '24px',
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: 8,
      color: '#15803d',
      fontSize: 14,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center'
    },
    passwordRequirements: {
      fontSize: 13,
      color: '#64748b',
      marginTop: -4,
      paddingLeft: 4
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
          <div style={styles.title}>Reset Password</div>
          <div style={styles.subtitle}>
            Enter your new password below
          </div>
        </div>

        {success ? (
          <div style={styles.success}>
            <FaCheckCircle size={48} />
            <div>
              <strong>Password Reset Successful!</strong>
              <p style={{ margin: '8px 0 0 0' }}>
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          </div>
        ) : (
          <>
            {error && <div style={styles.error}>{error}</div>}

            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.icon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <div
                    style={styles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0b4f8a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <div style={styles.passwordRequirements}>
                  Must be at least 6 characters
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.icon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <div
                    style={styles.eyeIcon}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0b4f8a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                style={{
                  ...styles.button,
                  opacity: (isLoading || !token) ? 0.6 : 1,
                  cursor: (isLoading || !token) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

export default ResetPassword;
