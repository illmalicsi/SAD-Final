import React, { useState } from 'react';

const sharedStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.95), rgba(2, 6, 23, 0.98))',
    padding: '20px'
  },
  formCard: {
    backgroundColor: 'rgba(10, 25, 47, 0.8)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
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
    backgroundColor: 'transparent',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    color: '#e5e7eb',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  }
};

const Login = ({ onBack, onLogin, onSwitchToSignup }) => {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Logging in...', formData);
    
    if (onLogin) {
      onLogin({
        email: formData.email,
        firstName: formData.email.split('@')[0],
        isLoggedIn: true
      });
    }
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

  return (
    <div style={sharedStyles.container}>
      <button 
        style={sharedStyles.backButton}
        onClick={onBack}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(100, 255, 218, 0.1)';
          e.target.style.borderColor = 'rgba(100, 255, 218, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
        }}
      >
        ← Back to Home
      </button>

      <div style={sharedStyles.formCard}>
        <div style={sharedStyles.header}>
          <h1 style={sharedStyles.logo}>DAVAO</h1>
          <p style={sharedStyles.logoSub}>BLUE EAGLES</p>
          <h2 style={sharedStyles.title}>Welcome Back!</h2>
          <p style={sharedStyles.subtitle}>Sign in to your account</p>
        </div>

        <form style={sharedStyles.form} onSubmit={handleSubmit}>
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
            type="submit"
            style={sharedStyles.button}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            Sign In
          </button>
        </form>

        <div style={sharedStyles.switchText}>
          Don't have an account?{' '}
          <span style={sharedStyles.switchLink} onClick={onSwitchToSignup}>
            Sign up here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;