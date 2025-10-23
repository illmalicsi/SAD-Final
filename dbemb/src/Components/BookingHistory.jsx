import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCreditCard,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaUserCircle
} from 'react-icons/fa';

const statusConfig = {
  pending: { color: '#92400e', bg: '#fef3c7', icon: FaExclamationCircle, label: 'Pending', borderColor: '#f59e0b' },
  approved: { color: '#065f46', bg: '#d1fae5', icon: FaCheckCircle, label: 'Approved', borderColor: '#10b981' },
  paid: { color: '#1e3a8a', bg: '#dbeafe', icon: FaCreditCard, label: 'Paid', borderColor: '#3b82f6' },
  rejected: { color: '#7f1d1d', bg: '#fee2e2', icon: FaTimesCircle, label: 'Rejected', borderColor: '#ef4444' }
};

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);

  // Inline style helpers
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)',
    paddingBottom: '48px'
  };

  const pageInner = {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '24px'
  };

  const headerStyle = {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
  };

  const cardBase = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(2,6,23,0.06)',
    border: '1px solid #e6eef8',
    overflow: 'hidden'
  };

  const emptyCard = {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 1px 4px rgba(2,6,23,0.06)',
    border: '1px solid #e2e8f0',
    padding: '64px',
    textAlign: 'center'
  };

  const spinner = {
    borderRadius: '9999px',
    height: '48px',
    width: '48px',
    borderBottom: '4px solid #2563eb'
  };

  const fetchData = () => {
    let u = null;
    try {
      u = JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null');
      setUser(u);
    } catch (e) {
      setUser(null);
    }

    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.bookings)) {
          const formatted = data.bookings.map(b => ({
            id: b.booking_id,
            customerName: b.customer_name,
            email: b.email,
            phone: b.phone,
            service: b.service,
            date: b.date ? b.date.split('T')[0] : b.date,
            startTime: b.start_time,
            endTime: b.end_time,
            location: b.location,
            estimatedValue: parseFloat(b.estimated_value || 5000),
            status: b.status,
            notes: b.notes,
            createdAt: b.created_at
          }));
          setBookings(formatted);
        } else {
          setBookings([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });

    fetch('http://localhost:5000/api/payments/user/' + (u?.email || ''))
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.payments)) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      })
      .catch(() => setPayments([]));
  };

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    window.addEventListener('transactionsUpdated', handler);
    return () => window.removeEventListener('transactionsUpdated', handler);
  }, [user?.email]);

  const userBookings = bookings.filter(b => b.email === user?.email);

  function getPaymentForBooking(bookingId) {
    return payments.find(p => p.booking_id === bookingId);
  }

  // Small style objects for repeated pieces
  const headerInner = {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  };

  const titleStyle = { fontSize: '32px', fontWeight: 700, color: '#0f172a', margin: 0 };
  const subtitleStyle = { color: '#475569', marginTop: '6px' };
  const userMeta = { marginTop: '8px', fontSize: '14px', color: '#64748b' };

  const listStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
  const cardStyleBase = { ...cardBase, borderLeftWidth: '8px' };
  const cardInner = { padding: '20px' };

  const smallLabel = { fontSize: '12px', color: '#64748b', fontWeight: 600 };
  const serviceTitle = { fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '6px 0' };
  const dateMeta = { fontSize: '12px', color: '#94a3b8' };

  const gridRow = { display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '12px' };
  const gridRowMd = { gridTemplateColumns: 'repeat(3, 1fr)' };

  const iconBox = { width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const payButton = {
    padding: '10px 18px',
    background: '#2563eb',
    color: '#fff',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600
  };

  const paymentBox = { background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerInner}>
          <FaUserCircle style={{ width: 56, height: 56, color: '#60a5fa' }} />
          <div>
            <h1 style={titleStyle}>Booking History</h1>
            <p style={subtitleStyle}>Track your bookings and payment status</p>
            {user && (
              <div style={userMeta}>
                <span style={{ fontWeight: 600 }}>{user.name || user.customerName}</span> • {user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={pageInner}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={spinner}></div>
          </div>
        ) : userBookings.length === 0 ? (
          <div style={emptyCard}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '9999px', background: '#f1f5f9', marginBottom: 24 }}>
              <FaCalendarAlt style={{ width: 40, height: 40, color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No Bookings Yet</h3>
            <p style={{ color: '#475569' }}>You haven't made any bookings yet. Start by creating your first booking!</p>
          </div>
        ) : (
          <div style={listStyle}>
            {userBookings.map((booking, idx) => {
              const payment = getPaymentForBooking(booking.id);
              const status = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const cardStyle = { ...cardStyleBase, borderLeftColor: status.borderColor };

              return (
                <div key={booking.id} style={cardStyle}>
                  {/* Timeline indicator */}
                  {idx !== userBookings.length - 1 && (
                    <span style={{ position: 'absolute', left: 10, top: '100%', width: 2, height: 32, background: '#e2e8f0' }}></span>
                  )}

                  <div style={cardInner}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                          <span style={{ ...smallLabel }}>Booking #{booking.id}</span>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 9999, fontSize: 13, fontWeight: 600, boxShadow: '0 1px 2px rgba(2,6,23,0.04)', background: status.bg, color: status.color }}>
                            <StatusIcon style={{ width: 14, height: 14 }} />
                            {status.label}
                          </div>
                        </div>
                        <h3 style={serviceTitle}>{booking.service}</h3>
                        <div style={dateMeta}>Booked on {new Date(booking.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>₱{booking.estimatedValue?.toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ ...gridRow, ...(window.innerWidth > 768 ? gridRowMd : {}) }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
                        <div style={iconBox}><FaCalendarAlt style={{ width: 18, height: 18, color: '#475569' }} /></div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Date</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{booking.date}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
                        <div style={iconBox}><FaClock style={{ width: 18, height: 18, color: '#475569' }} /></div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Time</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{booking.startTime} - {booking.endTime}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
                        <div style={iconBox}><FaMapMarkerAlt style={{ width: 18, height: 18, color: '#475569' }} /></div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Location</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{booking.location}</div>
                        </div>
                      </div>
                    </div>

                    {booking.status === 'approved' && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                        <button onClick={() => window.location.href = `/pay/${booking.id}`} style={payButton}>
                          <FaCreditCard style={{ width: 16, height: 16, marginRight: 8 }} />
                          Pay Now
                        </button>
                      </div>
                    )}

                    {booking.status === 'paid' && payment && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                        <div style={paymentBox}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FaCheckCircle style={{ width: 18, height: 18, color: '#15803d' }} />
                            <span style={{ fontWeight: 700, color: '#065f46' }}>Payment Confirmed</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 14, flex: 1 }}>
                            <div>
                              <div style={{ color: '#166534', fontWeight: 700 }}>Method:</div>
                              <div style={{ color: '#065f46', marginTop: 4 }}>{payment.payment_method}</div>
                            </div>
                            <div>
                              <div style={{ color: '#166534', fontWeight: 700 }}>Amount:</div>
                              <div style={{ color: '#065f46', marginTop: 4 }}>₱{payment.amount_paid?.toLocaleString()}</div>
                            </div>
                            {payment.notes && (
                              <div>
                                <div style={{ color: '#166534', fontWeight: 700 }}>Reference:</div>
                                <div style={{ color: '#065f46', marginTop: 4 }}>{payment.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}