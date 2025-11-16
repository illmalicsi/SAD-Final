import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaMusic,
  FaGuitar,
  FaCompactDisc,
  FaSearch,
  FaPlus,
  FaChevronDown,
  FaSpinner
} from 'react-icons/fa';
import mysqlService from '../services/mysqlService';
import StyledSelect from './StyledSelect';

const BookingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('timeline'); // 'calendar' | 'timeline'
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await mysqlService.get('/bookings');
      let list = [];
      if (response) {
        if (response.success && Array.isArray(response.bookings)) {
          list = response.bookings;
        } else if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response.bookings)) {
          list = response.bookings;
        }
      }

      const normalized = (list || []).map(b => {
        // Prefer requested_* values when a reschedule request exists so the calendar
        // reflects the requested/rescheduled date and time instead of the original.
        const displayDate = b.requested_date || b.requestedDate || b.date || '';
        const dateOnly = String(displayDate).split('T')[0];
        const displayStart = b.requested_start || b.requestedStart || b.start_time || b.startTime || '';
        const displayEnd = b.requested_end || b.requestedEnd || b.end_time || b.endTime || '';
        const customer_name = b.customer_name || [b.first_name, b.last_name].filter(Boolean).join(' ') || b.customerName || '';
        return { ...b, date: dateOnly, start_time: displayStart, end_time: displayEnd, customer_name };
      });

      setBookings(normalized);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const toYMD = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return String(d).split('T')[0];
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = toYMD(date);
    return bookings.filter(booking => toYMD(booking.date) === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#0f9d58';
      case 'pending': return '#f4b400';
      case 'upcoming': return '#4285f4';
      case 'rejected': return '#db4437';
      default: return '#5f6368';
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDate = (date) => {
    try {
      if (typeof date === 'string') {
        const parts = date.split('T')[0].split('-');
        if (parts.length === 3) {
          const d = new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);
          return d.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      }
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return String(date);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return String(time);
    }
  };

  const getServiceIcon = (service) => {
    const serviceStr = service?.toLowerCase() || '';
    if (serviceStr.includes('band')) return <FaMusic />;
    if (serviceStr.includes('instrument')) return <FaGuitar />;
    if (serviceStr.includes('rental')) return <FaCompactDisc />;
    return <FaCalendarAlt />;
  };

  const categorizeBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const past = [];
    const current = [];
    const upcoming = [];
    const future = [];

    bookings.forEach(b => {
      const parts = String(b.date).split('T')[0].split('-');
      if (parts.length !== 3) return;
      const d = new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);
      d.setHours(0, 0, 0, 0);

      const matchesSearch = !searchTerm || 
        b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || b.status?.toLowerCase() === statusFilter.toLowerCase();
      
      if (!matchesSearch || !matchesStatus) return;

      if (d < today) {
        past.push(b);
      } else if (d.getTime() === today.getTime()) {
        current.push(b);
      } else if (d >= startOfWeek && d <= endOfWeek) {
        upcoming.push(b);
      } else if (d > endOfWeek) {
        future.push(b);
      }
    });

    const sortByDateTime = (arr) => arr.sort((a, b) => {
      if (a.date === b.date) return (a.start_time || '').localeCompare(b.start_time || '');
      return a.date > b.date ? 1 : a.date < b.date ? -1 : 0;
    });

    return {
      past: sortByDateTime(past),
      current: sortByDateTime(current),
      upcoming: sortByDateTime(upcoming),
      future: sortByDateTime(future)
    };
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const categorized = categorizeBookings();

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #dadce0',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        minHeight: '64px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              borderRadius: '8px'
            }}>
              <FaCalendarAlt size={18} />
            </div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '400',
              color: '#202124',
              margin: 0
            }}>Calendar</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #dadce0',
            padding: '0 8px',
            height: '36px',
            background: '#fff',
            minWidth: '150px',
            borderRadius: '6px'
          }}>
            <FaSearch size={14} color="#5f6368" />
            <input
              type="text"
              placeholder="Search bookings"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                padding: '0 8px',
                fontSize: '14px',
                width: '100%',
                background: 'transparent'
              }}
            />
          </div>

          <div style={{ width: 170 }}>
            <StyledSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: '36px', fontSize: '14px', padding: '6px 10px' }}
            >
              <option value="all">All status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="upcoming">Upcoming</option>
              <option value="rejected">Rejected</option>
            </StyledSelect>
          </div>

          {loading && (
            <div style={{ fontSize: '12px', color: '#5f6368', paddingLeft: '8px' }}>
              Loading bookings...
            </div>
          )}

          <div style={{
            display: 'flex',
            border: '1px solid #dadce0',
            height: '36px',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '0 16px',
                border: 'none',
                background: viewMode === 'calendar' ? '#e8f0fe' : '#fff',
                color: viewMode === 'calendar' ? '#1967d2' : '#5f6368',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                borderRight: '1px solid #dadce0'
              }}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                padding: '0 16px',
                border: 'none',
                background: viewMode === 'timeline' ? '#e8f0fe' : '#fff',
                color: viewMode === 'timeline' ? '#1967d2' : '#5f6368',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Timeline
            </button>
          </div>

          <button style={{
            padding: '0 16px',
            height: '36px',
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px'
          }}>
            <FaPlus size={12} />
            Create
          </button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: windowWidth < 768 ? 'column' : 'row' }}>
          {/* Mini Calendar Sidebar */}
          <div style={{
            width: windowWidth < 768 ? '100%' : '256px',
            borderRight: windowWidth < 768 ? 'none' : '1px solid #dadce0',
            borderBottom: windowWidth < 768 ? '1px solid #dadce0' : 'none',
            padding: '16px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <button onClick={prevMonth} style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}>
                <FaChevronLeft size={14} color="#5f6368" />
              </button>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#202124' }}>
                {monthName}
              </span>
              <button onClick={nextMonth} style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}>
                <FaChevronRight size={14} color="#5f6368" />
              </button>
            </div>

            {/* Mini Calendar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              fontSize: '11px',
              textAlign: 'center'
            }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} style={{ color: '#70757a', padding: '4px', fontWeight: '500' }}>
                  {day}
                </div>
              ))}
              {days.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} />;
                const hasBooking = getBookingsForDate(date).length > 0;
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '4px',
                      cursor: 'pointer',
                      color: isToday ? '#1a73e8' : '#202124',
                      fontWeight: isToday ? '700' : '400',
                      background: isToday ? '#e8f0fe' : 'transparent',
                      position: 'relative',
                      borderRadius: '4px'
                    }}
                  >
                    {date.getDate()}
                    {hasBooking && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '4px',
                        background: '#1a73e8',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar View */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', position: 'relative' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              background: '#dadce0',
              border: '1px solid #dadce0'
            }}>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} style={{
                  background: '#fff',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#70757a',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {day.slice(0, 3)}
                </div>
              ))}
              
              {days.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} style={{ background: '#f8f9fa', minHeight: '100px' }} />;
                const dayBookings = getBookingsForDate(date);
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#fff',
                      minHeight: '100px',
                      padding: '4px',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      fontSize: '12px',
                      fontWeight: isToday ? '700' : '400',
                      color: isToday ? '#1a73e8' : '#202124',
                      marginBottom: '4px'
                    }}>
                      {date.getDate()}
                    </div>
                    {dayBookings.slice(0, 3).map((booking, i) => (
                      <div
                        key={i}
                        onMouseEnter={(e) => { setHoveredBooking(booking); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                        onMouseMove={(e) => { setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                        onMouseLeave={() => setHoveredBooking(null)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 4px',
                          marginBottom: '2px',
                          background: getStatusColor(booking.status),
                          color: 'white',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          borderRadius: '3px',
                          cursor: 'default'
                        }}
                      >
                        {booking.service}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div style={{ fontSize: '10px', color: '#5f6368', marginTop: '2px' }}>
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
            {/* Hover tooltip */}
            {hoveredBooking && (
              <div
                style={{
                  position: 'fixed',
                  left: tooltipPos.x + 12,
                  top: tooltipPos.y + 12,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '10px 12px',
                  boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
                  zIndex: 20000,
                  minWidth: 240,
                  maxWidth: 420,
                  pointerEvents: 'none',
                  fontSize: 13,
                  color: '#111827'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{hoveredBooking.service}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{hoveredBooking.customer_name}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaClock size={12} />{formatTime(hoveredBooking.start_time)} - {formatTime(hoveredBooking.end_time)}</div>
                </div>
                {hoveredBooking.location && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#6b7280' }}><FaMapMarkerAlt size={12} />{hoveredBooking.location}</div>
                )}
                {hoveredBooking.note && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>{hoveredBooking.note}</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: windowWidth < 768 ? '12px' : '16px 24px',
          background: '#f8f9fa'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: windowWidth < 640 ? '1fr' : 
                                 windowWidth < 1024 ? 'repeat(2, 1fr)' : 
                                 'repeat(4, 1fr)',
            gap: '16px'
          }}>
                          {[
              { title: 'Past Bookings', data: categorized.past, color: '#5f6368' },
              { title: 'Today', data: categorized.current, color: '#1a73e8' },
              { title: 'This Week', data: categorized.upcoming, color: '#f4b400' },
              { title: 'Future', data: categorized.future, color: '#0f9d58' }
            ].map(section => (
              <div key={section.title} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #dadce0' }}>
                <div style={{
                  padding: '12px 16px',
                  background: '#fff',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h2 style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#202124',
                    margin: 0
                  }}>
                    {section.title}
                  </h2>
                  <span style={{
                    fontSize: '12px',
                    color: '#5f6368',
                    background: '#f1f3f4',
                    padding: '2px 8px',
                    fontWeight: '500',
                    borderRadius: '4px'
                  }}>
                    {section.data.length}
                  </span>
                </div>
                
                <div style={{
                  background: '#fff',
                  border: 'none',
                  borderTop: 'none',
                  minHeight: '400px',
                  maxHeight: 'calc(100vh - 180px)',
                  overflowY: 'auto'
                }}>
                  {section.data.length === 0 ? (
                    <div style={{
                      padding: '48px 16px',
                      textAlign: 'center',
                      color: '#5f6368',
                      fontSize: '13px'
                    }}>
                      No bookings
                    </div>
                  ) : (
                    section.data.map((booking, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f1f3f4',
                          cursor: 'pointer',
                          background: '#fff'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          <div style={{
                            width: '4px',
                            height: '48px',
                            background: getStatusColor(booking.status),
                            flexShrink: 0,
                            borderRadius: '2px'
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#202124',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {booking.service}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#5f6368',
                              marginBottom: '2px'
                            }}>
                              {booking.customer_name}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#5f6368',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginBottom: '2px'
                            }}>
                              <FaClock size={10} />
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </div>
                            {booking.location && (
                              <div style={{
                                fontSize: '11px',
                                color: '#5f6368',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                <FaMapMarkerAlt size={10} />
                                {booking.location}
                              </div>
                            )}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: getStatusColor(booking.status),
                            color: 'white',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                            borderRadius: '4px'
                          }}>
                            {booking.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;