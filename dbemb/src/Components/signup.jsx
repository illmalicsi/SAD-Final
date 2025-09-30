import React, { useState } from "react";
import {
  FaUpload,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaPhone,
  FaMusic,
  FaMapMarkerAlt,
  FaIdCard,
  FaCheck,
  FaTimes, // added
} from "react-icons/fa";

const Signup = ({ onSignup, onClose, onSwitchToLogin }) => { // added onSwitchToLogin prop
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
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

  // no react-router dependency required

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(180deg, rgba(6,10,20,1) 0%, rgba(8,14,28,1) 100%)",
      padding: 24,
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: 920,
      background: "rgba(7,16,30,0.75)",
      border: "1px solid rgba(100,255,218,0.06)",
      borderRadius: 12,
      padding: 28,
      boxShadow: "0 6px 30px rgba(2,6,23,0.6)",
      color: "#e6eef8",
      position: "relative" // added so close button can be absolute
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
    closeButton: { // added
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
    textarea: {
      minHeight: 96,
      resize: "vertical",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid rgba(100,255,218,0.06)",
      background: "rgba(2,6,23,0.45)",
      color: "#e6eef8",
      fontSize: 15,
    },
    fileRow: {
      display: "flex",
      gap: 12,
      alignItems: "center",
    },
    fileLabel: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "linear-gradient(180deg, rgba(2,6,23,0.6), rgba(4,10,20,0.6))",
      border: "1px dashed rgba(100,255,218,0.06)",
      padding: "10px 14px",
      borderRadius: 8,
      cursor: "pointer",
      color: "#cfeee3",
      fontWeight: 600,
      fontSize: 14,
    },
    small: { fontSize: 12, color: "#9fb0c8" },
    err: { color: "#ff6b6b", fontSize: 12 },
    actions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
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
    btnGhost: {
      background: "transparent",
      border: "1px solid rgba(100,255,218,0.06)",
      color: "#cfeee3",
      padding: "8px 12px",
      borderRadius: 8,
      cursor: "pointer",
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
    "@media": {
      small: {
        grid2: { gridTemplateColumns: "1fr", gap: 12 },
      },
    },
  };

  const validate = (values) => {
    const e = {};
    if (!values.firstName.trim()) e.firstName = "First name required";
    if (!values.lastName.trim()) e.lastName = "Last name required";
    if (!values.email) e.email = "Email required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Invalid email";
    if (!values.birthday) e.birthday = "Birthday required";
    else {
      const birth = new Date(values.birthday);
      const diff = new Date().getFullYear() - birth.getFullYear();
      if (diff < 15) e.birthday = "Minimum age 15";
    }
    if (!values.phone) e.phone = "Phone required";
    else if (!/^\d{10,11}$/.test(values.phone.replace(/\D/g, ""))) e.phone = "Invalid phone";
    if (!values.instrument) e.instrument = "Instrument required";
    if (!values.address) e.address = "Address required";
    if (!values.identityProof) e.identityProof = "Upload ID proof";
    return e;
  };

  const handleChange = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: null }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, identityProof: "Max 5MB" }));
      return;
    }
    setForm((s) => ({ ...s, identityProof: f }));
    setFileName(f.name);
    setErrors((p) => ({ ...p, identityProof: null }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSuccess(null);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      // Simulate submit — replace with real API call
      await new Promise((r) => setTimeout(r, 900));
      setSuccess("Application submitted. We'll contact you soon.");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        birthday: "",
        phone: "",
        instrument: "",
        address: "",
        identityProof: null,
      });
      setFileName("");
      if (onSignup) onSignup(form);
    } catch (err) {
      setErrors({ submit: "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  // navigate to login (prop first, fallback to /login)
  const handleSwitchToLogin = () => {
    if (typeof onSwitchToLogin === "function") {
      onSwitchToLogin();
      return;
    }
    window.location.href = "/login";
  };

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }
    // fallback to full-page navigation so it works without react-router
    window.location.href = "/home";
  };
  
  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit} noValidate>
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          style={styles.closeButton}
        >
          <FaTimes />
        </button>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FaUser color="#60a5fa" />
          </div>
          <div>
            <div style={styles.title}>Membership Application</div>
            <div style={styles.subtitle}>Complete this form to apply for membership</div>
          </div>
        </div>

        <div style={{ ...styles.grid2, marginBottom: 12 }}>
          <div style={styles.field}>
            <label style={styles.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaUser color="#9fb0c8" /> First name
              </div>
            </label>
            <input
              style={styles.input}
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              aria-label="First name"
            />
            {errors.firstName && <div style={styles.err}>{errors.firstName}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaUser color="#9fb0c8" /> Last name
              </div>
            </label>
            <input
              style={styles.input}
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              aria-label="Last name"
            />
            {errors.lastName && <div style={styles.err}>{errors.lastName}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaEnvelope color="#9fb0c8" /> Email
              </div>
            </label>
            <input
              style={styles.input}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter your email address"
              type="email"
              aria-label="Email"
            />
            {errors.email && <div style={styles.err}>{errors.email}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaCalendar color="#9fb0c8" /> Birthday
              </div>
            </label>
            <input
              style={styles.input}
              value={form.birthday}
              onChange={(e) => handleChange("birthday", e.target.value)}
              type="date"
              aria-label="Birthday"
            />
            {errors.birthday && <div style={styles.err}>{errors.birthday}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaPhone color="#9fb0c8" /> Phone
              </div>
            </label>
            <input
              style={styles.input}
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="09XXXXXXXXX"
              aria-label="Phone"
            />
            {errors.phone && <div style={styles.err}>{errors.phone}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaMusic color="#9fb0c8" /> Instrument
              </div>
            </label>
            <input
              style={styles.input}
              value={form.instrument}
              onChange={(e) => handleChange("instrument", e.target.value)}
              placeholder="e.g., Snare Drum, Clarinet"
              aria-label="Instrument"
            />
            {errors.instrument && <div style={styles.err}>{errors.instrument}</div>}
          </div>

          <div style={{ ...styles.field, ...styles.singleColumn }}>
            <label style={styles.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaMapMarkerAlt color="#9fb0c8" /> Address
              </div>
            </label>
            <textarea
              style={styles.textarea}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Street, City, Province / Region"
              aria-label="Address"
            />
            {errors.address && <div style={styles.err}>{errors.address}</div>}
          </div>
        </div>

        <div style={{ ...styles.field }}>
          <label style={styles.label}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaIdCard color="#9fb0c8" /> Identity proof (PDF / JPG / PNG, max 5MB)
            </div>
          </label>
          <div style={styles.fileRow}>
            <label style={styles.fileLabel}>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFile}
                style={{ display: "none" }}
              />
              <FaUpload />
              Upload ID
            </label>
            <div style={styles.small}>{fileName || "No file chosen"}</div>
          </div>
          {errors.identityProof && <div style={styles.err}>{errors.identityProof}</div>}
        </div>

        <div style={styles.actions}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              style={styles.btnGhost}
              onClick={() => {
                setForm({
                  firstName: "",
                  lastName: "",
                  email: "",
                  birthday: "",
                  phone: "",
                  instrument: "",
                  address: "",
                  identityProof: null,
                });
                setFileName("");
                setErrors({});
              }}
            >
              Reset
            </button>
            <div style={styles.small}>We respect your privacy. ID used only for verification.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <button type="submit" style={styles.btnPrimary} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            <button
              type="button"
              onClick={handleSwitchToLogin}
              style={styles.linkButton}
              aria-label="Go to login"
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

export default Signup;
