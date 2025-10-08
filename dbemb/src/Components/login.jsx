import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaTimes, FaUserAlt } from 'react-icons/fa';
import authService from '../services/authService'; // Use real backend auth service

const sharedStyles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(10,25,47,0.98), rgba(2,6,23,0.99))',
    padding: 20,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 14,
    padding: 28,
    background: 'linear-gradient(180deg, rgba(7,16,30,0.82), rgba(6,12,24,0.82))',
    border: '1px solid rgba(100,255,218,0.06)',
    boxShadow: '0 12px 30px rgba(2,6,23,0.6)',
    position: 'relative',
    color: '#e6eef8'
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '1px solid rgba(100,255,218,0.06)',
    background: 'transparent',
    color: '#9fb0c8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    background: 'linear-gradient(90deg,#0ea5a5,#60a5fa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#031024',
    fontWeight: 700,
    fontSize: 20
  },
  title: { fontSize: 20, fontWeight: 700, color: '#fff' },
  subtitle: { color: '#9fb0c8', fontSize: 13 },
  form: { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 },
  field: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: 12, color: '#9fb0c8' },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    borderRadius: 10,
    border: '1px solid rgba(100,255,218,0.06)',
    background: 'rgba(2,6,23,0.45)',
    color: '#e6eef8',
    fontSize: 15,
    outline: 'none'
  },
  hint: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
  btnPrimary: {
    marginTop: 6,
    background: 'linear-gradient(90deg,#14b8a6,#60a5fa)',
    border: 'none',
    color: '#031024',
    padding: '12px 16px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15
  },
  linkRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  linkText: { color: '#9fb0c8', fontSize: 13 },
  linkAction: { color: '#64ffda', cursor: 'pointer', fontWeight: 600 },
  error: { color: '#ff6b6b', textAlign: 'center', marginTop: 8 },

  // added styles for admin note + signup below
  adminNote: {
    marginTop: 12,
    textAlign: 'center',
    color: '#9fb0c8',
    fontSize: 13,
    lineHeight: 1.3
  },
  adminCreds: {
    background: 'rgba(6,10,20,0.35)',
    border: '1px solid rgba(100,255,218,0.04)',
    display: 'inline-block',
    padding: '8px 12px',
    borderRadius: 8,
    color: '#cfeee3',
    fontSize: 13,
    marginTop: 8
  },
  signupBelow: {
    marginTop: 8,
    color: '#9fb0c8',
    fontSize: 13
  }
};

const Login = ({ onBack, onLogin, onSwitchToSignup, error, onClearError }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

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

  const focusStyle = (e) => {
    e.target.style.boxShadow = '0 6px 18px rgba(96,165,250,0.06)';
    e.target.style.borderColor = 'rgba(100,255,218,0.24)';
  };
  const blurStyle = (e) => {
    e.target.style.boxShadow = 'none';
    e.target.style.borderColor = 'rgba(100,255,218,0.06)';
  };

  return (
    <div style={sharedStyles.page}>
      <div style={sharedStyles.card}>
        <button
          style={sharedStyles.close}
          onClick={onBack}
          title="Close"
        >
          <FaTimes />
        </button>

        <div style={sharedStyles.header}>
          <div style={sharedStyles.logoBox}><FaUserAlt color="#ffffff" /></div>
          <div>
            <div style={sharedStyles.title}>Welcome Back</div>
            <div style={sharedStyles.subtitle}>Login to access the website</div>
          </div>
        </div>

        {(error || loginError) && (
          <div style={sharedStyles.error}>{error || loginError}</div>
        )}

        <form style={sharedStyles.form} onSubmit={handleSubmit} noValidate>
          <div style={sharedStyles.field}>
            <FaEnvelope style={sharedStyles.icon} />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
              style={sharedStyles.input}
              required
            />
          </div>

          <div style={sharedStyles.field}>
            <FaLock style={sharedStyles.icon} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
              style={sharedStyles.input}
              required
            />
          </div>

          <div style={sharedStyles.linkRow}>
            <div style={sharedStyles.linkText}>
              <label style={{ cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" style={{ marginRight: 8 }} /> Remember me
              </label>
            </div>

            {/* removed duplicate Sign up link (kept signup link below admin creds) */}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...sharedStyles.btnPrimary,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={e => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)') && (e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)')}
            onMouseLeave={e => !isLoading && (e.currentTarget.style.transform = 'translateY(0)') && (e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)')}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Login help and signup link */}
          <div style={sharedStyles.adminNote}>
            <div style={sharedStyles.adminCreds}>
              <strong>Demo Login:</strong> ivanlouiemalicsi@gmail.com / Admin123!
            </div>
            <div style={sharedStyles.signupBelow}>
              Don't have an account?{' '}
              <span
                style={sharedStyles.linkAction}
                onClick={() => { if (onSwitchToSignup) onSwitchToSignup(); else window.location.href = '/signup'; }}
              >
                Sign up
              </span>
            </div>
            <div style={{...sharedStyles.signupBelow, marginTop: 8, fontSize: 11, color: '#6b7280'}}>
              (Currently using temporary authentication while backend connects)
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;