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
  FaFilter,
  FaPlus
} from '../icons/fa';
import mysqlService from '../services/mysqlService';

const BookingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await mysqlService.get('/bookings');
      if (response.success) {
        // Normalize booking.date to a date-only string (YYYY-MM-DD) to avoid
        // timezone-driven shifts when the client constructs Date objects.
        const normalized = response.bookings.map(b => {
          const raw = b?.date || '';
          const dateOnly = String(raw).split('T')[0];
          return { ...b, date: dateOnly };
        });
        setBookings(normalized);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: format Date -> YYYY-MM-DD (local date parts)
  const toYMD = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return String(d).split('T')[0];
    // Date object
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Get calendar days for current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    if (!date) return [];
    // Compare using local date parts (YYYY-MM-DD) to avoid timezone conversion
    const dateStr = toYMD(date);
    return bookings.filter(booking => {
      const bookingDate = toYMD(booking.date);
      return bookingDate === dateStr;
    });
  };

  // Get color based on status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#10b981'; // green
      case 'pending':
        return '#f59e0b'; // yellow
      case 'upcoming':
        return '#3b82f6'; // blue
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // Get status background color
  const getStatusBackground = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'rgba(16, 185, 129, 0.1)';
      case 'pending':
        return 'rgba(245, 158, 11, 0.1)';
      case 'upcoming':
        return 'rgba(59, 130, 246, 0.1)';
      case 'rejected':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  // Get filtered bookings for current week
  const getWeekBookings = () => {
    if (selectedWeek.length === 0) return [];
    
    let weekBookings = [];
    selectedWeek.forEach(date => {
      if (date) {
        const dayBookings = getBookingsForDate(date);
        dayBookings.forEach(booking => {
          weekBookings.push({
            ...booking,
            displayDate: date
          });
        });
      }
    });
    
    // Apply filters
    weekBookings = weekBookings.filter(booking => {
      const matchesSearch = !searchTerm || 
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        booking.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
    
    return weekBookings.sort((a, b) => 
      // booking.date is normalized to YYYY-MM-DD so string comparison is safe
      (a.date > b.date ? 1 : a.date < b.date ? -1 : 0) ||
      (a.start_time?.localeCompare(b.start_time) || 0)
    );
  };

  // Navigation functions
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  // Handle date click to select week
  const handleDateClick = (date) => {
    if (!date) return;
    
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    setSelectedWeek(week);
    setViewMode('week');
  };

  // Check if date is in selected week
  const isInSelectedWeek = (date) => {
    if (!date || selectedWeek.length === 0) return false;
    const dateStr = toYMD(date);
    return selectedWeek.some(weekDate => toYMD(weekDate) === dateStr);
  };

  // Format functions
  const formatDate = (date) => {
    // Accept either a Date object or a YYYY-MM-DD string. Construct a local
    // Date from parts to avoid timezone shifts when parsing ISO strings.
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
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get service icon
  const getServiceIcon = (service) => {
    const serviceStr = service?.toLowerCase() || '';
    if (serviceStr.includes('band')) return <FaMusic />;
    if (serviceStr.includes('instrument')) return <FaGuitar />;
    if (serviceStr.includes('rental')) return <FaCompactDisc />;
    return <FaCalendarAlt />;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekBookings = getWeekBookings();

  const styles = {
    container: {
      padding: '24px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '16px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0'
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    titleIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '20px'
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0
    },
    subtitle: {
      fontSize: '12px',
      color: '#64748b',
      margin: 0
    },
    controls: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchBox: {
      padding: '10px 14px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      background: '#f8fafc',
      minWidth: '220px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    searchInput: {
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: '14px',
      width: '100%',
      color: '#374151'
    },
    filterSelect: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      background: '#f8fafc',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '140px'
    },
    viewToggle: {
      display: 'flex',
      background: '#f1f5f9',
      borderRadius: '12px',
      padding: '4px',
      border: '1px solid #e2e8f0'
    },
    viewButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: 'transparent',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#64748b'
    },
    activeView: {
      background: 'white',
      color: '#3b82f6',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    navSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    navButton: {
      padding: '12px 16px',
      background: 'white',
      color: '#374151',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    primaryButton: {
      padding: '10px 18px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    monthYearSelector: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    dropdown: {
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    calendarContainer: {
      display: 'grid',
      gridTemplateColumns: viewMode === 'month' ? '1fr 400px' : '1fr',
      gap: '24px',
      height: 'calc(100vh - 200px)'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
      height: '100%',
      overflow: 'auto'
    },
    dayHeader: {
      textAlign: 'center',
      fontWeight: '600',
      color: '#374151',
      padding: '16px 0',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    dayCell: {
      minHeight: '98px',
      padding: '10px',
      background: 'white',
      border: '1px solid #f1f5f9',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    emptyCell: {
      minHeight: '120px',
      background: 'transparent',
      border: 'none'
    },
    dateNumber: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    todayBadge: {
      fontSize: '9px',
      padding: '2px 6px',
      borderRadius: '6px',
      background: '#3b82f6',
      color: 'white',
      fontWeight: '600'
    },
    bookingsContainer: {
      flex: 1,
      overflowY: 'auto',
      minHeight: 0
    },
    bookingItem: {
      fontSize: '12px',
      padding: '6px 8px',
      borderRadius: '8px',
      color: '#1f2937',
      fontWeight: '600',
      marginBottom: '6px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    moreBookings: {
      fontSize: '12px',
      color: '#3b82f6',
      fontWeight: '600',
      marginTop: '6px',
      textAlign: 'center',
      cursor: 'pointer'
    },
    sidebar: {
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    sidebarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    sidebarTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    weekRange: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      padding: '8px 12px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    bookingsList: {
      flex: 1,
      overflowY: 'auto',
      minHeight: 0
    },
    bookingCard: {
      padding: '16px',
      marginBottom: '12px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      background: 'white',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    bookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    serviceInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    serviceIcon: {
      color: '#3b82f6',
      fontSize: '16px'
    },
    serviceName: {
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '14px'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      color: 'white'
    },
    bookingDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    detailItem: {
      fontSize: '13px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: '#94a3b8',
      textAlign: 'center'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5
    },
    loadingState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 20px',
      color: '#64748b',
      fontSize: '16px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaCalendarAlt />
            Loading calendar...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div style={styles.titleIcon}>
            <FaCalendarAlt />
          </div>
          <div style={styles.titleContent}>
            <h1 style={styles.title}>Booking Calendar</h1>
            <p style={styles.subtitle}>Manage and view all your bookings</p>
          </div>
        </div>

        <div style={styles.controls}>
          {/* Search */}
          <div style={styles.searchBox}>
            <FaSearch color="#94a3b8" />
            <input
              style={styles.searchInput}
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select 
            style={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="upcoming">Upcoming</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* View Toggle */}
          <div style={styles.viewToggle}>
            <button 
              style={{ ...styles.viewButton, ...(viewMode === 'month' && styles.activeView) }}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              style={{ ...styles.viewButton, ...(viewMode === 'week' && styles.activeView) }}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
          </div>

          {/* Navigation */}
          <div style={styles.navSection}>
            <button 
              style={styles.navButton}
              onClick={prevMonth}
            >
              <FaChevronLeft />
            </button>
            
            <div style={styles.monthYearSelector}>
              <select 
                value={currentDate.getMonth()} 
                onChange={handleMonthChange}
                style={styles.dropdown}
              >
                <option value={0}>January</option>
                <option value={1}>February</option>
                <option value={2}>March</option>
                <option value={3}>April</option>
                <option value={4}>May</option>
                <option value={5}>June</option>
                <option value={6}>July</option>
                <option value={7}>August</option>
                <option value={8}>September</option>
                <option value={9}>October</option>
                <option value={10}>November</option>
                <option value={11}>December</option>
              </select>
              
              <select 
                value={currentDate.getFullYear()} 
                onChange={handleYearChange}
                style={styles.dropdown}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
            
            <button 
              style={styles.navButton}
              onClick={nextMonth}
            >
              <FaChevronRight />
            </button>
          </div>

          <button style={styles.primaryButton}>
            <FaPlus />
            New Booking
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.calendarContainer}>
        {/* Calendar Grid */}
        <div style={styles.calendarGrid}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={styles.dayHeader}>{day}</div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} style={styles.emptyCell}></div>;
            }
            
            const dayBookings = getBookingsForDate(date);
            const isSelected = isInSelectedWeek(date);
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <div
                key={index}
                style={{
                  ...styles.dayCell,
                  background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 
                             isToday ? 'rgba(59, 130, 246, 0.08)' : 'white',
                  border: isToday ? '2px solid #3b82f6' : '1px solid #f1f5f9',
                  transform: hoveredDate === index ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: hoveredDate === index ? '0 8px 16px rgba(0, 0, 0, 0.1)' : 
                            isToday ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none'
                }}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDate(index)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div style={styles.dateNumber}>
                  {date.getDate()}
                  {isToday && <span style={styles.todayBadge}>Today</span>}
                </div>
                
                {/* Bookings */}
                <div style={styles.bookingsContainer}>
                  {dayBookings.slice(0, 4).map((booking, idx) => (
                    <div
                      key={idx}
                      style={{
                        ...styles.bookingItem,
                        background: getStatusBackground(booking.status),
                        color: getStatusColor(booking.status),
                        borderLeft: `4px solid ${getStatusColor(booking.status)}`
                      }}
                      title={`${booking.customer_name} - ${booking.service}`}
                    >
                      <span style={{ fontSize: '12px', opacity: 0.9 }}>{formatTime(booking.start_time)}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.service}</span>
                    </div>
                  ))}
                  
                  {dayBookings.length > 4 && (
                    <div style={styles.moreBookings}>
                      +{dayBookings.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar - Only show in month view */}
        {viewMode === 'month' && (
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <div style={styles.sidebarTitle}>
                <FaClock />
                Week Overview
              </div>
              {selectedWeek.length > 0 && (
                <div style={styles.weekRange}>
                  {selectedWeek[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                  {selectedWeek[6]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
            
            <div style={styles.bookingsList}>
              {weekBookings.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <FaCalendarAlt />
                  </div>
                  <h3 style={{ color: '#475569', marginBottom: '8px' }}>
                    {selectedWeek.length > 0 ? 'No bookings this week' : 'Select a date'}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
                    {selectedWeek.length > 0 ? 
                      'No bookings match your current filters' : 
                      'Click on any date to view week events'}
                  </p>
                </div>
              ) : (
                weekBookings.map((booking, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.bookingCard,
                      background: getStatusBackground(booking.status),
                      borderLeft: `4px solid ${getStatusColor(booking.status)}`
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
                  >
                    <div style={styles.bookingHeader}>
                      <div style={styles.serviceInfo}>
                        <div style={styles.serviceIcon}>
                          {getServiceIcon(booking.service)}
                        </div>
                        <div style={styles.serviceName}>{booking.service}</div>
                      </div>
                      <div
                        style={{
                          ...styles.statusBadge,
                          background: getStatusColor(booking.status)
                        }}
                      >
                        {booking.status}
                      </div>
                    </div>
                    
                    <div style={styles.bookingDetails}>
                      <div style={styles.detailItem}>
                        <FaUser size={12} />
                        {booking.customer_name}
                      </div>
                      
                      <div style={styles.detailItem}>
                        <FaCalendarAlt size={12} />
                        {formatDate(booking.date)}
                      </div>
                      
                      {booking.start_time && booking.end_time && (
                        <div style={styles.detailItem}>
                          <FaClock size={12} />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                      )}
                      
                      {booking.location && (
                        <div style={styles.detailItem}>
                          <FaMapMarkerAlt size={12} />
                          {booking.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;