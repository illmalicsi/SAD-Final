import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaArrowLeft, FaMusic, FaUserFriends, FaUser, FaFileAlt } from 'react-icons/fa';
import NotificationService from '../services/notificationService';
import AuthService from '../services/authService';

const Approval = ({ onBackToHome }) => {
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [rentRequests, setRentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('borrow'); // 'borrow', 'rent'
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchInstrumentRequests = () => {
    try {
      const borrow = JSON.parse(localStorage.getItem('borrowRequests') || '[]');
      const rent = JSON.parse(localStorage.getItem('rentRequests') || '[]');
      setBorrowRequests(Array.isArray(borrow) ? borrow : []);
      setRentRequests(Array.isArray(rent) ? rent : []);
    } catch (err) {
      console.error('Error loading instrument requests:', err);
      setBorrowRequests([]);
      setRentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstrumentRequests();
    
    // Listen for new requests
    const handleBorrowUpdate = () => fetchInstrumentRequests();
    const handleRentUpdate = () => fetchInstrumentRequests();
    
    window.addEventListener('borrowRequestsUpdated', handleBorrowUpdate);
    window.addEventListener('rentRequestsUpdated', handleRentUpdate);
  // Also listen for notification updates to refresh UI if needed
  const notifHandler = () => fetchInstrumentRequests();
  window.addEventListener('notificationsUpdated', notifHandler);
    
    return () => {
      window.removeEventListener('borrowRequestsUpdated', handleBorrowUpdate);
      window.removeEventListener('rentRequestsUpdated', handleRentUpdate);
      window.removeEventListener('notificationsUpdated', notifHandler);
    };
  }, []);

  const handleInstrumentRequestAction = async (requestId, action, type) => {
    setProcessingId(requestId);
    try {
      const endpointBase = type === 'borrow' ? '/instruments/borrow-request' : '/instruments/rent-request';
      const resp = await AuthService.put(`${endpointBase}/${requestId}/${action}`);

      if (!resp || resp.success !== true) {
        const msg = (resp && resp.message) ? resp.message : 'Failed to update request';
        alert(msg);
        return;
      }

      // Update local UI/state (keep localStorage in sync for the embedded UI flows)
      const storageKey = type === 'borrow' ? 'borrowRequests' : 'rentRequests';
      const requests = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedRequests = requests.map(r => r.id === requestId ? { ...r, status: action } : r);
      localStorage.setItem(storageKey, JSON.stringify(updatedRequests));
      if (type === 'borrow') setBorrowRequests(updatedRequests); else setRentRequests(updatedRequests);

      // On approval, send notification and emit realtime event
      const reqObj = updatedRequests.find(r => r.id === requestId);
      if (action === 'approved' && reqObj) {
        try {
          if (type === 'rent') {
            NotificationService.createNotification(reqObj.userEmail, {
              type: 'success',
              title: 'Instrument Rental Approved ✅',
              message: `Your rental request for ${reqObj.instrumentName || reqObj.instrument || 'an instrument'} has been approved. Please complete full payment to secure the booking.`,
              data: { requestId }
            });
          } else {
            NotificationService.createNotification(reqObj.userEmail, {
              type: 'success',
              title: 'Borrow Request Approved ✅',
              message: `Your borrow request for ${reqObj.instrumentName || reqObj.instrument || 'an instrument'} has been approved. Please bring a valid ID during meetup.`,
              data: { requestId }
            });
          }
        } catch (e) {
          console.error('Failed to create notification on approval', e);
        }
        window.dispatchEvent(new CustomEvent('instrumentRequestApproved', { detail: { userEmail: reqObj.userEmail, userId: reqObj.userId, type } }));
      }

      window.dispatchEvent(new Event(`${type}RequestsUpdated`));
    } catch (err) {
      console.error('Failed to update request', err);
      const msg = (err && err.message) ? err.message : 'Failed to update request';
      alert(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkPaid = (requestId, type) => {
    setProcessingId(requestId);
    try {
      const storageKey = type === 'borrow' ? 'borrowRequests' : 'rentRequests';
      const requests = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = requests.map(r => r.id === requestId ? { ...r, status: 'paid' } : r);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (type === 'borrow') setBorrowRequests(updated); else setRentRequests(updated);
      // Notify user about payment confirmation
      const paidReq = updated.find(r => r.id === requestId);
      if (paidReq) {
        NotificationService.createNotification(paidReq.userEmail, {
          type: 'success',
          title: 'Payment Received ✅',
          message: `We have recorded full payment for your ${type === 'rent' ? 'rental' : 'borrow'} request (${paidReq.instrument || paidReq.instrumentName}). Thank you!`,
          data: { requestId: paidReq.id }
        });
      }
      window.dispatchEvent(new Event(`${type}RequestsUpdated`));
    } catch (err) {
      console.error('Failed to mark paid', err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      base: {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      },
      pending: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fbbf24'
      },
      approved: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        border: '1px solid #34d399'
      },
      paid: {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #60a5fa'
      }
    };

    return (
      <span style={{...styles.base, ...styles[status] || styles.pending}}>
        {status}
      </span>
    );
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    titleIcon: {
      color: '#f59e0b',
      fontSize: '24px'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    cardHeader: {
      padding: '24px 32px',
      borderBottom: '1px solid #f1f5f9',
      backgroundColor: '#fafbfc'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#374151',
      margin: 0
    },
    cardBody: {
      padding: '0'
    },
    alert: {
      padding: '16px 32px',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: 'none',
      borderBottom: '1px solid #fecaca',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    th: {
      padding: '16px 24px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      verticalAlign: 'middle'
    },
    td: {
      padding: '20px 24px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
      color: '#374151',
      verticalAlign: 'middle'
    },
    invoiceRow: {
      transition: 'background-color 0.2s ease'
    },
    invoiceCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    requestCard: {
      background: '#fff',
      border: '1px solid #e6eef8',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 6px 18px rgba(2,6,23,0.03)'
    },
    requestHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    },
    requestBody: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    },
    requestMeta: {
      flex: 1,
      minWidth: 200
    },
    requestActions: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    },
    primaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 600
    },
    dangerBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 600
    },
    disabledBtn: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    invoiceId: {
      fontWeight: '600',
      color: '#1f2937'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#6b7280'
    },
    amount: {
      fontWeight: '600',
      fontSize: '16px',
      color: '#059669'
    },
    description: {
      color: '#6b7280',
      fontStyle: 'italic',
      maxWidth: '200px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    dateInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#6b7280'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      backgroundColor: '#10b981',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    actionButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    emptyState: {
      padding: '64px 32px',
      textAlign: 'center',
      color: '#6b7280'
    },
    emptyIcon: {
      fontSize: '48px',
      color: '#d1d5db',
      marginBottom: '16px'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    emptyDescription: {
      fontSize: '14px',
      color: '#6b7280'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #ffffff',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{...styles.card, padding: '64px', textAlign: 'center'}}>
          <div style={{...styles.spinner, margin: '0 auto 16px'}}></div>
          <div>Loading instrument requests...</div>
        </div>
      </div>
    );
  }

  // Show all requests, sorted by status (pending first, then approved, then rejected)
  const sortedBorrowRequests = [...borrowRequests].sort((a, b) => {
    const statusOrder = { pending: 0, approved: 1, rejected: 2, returned: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  const sortedRentRequests = [...rentRequests].sort((a, b) => {
    const statusOrder = { pending: 0, approved: 1, rejected: 2, paid: 3, returned: 4 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const pendingBorrowCount = borrowRequests.filter(req => req.status === 'pending').length;
  const pendingRentCount = rentRequests.filter(req => req.status === 'pending').length;

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#ffffff' : '#64748b',
    border: 'none',
    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .back-button:hover {
            background-color: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
          }
          
          .invoice-row:hover {
            background-color: #f8fafc;
          }
          
          .approve-button:hover:not(:disabled) {
            background-color: #059669;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .reject-button:hover:not(:disabled) {
            background-color: #dc2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }

          .tab-button:hover {
            background-color: #f1f5f9;
          }
        `}
      </style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaMusic style={styles.titleIcon} />
          Instrument Request Approvals
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('borrow')} 
          style={tabStyle(activeTab === 'borrow')}
          className="tab-button"
        >
          <FaUserFriends size={14} />
          Borrow Requests ({borrowRequests.length})
          {pendingBorrowCount > 0 && <span style={{ marginLeft: '4px', padding: '2px 6px', backgroundColor: '#fbbf24', color: '#78350f', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>{pendingBorrowCount} pending</span>}
        </button>
        <button 
          onClick={() => setActiveTab('rent')} 
          style={tabStyle(activeTab === 'rent')}
          className="tab-button"
        >
          <FaMusic size={14} />
          Rent Requests ({rentRequests.length})
          {pendingRentCount > 0 && <span style={{ marginLeft: '4px', padding: '2px 6px', backgroundColor: '#fbbf24', color: '#78350f', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>{pendingRentCount} pending</span>}
        </button>
      </div>

      {/* Borrow Requests Tab */}
      {activeTab === 'borrow' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              Borrow Requests ({borrowRequests.length})
              {pendingBorrowCount > 0 && <span style={{ marginLeft: '8px', fontSize: '14px', color: '#f59e0b' }}>• {pendingBorrowCount} pending</span>}
            </h2>
          </div>

          <div style={styles.cardBody}>
            {borrowRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <FaUserFriends style={styles.emptyIcon} />
                <div style={styles.emptyTitle}>No Borrow Requests</div>
                <div style={styles.emptyDescription}>No borrow requests have been submitted yet.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {sortedBorrowRequests.map(req => (
                  <div key={req.id} style={styles.requestCard} className="invoice-row">
                    <div style={styles.requestHeader}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={styles.invoiceId}>#{req.id}</div>
                      </div>
                      <div>{getStatusBadge(req.status)}</div>
                    </div>

                    <div style={styles.requestBody}>
                      <div style={styles.requestMeta}>
                        <div style={{ fontWeight: 700 }}>{req.instrumentName || req.instrument}</div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>{req.quantity || 1} unit(s)</div>
                        {/* Borrow requests: only show name and quantity (price not shown for borrow) */}
                      </div>

                      <div style={styles.requestActions}>
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleInstrumentRequestAction(req.id, 'approved', 'borrow')}
                              disabled={processingId === req.id}
                              style={{ ...styles.primaryBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                            >
                              {processingId === req.id ? <div style={styles.spinner}></div> : <FaCheck />} Approve
                            </button>
                            <button
                              onClick={() => handleInstrumentRequestAction(req.id, 'rejected', 'borrow')}
                              disabled={processingId === req.id}
                              style={{ ...styles.dangerBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                            ><FaTimes /> Reject
                            </button>
                          </>
                        ) : req.status === 'approved' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                            <div style={{ color: '#065f46', fontWeight: 700 }}>✓ Approved</div>
                            {req.borrowerIdFileName ? (
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <FaFileAlt />
                                <div style={{ fontSize: 13 }}>{req.borrowerIdFileName}</div>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div style={{ color: '#6b7280', fontStyle: 'italic' }}>{req.status}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rent Requests Tab */}
      {activeTab === 'rent' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              Rent Requests ({rentRequests.length})
              {pendingRentCount > 0 && <span style={{ marginLeft: '8px', fontSize: '14px', color: '#f59e0b' }}>• {pendingRentCount} pending</span>}
            </h2>
          </div>

          <div style={styles.cardBody}>
            {rentRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <FaMusic style={styles.emptyIcon} />
                <div style={styles.emptyTitle}>No Rent Requests</div>
                <div style={styles.emptyDescription}>No rent requests have been submitted yet.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {sortedRentRequests.map(req => (
                  <div key={req.id} style={styles.requestCard} className="invoice-row">
                    <div style={styles.requestHeader}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={styles.invoiceId}>#{req.id}</div>
                      </div>
                      <div>{getStatusBadge(req.status)}</div>
                    </div>

                    <div style={styles.requestBody}>
                      <div style={styles.requestMeta}>
                        <div style={{ fontWeight: 700 }}>{req.instrumentName || req.instrument}</div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>{req.quantity || 1} unit(s)</div>
                        { (req.rental_fee || req.rentalFee) && (
                          <div style={{ color: '#059669', fontSize: 13, marginTop: 6 }}>
                            ₱{Number(req.rental_fee || req.rentalFee).toFixed(2)} / day
                          </div>
                        )}
                      </div>

                      <div style={styles.requestActions}>
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleInstrumentRequestAction(req.id, 'approved', 'rent')}
                              disabled={processingId === req.id}
                              style={{ ...styles.primaryBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                            >
                              {processingId === req.id ? <div style={styles.spinner}></div> : <FaCheck />} Approve
                            </button>
                            <button
                              onClick={() => handleInstrumentRequestAction(req.id, 'rejected', 'rent')}
                              disabled={processingId === req.id}
                              style={{ ...styles.dangerBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                            ><FaTimes /> Reject
                            </button>
                          </>
                        ) : req.status === 'approved' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                            <div style={{ color: '#065f46', fontWeight: 700 }}>✓ Approved</div>
                            <button onClick={() => handleMarkPaid(req.id, 'rent')} disabled={processingId === req.id} style={{ ...styles.primaryBtn, ...(processingId === req.id ? styles.disabledBtn : {}), backgroundColor: '#0369a1' }}>
                              Mark Paid
                            </button>
                          </div>
                        ) : req.status === 'paid' ? (
                          <div style={{ color: '#0b6623', fontWeight: 700 }}>Paid</div>
                        ) : (
                          <div style={{ color: '#64748b', fontStyle: 'italic' }}>{req.status === 'rejected' ? 'Request rejected' : 'Request returned'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Approval;
