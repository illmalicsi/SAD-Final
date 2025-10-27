import React, { useState, useEffect, useMemo } from 'react';
import AuthService from '../services/authService';
import InstrumentTerms from './InstrumentTerms';
import { FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaSpinner, FaChevronLeft, FaChevronRight, FaInfoCircle, FaGuitar } from 'react-icons/fa';

// Instrument data will be loaded from the backend; no local fallback mapping to force DB-driven options

const InstrumentRental = () => {
  const today = new Date();
  
  // --- Core State ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // For Instrument Rentals
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [fetchedInstruments, setFetchedInstruments] = useState([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [instrumentsError, setInstrumentsError] = useState(null);
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // current logged-in user (if any)
  const [user, setUser] = useState(null);

  // Terms acceptance (required for rental requests)
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // --- Calendar State ---
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // --- Derived State ---
  const rentalDays = useMemo(() => {
    if (rentalStartDate && rentalEndDate) {
      const start = new Date(rentalStartDate);
      const end = new Date(rentalEndDate);
      if (end < start) return 0;
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  }, [rentalStartDate, rentalEndDate]);

  // --- Effect for Price Calculation ---
  useEffect(() => {
    let instrumentPrice = 0;
    // If selectedInstrument is a DB item (prefix 'db-<id>') find it
    if (typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-')) {
      const id = parseInt(selectedInstrument.replace('db-', ''), 10);
      const inst = fetchedInstruments.find(i => Number(i.instrument_id) === id);
      // support both snake_case (from backend) and camelCase
      const rawPrice = inst?.price_per_day ?? inst?.pricePerDay ?? 0;
      instrumentPrice = Number(rawPrice) || 0;
    } else {
      // no local fallback: non-db selections have no price
      instrumentPrice = 0;
    }
    const value = instrumentPrice * rentalDays;
    setEstimatedValue(value);
  }, [selectedInstrument, rentalDays, fetchedInstruments]);

  // Load user data
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null');
      if (stored) {
        setUser(stored);
        if (stored.firstName || stored.email) {
          setName(stored.firstName ? `${stored.firstName} ${stored.lastName || ''}`.trim() : (stored.email || ''));
          setEmail(stored.email || '');
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Fetch available instruments from backend (fallback to localStorage)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingInstruments(true);
      setInstrumentsError(null);
      try {
        const res = await fetch('http://localhost:5000/api/instruments');
        if (!res.ok) throw new Error('Failed to fetch instruments');
        const data = await res.json();
        if (!cancelled) {
          if (data && Array.isArray(data.instruments)) {
            setFetchedInstruments(data.instruments);
            try { console.debug('InstrumentRental: fetched instruments (instruments):', data.instruments); } catch(e) {}
          } else if (Array.isArray(data)) {
            setFetchedInstruments(data);
            try { console.debug('InstrumentRental: fetched instruments (array):', data); } catch(e) {}
          } else {
            setFetchedInstruments([]);
          }
        }
      } catch (err) {
        // fallback: try localStorage dbeInventory
        console.warn('InstrumentRental: fetch instruments failed, falling back to localStorage', err);
        try {
          const saved = localStorage.getItem('dbeInventory');
          if (saved) {
            const parsed = JSON.parse(saved);
            // map to expected shape
            const mapped = (Array.isArray(parsed) ? parsed : []).map(it => ({
              instrument_id: it.id || it.instrument_id,
              name: it.name || it.label || '',
              category: it.category || '',
              subcategory: it.subcategory || '',
              quantity: it.locations ? it.locations.reduce((s,l)=>s+(Number(l.quantity)||0),0) : (it.quantity||0),
              location: it.locations && it.locations.length ? (it.locations[0].name || '') : (it.location||''),
              availability_status: it.archived ? 'Unavailable' : (it.status || 'Available'),
              // try to preserve price and condition if present in local saved inventory
              price_per_day: it.price_per_day ?? it.pricePerDay ?? null,
              condition_status: it.condition_status ?? it.conditionStatus ?? it.condition ?? null
            }));
            if (!cancelled) setFetchedInstruments(mapped.filter(i => i.availability_status === 'Available'));
            try { console.debug('InstrumentRental: loaded instruments from localStorage dbeInventory:', mapped); } catch(e) {}
          } else {
            if (!cancelled) setFetchedInstruments([]);
          }
        } catch (e) {
          if (!cancelled) setInstrumentsError(String(err || e));
        }
      } finally {
        if (!cancelled) setLoadingInstruments(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // --- Calendar Utils ---
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay();
  const pad2 = n => (n < 10 ? `0${n}` : `${n}`);
  const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDateClick = (dateStr) => {
    if (dateStr >= todayStr) {
      if (!rentalStartDate || rentalEndDate) {
        setRentalStartDate(dateStr);
        setRentalEndDate('');
      } else if (dateStr >= rentalStartDate) {
        setRentalEndDate(dateStr);
      } else {
        setRentalStartDate(dateStr);
      }
    }
  };

  // --- Form Submission ---
  useEffect(() => {
    const handler = (e) => {
      if (user && (e.detail.userEmail === user.email || e.detail.userId === user.id)) {
        setApprovalNotification('Your instrument rental request has been approved! Please proceed with full payment to secure your booking.');
        setTimeout(() => setApprovalNotification(null), 10000);
      }
    };
    window.addEventListener('instrumentRequestApproved', handler);
    return () => window.removeEventListener('instrumentRequestApproved', handler);
  }, [user]);

  const [approvalNotification, setApprovalNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Rentals-only: always treat this as a rent request
      const type = 'rent';
      const storageKey = 'rentRequests';

      const selectedLabel = (() => {
        if (typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-')) {
          const id = parseInt(selectedInstrument.replace('db-', ''), 10);
          const inst = fetchedInstruments.find(i => Number(i.instrument_id) === id);
          return inst ? inst.name : selectedInstrument;
        }
        // no local fallback; return raw value if not a db selection
        return selectedInstrument;
      })();

      // If logged in, prefer server-side creation so inventory is tracked in DB
      if (AuthService.isAuthenticated()) {
        const instrumentIdVar = (typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-')) ? parseInt(selectedInstrument.replace('db-', ''), 10) : null;
        const instMatch = instrumentIdVar ? fetchedInstruments.find(i => Number(i.instrument_id) === instrumentIdVar) : null;
        const instrumentTypeVar = instMatch ? (instMatch.subcategory || '') : '';

        // foundInstrument for local mirroring and metadata
        const foundInstrument = instMatch || null;

        const payload = {
          instrumentId: instrumentIdVar,
          instrumentName: selectedLabel,
          instrumentType: instrumentTypeVar,
          quantity: Number(quantity) || 1,
          startDate: rentalStartDate,
          endDate: rentalEndDate,
          purpose: purpose ? purpose.trim() : null,
          notes: notes ? notes.trim() : null,
          rentalFee: estimatedValue || null
        };

        const endpoint = '/instruments/rent-request';
        try {
          const resp = await AuthService.post(endpoint, payload);
          if (!resp || resp.success !== true) throw new Error(resp && resp.message ? resp.message : 'Failed to submit request');

          // Mirror to localStorage for UI continuity
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const request = {
              id: resp.requestId || resp.request_id || Date.now(),
              request_id: resp.requestId || resp.request_id || null,
            userId: user?.id || null,
            userName: name.trim(),
            userEmail: email.trim().toLowerCase(),
            phone: phone.trim(),
            instrument: selectedLabel,
            instrumentCondition: foundInstrument ? foundInstrument.condition_status : null,
            instrumentPricePerDay: foundInstrument ? foundInstrument.price_per_day : null,
            startDate: rentalStartDate,
            endDate: rentalEndDate,
            purpose: payload.purpose,
            notes: payload.notes,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          existing.unshift(request);
          localStorage.setItem(storageKey, JSON.stringify(existing));
          window.dispatchEvent(new Event(`${type}RequestsUpdated`));

          setShowSuccess(true);
        } catch (err) {
          console.error('Server request failed, falling back to localStorage:', err);
          // fallback to localStorage behavior
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const request = {
            id: `local-${Date.now()}`,
            request_id: null,
            localOnly: true,
            userId: user?.id || null,
            userName: name.trim(),
            userEmail: email.trim().toLowerCase(),
            phone: phone.trim(),
            instrument: selectedLabel,
            instrumentCondition: instMatch ? instMatch.condition_status : null,
            instrumentPricePerDay: instMatch ? instMatch.price_per_day : null,
            startDate: rentalStartDate,
            endDate: rentalEndDate,
            purpose: purpose ? purpose.trim() : null,
            notes: notes ? notes.trim() : null,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          existing.unshift(request);
          localStorage.setItem(storageKey, JSON.stringify(existing));
          window.dispatchEvent(new Event(`${type}RequestsUpdated`));
          setShowSuccess(true);
        }
      } else {
        // Not authenticated: keep storing locally
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const request = {
          id: `local-${Date.now()}`,
          request_id: null,
          localOnly: true,
          userId: user?.id || null,
          userName: name.trim(),
          userEmail: email.trim().toLowerCase(),
          phone: phone.trim(),
          instrument: selectedLabel,
          instrumentCondition: (typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-')) ? (fetchedInstruments.find(i => Number(i.instrument_id) === parseInt(selectedInstrument.replace('db-',''),10))?.condition_status || null) : null,
          instrumentPricePerDay: (typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-')) ? (fetchedInstruments.find(i => Number(i.instrument_id) === parseInt(selectedInstrument.replace('db-',''),10))?.price_per_day || null) : null,
          startDate: rentalStartDate,
          endDate: rentalEndDate,
          purpose: purpose ? purpose.trim() : null,
          notes: notes ? notes.trim() : null,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        existing.unshift(request);
        localStorage.setItem(storageKey, JSON.stringify(existing));
        window.dispatchEvent(new Event(`${type}RequestsUpdated`));
        setShowSuccess(true);
      }

      // Reset form
      setSelectedInstrument('');
      setRentalStartDate('');
      setRentalEndDate('');
      setPurpose('');
      setNotes('');
      setLocation('');
      setEstimatedValue(0);
      setAcceptedTerms(false);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(error.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync any locally created rent requests (localOnly) with the server when authenticated
  useEffect(() => {
    let cancelled = false;
    const trySync = async () => {
      if (!AuthService.isAuthenticated()) return;
      const storageKey = 'rentRequests';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      // find local-only entries
      const locals = existing.filter(r => r.localOnly === true);
      if (!locals.length) return;

      for (const l of locals) {
        if (cancelled) break;
        try {
          const payload = {
            instrumentId: null,
            instrumentName: l.instrument || l.instrumentName || '',
            instrumentType: '',
            quantity: Number(l.quantity) || 1,
            startDate: l.startDate,
            endDate: l.endDate,
            purpose: l.purpose || l.notes || null,
            notes: l.notes || null,
            rentalFee: l.instrumentPricePerDay || l.rentalFee || null
          };
          const resp = await AuthService.post('/instruments/rent-request', payload);
          if (resp && resp.success === true && resp.requestId) {
            // replace local id with server id and remove localOnly flag
            const updated = JSON.parse(localStorage.getItem(storageKey) || '[]').map(r => r.id === l.id ? { ...r, id: resp.requestId, request_id: resp.requestId, localOnly: false } : r);
            localStorage.setItem(storageKey, JSON.stringify(updated));
            window.dispatchEvent(new Event('rentRequestsUpdated'));
          }
        } catch (err) {
          console.warn('Failed to sync local rent request to server:', err);
          // don't throw — try next item later
        }
      }
    };
    trySync();
    return () => { cancelled = true; };
  }, []);

  const isFormValid = useMemo(() => {
    const base = !!selectedInstrument && !!rentalStartDate && !!rentalEndDate && !!purpose && !!name && !!email && !!location;
    // For rentals require terms acceptance
    return base && acceptedTerms;
  }, [selectedInstrument, rentalStartDate, rentalEndDate, purpose, name, email, location, acceptedTerms]);

  const minDate = today.toISOString().split('T')[0];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      padding: '2rem 1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    wrapper: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '0'
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: '800',
      color: '#0369a1',
      marginBottom: '1rem',
      letterSpacing: '-0.02em',
      padding: '0'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1.125rem',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
      padding: '0'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '2rem',
      alignItems: 'start'
    },
    formContainer: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '2.5rem',
      border: '1px solid rgba(3, 105, 161, 0.1)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
    },
    formTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '2rem',
      color: '#0f172a',
      fontSize: '1.5rem',
      fontWeight: '700'
    },
    formGrid: {
      display: 'grid',
      gap: '1.5rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      color: '#334155',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    required: {
      color: '#ef4444'
    },
    input: {
      width: '100%',
      padding: '1rem 1.25rem',
      background: 'rgba(248, 250, 252, 0.8)',
      border: '2px solid rgba(203, 213, 225, 0.5)',
      borderRadius: '12px',
      color: '#0f172a',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    textarea: {
      minHeight: '120px',
      resize: 'vertical'
    },
    button: {
      width: '100%',
      padding: '1.25rem 2rem',
      background: isFormValid
        ? 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)'
        : 'rgba(203, 213, 225, 0.5)',
      color: isFormValid ? '#ffffff' : '#94a3b8',
      border: 'none',
      borderRadius: '16px',
      fontSize: '1.125rem',
      fontWeight: '700',
      cursor: isFormValid ? 'pointer' : 'not-allowed',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: isFormValid
        ? '0 10px 30px rgba(3, 105, 161, 0.2)'
        : 'none'
    },
    successMessage: {
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out'
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    },
    calendarContainer: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '1.5rem',
      border: '1px solid rgba(3, 105, 161, 0.1)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: '2rem'
    },
    calendarHeader: {
      marginBottom: '1rem'
    },
    calendarTitle: {
      color: '#0f172a',
      fontSize: '1.125rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem'
    },
    calendarNav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    navButton: {
      background: 'rgba(3, 105, 161, 0.1)',
      border: '1px solid rgba(3, 105, 161, 0.2)',
      borderRadius: '8px',
      padding: '0.5rem',
      color: '#0369a1',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    monthYear: {
      color: '#334155',
      fontSize: '0.875rem',
      fontWeight: '600',
      minWidth: '100px',
      textAlign: 'center'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.25rem'
    },
    dayHeader: {
      color: '#64748b',
      fontSize: '0.75rem',
      fontWeight: '600',
      textAlign: 'center',
      padding: '0.5rem 0.25rem'
    },
    dayCell: {
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.75rem',
      fontWeight: '500',
      position: 'relative'
    },
    dayAvailable: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.3)'
    },
    dayPast: {
      background: 'rgba(203, 213, 225, 0.3)',
      color: '#94a3b8',
      cursor: 'not-allowed'
    },
    daySelected: {
      background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(3, 105, 161, 0.3)'
    },
    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      marginTop: '1.25rem',
      padding: '0.75rem',
      background: 'rgba(248, 250, 252, 0.8)',
      borderRadius: '12px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      fontSize: '0.75rem',
      color: '#475569'
    },
    legendDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%'
    },
    priceDisplay: {
      background: 'rgba(3, 105, 161, 0.05)',
      border: '1px solid rgba(3, 105, 161, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      marginTop: '1rem',
    },
    priceLabel: {
      color: '#475569',
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
    },
    priceValue: {
      color: '#0369a1',
      fontSize: '2.5rem',
      fontWeight: '800',
    },
    priceInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(248, 250, 252, 0.8)',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      fontSize: '0.875rem',
      color: '#475569',
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          input:focus, select:focus, textarea:focus {
            border-color: #0369a1 !important;
            box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1) !important;
          }
          
          select option {
            background: #ffffff;
            color: #0f172a;
          }
          
          .calendar-day:hover:not(.day-past) {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
          }
          
          .nav-button:hover {
            background: rgba(3, 105, 161, 0.2) !important;
            transform: scale(1.05);
          }

          @media (max-width: 1024px) {
            .main-content {
              grid-template-columns: 1fr !important;
            }
            .calendar-container {
              position: relative !important;
              top: 0 !important;
            }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {showSuccess && (
        <div style={styles.successMessage}>
          <FaCheckCircle />
          {'Instrument rental request submitted for approval. We will contact you soon.'}
        </div>
      )}

      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Instrument Rental
          </h1>
          <p style={styles.subtitle}>
            Rent an instruments for your musical needs.
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="main-content" style={styles.mainContent}>
          {/* Form Section */}
          <div style={styles.formContainer}>
            <div style={styles.formTitle}>
              <FaGuitar />
              Rental Details
            </div>

            <form onSubmit={handleSubmit} style={styles.formGrid}>
              {/* Instrument Selection */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaGuitar />
                  Instrument
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={selectedInstrument}
                  onChange={e => setSelectedInstrument(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">Select an instrument...</option>
                  {loadingInstruments && (
                    <option value="" disabled>Loading instruments...</option>
                  )}
                  {!loadingInstruments && fetchedInstruments && fetchedInstruments.length > 0 && (
                    fetchedInstruments.map(inst => (
                      <option key={`db-${inst.instrument_id}`} value={`db-${inst.instrument_id}`}>
                        {inst.name} {inst.availability_status ? `— ${inst.availability_status}` : ''} {inst.condition_status ? `— ${inst.condition_status}` : ''} {inst.price_per_day !== null && inst.price_per_day !== undefined ? `— ₱${Number(inst.price_per_day).toLocaleString()}/day` : ''}
                      </option>
                    ))
                  )}

                  {/* Fallback to static mapping if user wants non-db options */}
                  {/* No local fallback options: DB-driven selection only */}
                </select>
              </div>

              {/* Selected instrument summary (show only name, availability, condition, price) */}
              {selectedInstrument && typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-') && (() => {
                const id = parseInt(selectedInstrument.replace('db-', ''), 10);
                const sel = fetchedInstruments.find(i => Number(i.instrument_id) === id);
                if (!sel) return null;
                return (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 10, border: '1px solid rgba(3,105,161,0.08)', background: 'rgba(248,250,252,0.8)', maxWidth: 520 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{sel.name}</div>
                    <div style={{ color: '#475569', fontSize: 13 }}>Availability: <strong style={{ color: sel.availability_status === 'Available' ? '#065f46' : '#b91c1c' }}>{sel.availability_status}</strong></div>
                    <div style={{ color: '#475569', fontSize: 13 }}>Condition: <strong>{sel.condition_status || 'Unknown'}</strong></div>
                    <div style={{ color: '#0369a1', fontSize: 16, fontWeight: 700, marginTop: 6 }}>{sel.price_per_day !== null && sel.price_per_day !== undefined ? `₱${Number(sel.price_per_day).toLocaleString()}/day` : 'Price N/A'}</div>
                  </div>
                );
              })()}

              {/* Purpose */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaInfoCircle />
                  Purpose
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  style={styles.input}
                  placeholder="e.g., Wedding performance, rehearsal, practice sessions"
                  required
                />
              </div>

              {/* Rental Dates */}
              <div style={styles.gridTwo}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaCalendarAlt />
                    Rental Start Date
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    value={rentalStartDate}
                    onChange={e => setRentalStartDate(e.target.value)}
                    style={styles.input}
                    min={minDate}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaCalendarAlt />
                    Rental End Date
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    value={rentalEndDate}
                    onChange={e => setRentalEndDate(e.target.value)}
                    style={styles.input}
                    min={rentalStartDate || minDate}
                    required
                  />
                </div>
              </div>

              {/* Duration Info */}
              {rentalDays > 0 && (
                <div style={styles.priceInfo}>
                  <FaInfoCircle />
                  <span>Duration: <strong>{rentalDays} day{rentalDays > 1 && 's'}</strong></span>
                </div>
              )}

              {/* Personal Information */}
              <div style={styles.gridTwo}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaUser />
                    Full Name
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={styles.input}
                    placeholder="e.g., Juan Dela Cruz"
                    required
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaEnvelope />
                    Email Address
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={styles.input}
                    placeholder="e.g., juan.delacruz@email.com"
                    required
                  />
                </div>
              </div>

              <div style={styles.gridTwo}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaPhone />
                    Phone Number
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={styles.input}
                    placeholder="e.g., 09171234567"
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FaMapMarkerAlt />
                    Address
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    style={styles.input}
                    placeholder="e.g., 123 Rizal St, Metro Manila"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaInfoCircle />
                  Notes / Special Requests
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ ...styles.input, ...styles.textarea }}
                  placeholder="e.g., pickup person, ID to present, additional instructions"
                  rows={4}
                ></textarea>
              </div>

              {/* Price Display */}
              {estimatedValue > 0 && (
                <div style={styles.priceDisplay}>
                  <div style={styles.priceLabel}>Estimated Price</div>
                  <div style={styles.priceValue}>₱{estimatedValue.toLocaleString()}</div>
                </div>
              )}

              {/* Terms and Policy for Rentals (required) - extracted to component for cleanliness */}
              <InstrumentTerms acceptedTerms={acceptedTerms} setAcceptedTerms={setAcceptedTerms} user={user} />

              <button type="submit" disabled={!isFormValid || isSubmitting} style={styles.button}>
                {isSubmitting ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Calendar Section */}
          <div className="calendar-container" style={styles.calendarContainer}>
            <div style={styles.calendarHeader}>
              <div style={styles.calendarTitle}>
                <FaCalendarAlt size={16} />
                Select Rental Dates
              </div>
            </div>
            <div style={styles.calendarNav}>
              <button className="nav-button" style={styles.navButton} onClick={prevMonth} type="button">
                <FaChevronLeft size={12} />
              </button>
              <div style={styles.monthYear}>
                {new Date(year, month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <button className="nav-button" style={styles.navButton} onClick={nextMonth} type="button">
                <FaChevronRight size={12} />
              </button>
            </div>

            <div style={styles.calendarGrid}>
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={styles.dayHeader}>
                  {day}
                </div>
              ))}

              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: firstWeekday(year, month) }, (_, i) => (
                <div key={`empty-${i}`} style={styles.dayCell}></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth(year, month) }, (_, i) => {
                const day = i + 1;
                const dateStr = ymd(year, month, day);
                const isPast = dateStr < todayStr;
                const isSelected = dateStr >= rentalStartDate && dateStr <= rentalEndDate && rentalStartDate && rentalEndDate;

                let dayStyle = { ...styles.dayCell };

                if (isSelected) {
                  dayStyle = { ...dayStyle, ...styles.daySelected };
                } else if (isPast) {
                  dayStyle = { ...dayStyle, ...styles.dayPast };
                } else {
                  dayStyle = { ...dayStyle, ...styles.dayAvailable };
                }

                return (
                  <div
                    key={day}
                    className={`calendar-day ${isPast ? 'day-past' : ''}`}
                    style={dayStyle}
                    onClick={() => handleDateClick(dateStr)}
                    title={
                      isPast
                        ? 'Past date'
                        : isSelected
                          ? 'Selected'
                          : 'Available'
                    }
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: '#10b981' }}></div>
                Available
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: '#0369a1' }}></div>
                Selected
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: '#64748b' }}></div>
                Past Date
              </div>
            </div>

            {/* Show selected range below calendar */}
            {rentalStartDate && rentalEndDate && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(3, 105, 161, 0.1)',
                borderRadius: '8px',
                color: '#0369a1',
                fontWeight: '600',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>
                Selected: {rentalStartDate} to {rentalEndDate} ({rentalDays} day{rentalDays > 1 ? 's' : ''})
              </div>
            )}
          </div>
        </div>
      </div>
      {approvalNotification && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#1e3a8a', color: '#fff', padding: 12, borderRadius: 8, zIndex: 2000 }}>
          {approvalNotification}
        </div>
      )}
    </div>
  );
};

export default InstrumentRental;
