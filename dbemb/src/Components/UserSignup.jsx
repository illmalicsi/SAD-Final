import React, { useState } from "react";
import authService from '../services/authService';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCheck,
  FaTimes,
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

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, rgba(6,10,20,1) 0%, rgba(8,14,28,1) 100%)",
      padding: 24,
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: 480,
      background: "rgba(7,16,30,0.75)",
      border: "1px solid rgba(100,255,218,0.06)",
      borderRadius: 12,
      padding: 28,
      boxShadow: "0 6px 30px rgba(2,6,23,0.6)",
      color: "#e6eef8",
      position: "relative"
    },
    linkButton: {
      background: "transparent",
      border: "none",
      color: "#60a5fa",
      cursor: "pointer",
      fontSize: 13,
      padding: 6,
      textDecoration: "underline"
    },
    closeButton: {
      position: "absolute",
      top: 12,
      right: 12,
      background: "transparent",
      border: "none",
      color: "#9fb0c8",
      cursor: "pointer",
      padding: 8,
      borderRadius: 8,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    },
    header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
    title: { fontSize: 20, fontWeight: 700, color: "#ffffff" },
    subtitle: { color: "#98a7bf", fontSize: 13 },
    grid2: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 16,
    },
    field: { display: "flex", flexDirection: "column", gap: 8 },
    label: { fontSize: 13, color: "#b8c7d9", fontWeight: 600 },
    input: {
      background: "rgba(2,6,23,0.45)",
      border: "1px solid rgba(100,255,218,0.06)",
      color: "#e6eef8",
      padding: "10px 12px",
      borderRadius: 8,
      fontSize: 15,
      outline: "none",
    },
    err: { color: "#ff6b6b", fontSize: 12 },
    actions: { display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 18 },
    btnPrimary: {
      background: "linear-gradient(90deg,#14b8a6,#60a5fa)",
      border: "none",
      color: "#031024",
      padding: "10px 16px",
      borderRadius: 10,
      fontWeight: 700,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    },
    successBox: {
      marginTop: 14,
      padding: 12,
      borderRadius: 8,
      background: "rgba(34,197,94,0.08)",
      border: "1px solid rgba(34,197,94,0.12)",
      color: "#bff3d6",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    singleColumn: { gridColumn: "1 / -1" },
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
        <button type="button" aria-label="Close" onClick={onClose} style={styles.closeButton}>
          <FaTimes />
        </button>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Create an Account</div>
            <div style={styles.subtitle}>Sign up for a standard user account.</div>
          </div>
        </div>

        <div style={{ ...styles.grid2, marginBottom: 12 }}>
          <div style={styles.field}>
            <label style={styles.label}>First name</label>
            <input
              style={styles.input}
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Juan"
            />
            {errors.firstName && <div style={styles.err}>{errors.firstName}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Last name</label>
            <input
              style={styles.input}
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="dela Cruz"
            />
            {errors.lastName && <div style={styles.err}>{errors.lastName}</div>}
          </div>

          <div style={{...styles.field, ...styles.singleColumn}}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="juan.delacruz@example.com"
              type="email"
            />
            {errors.email && <div style={styles.err}>{errors.email}</div>}
          </div>

          <div style={{...styles.field, ...styles.singleColumn}}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="6+ characters"
              type="password"
            />
            {errors.password && <div style={styles.err}>{errors.password}</div>}
          </div>

          <div style={{...styles.field, ...styles.singleColumn}}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Re-enter your password"
              type="password"
            />
            {errors.confirmPassword && <div style={styles.err}>{errors.confirmPassword}</div>}
          </div>
        </div>

        <div style={styles.actions}>
           <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <button type="submit" style={styles.btnPrimary} disabled={submitting}>
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={styles.linkButton}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>

        {success && (
          <div style={styles.successBox}>
            <FaCheck color="#10b981" />
            <div>{success}</div>
          </div>
        )}
        {errors.submit && <div style={{ ...styles.err, marginTop: 8 }}>{errors.submit}</div>}
      </form>
    </div>
  );
};

export default UserSignup;
