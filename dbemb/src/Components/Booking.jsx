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

  // Load bookings from API ONLY (no localStorage)
  const getStoredBookings = async () => {
    try {
      console.log('Booking.jsx: Fetching bookings from API...');
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Booking.jsx: API Response:', data);
        if (data.success && Array.isArray(data.bookings)) {
          // Convert database format to frontend format
          const bookings = data.bookings.map(b => ({
            id: b.booking_id,
            customerName: b.customer_name,
            name: b.customer_name,
            email: b.email,
            phone: b.phone,
            service: b.service,
            date: b.date ? b.date.split('T')[0] : b.date, // Fix date format
            startTime: b.start_time,
            endTime: b.end_time,
            location: b.location,
            estimatedValue: parseFloat(b.estimated_value || 5000),
            status: b.status,
            notes: b.notes,
            createdAt: b.created_at
          }));
          console.log('Booking.jsx: Loaded', bookings.length, 'bookings from API');
          return bookings;
        }
      } else {
        console.error('Booking.jsx: API request failed:', response.status);
      }
    } catch (error) {
      console.error('Booking.jsx: Error loading bookings from API:', error);
    }

    // Return empty array if API fails
    return [];
  };

  const [localBookings, setLocalBookings] = useState([]);

  // Load bookings on component mount
  useEffect(() => {
    const loadBookings = async () => {
      console.log('Booking.jsx: Component mounted, loading bookings...');
      const stored = await getStoredBookings();
      console.log('Booking.jsx: Setting local bookings:', stored.length);
      setLocalBookings(stored);
    };
    
    loadBookings();

    // Listen for booking updates from other components
    const handleBookingsUpdate = async () => {
      console.log('Booking.jsx: Received bookingsUpdated event, reloading...');
      const updated = await getStoredBookings();
      setLocalBookings(updated);
    };
    
    window.addEventListener('bookingsUpdated', handleBookingsUpdate);
    
    return () => {
      window.removeEventListener('bookingsUpdated', handleBookingsUpdate);
    };
  }, []);

  // Enhanced setBookings function - now just updates state, no localStorage
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
      // If standalone, update local state only (database is source of truth)
      console.log('Using local state setter');
      setLocalBookings(newBookings);
    }

    // Dispatch event to notify other components to reload from database
    window.dispatchEvent(new CustomEvent('bookingsUpdated', {
      detail: { reload: true }
    }));
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

    try {
      // Create booking object
      const newBooking = {
        userId: null, // Can be set if user is logged in
        customerName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        service: service,
        date: date,
        startTime: startTime,
        endTime: endTime,
        location: location.trim(),
        estimatedValue: 5000, // Default value
        notes: notes.trim() || null
      };

      // Save to database via API
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBooking)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Format the returned booking for frontend
        const formattedBooking = {
          id: data.booking.booking_id,
          service: data.booking.service,
          name: data.booking.customer_name,
          email: data.booking.email,
          phone: data.booking.phone,
          location: data.booking.location,
          notes: data.booking.notes,
          date: data.booking.date,
          startTime: data.booking.start_time,
          endTime: data.booking.end_time,
          createdAt: data.booking.created_at,
          status: data.booking.status,
          estimatedValue: parseFloat(data.booking.estimated_value || 5000)
        };

        // Update local state (for immediate UI feedback)
        setBookings(prev => {
          const updated = [...prev, formattedBooking];
          console.log('Booking.jsx: Added new booking, total bookings:', updated.length);
          return updated;
        });

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
      } else {
        alert(data.message || 'Failed to submit booking. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An error occurred while submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = service && name && email && location && date && startTime && endTime && !isDateBlocked(date) && endTime > startTime;

  // Get minimum date (today)
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
    inputFocus: {
      borderColor: '#0369a1',
      boxShadow: '0 0 0 3px rgba(3, 105, 161, 0.1)'
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
    gridThree: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
          
          .calendar-day:hover:not(.day-past):not(.day-approved) {
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
            Book Your Session
          </h1>
          <p style={styles.subtitle}>
            Schedule your music service with our professional team.
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="main-content" style={styles.mainContent}>
          {/* Form Section */}
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

        {/* Calendar Section - Now on the side */}
        <div className="calendar-container" style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <div style={styles.calendarTitle}>
              <FaCalendarAlt size={16} />
              Availability
            </div>
          </div>
          <div style={styles.calendarNav}>
            <button className="nav-button" style={styles.navButton} onClick={prevMonth}>
              <FaChevronLeft size={12} />
            </button>
            <div style={styles.monthYear}>
              {new Date(year, month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <button className="nav-button" style={styles.navButton} onClick={nextMonth}>
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
        {/* End of mainContent grid */}
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