import React, { useState, useEffect, useMemo } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaUsers, FaEnvelope, FaPhone, FaMapMarkerAlt, FaMusic, FaCheckCircle, FaSpinner, FaChevronLeft, FaChevronRight, FaInfoCircle, FaGuitar, FaDrum, FaKeyboard, FaPlus, FaCreditCard } from 'react-icons/fa';

// --- Data for Dynamic Form ---

const services = ['Band Gigs', 'Parade Events', 'Instrument Rentals', 'Music Arrangement', 'Music Workshops'];

const bandPackages = {
  '20-players-with': { label: '20 Players (with Food & Transport)', price: 15000 },
  '20-players-without': { label: '20 Players (without Food & Transport)', price: 20000 },
  '30-players-with': { label: '30 Players (with Food & Transport)', price: 25000 },
  '30-players-without': { label: '30 Players (without Food & Transport)', price: 30000 },
  'full-band': { label: 'Full Band', price: 35000 },
};

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

const musicArrangementBasePrice = 3000;

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '32px', minWidth: '340px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  input: { width: '100%', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px' },
  button: { marginTop: '18px', padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#0b62d6', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }
};

const Booking = ({ bookings: propBookings = [], setBookings: propSetBookings }) => {
  const today = new Date();
  
  // --- Core State ---
  const [service, setService] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  // --- Dynamic State based on Service ---
  const [estimatedValue, setEstimatedValue] = useState(0);
  
  // For Band Gigs / Parade Events
  const [bandPackage, setBandPackage] = useState('');
  const [eventDate, setEventDate] = useState('');
  
  // For Instrument Rentals
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');

  // For Music Arrangement
  const [numPieces, setNumPieces] = useState(1);

  // --- Calendar State ---
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // --- Derived State ---
  const rentalDays = useMemo(() => {
    if (service === 'Instrument Rentals' && rentalStartDate && rentalEndDate) {
      const start = new Date(rentalStartDate);
      const end = new Date(rentalEndDate);
      if (end < start) return 0;
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start and end date
      return diffDays;
    }
    return 0;
  }, [service, rentalStartDate, rentalEndDate]);

  // --- Effect for Price Calculation ---
  useEffect(() => {
    let value = 0;
    if (service === 'Band Gigs' || service === 'Parade Events') {
      value = bandPackages[bandPackage]?.price || 0;
    } else if (service === 'Instrument Rentals') {
      const instrumentPrice = instruments[selectedInstrument]?.pricePerDay || 0;
      value = instrumentPrice * rentalDays;
    } else if (service === 'Music Arrangement') {
      value = musicArrangementBasePrice * numPieces;
    } else if (service === 'Music Workshops') {
        value = 5000; // Default value for workshops
    }
    setEstimatedValue(value);
  }, [service, bandPackage, selectedInstrument, rentalDays, numPieces]);

  // Effect to set service from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceFromUrl = params.get('service');
    if (serviceFromUrl && services.includes(serviceFromUrl)) {
      setService(serviceFromUrl);
    }
  }, []);

  // --- Data Fetching and State Management (largely unchanged) ---
  const [localBookings, setLocalBookings] = useState([]);

  const getStoredBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.bookings)) {
          return data.bookings.map(b => ({
            id: b.booking_id,
            customerName: b.customer_name,
            email: b.email,
            phone: b.phone,
            service: b.service,
            date: b.date ? b.date.split('T')[0] : b.date,
            startTime: b.start_time,
            endTime: b.end_time,
            location: b.location,
            estimatedValue: parseFloat(b.estimated_value || 0),
            status: b.status,
            notes: b.notes,
            createdAt: b.created_at
          }));
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    return [];
  };

  useEffect(() => {
    const loadBookings = async () => {
      const stored = await getStoredBookings();
      setLocalBookings(stored);
    };
    loadBookings();
    const handleBookingsUpdate = async () => {
      const updated = await getStoredBookings();
      setLocalBookings(updated);
    };
    window.addEventListener('bookingsUpdated', handleBookingsUpdate);
    return () => window.removeEventListener('bookingsUpdated', handleBookingsUpdate);
  }, []);

  const updateBookings = (newBookingsOrFunction) => {
    const newBookings = typeof newBookingsOrFunction === 'function' 
      ? newBookingsOrFunction(bookings) 
      : newBookingsOrFunction;

    if (propSetBookings) {
      propSetBookings(newBookings);
    } else {
      setLocalBookings(newBookings);
    }
    window.dispatchEvent(new CustomEvent('bookingsUpdated'));
  };

  const bookings = propBookings.length > 0 ? propBookings : localBookings;
  const setBookings = updateBookings;

  const isDateBlocked = (dateStr) => {
    return bookings.some(b => b.date === dateStr && b.status === 'approved');
  };

  // --- Calendar Utils ---
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay();
  const pad2 = n => (n < 10 ? `0${n}` : `${n}`);
  const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  const getDateStatus = (dateStr) => {
    const dayBookings = bookings.filter(b => b.date === dateStr);
    if (dayBookings.some(b => b.status === 'approved')) return 'approved';
    if (dayBookings.some(b => b.status === 'pending')) return 'pending';
    return 'available';
  };

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
    if (dateStr >= todayStr && getDateStatus(dateStr) !== 'approved') {
      if (service === 'Instrument Rentals') {
        if (!rentalStartDate || rentalEndDate) {
          setRentalStartDate(dateStr);
          setRentalEndDate('');
        } else if (dateStr >= rentalStartDate) {
          setRentalEndDate(dateStr);
        } else {
          setRentalStartDate(dateStr);
        }
      } else if (service === 'Band Gigs' || service === 'Parade Events') {
        setEventDate(dateStr);
      }
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let bookingNotes = notes;
    let bookingDate = todayStr; // Default date
    let startTime = '09:00';
    let endTime = '17:00';

    if (service === 'Band Gigs' || service === 'Parade Events') {
        bookingNotes = `Package: ${bandPackages[bandPackage]?.label}\n\n${notes}`;
        bookingDate = eventDate; // Use the selected event date
    } else if (service === 'Instrument Rentals') {
        bookingNotes = `Instrument: ${instruments[selectedInstrument]?.label}\nRental Period: ${rentalStartDate} to ${rentalEndDate} (${rentalDays} days)\n\n${notes}`;
        bookingDate = rentalStartDate;
    } else if (service === 'Music Arrangement') {
        bookingNotes = `Number of Pieces: ${numPieces}\n\n${notes}`;
    }

    try {
      const newBooking = {
        userId: null,
        customerName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        service: service,
        date: bookingDate,
        startTime,
        endTime,
        location: location.trim(),
        estimatedValue: estimatedValue,
        notes: bookingNotes.trim() || null
      };

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const formattedBooking = {
          ...data.booking,
          id: data.booking.booking_id,
          date: data.booking.date ? data.booking.date.split('T')[0] : data.booking.date,
        };
        setBookings(prev => [...prev, formattedBooking]);
        setShowSuccess(true);
        
        // Reset form
        setService('');
        setName('');
        setEmail('');
        setPhone('');
        setLocation('');
        setNotes('');
        setBandPackage('');
        setSelectedInstrument('');
        setRentalStartDate('');
        setRentalEndDate('');
        setEventDate(''); // Reset event date
        setNumPieces(1);
        setEstimatedValue(0);

        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert(data.message || 'Failed to submit booking.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    if (!service || !name || !email || !location) return false;
    if (service === 'Band Gigs' || service === 'Parade Events') {
      return !!bandPackage && !!eventDate;
    }
    if (service === 'Instrument Rentals') {
      return !!selectedInstrument && !!rentalStartDate && !!rentalEndDate;
    }
    if (service === 'Music Arrangement') {
      return numPieces > 0;
    }
    if (service === 'Music Workshops') {
        return true; // Or add specific validation
    }
    return false;
  }, [service, name, email, location, bandPackage, eventDate, selectedInstrument, rentalStartDate, rentalEndDate, numPieces]);

  const minDate = today.toISOString().split('T')[0];

  // --- Render Methods for Dynamic Fields ---

  const renderServiceSpecificFields = () => {
    switch (service) {
      case 'Band Gigs':
      case 'Parade Events':
        return (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaUsers /> Package Options <span style={styles.required}>*</span></label>
              <select value={bandPackage} onChange={e => setBandPackage(e.target.value)} style={styles.input} required>
                <option value="">Select a package...</option>
                {Object.entries(bandPackages).map(([key, { label, price }]) => (
                  <option key={key} value={key}>{label} - ₱{price.toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaCalendarAlt /> Event Date <span style={styles.required}>*</span></label>
              <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={styles.input} min={minDate} required />
            </div>
          </>
        );
      case 'Instrument Rentals':
        return (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaGuitar /> Instrument <span style={styles.required}>*</span></label>
              <select value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)} style={styles.input} required>
                <option value="">Select an instrument...</option>
                {Object.entries(instruments).map(([key, { label, pricePerDay }]) => (
                  <option key={key} value={key}>{label} - ₱{pricePerDay.toLocaleString()}/day</option>
                ))}
              </select>
            </div>
            <div style={styles.gridTwo}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}><FaCalendarAlt /> Rental Start Date <span style={styles.required}>*</span></label>
                    <input type="date" value={rentalStartDate} onChange={e => setRentalStartDate(e.target.value)} style={styles.input} min={minDate} required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}><FaCalendarAlt /> Rental End Date <span style={styles.required}>*</span></label>
                    <input type="date" value={rentalEndDate} onChange={e => setRentalEndDate(e.target.value)} style={styles.input} min={rentalStartDate || minDate} required />
                </div>
            </div>
            {rentalDays > 0 && (
                <div style={styles.priceInfo}>
                    <FaInfoCircle />
                    <span>Duration: <strong>{rentalDays} day{rentalDays > 1 && 's'}</strong></span>
                </div>
            )}
          </>
        );
      case 'Music Arrangement':
        return (
            <>
                <div style={styles.inputGroup}>
                    <label style={styles.label}><FaPlus /> Number of Pieces <span style={styles.required}>*</span></label>
                    <input type="number" value={numPieces} onChange={e => setNumPieces(Math.max(1, parseInt(e.target.value)))} style={styles.input} min="1" required />
                </div>
                <div style={styles.priceInfo}>
                    <FaInfoCircle />
                    <span>Base price is ₱{musicArrangementBasePrice.toLocaleString()} per piece. Final price depends on complexity and instrumentation.</span>
                </div>
            </>
        );
      default:
        return null;
    }
  };

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

            {/* Dynamically Rendered Fields */}
            {service && renderServiceSpecificFields()}

            {/* Common Fields */}
            {service && (
                <>
                    <div style={styles.gridTwo}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}><FaUser /> Full Name <span style={styles.required}>*</span></label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} style={styles.input} placeholder="e.g., Juan Dela Cruz" required readOnly={isUserLoggedIn} />
                        </div>
                        
                        <div style={styles.inputGroup}>
                          <label style={styles.label}><FaEnvelope /> Email Address <span style={styles.required}>*</span></label>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} placeholder="e.g., juan.delacruz@email.com" required readOnly={isUserLoggedIn} />
                        </div>
                    </div>

                    <div style={styles.gridTwo}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}><FaPhone /> Phone Number <span style={styles.required}>*</span></label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} placeholder="e.g., 09171234567" required readOnly={isUserLoggedIn} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}><FaMapMarkerAlt /> Event Location / Address <span style={styles.required}>*</span></label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={styles.input} placeholder="e.g., 123 Rizal St, Metro Manila" required />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}><FaInfoCircle /> Notes / Special Requests</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} style={styles.textarea} placeholder="e.g., specific song requests, setup details, etc." rows={4}></textarea>
                    </div>

                    {/* Price Display */}
                    {estimatedValue > 0 && (
                        <div style={styles.priceDisplay}>
                            <div style={styles.priceLabel}>Estimated Price</div>
                            <div style={styles.priceValue}>₱{estimatedValue.toLocaleString()}</div>
                        </div>
                    )}

                    <button type="submit" disabled={!isFormValid || isSubmitting} style={styles.button}>
                        {isSubmitting ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <><FaCheckCircle /> Submit Booking Request</>}
                    </button>
                </>
            )}
          </form>
        </div>

        {/* Calendar Section - Now primarily for rentals */}
        <div className="calendar-container" style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <div style={styles.calendarTitle}>
              <FaCalendarAlt size={16} />
              {service === 'Instrument Rentals' ? 'Select Rental Dates' : 'Availability Calendar'}
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
              
              let isSelected = false;
              if (service === 'Instrument Rentals') {
                isSelected = dateStr >= rentalStartDate && dateStr <= rentalEndDate && rentalStartDate && rentalEndDate;
              } else if (service === 'Band Gigs' || service === 'Parade Events') {
                isSelected = dateStr === eventDate;
              }

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