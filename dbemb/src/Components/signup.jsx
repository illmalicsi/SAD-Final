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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
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
  inputError: {
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
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
  errorMessage: {
    color: '#ef4444',
    fontSize: '14px',
    margin: '-10px 0 10px 0',
    textAlign: 'center'
  },
  fieldError: {
    color: '#ef4444',
    fontSize: '12px',
    margin: '2px 0 0 0'
  },
  helpText: {
    color: '#94a3b8',
    fontSize: '12px',
    margin: '2px 0 0 0'
  }
};

const Signup = ({ onBack, onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    if (!phone) return 'Phone number is required'; // Phone is optional
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's exactly 11 digits and starts with 09
    if (cleanPhone.length !== 11) {
      return 'Phone number must be exactly 11 digits';
    }
    
    if (!cleanPhone.startsWith('09')) {
      return 'Phone number must start with 09';
    }
    
    return null;
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return null;
  };

  // Validate form field
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return !value ? 'First name is required' : null;
      case 'lastName':
        return !value ? 'Last name is required' : null;
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhoneNumber(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return !value ? 'Please confirm your password' : 
               value !== formData.password ? 'Passwords do not match' : null;
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits and limit to 11 characters
    let processedValue = value;
    if (name === 'phone') {
      // Remove all non-digit characters
      processedValue = value.replace(/\D/g, '');
      // Limit to 11 digits
      if (processedValue.length > 11) {
        processedValue = processedValue.slice(0, 11);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Real-time validation for confirm password
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const confirmPasswordError = name === 'confirmPassword' 
        ? (processedValue !== formData.password ? 'Passwords do not match' : null)
        : (formData.confirmPassword !== processedValue ? 'Passwords do not match' : null);
      
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Reset border style
    e.target.style.borderColor = fieldError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(100, 255, 218, 0.2)';
    e.target.style.boxShadow = 'none';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    // If there are errors, don't submit
    if (Object.values(newErrors).some(error => error !== null)) {
      return;
    }

    // Submit the form
    if (onSignup) {
      onSignup({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'user',
        isLoggedIn: true,
        isBlocked: false
      });
    }
  };

  const handleInputFocus = (e) => {
    if (!errors[e.target.name]) {
      e.target.style.borderColor = 'rgba(100, 255, 218, 0.6)';
      e.target.style.boxShadow = '0 0 0 3px rgba(100, 255, 218, 0.1)';
    }
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
          <h2 style={sharedStyles.title}>Join Our Band</h2>
          <p style={sharedStyles.subtitle}>Create your account to get started</p>
        </div>

        <div style={sharedStyles.form}>
          <div style={sharedStyles.formRow}>
            <div style={sharedStyles.formField}>
              <label style={sharedStyles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                style={errors.firstName ? sharedStyles.inputError : sharedStyles.input}
                value={formData.firstName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Enter your first name"
                required
              />
              {errors.firstName && touched.firstName && (
                <div style={sharedStyles.fieldError}>{errors.firstName}</div>
              )}
            </div>
            <div style={sharedStyles.formField}>
              <label style={sharedStyles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                style={errors.lastName ? sharedStyles.inputError : sharedStyles.input}
                value={formData.lastName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Enter your last name"
                required
              />
              {errors.lastName && touched.lastName && (
                <div style={sharedStyles.fieldError}>{errors.lastName}</div>
              )}
            </div>
          </div>

          <div style={sharedStyles.formField}>
            <label style={sharedStyles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              style={errors.email ? sharedStyles.inputError : sharedStyles.input}
              value={formData.email}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your email"
              required
            />
            {errors.email && touched.email && (
              <div style={sharedStyles.fieldError}>{errors.email}</div>
            )}
          </div>

          <div style={sharedStyles.formField}>
            <label style={sharedStyles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              style={errors.phone ? sharedStyles.inputError : sharedStyles.input}
              value={formData.phone}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter phone number"
              maxLength="11"
              required
            />
            {!errors.phone && (
              <div style={sharedStyles.helpText}></div>
            )}
            {errors.phone && touched.phone && (
              <div style={sharedStyles.fieldError}>{errors.phone}</div>
            )}
          </div>

          <div style={sharedStyles.formField}>
            <label style={sharedStyles.label}>Password</label>
            <input
              type="password"
              name="password"
              style={errors.password ? sharedStyles.inputError : sharedStyles.input}
              value={formData.password}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your password"
              required
            />
            {errors.password && touched.password && (
              <div style={sharedStyles.fieldError}>{errors.password}</div>
            )}
          </div>

          <div style={sharedStyles.formField}>
            <label style={sharedStyles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              style={errors.confirmPassword ? sharedStyles.inputError : sharedStyles.input}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <div style={sharedStyles.fieldError}>{errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            style={sharedStyles.button}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={handleSubmit}
          >
            Create Account
          </button>
        </div>

        <div style={sharedStyles.switchText}>
          Already have an account?{' '}
          <span style={sharedStyles.switchLink} onClick={onSwitchToLogin}>
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
