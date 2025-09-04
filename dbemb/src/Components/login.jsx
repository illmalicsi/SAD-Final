import React, { useState } from 'react';

const ADMIN_CREDENTIALS = {
  email: 'admin@blueeagles.com',
  password: 'Admin123!' 
};

const sharedStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.95), rgba(2, 6, 23, 0.98))',
    padding: '20px',
    position: 'relative'
  },
  formCard: {
    backgroundColor: 'rgba(10, 25, 47, 0.8)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#e5e7eb',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logo: {
    fontFamily: 'Marcellus, serif',
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #60a5fa, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0'
  },
  logoSub: {
    fontSize: '14px',
    color: '#93c5fd',
    margin: '0 0 20px 0',
    letterSpacing: '0.1em'
  },
  title: {
    color: '#e5e7eb',
    fontSize: '24px',
    fontFamily: 'Marcellus, serif',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    color: '#e5e7eb',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#e5e7eb',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  button: {
    backgroundColor: '#64ffda',
    border: '2px solid #64ffda',
    color: '#0b1a2c',
    padding: '14px 28px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px'
  },
  switchText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    marginTop: '20px'
  },
  switchLink: {
    color: '#64ffda',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: '500'
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: 'rgba(10, 25, 47, 0.8)',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#e5e7eb',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 10
  },
  adminHint: {
    marginTop: '15px', 
    padding: '10px', 
    backgroundColor: 'rgba(100, 255, 218, 0.1)', 
    borderRadius: '8px',
    fontSize: '12px',
    color: '#64ffda',
    textAlign: 'center'
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: '14px',
    margin: '-10px 0 10px 0',
    textAlign: 'center'
  }
};

const Login = ({ onBack, onLogin, onSwitchToSignup, error, onClearError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error && onClearError) onClearError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pass the form data to the parent component for authentication
    onLogin({
      email: formData.email,
      password: formData.password
    });
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.6)';
    e.target.style.boxShadow = '0 0 0 3px rgba(100, 255, 218, 0.1)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.2)';
    e.target.style.boxShadow = 'none';
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.color = '#64ffda';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 8px 20px rgba(100, 255, 218, 0.3)';
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = '#64ffda';
    e.target.style.color = '#0b1a2c';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  const handleCloseButtonHover = (e) => {
    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    e.target.style.borderColor = 'rgba(239, 68, 68, 0.6)';
    e.target.style.color = '#ef4444';
    e.target.style.transform = 'scale(1.1)';
  };

  const handleCloseButtonLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
    e.target.style.color = '#e5e7eb';
    e.target.style.transform = 'scale(1)';
  };

  return (
    <div style={sharedStyles.container}>
      <div style={sharedStyles.formCard}>
        <button 
          style={sharedStyles.closeButton}
          onClick={onBack}
          onMouseEnter={handleCloseButtonHover}
          onMouseLeave={handleCloseButtonLeave}
          title="Close"
        >
          ×
        </button>

        <div style={sharedStyles.header}>
          <h1 style={sharedStyles.logo}>DAVAO</h1>
          <p style={sharedStyles.logoSub}>BLUE EAGLES</p>
          <h2 style={sharedStyles.title}>Welcome Back!</h2>
          <p style={sharedStyles.subtitle}>Sign in to your account</p>
        </div>

        {error && <p style={sharedStyles.errorMessage}>{error}</p>}

        <div style={sharedStyles.form}>
          <div style={sharedStyles.formField}>
            <label style={sharedStyles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              style={sharedStyles.input}
              value={formData.email}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={sharedStyles.formField}>
            <label style={sharedStyles.label}>Password</label>
            <input
              type="password"
              name="password"
              style={sharedStyles.input}
              value={formData.password}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="button"
            style={sharedStyles.button}
            onClick={handleSubmit}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            Sign In
          </button>
        </div>

        <div style={sharedStyles.switchText}>
          Don't have an account?{' '}
          <span style={sharedStyles.switchLink} onClick={onSwitchToSignup}>
            Sign up here
          </span>
        </div>

        <div style={sharedStyles.adminHint}>
          Admin Demo: admin@blueeagles.com / Admin123!
        </div>
      </div>
    </div>
  );
};

export default Login;