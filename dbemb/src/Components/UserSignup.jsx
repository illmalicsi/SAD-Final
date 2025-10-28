import React, { useEffect, useRef, useState } from "react";
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
import loginImg from "./Assets/dbemb_login_signup.jpg";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
    padding: 32,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 980,
    background: "#ffffff",
    borderRadius: 16,
    padding: 0,
    boxShadow: "0 10px 36px rgba(11, 59, 120, 0.09)",
    color: "#1e293b",
    position: "relative",
    display: "flex",
    overflow: "hidden",
    minHeight: 580
  },
  imagePanel: {
    width: "49%",
    minWidth: 360,
    backgroundImage: `url(${loginImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    color: "#ffffff"
  },
  formPanel: {
    width: "51%",
    padding: "40px 44px",
    boxSizing: "border-box"
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
  header: { textAlign: "center", marginBottom: 18 },
  title: { fontSize: 40, fontWeight: 700, color: "#0f172a", marginBottom: 6 },
  subtitle: { color: "#64748b", fontSize: 15, fontWeight: 400 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 },
  label: { fontSize: 14, color: "#334155", fontWeight: 600, marginBottom: 2 },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  icon: { position: "absolute", left: 14, color: "#94a3b8", fontSize: 16 },
  eyeIcon: { position: "absolute", right: 14, color: "#94a3b8", fontSize: 16, cursor: "pointer", padding: 4, transition: "color 0.2s", zIndex: 2 },
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
  err: { color: "#dc2626", fontSize: 12, marginTop: 4, fontWeight: 500 },
  btnPrimary: {
    width: "100%",
    background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
    border: 'none',
    color: 'white',
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
  linkText: { textAlign: "center", marginTop: 12, fontSize: 14, color: "#64748b" },
  linkButton: { background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: 0, marginLeft: 4 },
  successBox: { marginTop: 12, padding: 14, borderRadius: 10, background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534", display: "flex", alignItems: "center", gap: 10, fontSize: 14 },
};

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
  const googleBtnRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleErr, setGoogleErr] = useState(null);
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

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

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      if (!window.google || !window.google.accounts || !googleBtnRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              setSubmitting(true);
              const cred = response.credential;
              const data = await authService.googleSignIn(cred);
              if (data && data.success && onSignup) {
                onSignup(data.user);
              }
            } catch (err) {
              console.error('Google sign-in failed:', err);
              setGoogleErr(err.message || 'Google sign-in failed');
            } finally {
              setSubmitting(false);
            }
          },
          auto_select: false,
          ux_mode: 'popup'
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
          shape: 'rectangular',
          width: 360
        });
        setGoogleReady(true);
      } catch (e) {
        console.error('Google init error:', e);
        setGoogleErr('Failed to initialize Google Sign-In');
      }
    };

    if (!window.google) {
      const scriptId = 'google-identity-services';
      if (!document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.defer = true;
        s.id = scriptId;
        s.onload = initGoogle;
        s.onerror = () => setGoogleErr('Failed to load Google script');
        document.body.appendChild(s);
      } else {
        initGoogle();
      }
    } else {
      initGoogle();
    }
  }, [GOOGLE_CLIENT_ID, onSignup]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.imagePanel}>
          {/* left image panel (no overlay) */}
        </div>

        <form style={styles.formPanel} onSubmit={handleSubmit} noValidate>
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
                  onFocus={(e) => { e.target.style.borderColor = '#0b4f8a'; e.target.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
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
                  onFocus={(e) => { e.target.style.borderColor = '#0b4f8a'; e.target.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
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
                onFocus={(e) => { e.target.style.borderColor = '#0b4f8a'; e.target.style.background = '#ffffff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
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
                onFocus={(e) => { e.target.style.borderColor = '#0b4f8a'; e.target.style.background = '#ffffff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
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
                onFocus={(e) => { e.target.style.borderColor = '#0b4f8a'; e.target.style.background = '#ffffff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</div>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {GOOGLE_CLIENT_ID ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <div ref={googleBtnRef} />
            </div>
          ) : null}
          {googleErr && <div style={{ ...styles.err, textAlign: 'center' }}>{googleErr}</div>}

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
    </div>
  );
};

export default UserSignup;
