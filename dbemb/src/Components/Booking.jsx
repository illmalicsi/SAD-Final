import React, { useMemo, useState } from 'react';

const Booking = () => {
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
  const [bookings, setBookings] = useState([
    // Sample data to demonstrate the system
    {
      id: 1,
      service: 'Band Gigs',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+63 912 345 6789',
      location: 'Ayala Malls Abreeza',
      notes: 'Corporate event',
      date: '2025-09-25',
      startTime: '14:00',
      endTime: '18:00',
      createdAt: '2025-09-17T10:00:00.000Z',
      status: 'approved'
    },
    {
      id: 2,
      service: 'Music Workshops',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+63 917 654 3210',
      location: 'SM City Davao',
      notes: 'Guitar workshop for beginners',
      date: '2025-09-26',
      startTime: '10:00',
      endTime: '12:00',
      createdAt: '2025-09-17T11:00:00.000Z',
      status: 'pending'
    },
    {
      id: 3,
      service: 'Band Gigs',
      name: 'Mark Johnson',
      email: 'mark@example.com',
      phone: '+63 920 111 2222',
      location: 'Gmall of Davao',
      notes: 'Birthday party',
      date: '2025-09-26',
      startTime: '15:00',
      endTime: '19:00',
      createdAt: '2025-09-17T12:00:00.000Z',
      status: 'pending'
    }
  ]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  
  const services = ['Band Gigs', 'Music Arrangement', 'Parade Events', 'Music Workshops', 'Instrument Rentals'];

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y, m) => new Date(y, m, 1).getDay();
  const pad2 = n => (n < 10 ? `0${n}` : `${n}`);
  const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  // Check if a date is blocked (has approved booking)
  const isDateBlocked = (dateStr) => {
    return bookings.some(b => b.date === dateStr && b.status === 'approved');
  };

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

  const handleSubmit = () => {
    if (!service || !name || !email || !date || !startTime || !endTime || !location) return;
    if (endTime <= startTime) return;
    if (isDateBlocked(date)) return;
    
    const newBooking = {
      id: Date.now(),
      service,
      name,
      email,
      phone,
      location,
      notes,
      date,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setBookings(prev => [...prev, newBooking]);
    
    setShowSuccess(true);
    setService('');
    setName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setNotes('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleCancelBooking = (bookingId) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' }
        : booking
    ));
    setSelectedBookingDetails(null);
  };

  // Mock admin functions for demonstration
  const handleApproveBooking = (bookingId) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        // When approving, reject all other pending bookings for the same date
        const updatedBookings = prev.map(b => 
          b.date === booking.date && b.id !== bookingId && b.status === 'pending'
            ? { ...b, status: 'rejected' }
            : b
        );
        return { ...booking, status: 'approved' };
      }
      return booking;
    }));
  };

  const handleRejectBooking = (bookingId) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'rejected' }
        : booking
    ));
  };

  const isFormValid = service && name && email && location && date && startTime && endTime && !isDateBlocked(date) && endTime > startTime;

  const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(100, 116, 139, 0.3)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#94a3b8';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'approved': return 'rgba(16, 185, 129, 0.15)';
      case 'pending': return 'rgba(245, 158, 11, 0.15)';
      case 'rejected': return 'rgba(239, 68, 68, 0.15)';
      case 'cancelled': return 'rgba(107, 114, 128, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .form-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
          transform: translateY(-2px);
        }
        .form-input:hover {
          transform: translateY(-1px);
          border-color: rgba(148, 163, 184, 0.4);
        }
        .cal-day:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.05);
        }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4) !important;
        }
        .month-nav:hover {
          transform: scale(1.1);
          background: rgba(59, 130, 246, 0.15) !important;
        }
        .glass-card {
          background: rgba(15, 23, 42, 0.85);
          backdropFilter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .glass-card:hover {
          border-color: rgba(59, 130, 246, 0.2);
        }
        * {
          box-sizing: border-box;
        }
        
        @media (max-width: 1200px) {
          .main-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .calendar-section {
            max-width: none !important;
            order: -1;
          }
        }
        
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .schedule-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          .calendar-grid {
            gap: 4px !important;
          }
          .cal-day {
            height: 40px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* Close Button */}
      <button
        onClick={() => { 
          try { window.close(); } 
          catch (e) { } 
          finally { if (!window.opener) { window.location.href = '/'; } } 
        }}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 50,
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(30, 41, 59, 0.9)';
          e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(15, 23, 42, 0.8)';
          e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
        }}
      >
        <svg width="20" height="20" fill="none" stroke="#e2e8f0" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Success Message */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          padding: '16px 32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 25px 50px rgba(16, 185, 129, 0.3)',
          animation: 'slideUp 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Booking submitted successfully! Status: Pending
          </div>
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '64px',
          animation: 'slideUp 0.8s ease-out'
        }}>
          <h1 style={{
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            Book Your Session
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: 'clamp(16px, 3vw, 20px)',
            fontWeight: '400',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Schedule your music service with our professional team. Only one booking per date is accepted after approval.
          </p>
        </div>

        <div className="main-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '48px',
          alignItems: 'start'
        }}>
          {/* Form Section */}
          <div style={{ 
            animation: 'scaleIn 0.6s ease-out 0.2s both',
            minWidth: 0
          }}>
            <div className="glass-card" style={{
              borderRadius: '24px',
              padding: 'clamp(24px, 5vw, 40px)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}></div>
                <h2 style={{
                  color: '#ffffff',
                  fontSize: 'clamp(20px, 4vw, 28px)',
                  fontWeight: '700',
                  margin: 0
                }}>
                  Booking Details
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Service Selection */}
                <div>
                  <label style={labelStyle}>
                    Service Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={service}
                    onChange={e => setService(e.target.value)}
                    className="form-input"
                    style={inputStyle}
                  >
                    <option value="" style={{ background: '#1e293b' }}>Choose your service</option>
                    {services.map(s => (
                      <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Information Grid */}
                <div className="contact-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  <div>
                    <label style={labelStyle}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="contact-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  <div>
                    <label style={labelStyle}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(+63) 9xx xxx xxxx"
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Event Location <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Event address or venue"
                      className="form-input"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label style={labelStyle}>
                    Schedule <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="schedule-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '20px'
                  }}>
                    <div>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        min={todayStr}
                        className="form-input"
                        style={inputStyle}
                      />
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '8px',
                        fontWeight: '500'
                      }}>Date</p>
                    </div>
                    <div>
                      <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="form-input"
                        style={inputStyle}
                      />
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '8px',
                        fontWeight: '500'
                      }}>Start time</p>
                    </div>
                    <div>
                      <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="form-input"
                        style={inputStyle}
                      />
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '8px',
                        fontWeight: '500'
                      }}>End time</p>
                    </div>
                  </div>
                </div>

                {/* Date Blocked Warning */}
                {date && isDateBlocked(date) && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="18" height="18" fill="none" stroke="#f87171" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                        </svg>
                      </div>
                      <div>
                        <p style={{
                          color: '#fca5a5',
                          fontWeight: '700',
                          fontSize: '18px',
                          margin: '0 0 4px 0'
                        }}>Date Not Available</p>
                        <p style={{
                          color: '#f87171',
                          fontSize: '14px',
                          margin: 0
                        }}>This date already has an approved booking</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <label style={labelStyle}>
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special requirements, equipment needs, or additional information..."
                    rows={4}
                    className="form-input"
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '120px'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="submit-btn"
                  style={{
                    width: '100%',
                    padding: '20px 32px',
                    background: isFormValid
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'rgba(100, 116, 139, 0.3)',
                    color: isFormValid ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: isFormValid
                      ? '0 10px 30px rgba(16, 185, 129, 0.3)'
                      : 'none'
                  }}
                >
                  {isFormValid ? 'Submit Booking Request' : 'Complete Required Fields'}
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="calendar-section" style={{ 
            animation: 'scaleIn 0.6s ease-out 0.4s both',
            minWidth: 0
          }}>
            <div className="glass-card" style={{
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '32px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#a855f7',
                  borderRadius: '50%'
                }}></div>
                <h2 style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: 0
                }}>
                  Calendar
                </h2>
              </div>

              {/* Month Navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px'
              }}>
                <button
                  onClick={() => setMonth(m => (m === 0 ? (setYear(y => y - 1), 11) : m - 1))}
                  className="month-nav"
                  style={{
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg width="20" height="20" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: '0 0 4px 0'
                  }}>
                    {new Date(year, month, 1).toLocaleString('default', { month: 'long' })}
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0
                  }}>{year}</p>
                </div>
                
                <button
                  onClick={() => setMonth(m => (m === 11 ? (setYear(y => y + 1), 0) : m + 1))}
                  className="month-nav"
                  style={{
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg width="20" height="20" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar Headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#94a3b8',
                    padding: '12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="calendar-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                marginBottom: '32px'
              }}>
                {/* Empty cells */}
                {Array.from({ length: firstWeekday(year, month) }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ height: '48px' }} />
                ))}

                {/* Calendar days */}
                {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = ymd(year, month, day);
                  const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
                  const dateStatus = getDateStatus(dateStr);
                  const isSelected = date === dateStr;
                  const isToday = dateStr === todayStr;
                  const isPast = dateStr < todayStr;
                  const blocked = isDateBlocked(dateStr);

                  let borderColor, backgroundColor, textColor;
                  
                  if (isSelected) {
                    borderColor = '#3b82f6';
                    backgroundColor = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                    textColor = '#ffffff';
                  } else if (blocked) {
                    borderColor = '#ef4444';
                    backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    textColor = '#f87171';
                  } else if (dateStatus === 'pending') {
                    borderColor = '#f59e0b';
                    backgroundColor = 'rgba(245, 158, 11, 0.15)';
                    textColor = '#fbbf24';
                  } else if (dateStatus === 'rejected') {
                    borderColor = 'rgba(107, 114, 128, 0.6)';
                    backgroundColor = 'rgba(107, 114, 128, 0.15)';
                    textColor = '#9ca3af';
                  } else if (isToday) {
                    borderColor = 'rgba(59, 130, 246, 0.5)';
                    backgroundColor = 'rgba(59, 130, 246, 0.2)';
                    textColor = '#60a5fa';
                  } else {
                    borderColor = 'rgba(100, 116, 139, 0.2)';
                    backgroundColor = 'rgba(30, 41, 59, 0.4)';
                    textColor = isPast ? '#475569' : '#e2e8f0';
                  }

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (!isPast) {
                          setDate(dateStr);
                          if (dayBookings.length > 0) {
                            setSelectedBookingDetails(dayBookings);
                          } else {
                            setSelectedBookingDetails(null);
                          }
                        }
                      }}
                      disabled={isPast}
                      className="cal-day"
                      style={{
                        height: '48px',
                        fontSize: '14px',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        position: 'relative',
                        cursor: isPast ? 'not-allowed' : 'pointer',
                        border: `2px solid ${borderColor}`,
                        background: backgroundColor,
                        color: textColor
                      }}
                    >
                      {day}
                      {dayBookings.length > 0 && !isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '8px',
                          height: '8px',
                          background: getStatusColor(dateStatus),
                          borderRadius: '50%',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }} />
                      )}
                      {isToday && !isSelected && dayBookings.length === 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '4px',
                          width: '6px',
                          height: '6px',
                          background: '#3b82f6',
                          borderRadius: '50%'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Booking Details */}
              {date && (
                <div style={{
                  marginBottom: '32px',
                  padding: '24px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '16px',
                  border: '1px solid rgba(100, 116, 139, 0.2)'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '700',
                      margin: '0 0 4px 0'
                    }}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '14px',
                      margin: 0
                    }}>
                      Bookings for this date
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bookings
                      .filter(b => b.date === date && b.status !== 'cancelled')
                      .map(booking => (
                        <div key={booking.id} style={{
                          background: getStatusBg(booking.status),
                          padding: '16px',
                          borderRadius: '12px',
                          border: `1px solid ${getStatusColor(booking.status)}30`
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                          }}>
                            <div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                              }}>
                                <span style={{
                                  color: getStatusColor(booking.status),
                                  fontSize: '14px',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>
                                  {booking.status}
                                </span>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  background: getStatusColor(booking.status),
                                  borderRadius: '50%'
                                }}></div>
                              </div>
                              <p style={{
                                color: '#ffffff',
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '0 0 4px 0'
                              }}>
                                {booking.service}
                              </p>
                              <p style={{
                                color: '#94a3b8',
                                fontSize: '14px',
                                margin: '0 0 8px 0'
                              }}>
                                {booking.startTime} - {booking.endTime}
                              </p>
                              <p style={{
                                color: '#cbd5e1',
                                fontSize: '14px',
                                margin: 0
                              }}>
                                {booking.name} • {booking.location}
                              </p>
                            </div>
                          </div>
                          
                          {/* Customer Actions */}
                          {(booking.status === 'pending' || booking.status === 'approved') && (
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              marginTop: '16px',
                              paddingTop: '16px',
                              borderTop: '1px solid rgba(100, 116, 139, 0.2)'
                            }}>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: 'rgba(107, 114, 128, 0.2)',
                                  color: '#9ca3af',
                                  border: '1px solid rgba(107, 114, 128, 0.3)',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = 'rgba(107, 114, 128, 0.3)';
                                  e.target.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                                  e.target.style.color = '#9ca3af';
                                }}
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    }
                    
                    {bookings.filter(b => b.date === date && b.status !== 'cancelled').length === 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#10b981',
                          borderRadius: '50%'
                        }}></div>
                        <span style={{
                          color: '#34d399',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          No bookings for this date - Available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div style={{
                paddingTop: '24px',
                borderTop: '1px solid rgba(100, 116, 139, 0.2)'
              }}>
                <h5 style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Legend</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}></div>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>Selected date</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '2px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}></div>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>Today</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid #10b981',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}></div>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>Approved booking (blocked)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      flexShrink: 0,
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '6px',
                        height: '6px',
                        background: '#f59e0b',
                        borderRadius: '50%'
                      }}></div>
                    </div>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>Pending bookings</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'rgba(107, 114, 128, 0.15)',
                      border: '2px solid rgba(107, 114, 128, 0.6)',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}></div>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>Rejected bookings</span>
                  </div>
                </div>  
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;