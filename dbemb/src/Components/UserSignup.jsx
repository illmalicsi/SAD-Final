import React, { useState } from "react";
import authService from '../services/authService';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const UserSignup = ({ onSignup, onClose, onSwitchToLogin }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
      padding: 24,
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: 460,
      background: "#ffffff",
      borderRadius: 16,
      padding: "36px 40px 40px 40px",
      boxShadow: "0 10px 40px rgba(11, 59, 120, 0.12)",
      color: "#1e293b",
      position: "relative"
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      padding: 8,
      borderRadius: 8,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "color 0.2s"
    },
    header: { 
      textAlign: "center", 
      marginBottom: 28,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    },
    logoBox: {
      background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
      padding: "18px 32px",
      borderRadius: 12,
      boxShadow: "0 6px 20px rgba(11, 59, 120, 0.25)",
      marginBottom: 4
    },
    logoText: {
      margin: 0,
      lineHeight: 1.3
    },
    logoTextTop: {
      fontSize: 22,
      fontWeight: 800,
      color: "#60a5fa",
      letterSpacing: "0.18em",
      display: "block",
      textShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    logoTextBottom: {
      fontSize: 12,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: "0.25em",
      display: "block",
      marginTop: 1
    },
    title: { 
      fontSize: 26, 
      fontWeight: 700, 
      color: "#0f172a",
      marginBottom: 2,
      letterSpacing: "-0.02em",
      marginTop: 6
    },
    subtitle: { 
      color: "#64748b", 
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.4
    },
    field: { 
      display: "flex", 
      flexDirection: "column", 
      gap: 6,
      marginBottom: 14
    },
    label: { 
      fontSize: 13, 
      color: "#334155", 
      fontWeight: 600,
      marginBottom: 2
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    },
    icon: {
      position: "absolute",
      left: 14,
      color: "#94a3b8",
      fontSize: 16
    },
    eyeIcon: {
      position: "absolute",
      right: 14,
      color: "#94a3b8",
      fontSize: 16,
      cursor: "pointer",
      padding: 4,
      transition: "color 0.2s"
    },
    input: {
      width: "100%",
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      color: "#1e293b",
      padding: "11px 14px 11px 44px",
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit"
    },
    err: { 
      color: "#dc2626", 
      fontSize: 12,
      marginTop: 4,
      fontWeight: 500
    },
    btnPrimary: {
      width: "100%",
      background: "linear-gradient(135deg, #0b4f8a 0%, #0b3b78 100%)",
      border: "none",
      color: "#ffffff",
      padding: "12px 20px",
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 6,
      transition: "all 0.2s",
      boxShadow: "0 4px 12px rgba(11, 59, 120, 0.2)"
    },
    linkText: {
      textAlign: "center",
      marginTop: 16,
      fontSize: 13,
      color: "#64748b"
    },
    linkButton: {
      background: "transparent",
      border: "none",
      color: "#dc2626",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      textDecoration: "none",
      padding: 0,
      marginLeft: 4
    },
    successBox: {
      marginTop: 16,
      padding: 14,
      borderRadius: 10,
      background: "#f0fdf4",
      border: "1.5px solid #86efac",
      color: "#166534",
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 14
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 16,
    },
  };

  const validate = (values) => {
    const e = {};
    if (!values.firstName.trim()) e.firstName = "First name required";
    if (!values.lastName.trim()) e.lastName = "Last name required";
    if (!values.email) e.email = "Email required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Invalid email";
    if (!values.password) e.password = "Password required";
    else if (values.password.length < 6) e.password = "Password must be at least 6 characters";
    if (values.password !== values.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleChange = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: null }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSuccess(null);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      };
      await authService.register(payload);
      setSuccess("Registration successful! You can now log in.");
      
      // Auto-login
      try {
        const loginRes = await authService.login(payload.email, payload.password);
        if (loginRes && loginRes.success && onSignup) {
          onSignup(loginRes.user);
        }
      } catch (loginErr) {
        console.warn('Auto-login failed after registration:', loginErr);
      }

      setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: err.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit} noValidate>
        <button 
          type="button" 
          aria-label="Close" 
          onClick={onClose} 
          style={styles.closeButton}
          onMouseEnter={(e) => e.currentTarget.style.color = '#0b4f8a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <FaTimes size={18} />
        </button>
        
        <div style={styles.header}>
          <div style={styles.title}>Sign up</div>
          <div style={styles.subtitle}>Create your account to get started</div>
        </div>

        <div style={styles.grid2}>
          <div style={styles.field}>
            <label style={styles.label}>First name</label>
            <div style={styles.inputWrapper}>
              <FaUser style={styles.icon} />
              <input
                style={styles.input}
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="First name"
                onFocus={(e) => {
                  e.target.style.borderColor = '#0b4f8a';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>
            {errors.firstName && <div style={styles.err}>{errors.firstName}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Last name</label>
            <div style={styles.inputWrapper}>
              <FaUser style={styles.icon} />
              <input
                style={styles.input}
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Last name"
                onFocus={(e) => {
                  e.target.style.borderColor = '#0b4f8a';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>
            {errors.lastName && <div style={styles.err}>{errors.lastName}</div>}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrapper}>
            <FaEnvelope style={styles.icon} />
            <input
              style={styles.input}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter your email address"
              type="email"
              onFocus={(e) => {
                e.target.style.borderColor = '#0b4f8a';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>
          {errors.email && <div style={styles.err}>{errors.email}</div>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <FaLock style={styles.icon} />
            <input
              style={styles.input}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              onFocus={(e) => {
                e.target.style.borderColor = '#0b4f8a';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
              }}
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
          {errors.password && <div style={styles.err}>{errors.password}</div>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Confirm Password</label>
          <div style={styles.inputWrapper}>
            <FaLock style={styles.icon} />
            <input
              style={styles.input}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Re-enter your password"
              type={showConfirmPassword ? "text" : "password"}
              onFocus={(e) => {
                e.target.style.borderColor = '#0b4f8a';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
              }}
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
          {errors.confirmPassword && <div style={styles.err}>{errors.confirmPassword}</div>}
        </div>

        <button 
          type="submit" 
          style={styles.btnPrimary} 
          disabled={submitting}
          onMouseEnter={(e) => {
            if (!submitting) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(11, 59, 120, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!submitting) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 59, 120, 0.2)';
            }
          }}
        >
          {submitting ? "Creating Account..." : "Sign up"}
        </button>

        <div style={styles.linkText}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={styles.linkButton}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Sign in
          </button>
        </div>

        {success && (
          <div style={styles.successBox}>
            <FaCheck color="#16a34a" />
            <div>{success}</div>
          </div>
        )}
        {errors.submit && <div style={{ ...styles.err, marginTop: 12, textAlign: 'center' }}>{errors.submit}</div>}
      </form>
    </div>
  );
};

export default UserSignup;
