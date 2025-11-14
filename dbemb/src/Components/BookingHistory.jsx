import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCreditCard,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaUserCircle, FaBan, FaMusic
} from '../icons/fa';

const statusConfig = {
  pending: { color: '#92400e', bg: '#fef3c7', icon: FaExclamationCircle, label: 'Pending', borderColor: '#f59e0b' },
  approved: { color: '#065f46', bg: '#d1fae5', icon: FaCheckCircle, label: 'Approved', borderColor: '#10b981' },
  paid: { color: '#1e3a8a', bg: '#dbeafe', icon: FaCreditCard, label: 'Paid', borderColor: '#3b82f6' },
  rejected: { color: '#7f1d1d', bg: '#fee2e2', icon: FaTimesCircle, label: 'Rejected', borderColor: '#ef4444' },
  cancelled: { color: '#57534e', bg: '#f5f5f4', icon: FaBan, label: 'Cancelled', borderColor: '#78716c' }
};

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);
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

  fetch('http://localhost:5000/api/bookings', { credentials: 'include' })
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

  fetch('http://localhost:5000/api/payments/user/' + (u?.email || ''), { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.payments)) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      })
      .catch(() => setPayments([]));

  // Fetch rental/borrow history for the user
  (async () => {
    try {
      // Try to fetch instruments master data so we can derive per-day prices when requests lack them
      const instrumentPriceMapById = new Map();
      const instrumentPriceMapByName = new Map();
      try {
        const instrRes = await fetch('http://localhost:5000/api/instruments', { credentials: 'include' });
        if (instrRes && instrRes.ok) {
          const instrBody = await instrRes.json();
          const instrList = Array.isArray(instrBody) ? instrBody : (instrBody && Array.isArray(instrBody.instruments) ? instrBody.instruments : []);
          instrList.forEach(i => {
            if (i.instrument_id) instrumentPriceMapById.set(Number(i.instrument_id), Number(i.price_per_day) || null);
            const nameKey = (i.name || i.instrument_name || i.name || '') + '';
            if (nameKey) instrumentPriceMapByName.set(String(nameKey).toLowerCase().trim(), Number(i.price_per_day) || null);
          });
        }
      } catch (e) {
        console.warn('Failed to fetch instruments for price map (optional):', e && e.message);
      }

      const res = await fetch('http://localhost:5000/api/instruments/my-requests', { credentials: 'include' });
      let body = null;
      try {
        body = await res.json();
      } catch (parseErr) {
        console.warn('Failed to parse /api/instruments/my-requests response as JSON', parseErr);
      }

      console.debug('/api/instruments/my-requests response status:', res.status, 'body:', body);

      if (res.status === 401) {
        setError('Authentication required. Please sign in to view your rental & borrow history.');
      }

      if (body && body.success && Array.isArray(body.allRequests)) {
        const rows = body.allRequests.map(r => {
          const id = r.request_id || r.id;
          const instrumentName = r.instrument_name || r.instrumentName || r.instrument || r.instrumentLabel;
          const quantity = Number(r.quantity) || 1;
          const startDate = r.start_date || r.startDate || r.startDateTime || r.start;
          const endDate = r.end_date || r.endDate || r.endDateTime || r.end;
          const status = r.status || 'pending';
          const type = r.type || 'rent';
          const rawRentalFee = r.rental_fee || r.rentalFee || r.price_per_day || r.instrumentPricePerDay || null;
          const rawTotal = r.total_amount || r.totalAmount || r.amount || null;

          // compute inclusive days between start and end; default to 1
          let days = 1;
          try {
            if (startDate && endDate) {
              const s = new Date(startDate);
              const e = new Date(endDate);
              if (!isNaN(s) && !isNaN(e)) {
                const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24));
                days = diff >= 0 ? (diff + 1) : 1;
              }
            }
          } catch (dErr) { days = 1; }

          let rentalFee = rawRentalFee != null && rawRentalFee !== '' ? Number(rawRentalFee) : null;
          let totalAmount = rawTotal != null && rawTotal !== '' ? Number(rawTotal) : null;

          // store instrument id if provided so we can lookup price by id later
          const instrumentId = r.instrument_id || r.instrumentId || null;

          return { id, instrumentId, instrumentName, quantity, startDate, endDate, status, type, rentalFee, totalAmount, notes: r.notes || r.purpose || '' };
        });

        // Post-process rows: derive rentalFee from instrument master data or from total, and compute totalAmount when missing
        for (let i = 0; i < rows.length; i++) {
          const rr = rows[i];
          // recompute days
          let days = 1;
          try {
            if (rr.startDate && rr.endDate) {
              const s = new Date(rr.startDate);
              const e = new Date(rr.endDate);
              if (!isNaN(s) && !isNaN(e)) {
                const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24));
                days = diff >= 0 ? (diff + 1) : 1;
              }
            }
          } catch (dErr) { days = 1; }

          // derive rentalFee from master price by id or by name
          if ((rr.rentalFee == null || rr.rentalFee === 0) && rr.instrumentId && instrumentPriceMapById.has(Number(rr.instrumentId))) {
            const p = instrumentPriceMapById.get(Number(rr.instrumentId));
            if (p != null) rr.rentalFee = Number(p);
          }
          if ((rr.rentalFee == null || rr.rentalFee === 0) && rr.instrumentName) {
            const key = String(rr.instrumentName).toLowerCase().trim();
            if (instrumentPriceMapByName.has(key)) {
              const p = instrumentPriceMapByName.get(key);
              if (p != null) rr.rentalFee = Number(p);
            }
          }

          // derive rentalFee from totalAmount if available
          if ((rr.rentalFee == null || rr.rentalFee === 0) && rr.totalAmount != null && days > 0 && rr.quantity > 0) {
            const derived = rr.totalAmount / (days * rr.quantity);
            rr.rentalFee = Number.isFinite(derived) ? Number(derived.toFixed(2)) : null;
          }

          // compute totalAmount if missing but rentalFee exists
          if ((rr.totalAmount == null || rr.totalAmount === 0) && rr.rentalFee != null && days > 0 && rr.quantity > 0) {
            const computed = rr.rentalFee * days * rr.quantity;
            rr.totalAmount = Number.isFinite(computed) ? Number(computed.toFixed(2)) : null;
          }
        }

        setRentals(rows);
      } else {
        // fallback to localStorage
        const rentRequests = JSON.parse(localStorage.getItem('rentRequests') || '[]');
        const borrowRequests = JSON.parse(localStorage.getItem('borrowRequests') || '[]');
        const merged = [
          ...rentRequests.filter(rr => (rr.userEmail || rr.user?.email || rr.email) === (u?.email || '')).map(rr => {
            const id = rr.id || rr.requestId || Date.now();
            const instrumentName = rr.instrumentName || rr.instrument || rr.instrument_name;
            const quantity = Number(rr.quantity) || 1;
            const startDate = rr.startDate || rr.start_date;
            const endDate = rr.endDate || rr.end_date;
            const status = rr.status || 'pending';
            const type = 'rent';
            const rawRentalFee = rr.instrumentPricePerDay || rr.rentalFee || rr.rental_fee || null;
            const rawTotal = rr.total_amount || rr.amount || null;

            let days = 1;
            try {
              if (startDate && endDate) {
                const s = new Date(startDate);
                const e = new Date(endDate);
                if (!isNaN(s) && !isNaN(e)) {
                  const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24));
                  days = diff >= 0 ? (diff + 1) : 1;
                }
              }
            } catch (dErr) { days = 1; }

            let rentalFee = rawRentalFee != null && rawRentalFee !== '' ? Number(rawRentalFee) : null;
            const totalAmount = rawTotal != null && rawTotal !== '' ? Number(rawTotal) : null;
            if ((rentalFee == null || rentalFee === 0) && totalAmount != null && days > 0 && quantity > 0) {
              const derived = totalAmount / (days * quantity);
              rentalFee = Number.isFinite(derived) ? Number(derived.toFixed(2)) : null;
            }

            return { id, instrumentName, quantity, startDate, endDate, status, type, rentalFee, totalAmount, notes: rr.notes || rr.purpose || '' };
          }),
          ...borrowRequests.filter(br => (br.userEmail || br.user?.email || br.email) === (u?.email || '')).map(br => ({
            id: br.id || br.requestId || Date.now(),
            instrumentName: br.instrumentName || br.instrument || br.instrument_name,
            quantity: br.quantity || 1,
            startDate: br.startDate || br.start_date,
            endDate: br.endDate || br.end_date,
            status: br.status || 'pending',
            type: 'borrow',
            rentalFee: null,
            totalAmount: null,
            notes: br.notes || br.purpose || ''
          }))
        ];
        setRentals(merged);
      }
    } catch (err) {
      console.warn('Error fetching /api/instruments/my-requests, falling back to localStorage', err);
      // localStorage fallback
      const rentRequests = JSON.parse(localStorage.getItem('rentRequests') || '[]');
      const borrowRequests = JSON.parse(localStorage.getItem('borrowRequests') || '[]');
      const merged = [
        ...rentRequests.filter(rr => (rr.userEmail || rr.user?.email || rr.email) === (u?.email || '')).map(rr => ({
          id: rr.id || rr.requestId || Date.now(),
          instrumentName: rr.instrumentName || rr.instrument || rr.instrument_name,
          quantity: rr.quantity || 1,
          startDate: rr.startDate || rr.start_date,
          endDate: rr.endDate || rr.end_date,
          status: rr.status || 'pending',
          type: 'rent',
          rentalFee: rr.instrumentPricePerDay || rr.rentalFee || rr.rental_fee || null,
          totalAmount: rr.total_amount || rr.amount || null,
          notes: rr.notes || rr.purpose || ''
        })),
        ...borrowRequests.filter(br => (br.userEmail || br.user?.email || br.email) === (u?.email || '')).map(br => ({
          id: br.id || br.requestId || Date.now(),
          instrumentName: br.instrumentName || br.instrument || br.instrument_name,
          quantity: br.quantity || 1,
          startDate: br.startDate || br.start_date,
          endDate: br.endDate || br.end_date,
          status: br.status || 'pending',
          type: 'borrow',
          rentalFee: null,
          totalAmount: null,
          notes: br.notes || br.purpose || ''
        }))
      ];
      setRentals(merged);
    }
  })();
  };

  const handleCancelBooking = async (bookingId, email) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Booking cancelled successfully');
        fetchData(); // Refresh bookings list
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('An error occurred while cancelling the booking');
    }
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

  const listStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
  const cardStyleBase = { 
    ...cardBase, 
    borderLeftWidth: '6px',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default'
  };
  const cardInner = { padding: '24px' };

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
        {error && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#fff3f2', border: '1px solid #fca5a5', color: '#7f1d1d' }}>
            {error}
          </div>
        )}
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
          <div>
            <div style={{ marginBottom: '20px', padding: '16px 0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Your Bookings ({userBookings.length})
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                All your booking requests are displayed as individual cards below
              </p>
            </div>
            <div style={listStyle}>
            {userBookings.map((booking, idx) => {
              const payment = getPaymentForBooking(booking.id);
              const status = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const cardStyle = { 
                ...cardStyleBase, 
                borderLeftColor: status.borderColor,
                boxShadow: '0 2px 8px rgba(2,6,23,0.08)'
              };

              return (
                <div 
                  key={booking.id} 
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(2,6,23,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(2,6,23,0.08)';
                  }}
                >
                  <div style={cardInner}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <span style={{ ...smallLabel, background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            Booking #{booking.id}
                          </span>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 9999, fontSize: 13, fontWeight: 600, boxShadow: '0 1px 3px rgba(2,6,23,0.08)', background: status.bg, color: status.color }}>
                            <StatusIcon style={{ width: 14, height: 14 }} />
                            {status.label}
                          </div>
                        </div>
                        <h3 style={{ ...serviceTitle, fontSize: '20px', marginBottom: '4px' }}>{booking.service}</h3>
                        <div style={{ ...dateMeta, fontSize: '13px' }}>Booked on {new Date(booking.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Estimated Value</div>
                        <div style={{ fontSize: 30, fontWeight: 700, color: '#2563eb' }}>₱{booking.estimatedValue?.toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ ...gridRow, ...(window.innerWidth > 768 ? gridRowMd : {}), marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
                        <div style={{ ...iconBox, background: '#eff6ff' }}>
                          <FaCalendarAlt style={{ width: 18, height: 18, color: '#2563eb' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Date</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{booking.date}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
                        <div style={{ ...iconBox, background: '#fef3c7' }}>
                          <FaClock style={{ width: 18, height: 18, color: '#d97706' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Time</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{booking.startTime} - {booking.endTime}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569' }}>
                        <div style={{ ...iconBox, background: '#dcfce7' }}>
                          <FaMapMarkerAlt style={{ width: 18, height: 18, color: '#16a34a' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Location</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{booking.location}</div>
                        </div>
                      </div>
                    </div>

                    {(booking.status === 'pending' || booking.status === 'approved') && (
                      <div style={{ paddingTop: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12 }}>
                        {booking.status === 'approved' && (
                          <button onClick={() => window.location.href = `/pay/${booking.id}`} style={payButton}>
                            <FaCreditCard style={{ width: 16, height: 16, marginRight: 8 }} />
                            Pay Now
                          </button>
                        )}
                        <button 
                          onClick={() => handleCancelBooking(booking.id, booking.email)} 
                          style={{
                            ...payButton,
                            background: '#dc2626',
                            color: 'white'
                          }}
                        >
                          <FaBan style={{ width: 16, height: 16, marginRight: 8 }} />
                          Cancel Booking
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
          </div>
        )}
        {/* Rental / Borrow History Section */}
        {rentals && rentals.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ marginBottom: '20px', padding: '16px 0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Your Rental & Borrow History ({rentals.length})
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                All instrument rental and borrow requests are shown here
              </p>
            </div>

            <div style={listStyle}>
              {rentals.map((r) => (
                <div key={r.id} style={{ ...cardStyleBase, borderLeftColor: r.type === 'rent' ? '#3730a3' : '#10b981' }}>
                  <div style={cardInner}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ ...smallLabel, background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            {r.type === 'rent' ? 'Rental' : 'Borrow'} #{r.id}
                          </span>
                        </div>
                        <h3 style={{ ...serviceTitle, fontSize: 18, marginTop: 8 }}>{r.instrumentName}</h3>
                        <div style={{ fontSize: 13, color: '#475569' }}>{r.quantity} unit(s)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Status</div>
                        <div style={{ fontWeight: 700, marginTop: 6 }}>{(r.status || 'pending').toUpperCase()}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Start Date</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{r.startDate ? new Date(r.startDate).toLocaleString() : '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>End Date</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{r.endDate ? new Date(r.endDate).toLocaleString() : '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Fee / day</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#b45309' }}>{r.rentalFee ? `₱${Number(r.rentalFee).toLocaleString()}` : 'N/A'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                      <div style={{ color: '#64748b' }}>{r.notes}</div>
                      <div style={{ fontWeight: 700, color: '#3730a3' }}>{r.totalAmount ? `₱${Number(r.totalAmount).toLocaleString()}` : '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}