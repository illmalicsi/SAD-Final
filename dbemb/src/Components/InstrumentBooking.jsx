import React, { useState, useEffect, useMemo } from 'react';
import { FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaSpinner, FaChevronLeft, FaChevronRight, FaInfoCircle, FaGuitar } from 'react-icons/fa';

// --- Data for Instrument Rentals ---
const instruments = {
  'trumpet': { label: 'Trumpet', pricePerDay: 500 },
  'trombone': { label: 'Trombone', pricePerDay: 500 },
  'french-horn': { label: 'French Horn', pricePerDay: 500 },
  'tuba': { label: 'Tuba', pricePerDay: 500 },
  'flute': { label: 'Flute', pricePerDay: 500 },
  'clarinet': { label: 'Clarinet', pricePerDay: 500 },
  'saxophone': { label: 'Saxophone', pricePerDay: 500 },
  'yamaha-snare': { label: 'Yamaha Snare Drum', pricePerDay: 1000 },
  'pearl-snare': { label: 'Pearl Snare Drum', pricePerDay: 1000 },
  'bass-drum': { label: 'Bass Drum', pricePerDay: 500 },
  'cymbals': { label: 'Cymbals', pricePerDay: 500 },
};

const InstrumentBooking = () => {
  const today = new Date();
  
  // --- Core State ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSubmissionType, setLastSubmissionType] = useState('rent');
  
  // For Instrument Rentals
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(0);

  // current logged-in user (if any)
  const [user, setUser] = useState(null);

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
    const instrumentPrice = instruments[selectedInstrument]?.pricePerDay || 0;
    const value = instrumentPrice * rentalDays;
    setEstimatedValue(value);
  }, [selectedInstrument, rentalDays]);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const type = (user && user.role && user.role !== 'user') ? 'borrow' : 'rent';
      const storageKey = type === 'borrow' ? 'borrowRequests' : 'rentRequests';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const request = {
        id: Date.now(),
        userId: user?.id || null,
        userName: name.trim(),
        userEmail: email.trim().toLowerCase(),
        phone: phone.trim(),
        instrument: instruments[selectedInstrument]?.label || selectedInstrument,
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
      setLastSubmissionType(type === 'borrow' ? 'borrow' : 'rent');

      setShowSuccess(true);
      
      // Reset form
      setSelectedInstrument('');
      setRentalStartDate('');
      setRentalEndDate('');
      setPurpose('');
      setNotes('');
      setLocation('');
      setEstimatedValue(0);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    return !!selectedInstrument && !!rentalStartDate && !!rentalEndDate && !!purpose && !!name && !!email && !!location;
  }, [selectedInstrument, rentalStartDate, rentalEndDate, purpose, name, email, location]);

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
    },
    memberBorrowBox: {
      marginTop: '1rem',
      padding: '1rem',
      border: '1px dashed #c7e6d8',
      borderRadius: '12px',
      background: '#f8fdf9'
    },
    memberBorrowTitle: {
      fontWeight: '700',
      color: '#065f46',
      marginBottom: '0.5rem'
    },
    memberBorrowText: {
      marginBottom: '0.75rem',
      color: '#065f46',
      fontSize: '0.875rem'
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
          {lastSubmissionType === 'rent' && 'Instrument rental request submitted for approval. We will contact you soon.'}
          {lastSubmissionType === 'borrow' && 'Borrow request submitted for approval. We will contact you soon.'}
        </div>
      )}

      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Instrument Rental & Borrowing
          </h1>
          <p style={styles.subtitle}>
            Rent or borrow instruments for your musical needs.
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
                  {Object.entries(instruments).map(([key, { label, pricePerDay }]) => (
                    <option key={key} value={key}>{label} - ₱{pricePerDay.toLocaleString()}/day</option>
                  ))}
                </select>
              </div>

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

              {/* Member-only borrow form fields */}
              {user && user.role && user.role !== 'user' && (
                <div style={styles.memberBorrowBox}>
                  <div style={styles.memberBorrowTitle}>Member Borrow Request</div>
                  <div style={styles.memberBorrowText}>
                    As a member, you can borrow select instruments. Please confirm the borrow details above.
                  </div>
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
    </div>
  );
};

export default InstrumentBooking;