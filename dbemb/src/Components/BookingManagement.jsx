import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaMusic, FaSpinner, FaBell } from 'react-icons/fa';
import NotificationService from '../services/notificationService';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [notification, setNotification] = useState(null);

  // Load bookings from API
  const loadBookings = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('BookingManagement: Loading bookings from API...');

      if (response.ok) {
        const data = await response.json();
        console.log('BookingManagement: API Response:', data);
        
        if (data.success && Array.isArray(data.bookings)) {
          // Convert database format to frontend format
          const formattedBookings = data.bookings.map(b => ({
            id: b.booking_id,
            customerName: b.customer_name,
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
            createdAt: b.created_at,
            approvedBy: b.approved_by,
            approvedAt: b.approved_at
          }));
          setBookings(formattedBookings);
        } else {
          setBookings([]);
        }
      } else {
        console.error('Failed to fetch bookings:', response.statusText);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();

    // Listen for booking updates
    const handleBookingsUpdate = () => loadBookings();
    window.addEventListener('bookingsUpdated', handleBookingsUpdate);
    
    return () => {
      window.removeEventListener('bookingsUpdated', handleBookingsUpdate);
    };
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    setProcessingId(bookingId);
    
    console.log('BookingManagement: Updating booking', bookingId, 'to status:', newStatus);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('BookingManagement: No token found');
        showNotification('Authentication required', 'error');
        setProcessingId(null);
        return;
      }

      console.log('BookingManagement: Sending PUT request to API...');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      console.log('BookingManagement: API Response:', data);

      if (response.ok && data.success) {
        // Find the booking to send notifications
        const booking = bookings.find(b => b.id === bookingId);
        
        if (booking) {
          // Send notification to customer
          if (newStatus === 'approved') {
            NotificationService.notifyBookingConfirmed(booking);
            showNotification(`Booking approved and customer notified!`, 'success');
          } else if (newStatus === 'rejected') {
            NotificationService.notifyBookingRejected(booking);
            showNotification(`Booking rejected and customer notified.`, 'info');
          }
        }

        console.log('BookingManagement: Reloading bookings from API...');
        // Reload bookings from server to get updated data
        await loadBookings();

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('bookingsUpdated', {
          detail: { bookingId, status: newStatus }
        }));

      } else {
        showNotification(data.message || 'Failed to update booking', 'error');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      showNotification('Failed to update booking', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredBookings = () => {
    if (filterStatus === 'all') return bookings;
    return bookings.filter(b => b.status === filterStatus);
  };

  const filteredBookings = getFilteredBookings();
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '14px'
    },
    filterBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    filterButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    filterButtonActive: {
      backgroundColor: '#0369a1',
      color: '#ffffff',
      borderColor: '#0369a1'
    },
    bookingCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease'
    },
    bookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    bookingTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '4px'
    },
    bookingId: {
      fontSize: '13px',
      color: '#64748b'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusPending: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fbbf24'
    },
    statusApproved: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #34d399'
    },
    statusRejected: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #f87171'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '16px'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#475569',
      fontSize: '14px'
    },
    notesSection: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    actionButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    },
    approveButton: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    rejectButton: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    notification: {
      position: 'fixed',
      top: '24px',
      right: '24px',
      padding: '16px 24px',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease',
      minWidth: '300px'
    },
    notificationSuccess: {
      borderLeft: '4px solid #10b981'
    },
    notificationError: {
      borderLeft: '4px solid #ef4444'
    },
    notificationInfo: {
      borderLeft: '4px solid #3b82f6'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '2px dashed #e2e8f0'
    },
    emptyIcon: {
      fontSize: '48px',
      color: '#cbd5e1',
      marginBottom: '16px'
    },
    emptyText: {
      color: '#64748b',
      fontSize: '16px'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #ffffff',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaSpinner size={32} color="#0369a1" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#64748b' }}>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>

      {/* Notification */}
      {notification && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'success' ? styles.notificationSuccess : {}),
          ...(notification.type === 'error' ? styles.notificationError : {}),
          ...(notification.type === 'info' ? styles.notificationInfo : {})
        }}>
          <FaBell size={20} color={
            notification.type === 'success' ? '#10b981' :
            notification.type === 'error' ? '#ef4444' : '#3b82f6'
          } />
          <span style={{ flex: 1, color: '#0f172a' }}>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaCalendarAlt color="#0369a1" />
          Booking Management
        </h1>
        <p style={styles.subtitle}>Review and manage customer booking requests</p>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <button
          style={{
            ...styles.filterButton,
            ...(filterStatus === 'all' ? styles.filterButtonActive : {})
          }}
          onClick={() => setFilterStatus('all')}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filterStatus === 'pending' ? styles.filterButtonActive : {})
          }}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filterStatus === 'approved' ? styles.filterButtonActive : {})
          }}
          onClick={() => setFilterStatus('approved')}
        >
          Approved ({approvedCount})
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filterStatus === 'rejected' ? styles.filterButtonActive : {})
          }}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div style={styles.emptyState}>
          <FaCalendarAlt style={styles.emptyIcon} />
          <p style={styles.emptyText}>No bookings found</p>
        </div>
      ) : (
        filteredBookings
          .sort((a, b) => {
            // Sort by status priority: pending first, then approved, then rejected
            const statusOrder = { pending: 0, approved: 1, rejected: 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
              return statusOrder[a.status] - statusOrder[b.status];
            }
            // Then by date (newest first)
            return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
          })
          .map(booking => (
            <div key={booking.id} style={styles.bookingCard}>
              {/* Header */}
              <div style={styles.bookingHeader}>
                <div>
                  <div style={styles.bookingTitle}>{booking.service}</div>
                  <div style={styles.bookingId}>Booking #{booking.id}</div>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  ...(booking.status === 'pending' ? styles.statusPending : {}),
                  ...(booking.status === 'approved' ? styles.statusApproved : {}),
                  ...(booking.status === 'rejected' ? styles.statusRejected : {})
                }}>
                  {booking.status}
                </span>
              </div>

              {/* Customer Details */}
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <FaUser size={14} color="#0369a1" />
                  <span>{booking.name}</span>
                </div>
                <div style={styles.detailItem}>
                  <FaEnvelope size={14} color="#0369a1" />
                  <span>{booking.email}</span>
                </div>
                <div style={styles.detailItem}>
                  <FaPhone size={14} color="#0369a1" />
                  <span>{booking.phone}</span>
                </div>
                <div style={styles.detailItem}>
                  <FaMapMarkerAlt size={14} color="#0369a1" />
                  <span>{booking.location}</span>
                </div>
              </div>

              {/* Booking Details */}
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <FaCalendarAlt size={14} color="#0369a1" />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div style={styles.detailItem}>
                  <FaClock size={14} color="#0369a1" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div style={styles.notesSection}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    Notes:
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569' }}>
                    {booking.notes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {booking.status === 'pending' && (
                <div style={styles.actionButtons}>
                  <button
                    style={{
                      ...styles.actionButton,
                      ...styles.approveButton,
                      ...(processingId === booking.id ? styles.disabledButton : {})
                    }}
                    onClick={() => updateBookingStatus(booking.id, 'approved')}
                    disabled={processingId === booking.id}
                  >
                    {processingId === booking.id ? (
                      <>
                        <div style={styles.spinner}></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck size={14} />
                        Approve & Notify
                      </>
                    )}
                  </button>
                  <button
                    style={{
                      ...styles.actionButton,
                      ...styles.rejectButton,
                      ...(processingId === booking.id ? styles.disabledButton : {})
                    }}
                    onClick={() => updateBookingStatus(booking.id, 'rejected')}
                    disabled={processingId === booking.id}
                  >
                    <FaTimes size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
      )}
    </div>
  );
};

export default BookingManagement;
