import React, { useState } from "react";
import authService from '../services/authService';
import {
  FaUpload,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaPhone,
  FaMusic,
  FaMapMarkerAlt,
  FaIdCard,
  FaLock,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const Signup = ({ onSignup, onClose, onSwitchToLogin }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    phone: "",
    instrument: "",
    address: "",
    identityProof: null,
  });
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const styles = {
    page: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
      padding: 24,
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      zIndex: 1000,
      overflow: "auto"
    },
    card: {
      width: "100%",
      maxWidth: 920,
      maxHeight: "90vh",
      background: "#ffffff",
      borderRadius: 16,
      padding: "36px 40px 40px 40px",
      boxShadow: "0 10px 40px rgba(11, 59, 120, 0.12)",
      color: "#1e293b",
      position: "relative",
      overflow: "auto",
      margin: "auto"
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
      transition: "color 0.2s",
      zIndex: 10
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
    grid3: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16,
    },
    textarea: {
      width: "100%",
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      color: "#1e293b",
      padding: "11px 14px 11px 44px",
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
      minHeight: "80px",
      resize: "vertical"
    },
    fileInput: {
      width: "100%",
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      color: "#1e293b",
      padding: "11px 14px",
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
      cursor: "pointer"
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: "#0f172a",
      marginBottom: 12,
      marginTop: 20,
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    sectionDivider: {
      height: "1px",
      background: "#e2e8f0",
      margin: "20px 0",
      border: "none"
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
    if (!values.birthday) e.birthday = "Date of birth required";
    if (!values.phone.trim()) e.phone = "Contact number required";
    if (!values.instrument.trim()) e.instrument = "Primary instrument/section required";
    if (!values.address.trim()) e.address = "Complete address required";
    if (!values.identityProof) e.identityProof = "Government ID required for membership verification";
    return e;
  };

  const handleChange = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((s) => ({ ...s, identityProof: file }));
      setFileName(file.name);
      setErrors((prev) => ({ ...prev, identityProof: null }));
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSuccess(null);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('birthday', form.birthday);
      formData.append('phone', form.phone);
      formData.append('instrument', form.instrument);
      formData.append('address', form.address);
      if (form.identityProof) {
        formData.append('identityProof', form.identityProof);
      }

      await authService.register(formData);
      setSuccess("Membership application submitted successfully! We will review your application and contact you via email.");
      
      // Auto-login
      try {
        const loginRes = await authService.login(form.email, form.password);
        if (loginRes && loginRes.success && onSignup) {
          onSignup(loginRes.user);
        }
      } catch (loginErr) {
        console.warn('Auto-login failed after registration:', loginErr);
        // For membership applications, we might not want auto-login
        // The user should wait for approval first
      }

      setForm({ 
        firstName: "", 
        lastName: "", 
        email: "", 
        password: "", 
        confirmPassword: "",
        birthday: "",
        phone: "",
        instrument: "",
        address: "",
        identityProof: null
      });
      setFileName("");
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
          <div style={styles.title}>Membership Application</div>
          <div style={styles.subtitle}>Apply to join the Davao Blue Eagles Marching Band</div>
        </div>

        {/* Personal Information */}
        <div style={styles.sectionTitle}>
          <FaUser />
          Personal Information
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

        <hr style={styles.sectionDivider} />

        {/* Additional Information */}
        <div style={styles.sectionTitle}>
          <FaMusic />
          Musical Background & Contact Details
        </div>

        <div style={styles.grid3}>
          <div style={styles.field}>
            <label style={styles.label}>Date of Birth</label>
            <div style={styles.inputWrapper}>
              <FaCalendar style={styles.icon} />
              <input
                style={styles.input}
                value={form.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
                placeholder="YYYY-MM-DD"
                type="date"
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
            {errors.birthday && <div style={styles.err}>{errors.birthday}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contact Number</label>
            <div style={styles.inputWrapper}>
              <FaPhone style={styles.icon} />
              <input
                style={styles.input}
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Mobile number (e.g., 09123456789)"
                type="tel"
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
            {errors.phone && <div style={styles.err}>{errors.phone}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Primary Instrument/Section</label>
            <div style={styles.inputWrapper}>
              <FaMusic style={styles.icon} />
              <input
                style={styles.input}
                value={form.instrument}
                onChange={(e) => handleChange("instrument", e.target.value)}
                placeholder="e.g., Trumpet, Flute, Drums, Color Guard"
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
            {errors.instrument && <div style={styles.err}>{errors.instrument}</div>}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Complete Address</label>
          <div style={styles.inputWrapper}>
            <FaMapMarkerAlt style={styles.icon} />
            <textarea
              style={styles.textarea}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Street, Barangay, City, Province"
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
          {errors.address && <div style={styles.err}>{errors.address}</div>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Valid Government ID (Required for Membership)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
            Upload a clear photo or scan of your government-issued ID (Driver's License, SSS ID, Passport, etc.)
          </div>
          {fileName && (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Selected: {fileName}
            </div>
          )}
          {errors.identityProof && <div style={styles.err}>{errors.identityProof}</div>}
        </div>

        <div style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: 10,
          padding: 16,
          marginTop: 20,
          fontSize: 12,
          color: "#0c4a6e",
          lineHeight: 1.5
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <FaIdCard />
            Membership Application Notice
          </div>
          <div>
            By submitting this application, you agree to provide accurate information and understand that:
            <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
              <li>All information will be verified during the review process</li>
              <li>Your application will be reviewed by the band management</li>
              <li>You may be contacted for an audition or interview</li>
              <li>Membership is subject to availability and band requirements</li>
            </ul>
          </div>
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
          {submitting ? "Submitting Application..." : "Submit Membership Application"}
        </button>

        <div style={styles.linkText}>
          Already a member?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={styles.linkButton}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Sign in to your account
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

export default Signup;
