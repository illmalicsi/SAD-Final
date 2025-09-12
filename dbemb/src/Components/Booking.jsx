import React, { useMemo, useState } from 'react';

const Booking = () => {
  const today = new Date();
  const [service, setService] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookings, setBookings] = useState([]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showSuccess, setShowSuccess] = useState(false);
  const services = ['Band Gigs','Music Arrangement','Parade Events','Music Workshops','Instrument Rentals'];

  const daysInMonth = (y,m) => new Date(y, m+1, 0).getDate();
  const firstWeekday = (y,m) => new Date(y, m, 1).getDay();
  const pad2 = n => (n<10?`0${n}`:`${n}`);
  const ymd = (y,m,d) => `${y}-${pad2(m+1)}-${pad2(d)}`;
  const isTaken = (svc, y,m,d) => bookings.some(b => b.service===svc && b.date===ymd(y,m,d) && b.status!=='cancelled');
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());
  const hasConflict = useMemo(() => {
    if (!service || !date || !startTime || !endTime) return false;
    const start = `${date}T${startTime}`;
    const end = `${date}T${endTime}`;
    const overlap = (aS,aE,bS,bE)=> aS<bE && bS<aE;
    return bookings.some(b => b.service===service && b.date===date && b.status!=='cancelled' && overlap(start,end,`${b.date}T${b.startTime}`,`${b.date}T${b.endTime}`));
  }, [service,date,startTime,endTime,bookings]);

  const submit = (e) => {
    e.preventDefault();
    if (!service || !name || !email || !date || !startTime || !endTime) return;
    if (endTime <= startTime) return;
    if (hasConflict) return;
    const newBooking = { 
      id: Date.now(), 
      service, 
      name, 
      email, 
      phone, 
      notes, 
      date, 
      startTime, 
      endTime, 
      createdAt: new Date().toISOString(), 
      status:'pending' 
    };
    setBookings(prev => [...prev, newBooking]);
    setShowSuccess(true);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const isFormValid = service && name && email && date && startTime && endTime && !hasConflict && endTime > startTime;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
      padding: '32px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Close page button */}
      <button
        onClick={() => { try { window.close(); } catch (e) { /* ignore */ } finally { if (!window.opener) { window.location.href = '/'; } } }}
        aria-label="Close booking page"
        title="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          color: '#e2e8f0',
          borderRadius: '10px',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'; e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 25s ease-in-out infinite reverse'
      }} />

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
          outline: none;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          transform: translateY(-1px);
        }
        .cal-day:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15) !important;
        }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4) !important;
        }
        .month-nav:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          transform: scale(1.1);
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          animation: 'slideUp 0.8s ease-out'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            Book Your Session
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '18px',
            fontWeight: '400',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Schedule your music service with our professional team. Select your preferred date and time below.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            zIndex: 1000,
            animation: 'slideUp 0.5s ease-out',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            Booking submitted successfully!
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Form Section */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            animation: 'scaleIn 0.6s ease-out 0.2s both'
          }}>
            <h2 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#3b82f6',
                borderRadius: '50%'
              }}></span>
              Contact Information
            </h2>

            <form onSubmit={submit}>
              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Full Name *
                  </label>
                  <input 
                    className="form-input"
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={name}
                    onChange={e=>setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Email *
                  </label>
                  <input 
                    type="email"
                    className="form-input"
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Phone
                  </label>
                  <input 
                    className="form-input"
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={phone}
                    onChange={e=>setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Service *
                  </label>
                  <select 
                    className="form-input"
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={service}
                    onChange={e=>setService(e.target.value)}
                  >
                    <option value="">Select a service</option>
                    {services.map(s => (
                      <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Date *
                  </label>
                  <input 
                    type="date"
                    className="form-input"
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={date}
                    onChange={e=>setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Start Time *
                  </label>
                  <input 
                    type="time"
                    className="form-input"
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={startTime}
                    onChange={e=>setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    End Time *
                  </label>
                  <input 
                    type="time"
                    className="form-input"
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    value={endTime}
                    onChange={e=>setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Conflict Warning */}
              {hasConflict && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  Time conflict detected with an existing booking
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Additional Notes
                </label>
                <textarea 
                  className="form-input"
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    color: '#ffffff',
                    fontSize: '16px',
                    minHeight: '120px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  value={notes}
                  onChange={e=>setNotes(e.target.value)}
                  placeholder="Any special requirements or additional information..."
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="submit-btn"
                disabled={!isFormValid}
                style={{
                  width: '100%',
                  background: isFormValid 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'rgba(148, 163, 184, 0.3)',
                  color: isFormValid ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '18px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: isFormValid 
                    ? '0 10px 30px rgba(16, 185, 129, 0.3)'
                    : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {isFormValid ? 'Submit Booking' : 'Complete Required Fields'}
              </button>
            </form>
          </div>

          {/* Calendar Section */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            animation: 'scaleIn 0.6s ease-out 0.4s both'
          }}>
            <h2 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#a855f7',
                borderRadius: '50%'
              }}></span>
              Availability
            </h2>

            {/* Month Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <button 
                className="month-nav"
                onClick={() => setMonth(m => (m===0 ? (setYear(y=>y-1), 11) : m-1))}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  color: '#3b82f6',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                ←
              </button>
              <div style={{
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                {new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <button 
                className="month-nav"
                onClick={() => setMonth(m => (m===11 ? (setYear(y=>y+1), 0) : m+1))}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  color: '#3b82f6',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18L15 12L9 6"/>
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                <div key={day} style={{
                  color: '#94a3b8',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {day}
                </div>
              ))}

              {/* Empty cells for first week */}
              {Array.from({ length: firstWeekday(year, month) }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
                const day = i + 1;
                const dateStr = ymd(year, month, day);
                const taken = isTaken(service, year, month, day);
                const isSelected = date === dateStr;
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={day}
                    className="cal-day"
                    onClick={() => !taken && setDate(dateStr)}
                    disabled={taken}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected 
                        ? '2px solid #3b82f6' 
                        : isToday 
                        ? '2px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid rgba(148, 163, 184, 0.1)',
                      background: taken 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : isSelected 
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(30, 41, 59, 0.3)',
                      color: taken 
                        ? '#f87171' 
                        : isSelected 
                        ? '#60a5fa'
                        : '#ffffff',
                      cursor: taken ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: isSelected || isToday ? '700' : '500',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                  >
                    {day}
                    {isToday && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '4px',
                        background: '#3b82f6',
                        borderRadius: '50%'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Booking Info */}
            {service && date && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <h4 style={{
                  color: '#e2e8f0',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  {service} • {new Date(date).toLocaleDateString()}
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {bookings
                    .filter(b => b.service === service && b.date === date && b.status !== 'cancelled')
                    .map(booking => (
                      <span key={booking.id} style={{
                        padding: '6px 12px',
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '20px',
                        color: '#c084fc',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    ))
                  }
                  {bookings.filter(b => b.service === service && b.date === date && b.status !== 'cancelled').length === 0 && (
                    <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500', display:'inline-flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ display:'inline-block', width:'6px', height:'6px', background:'#10b981', borderRadius:'50%' }} />
                      No bookings - full day available
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;