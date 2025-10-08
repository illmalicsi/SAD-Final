import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import authService from '../services/authService'; // Use real backend auth service

const sharedStyles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
    padding: 24,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: 460,
    background: '#ffffff',
    borderRadius: 16,
    padding: '48px 40px',
    boxShadow: '0 8px 32px rgba(11, 59, 120, 0.08)',
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
    fontSize: 28, 
    fontWeight: 700, 
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: '-0.02em'
  },
  subtitle: { 
    color: '#64748b', 
    fontSize: 15,
    fontWeight: 400
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { 
    fontSize: 14, 
    color: '#334155', 
    fontWeight: 600,
    marginBottom: 4
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  icon: { 
    position: 'absolute', 
    left: 14, 
    color: '#94a3b8',
    fontSize: 16
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    color: '#94a3b8',
    fontSize: 16,
    cursor: 'pointer',
    padding: 4,
    transition: 'color 0.2s'
  },
  input: {
    width: '100%',
    padding: '13px 14px 13px 44px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: 15,
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  linkRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: -8
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#334155',
    cursor: 'pointer',
    userSelect: 'none'
  },
  forgotLink: {
    fontSize: 14,
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none'
  },
  btnPrimary: {
    width: '100%',
    marginTop: 8,
    background: 'linear-gradient(135deg, #0b4f8a 0%, #0b3b78 100%)',
    border: 'none',
    color: '#ffffff',
    padding: '14px 20px',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(11, 59, 120, 0.2)'
  },
  linkText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: '#64748b'
  },
  linkAction: { 
    color: '#dc2626', 
    cursor: 'pointer', 
    fontWeight: 600,
    textDecoration: 'none'
  },
  error: { 
    color: '#dc2626', 
    textAlign: 'center', 
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
    background: '#fef2f2',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #fecaca'
  },
};

const Login = ({ onBack, onLogin, onSwitchToSignup, error, onClearError }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (error && onClearError) onClearError();
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      console.log('Login component - Attempting login...');
      const response = await authService.login(formData.email, formData.password);
      console.log('Login component - Response received:', response);
      
      if (response.success && onLogin) {
        console.log('Login component - Calling onLogin with user:', response.user);
        // Pass user data to parent component
        onLogin(response.user);
      } else {
        console.log('Login component - Login not successful or no onLogin callback');
        setLoginError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login component - Error caught:', error);
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={sharedStyles.page}>
      <div style={sharedStyles.card}>
        <button
          style={sharedStyles.close}
          onClick={onBack}
          title="Close"
          onMouseEnter={(e) => e.currentTarget.style.color = '#0b4f8a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <FaTimes size={18} />
        </button>

        <div style={sharedStyles.header}>
          <div style={sharedStyles.title}>Login</div>
          <div style={sharedStyles.subtitle}>Welcome back! Please enter your details</div>
        </div>

        {(error || loginError) && (
          <div style={sharedStyles.error}>{error || loginError}</div>
        )}

        <form style={sharedStyles.form} onSubmit={handleSubmit} noValidate>
          <div style={sharedStyles.field}>
            <label style={sharedStyles.label}>Email or Username</label>
            <div style={sharedStyles.inputWrapper}>
              <FaEnvelope style={sharedStyles.icon} />
              <input
                name="email"
                type="email"
                placeholder="Enter your email or username"
                value={formData.email}
                onChange={handleInputChange}
                style={sharedStyles.input}
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

          <div style={sharedStyles.field}>
            <label style={sharedStyles.label}>Password</label>
            <div style={sharedStyles.inputWrapper}>
              <FaLock style={sharedStyles.icon} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                style={sharedStyles.input}
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
                style={sharedStyles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0b4f8a'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <div style={sharedStyles.linkRow}>
            <label style={sharedStyles.rememberMe}>
              <input type="checkbox" /> Remember me
            </label>
            <span style={sharedStyles.forgotLink}>Forgot password?</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...sharedStyles.btnPrimary,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(11, 59, 120, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 59, 120, 0.2)';
              }
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={sharedStyles.linkText}>
            Don't have an account?{' '}
            <span
              style={sharedStyles.linkAction}
              onClick={() => { if (onSwitchToSignup) onSwitchToSignup(); else window.location.href = '/signup'; }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign up now
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;