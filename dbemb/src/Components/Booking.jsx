import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaMusic, FaCheckCircle, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Booking = ({ bookings: propBookings = [], setBookings: propSetBookings }) => {
  const today = new Date();
  const [service, setService] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const services = ['Band Gigs', 'Music Arrangement', 'Parade Events', 'Music Workshops', 'Instrument Rentals'];

  // Load bookings from localStorage or use default data
  const getStoredBookings = () => {
    try {
      const stored = localStorage.getItem('dbeBookings');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading bookings from localStorage:', error);
    }

    // Default data if no stored data
    return [
      {
        id: 1,
        service: 'Band Gigs',
        name: 'Bongbong Marky',
        email: 'magnanakaw@gmail.com',
        phone: '+63 912 345 6789',
        location: 'Ilocos Norte',
        notes: 'Birthday ni BWS',
        date: '2025-09-25',
        startTime: '14:00',
        endTime: '18:00',
        createdAt: '2025-09-17T10:00:00.000Z',
        status: 'approved'
      },
      {
        id: 2,
        service: 'Music Workshops',
        name: 'Justin Nabunturan',
        email: 'justin@gmail.com',
        phone: '+63 917 654 3210',
        location: 'Nabunturan City',
        notes: 'Saxophone practice for idol Justin',
        date: '2025-09-26',
        startTime: '10:00',
        endTime: '12:00',
        createdAt: '2025-09-17T11:00:00.000Z',
        status: 'pending'
      },
      {
        id: 3,
        service: 'Band Gigs',
        name: 'Ivan Louie Malicsi',
        email: 'ilim@gmail.com',
        phone: '+63 920 111 2222',
        location: 'Jollibee Toril',
        notes: 'Farewell party (yoko na sa Davao)',
        date: '2025-09-26',
        startTime: '15:00',
        endTime: '19:00',
        createdAt: '2025-09-17T12:00:00.000Z',
        status: 'pending'
      }
    ];
  };

  const [localBookings, setLocalBookings] = useState(() => {
    const stored = getStoredBookings();
    console.log('Booking.jsx: Initial load - stored bookings:', stored.length);
    return stored;
  });

  // Function to save bookings to localStorage
  const saveBookingsToStorage = (newBookings) => {
    try {
      localStorage.setItem('dbeBookings', JSON.stringify(newBookings));
      console.log('Booking.jsx: Saved to localStorage:', newBookings.length, 'bookings');
      console.log('Latest booking:', newBookings[newBookings.length - 1]);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('bookingsUpdated', {
        detail: { bookings: newBookings }
      }));
    } catch (error) {
      console.error('Error saving bookings to localStorage:', error);
    }
  };

  // Enhanced setBookings function that also saves to localStorage
  const updateBookings = (newBookingsOrFunction) => {
    let newBookings;

    if (typeof newBookingsOrFunction === 'function') {
      // Handle function case (like prev => [...prev, newItem])
      newBookings = newBookingsOrFunction(bookings);
    } else {
      // Handle direct array case
      newBookings = newBookingsOrFunction;
    }

    console.log('updateBookings called with:', newBookings.length, 'bookings');

    if (propSetBookings) {
      // If we have a prop setter, use it (for dashboard integration)
      console.log('Using prop setter');
      propSetBookings(newBookings);
    } else {
      // If standalone, update local state and save to localStorage
      console.log('Using local state setter');
      setLocalBookings(newBookings);
      saveBookingsToStorage(newBookings);
    }
  };

  // Use prop data if available, otherwise use local state
  const bookings = propBookings.length > 0 ? propBookings : localBookings;
  const setBookings = updateBookings;

  // Check if a date is blocked (has approved booking)
  const isDateBlocked = (dateStr) => {
    return bookings.some(b => b.date === dateStr && b.status === 'approved');
  };

  // Calendar helper functions
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay();
  const pad2 = n => (n < 10 ? `0${n}` : `${n}`);
  const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  // Get date status for calendar display
  const getDateStatus = (dateStr) => {
    const dayBookings = bookings.filter(b => b.date === dateStr);
    const approvedBookings = dayBookings.filter(b => b.status === 'approved');
    const pendingBookings = dayBookings.filter(b => b.status === 'pending');
    const rejectedBookings = dayBookings.filter(b => b.status === 'rejected');

    if (approvedBookings.length > 0) return 'approved';
    if (pendingBookings.length > 0) return 'pending';
    if (rejectedBookings.length > 0) return 'rejected';
    return 'available';
  };

  // Navigate calendar
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

  // Handle date selection
  const handleDateClick = (dateStr) => {
    if (dateStr >= todayStr && getDateStatus(dateStr) === 'available') {
      setDate(dateStr);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!service || !name || !email || !date || !startTime || !endTime || !location) {
      alert('Please fill in all required fields.');
      return;
    }

    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }

    if (isDateBlocked(date)) {
      alert('This date is already booked. Please choose a different date.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newBooking = {
      id: Date.now(),
      service,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      location: location.trim(),
      notes: notes.trim(),
      date,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    setBookings(prev => {
      const updated = [...prev, newBooking];
      console.log('Booking.jsx: Adding new booking, total bookings:', updated.length);
      return updated;
    });

    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form
    setService('');
    setName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setNotes('');
    setDate('');
    setStartTime('');
    setEndTime('');

    setTimeout(() => setShowSuccess(false), 5000);
  };

  const isFormValid = service && name && email && location && date && startTime && endTime && !isDateBlocked(date) && endTime > startTime;

  // Get minimum date (today)
  const minDate = today.toISOString().split('T')[0];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '2rem 1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: '1.125rem',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    formContainer: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '2.5rem',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
    },
    formTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '2rem',
      color: '#ffffff',
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
      color: '#e2e8f0',
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
      background: 'rgba(30, 41, 59, 0.6)',
      border: '2px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    textarea: {
      minHeight: '120px',
      resize: 'vertical'
    },
    button: {
      width: '100%',
      padding: '1.25rem 2rem',
      background: isFormValid
        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
        : 'rgba(100, 116, 139, 0.3)',
      color: isFormValid ? '#ffffff' : '#64748b',
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
        ? '0 10px 30px rgba(59, 130, 246, 0.3)'
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
    gridThree: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem'
    },
    calendarContainer: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '2rem',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      marginTop: '2rem'
    },
    calendarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem'
    },
    calendarTitle: {
      color: '#ffffff',
      fontSize: '1.25rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    calendarNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    navButton: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '8px',
      padding: '0.5rem',
      color: '#3b82f6',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    monthYear: {
      color: '#e2e8f0',
      fontSize: '1.125rem',
      fontWeight: '600',
      minWidth: '120px',
      textAlign: 'center'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem'
    },
    dayHeader: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      fontWeight: '600',
      textAlign: 'center',
      padding: '0.75rem 0.5rem'
    },
    dayCell: {
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.875rem',
      fontWeight: '500',
      position: 'relative'
    },
    dayAvailable: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.3)'
    },
    dayPending: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b',
      border: '1px solid rgba(245, 158, 11, 0.3)'
    },
    dayApproved: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      cursor: 'not-allowed'
    },
    dayPast: {
      background: 'rgba(100, 116, 139, 0.1)',
      color: '#64748b',
      cursor: 'not-allowed'
    },
    daySelected: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '1.5rem',
      padding: '1rem',
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '12px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#e2e8f0'
    },
    legendDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%'
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
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          }
          
          select option {
            background: #1e293b;
            color: #ffffff;
          }
          
          .calendar-day:hover:not(.day-past):not(.day-approved) {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          }
          
          .nav-button:hover {
            background: rgba(59, 130, 246, 0.2) !important;
            transform: scale(1.05);
          }
        `}
      </style>

      {showSuccess && (
        <div style={styles.successMessage}>
          <FaCheckCircle />
          Booking submitted successfully! We'll contact you soon.
        </div>
      )}

      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <FaMusic style={{ marginRight: '1rem' }} />
            Book Your Session
          </h1>
          <p style={styles.subtitle}>
            Schedule your music service with our professional team.
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.formTitle}>
            <FaCalendarAlt />
            Booking Details
          </div>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            {/* Service Selection */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FaMusic />
                Service Type
                <span style={styles.required}>*</span>
              </label>
              <select
                value={service}
                onChange={e => setService(e.target.value)}
                style={styles.input}
                required
              >
                <option value="">Choose your service</option>
                {services.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
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
                  placeholder="Enter your full name"
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
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div style={styles.gridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaPhone />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Remove all non-digit characters for processing
                    const digitsOnly = value.replace(/\D/g, '');

                    // Handle +63 format
                    if (value.startsWith('+63')) {
                      const remaining = digitsOnly.slice(2);
                      if (remaining.length <= 10) {
                        setPhone(`+63${remaining}`);
                      }
                    }
                    // Handle 09 format (convert to +63)
                    else if (digitsOnly.startsWith('09')) {
                      if (digitsOnly.length <= 11) {
                        setPhone(`+63${digitsOnly.slice(1)}`);
                      }
                    }
                    // Handle direct 11 digits starting with 9
                    else if (digitsOnly.startsWith('9')) {
                      if (digitsOnly.length <= 10) {
                        setPhone(`+63${digitsOnly}`);
                      }
                    }
                    // Handle any other digit input
                    else if (digitsOnly.length > 0) {
                      if (digitsOnly.length <= 10) {
                        setPhone(`+63${digitsOnly}`);
                      }
                    }
                    // Empty input
                    else {
                      setPhone('');
                    }
                  }}
                  style={styles.input}
                  placeholder="+63 912 345 6789"
                  pattern="\+639[0-9]{9}"
                  title="Please enter a valid Philippine mobile number"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaMapMarkerAlt />
                  Event Location
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={styles.input}
                  placeholder="Enter event location"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div style={styles.gridThree}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaCalendarAlt />
                  Event Date
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={styles.input}
                  min={minDate}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaClock />
                  Start Time
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FaClock />
                  End Time
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ ...styles.input, ...styles.textarea }}
                placeholder="Any special requirements, equipment needs, or additional information..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              style={styles.button}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Submit Booking Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Calendar Section */}
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <div style={styles.calendarTitle}>
              <FaCalendarAlt />
              Availability Calendar
            </div>
            <div style={styles.calendarNav}>
              <button className="nav-button" style={styles.navButton} onClick={prevMonth}>
                <FaChevronLeft />
              </button>
              <div style={styles.monthYear}>
                {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button className="nav-button" style={styles.navButton} onClick={nextMonth}>
                <FaChevronRight />
              </button>
            </div>
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
              const status = getDateStatus(dateStr);
              const isPast = dateStr < todayStr;
              const isSelected = dateStr === date;

              let dayStyle = { ...styles.dayCell };

              if (isSelected) {
                dayStyle = { ...dayStyle, ...styles.daySelected };
              } else if (isPast) {
                dayStyle = { ...dayStyle, ...styles.dayPast };
              } else {
                switch (status) {
                  case 'available':
                    dayStyle = { ...dayStyle, ...styles.dayAvailable };
                    break;
                  case 'pending':
                    dayStyle = { ...dayStyle, ...styles.dayPending };
                    break;
                  case 'approved':
                    dayStyle = { ...dayStyle, ...styles.dayApproved };
                    break;
                  default:
                    dayStyle = { ...dayStyle, ...styles.dayAvailable };
                }
              }

              return (
                <div
                  key={day}
                  className={`calendar-day ${isPast ? 'day-past' : ''} ${status === 'approved' ? 'day-approved' : ''}`}
                  style={dayStyle}
                  onClick={() => handleDateClick(dateStr)}
                  title={
                    isPast
                      ? 'Past date'
                      : status === 'approved'
                        ? 'Booked'
                        : status === 'pending'
                          ? 'Pending booking'
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
              <div style={{ ...styles.legendDot, background: '#f59e0b' }}></div>
              Pending
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: '#ef4444' }}></div>
              Booked
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: '#64748b' }}></div>
              Past Date
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Booking;