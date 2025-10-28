import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaArrowLeft, FaMusic, FaUserFriends, FaUser, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import NotificationService from '../services/notificationService';
import AuthService from '../services/authService';

const Approval = ({ onBackToHome }) => {
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [rentRequests, setRentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('borrow'); 
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [viewDetailsRequest, setViewDetailsRequest] = useState(null);

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

  // Attempt to sync/normalize local rent request ids to server-generated request_id
  useEffect(() => {
    let cancelled = false;
    const syncLocalRentRequests = async () => {
      try {
        if (!AuthService.isAuthenticated()) return;
        const storageKey = 'rentRequests';
        const local = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!Array.isArray(local) || !local.length) return;

        let changed = false;
        for (const l of local) {
          if (cancelled) break;
          // heuristic: local-only flagged or id appears to be a large timestamp (>= year 2000 ms)
          const isLocalOnly = l.localOnly === true || (typeof l.id === 'number' && l.id > 1000000000000);
          if (!isLocalOnly) continue;

          try {
            const payload = {
              instrumentId: null,
              instrumentName: l.instrument || l.instrumentName || '',
              instrumentType: l.instrumentType || '',
              quantity: Number(l.quantity) || 1,
              startDate: l.startDate,
              endDate: l.endDate,
              purpose: l.purpose || l.notes || null,
              notes: l.notes || null,
              rentalFee: l.instrumentPricePerDay || l.rentalFee || null
            };
            const resp = await AuthService.post('/instruments/rent-request', payload);
            if (resp && resp.success === true && resp.requestId) {
              // replace local id with server id and clear localOnly
              const updated = JSON.parse(localStorage.getItem(storageKey) || '[]').map(r => r.id === l.id ? { ...r, id: resp.requestId, localOnly: false } : r);
              localStorage.setItem(storageKey, JSON.stringify(updated));
              setRentRequests(updated);
              changed = true;
              continue;
            }
          } catch (err) {
            // fallback to trying to match against server list
            try {
              const serverList = await AuthService.get('/instruments/rent-requests');
              if (serverList && serverList.success && Array.isArray(serverList.requests)) {
                const match = serverList.requests.find(s => {
                  const sName = s.instrument_name || s.instrumentName || s.instrument || '';
                  const lName = l.instrument || l.instrumentName || '';
                  const sEmail = s.userEmail || s.email || s.user_email || '';
                  const lEmail = l.userEmail || l.email || l.userEmail || '';
                  const nameMatch = lName && sName && String(sName).trim() === String(lName).trim();
                  const emailMatch = lEmail && sEmail && String(sEmail).trim() === String(lEmail).trim();
                  return (nameMatch && emailMatch) || nameMatch || emailMatch;
                });
                if (match) {
                  const realId = match.request_id || match.requestId || match.id;
                  if (realId) {
                    const updated = JSON.parse(localStorage.getItem(storageKey) || '[]').map(r => r.id === l.id ? { ...r, id: realId, request_id: realId, localOnly: false } : r);
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                    setRentRequests(updated);
                    changed = true;
                    continue;
                  }
                }
              }
            } catch (e) {
              console.error('Fallback rent request match failed', e);
            }
          }
        }
        if (changed) window.dispatchEvent(new Event('rentRequestsUpdated'));
      } catch (e) {
        console.error('Failed to sync local rent requests:', e);
      }
    };
    syncLocalRentRequests();
    return () => { cancelled = true; };
  }, []);

  const handleInstrumentRequestAction = async (requestId, action, type) => {
    setProcessingId(requestId);
    try {
      const endpointBase = type === 'borrow' ? '/instruments/borrow-request' : '/instruments/rent-request';
      // backend routes use verbs 'approve' / 'reject' (no trailing 'd')
      const actionPath = action === 'approved' ? 'approve' : (action === 'rejected' ? 'reject' : action);

      // If this is a rent request and the id looks like a local timestamp fallback (Date.now()),
      // attempt to create the server rent-request first and replace local id with server requestId.
      let effectiveId = requestId;
      try {
        const storageKey = 'rentRequests';
        const local = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const localReq = local.find(r => String(r.id) === String(effectiveId));
        // prefer existing server-side request_id if present
        if (localReq && (localReq.request_id || localReq.requestId)) {
          effectiveId = localReq.request_id || localReq.requestId;
        }
        const looksLikeTimestamp = (typeof effectiveId === 'number' && effectiveId > 1000000000000) || (typeof effectiveId === 'string' && effectiveId.length > 12);
        if (type === 'rent' && looksLikeTimestamp) {
          if (localReq) {
            // Build payload for server from local request fields
            const payload = {
              instrumentId: localReq.instrumentId || null,
              instrumentName: localReq.instrumentName || localReq.instrument || '',
              instrumentType: localReq.instrumentType || localReq.instrument_type || '',
              quantity: Number(localReq.quantity) || 1,
              startDate: localReq.startDate || localReq.start_date || null,
              endDate: localReq.endDate || localReq.end_date || null,
              purpose: localReq.purpose || localReq.notes || null,
              notes: localReq.notes || null,
              rentalFee: localReq.rentalFee || localReq.rental_fee || localReq.instrumentPricePerDay || null
            };
            try {
              const createResp = await AuthService.post('/instruments/rent-request', payload);
              if (createResp && createResp.success === true && createResp.requestId) {
                  const realId = createResp.requestId;
                  // update localStorage mapping
                  const updatedLocal = local.map(r => String(r.id) === String(effectiveId) ? { ...r, id: realId, request_id: realId, localOnly: false } : r);
                  localStorage.setItem(storageKey, JSON.stringify(updatedLocal));
                  setRentRequests(Array.isArray(updatedLocal) ? updatedLocal : []);
                  effectiveId = realId;
                }
            } catch (e) {
              // create failed (possibly unauthenticated) — we'll continue and let later logic handle it
              console.warn('Failed to create server rent-request for local item before action:', e);
            }
          }
        }
      } catch (e) {
        console.warn('Error while resolving local rent request to server id:', e);
      }

      const resp = await AuthService.put(`${endpointBase}/${effectiveId}/${actionPath}`);

      // If server didn't accept the id (e.g. rent request id from localStorage is a timestamp placeholder),
      // try to resolve the real rent request id by fetching the server's rent requests and matching by other fields.
      if (!resp || resp.success !== true) {
        const msg = (resp && resp.message) ? resp.message : 'Failed to update request';

        // Only attempt resolution for rent requests when server says not found
        if (type === 'rent' && msg && /not found/i.test(msg)) {
          try {
            const serverList = await AuthService.get('/instruments/rent-requests');
            if (serverList && serverList.success && Array.isArray(serverList.requests)) {
              const storageKey = 'rentRequests';
              const local = JSON.parse(localStorage.getItem(storageKey) || '[]');
              const localReq = local.find(r => String(r.id) === String(requestId)) || {};

              // match heuristics: prefer matching userEmail + instrument name; fallback to instrument name alone
              const match = serverList.requests.find(s => {
                const sName = s.instrument_name || s.instrumentName || s.instrument || '';
                const lName = localReq.instrumentName || localReq.instrument || '';
                const sEmail = s.userEmail || s.email || s.user_email || '';
                const lEmail = localReq.userEmail || localReq.email || localReq.userEmail || '';
                const nameMatch = lName && sName && String(sName).trim() === String(lName).trim();
                const emailMatch = lEmail && sEmail && String(sEmail).trim() === String(lEmail).trim();
                return (nameMatch && emailMatch) || nameMatch || emailMatch;
              });

              if (match) {
                const realId = match.request_id || match.requestId || match.id;
                if (realId) {
                  // Retry the approve/reject call using the real id from the server
                  const retry = await AuthService.put(`${endpointBase}/${realId}/${actionPath}`);
                  if (retry && retry.success === true) {
                    // Update localStorage mapping so future actions use the server id
                    const updatedLocal = local.map(r => r.id === requestId ? { ...r, id: realId } : r);
                    localStorage.setItem(storageKey, JSON.stringify(updatedLocal));
                    setRentRequests(Array.isArray(updatedLocal) ? updatedLocal : []);

                    // Also update UI/state to reflect the action
                    const requests = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    const updatedRequests = requests.map(r => r.id === realId ? { ...r, status: action } : r);
                    localStorage.setItem(storageKey, JSON.stringify(updatedRequests));
                    setRentRequests(updatedRequests);

                    // Send notifications & events similar to original flow
                    const reqObj = updatedRequests.find(r => String(r.id) === String(realId));
                    if (action === 'approved' && reqObj) {
                      try {
                        NotificationService.createNotification(reqObj.userEmail, {
                          type: 'success',
                          title: 'Instrument Rental Approved ✅',
                          message: `Your rental request for ${reqObj.instrumentName || reqObj.instrument || 'an instrument'} has been approved. Please complete full payment to secure the booking.`,
                          data: { requestId: realId }
                        });
                      } catch (e) {
                        console.error('Failed to create notification on approval', e);
                      }
                      window.dispatchEvent(new CustomEvent('instrumentRequestApproved', { detail: { userEmail: reqObj.userEmail, userId: reqObj.userId, type } }));
                    }

                    window.dispatchEvent(new Event(`${type}RequestsUpdated`));
                    return true;
                  }
                }
              }
            }
          } catch (e) {
            console.error('Failed to resolve rent request id from server:', e);
          }
        }

        // If resolution not attempted or failed, show the server message
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
      return true;
    } catch (err) {
      console.error('Failed to update request', err);
      const msg = (err && err.message) ? err.message : 'Failed to update request';
      alert(msg);
      return false;
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
        padding: '4px 10px',
        borderRadius: 14,
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        display: 'inline-block'
      },
      pending: {
        backgroundColor: '#fff7ed',
        color: '#7a4100',
        border: '1px solid #f59e0b'
      },
      approved: {
        backgroundColor: '#ecfdf5',
        color: '#065f46',
        border: '1px solid #34d399'
      },
      paid: {
        backgroundColor: '#eff6ff',
        color: '#1e3a8a',
        border: '1px solid #60a5fa'
      },
      rejected: {
        backgroundColor: '#fff1f2',
        color: '#7f1d1d',
        border: '1px solid #f87171'
      }
    };

    return (
      <span style={{...styles.base, ...(styles[status] || styles.pending)}}>
        {String(status || '').toUpperCase()}
      </span>
    );
  };

  const styles = {
    // global container + font to match Inventory
    container: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px'
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
    closeButton: {
      background: 'transparent',
      border: 'none',
      fontSize: '20px',
      lineHeight: '1',
      cursor: 'pointer',
      color: '#374151'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '0',
      boxShadow: '0 6px 18px rgba(2,6,23,0.06)',
      border: '1px solid rgba(15,23,42,0.04)',
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
    // stats (match inventory sizing / alignment)
    statsContainer: {
      display: 'flex',
      flexWrap: 'nowrap',       // keep cards on one line
      gap: '12px',
      margin: '0 0 18px 0',
      alignItems: 'stretch',
      padding: '0 4px',
      boxSizing: 'border-box',
      justifyContent: 'flex-start',
      overflowX: 'auto'
    },
    statCard: {
      flex: '0 0 220px',
      minWidth: 200,
      maxWidth: 260,
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '14px 16px',
      textAlign: 'center',
      transition: 'all 0.18s ease',
      minHeight: 110,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
    },
    statIcon: { marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statNumber: { fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: 6, textAlign: 'center' },
    statLabel: { fontSize: '13px', color: '#64748b', marginTop: 4, textAlign: 'center' },

    tableHeader: {
      borderBottom: '1px solid #e2e8f0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 800,
      color: '#0f172a',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    th: {
      padding: '12px 16px',
      textAlign: 'center',
      fontSize: '13px',
      fontWeight: 600,
      color: '#3b82f6',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      verticalAlign: 'middle'
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
      color: '#374151',
      verticalAlign: 'middle',
      textAlign: 'center'
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
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: '#fff',
      border: '1px solid rgba(15,23,42,0.04)',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 6px 18px rgba(2,6,23,0.03)'
    },
    requestHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    },
    requestBody: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      width: '100%'
    },
    requestMeta: {
      flex: 1,
      minWidth: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    },
    requestActions: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    },
    viewBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px',
      fontSize: 13,
      backgroundColor: '#ffffff',
      color: '#2563eb',
      border: '1.5px solid #2563eb',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.12s ease'
    },
    secondaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '6px 10px',
      minWidth: 100,
      fontSize: 13,
      backgroundColor: '#ffffff',
      color: '#b45309',
      border: '1.5px solid #f59e0b',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 600
    },
    modalProfile: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 12,
      background: '#eef2ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      color: '#3730a3',
      fontWeight: 700
    },
    modalInfoCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    },
    /* Modal specific styles */
    modalCard: {
      width: 'min(780px, 96%)',
      background: '#ffffff',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 16px 48px rgba(2,6,23,0.18)'
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #eef2f7',
      paddingBottom: 12,
      marginBottom: 12
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 800,
      color: '#0f172a'
    },
    modalSub: {
      fontSize: 13,
      color: '#6b7280'
    },
    closeIcon: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      fontSize: 16
    },
    modalBodyGrid: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: 20
    },
    profileCard: {
      background: '#fafafa',
      borderRadius: 10,
      padding: 14,
      border: '1px solid #f1f5f9'
    },
    profileAvatar: {
      width: 84,
      height: 84,
      borderRadius: 14,
      background: '#eef2ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 34,
      color: '#3730a3',
      fontWeight: 800,
      marginBottom: 8
    },
    profileName: {
      fontWeight: 800,
      fontSize: 16
    },
    profileContact: {
      color: '#6b7280',
      fontSize: 13
    },
    detailLabel: {
      fontSize: 12,
      color: '#64748b',
      marginBottom: 6
    },
    detailValue: {
      fontWeight: 600,
      color: '#0f172a'
    },
    modalFooter: {
      marginTop: 16,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10
    },
    btnBlue: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '6px 10px',
      minWidth: 100,
      fontSize: 13,
      backgroundColor: '#ffffff',
      color: '#2563eb',
      border: '1.5px solid #2563eb',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 600
    },
    primaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '6px 10px',
      minWidth: 100,
      fontSize: 13,
      backgroundColor: '#ffffff',
      color: '#059669',
      border: '1.5px solid #059669',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 600
    },
    dangerBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '6px 10px',
      minWidth: 100,
      fontSize: 13,
      backgroundColor: '#ffffff',
      color: '#ef4444',
      border: '1.5px solid #ef4444',
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
      width: '14px',
      height: '14px',
      border: '1.5px solid rgba(15,23,42,0.12)',
      borderTop: '1.5px solid rgba(15,23,42,0.5)',
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: 0, borderBottom: 'none', paddingBottom: 6 }}>
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
          <div style={styles.cardBody}>
             {borrowRequests.length === 0 ? (
               <div style={styles.emptyState}>
                 <FaUserFriends style={styles.emptyIcon} />
                 <div style={styles.emptyTitle}>No Borrow Requests</div>
                 <div style={styles.emptyDescription}>No borrow requests have been submitted yet.</div>
               </div>
             ) : (
               <div style={{ padding: '4px 12px 12px 12px', marginTop: 0 }}>
                 <table style={styles.table}>
                   <thead style={styles.tableHeader}>
                     <tr>
                       <th style={styles.th}>ID</th>
                       <th style={styles.th}>Name</th>
                       <th style={styles.th}>Email</th>
                       <th style={styles.th}>Instrument</th>
                       <th style={styles.th}>Qty</th>
                       <th style={styles.th}>Requested</th>
                       <th style={styles.th}>Status</th>
                       <th style={styles.th}>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {sortedBorrowRequests.map(req => (
                       <tr key={req.id} className="invoice-row" style={req.archived ? styles.archivedRow : {}}>
                         <td style={styles.td}>{req.id}</td>
                         <td style={styles.td}>{req.userName || req.userFullName || req.user || '—'}</td>
                         <td style={styles.td}>{req.userEmail || req.email || '—'}</td>
                         <td style={styles.td}>{req.instrumentName || req.instrument || '—'}</td>
                         <td style={styles.td}>{req.quantity || 1}</td>
                         <td style={styles.td}>{formatDate(req.createdAt || req.startDate || req.date || '')}</td>
                         <td style={styles.td}>{getStatusBadge(req.status)}</td>
                         <td style={styles.td}>
                           <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                             <button onClick={() => setViewDetailsRequest({ ...req, type: 'borrow' })} style={styles.viewBtn}><FaInfoCircle /> Details</button>
                             {req.status === 'pending' && (
                               <>
                                 <button
                                   onClick={async () => {
                                     await handleInstrumentRequestAction(req.id, 'approved', 'borrow');
                                   }}
                                   disabled={processingId === req.id}
                                   style={{ ...styles.primaryBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                                 >
                                   <FaCheck /> Approve
                                 </button>
                                 <button
                                   onClick={async () => {
                                     await handleInstrumentRequestAction(req.id, 'rejected', 'borrow');
                                   }}
                                   disabled={processingId === req.id}
                                   style={{ ...styles.dangerBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                                 >
                                   <FaTimes /> Reject
                                 </button>
                               </>
                             )}
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      )}
 
      {/* Rent Requests Tab */}
      {activeTab === 'rent' && (
        <div style={styles.card}>
          <div style={styles.cardBody}>
           {rentRequests.length === 0 ? (
             <div style={styles.emptyState}>
               <FaMusic style={styles.emptyIcon} />
               <div style={styles.emptyTitle}>No Rent Requests</div>
               <div style={styles.emptyDescription}>No rent requests have been submitted yet.</div>
             </div>
           ) : (
             <div style={{ padding: '4px 12px 12px 12px', marginTop: 0 }}>
               <table style={styles.table}>
                 <thead style={styles.tableHeader}>
                   <tr>
                     <th style={styles.th}>ID</th>
                     <th style={styles.th}>Name</th>
                     <th style={styles.th}>Email</th>
                     <th style={styles.th}>Instrument</th>
                     <th style={styles.th}>Qty</th>
                     <th style={styles.th}>Fee/Day</th>
                     <th style={styles.th}>Requested</th>
                     <th style={styles.th}>Status</th>
                     <th style={styles.th}>Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sortedRentRequests.map(req => (
                     <tr key={req.id} className="invoice-row" style={req.archived ? styles.archivedRow : {}}>
                       <td style={styles.td}>{req.id}</td>
                       <td style={styles.td}>{req.userName || req.userFullName || req.user || '—'}</td>
                       <td style={styles.td}>{req.userEmail || req.email || '—'}</td>
                       <td style={styles.td}>{req.instrumentName || req.instrument || '—'}</td>
                       <td style={styles.td}>{req.quantity || 1}</td>
                       <td style={styles.td}>{(req.rental_fee || req.rentalFee) ? `₱${Number(req.rental_fee || req.rentalFee).toFixed(2)}` : '—'}</td>
                       <td style={styles.td}>{formatDate(req.createdAt || req.startDate || req.date || '')}</td>
                       <td style={styles.td}>{getStatusBadge(req.status)}</td>
                       <td style={styles.td}>
                         <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                           <button onClick={() => setViewDetailsRequest({ ...req, type: 'rent' })} style={styles.viewBtn}><FaInfoCircle /> Details</button>
                           {req.status === 'pending' && (
                             <>
                               <button
                                 onClick={async () => {
                                   await handleInstrumentRequestAction(req.id, 'approved', 'rent');
                                 }}
                                 disabled={processingId === req.id}
                                 style={{ ...styles.primaryBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                               >
                                 <FaCheck /> Approve
                               </button>
                               <button
                                 onClick={async () => {
                                   await handleInstrumentRequestAction(req.id, 'rejected', 'rent');
                                 }}
                                 disabled={processingId === req.id}
                                 style={{ ...styles.dangerBtn, ...(processingId === req.id ? styles.disabledBtn : {}) }}
                               >
                                 <FaTimes /> Reject
                               </button>
                             </>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
          </div>
        </div>
      )}
      {/* Details modal (alternate design) */}
      {viewDetailsRequest && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,6,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setViewDetailsRequest(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>Request Details</div>
                <div style={styles.modalSub}>ID #{viewDetailsRequest.id} • {viewDetailsRequest.type === 'rent' ? 'Rent' : 'Borrow'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setViewDetailsRequest(null)} style={styles.closeIcon}>✕</button>
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <div style={styles.modalBodyGrid}>
                <div style={styles.profileCard}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={styles.profileAvatar}>{(viewDetailsRequest.userName || viewDetailsRequest.userFullName || viewDetailsRequest.user || 'U').charAt(0)}</div>
                    <div style={styles.profileName}>{viewDetailsRequest.userName || viewDetailsRequest.userFullName || viewDetailsRequest.user || '—'}</div>
                    <div style={styles.profileContact}>{viewDetailsRequest.userEmail || viewDetailsRequest.email || '—'}</div>
                    <div style={{ height: 12 }}></div>
                    <div style={styles.detailLabel}>Phone</div>
                    <div style={styles.detailValue}>{viewDetailsRequest.phone || viewDetailsRequest.userPhone || '—'}</div>
                    {viewDetailsRequest.borrowerIdFileName && (
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <div style={styles.detailLabel}>Uploaded ID</div>
                        <a target="_blank" rel="noreferrer" href={`/uploads/${viewDetailsRequest.borrowerIdFileName}`}>{viewDetailsRequest.borrowerIdFileName}</a>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={styles.detailLabel}>Instrument</div>
                      <div style={styles.detailValue}>{viewDetailsRequest.instrumentName || viewDetailsRequest.instrument || '—'}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{viewDetailsRequest.quantity || 1} unit(s)</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      { (viewDetailsRequest.rental_fee || viewDetailsRequest.rentalFee) ? <div style={{ color: '#059669', fontWeight: 700 }}>₱{Number(viewDetailsRequest.rental_fee || viewDetailsRequest.rentalFee).toFixed(2)} / day</div> : null}
                    </div>
                  </div>

                  <div>
                    <div style={styles.detailLabel}>Start / End</div>
                    <div style={styles.detailValue}>{viewDetailsRequest.startDate ? `${formatDate(viewDetailsRequest.startDate)} — ${formatDate(viewDetailsRequest.endDate)}` : '—'}</div>
                  </div>

                  <div>
                    <div style={styles.detailLabel}>Purpose / Notes</div>
                    <div style={{ ...styles.detailValue, whiteSpace: 'pre-wrap' }}>{viewDetailsRequest.purpose || viewDetailsRequest.notes || '—'}</div>
                  </div>

                  <div style={styles.modalFooter}>

                    {viewDetailsRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={async () => {
                            const ok = await handleInstrumentRequestAction(viewDetailsRequest.id, 'rejected', viewDetailsRequest.type);
                            if (ok) setViewDetailsRequest(null);
                          }}
                          disabled={processingId === viewDetailsRequest.id}
                          style={{ ...styles.dangerBtn, ...(processingId === viewDetailsRequest.id ? styles.disabledBtn : {}) }}
                        ><FaTimes /> Reject
                        </button>

                        <button
                          onClick={async () => {
                            const ok = await handleInstrumentRequestAction(viewDetailsRequest.id, 'approved', viewDetailsRequest.type);
                            if (ok) setViewDetailsRequest(null);
                          }}
                          disabled={processingId === viewDetailsRequest.id}
                          style={{ ...styles.primaryBtn, ...(processingId === viewDetailsRequest.id ? styles.disabledBtn : {}) }}
                        >
                          {processingId === viewDetailsRequest.id ? <div style={styles.spinner}></div> : <><FaCheck /> Approve</>}
                        </button>
                      </>
                    )}

                    {viewDetailsRequest.status === 'approved' && viewDetailsRequest.type === 'rent' && (
                      <button onClick={() => { handleMarkPaid(viewDetailsRequest.id, viewDetailsRequest.type); setViewDetailsRequest(null); }} disabled={processingId === viewDetailsRequest.id} style={{ ...styles.btnBlue, ...(processingId === viewDetailsRequest.id ? styles.disabledBtn : {}) }}>Mark Paid</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approval;
