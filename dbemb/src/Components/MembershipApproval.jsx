import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaCheck, FaTimes, FaExclamationCircle, FaUsers, FaClock } from 'react-icons/fa';
import AuthService from '../services/authService';

const MembershipApproval = ({ user, onBackToHome, onLogout, embedded = false }) => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPendingMembers();
  }, []);

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      const response = await AuthService.get('/membership/pending');
      setPendingMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching pending members:', error);
      showNotification('Failed to load pending members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setProcessingId(userId);
      await AuthService.put(`/membership/approve/${userId}`);
      showNotification('Member approved successfully!', 'success');
      fetchPendingMembers();
    } catch (error) {
      console.error('Error approving member:', error);
      showNotification('Failed to approve member', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    try {
      setProcessingId(userId);
      await AuthService.put(`/membership/reject/${userId}`);
      showNotification('Member rejected', 'info');
      fetchPendingMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      showNotification('Failed to reject member', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2.5rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    header: {
      marginBottom: '2.5rem'
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1rem',
      fontWeight: '400'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2.5rem'
    },
    statCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      transition: 'all 0.3s ease'
    },
    statIconWrapper: {
      width: '60px',
      height: '60px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.75rem',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
    },
    statContent: {
      flex: 1
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#64748b',
      marginBottom: '0.5rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#0f172a',
      letterSpacing: '-0.02em'
    },
    tableContainer: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    tableHeader: {
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '1.75rem 2rem',
      color: '#0f172a',
      fontSize: '1.125rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
      tableLayout: 'auto'
    },
    tableHead: {
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    th: {
      backgroundColor: '#f8fafc',
      padding: '0.75rem 1rem',
      textAlign: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontSize: '0.6875rem',
      fontWeight: '600',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      borderBottom: '1px solid #e2e8f0'
    },
    tr: {
      borderBottom: '1px solid #f1f5f9',
      transition: 'all 0.2s ease'
    },
    td: {
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #f1f5f9',
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#334155',
      fontSize: '0.875rem'
    },
    tdName: {
      textAlign: 'left',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      minWidth: '140px',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#0f172a'
    },
    tdEmail: {
      textAlign: 'left',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      minWidth: '180px',
      fontSize: '0.8125rem',
      color: '#64748b'
    },
    tdDate: {
      color: '#64748b',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
    },
    roleBadge: {
      padding: '0.375rem 0.75rem',
      borderRadius: '100px',
      fontSize: '0.6875rem',
      fontWeight: '600',
      letterSpacing: '0.025em',
      textTransform: 'uppercase',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.25rem',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'nowrap'
    },
    approveButton: {
      backgroundColor: 'white',
      border: '1px solid #10b981',
      color: '#10b981',
      padding: '0.375rem 0.5rem',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      minWidth: '68px'
    },
    rejectButton: {
      backgroundColor: 'white',
      border: '1px solid #ef4444',
      color: '#ef4444',
      padding: '0.375rem 0.5rem',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      minWidth: '68px'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    emptyState: {
      padding: '4rem 2rem',
      textAlign: 'center',
      color: '#64748b'
    },
    emptyIcon: {
      fontSize: '4rem',
      color: '#cbd5e1',
      marginBottom: '1.5rem'
    },
    emptyText: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#475569'
    },
    emptySubtext: {
      fontSize: '0.9375rem',
      color: '#94a3b8'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      gap: '1rem'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e0f2fe',
      borderTop: '4px solid #0ea5e9',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    notification: {
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '400px',
      backdropFilter: 'blur(10px)'
    },
    notificationSuccess: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    notificationError: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    notificationInfo: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          tr:hover {
            background-color: #f8fafc !important;
          }
          button:hover:not(:disabled) {
            transform: translateY(-1px);
            opacity: 0.9;
          }
          button:active:not(:disabled) {
            transform: translateY(0);
          }
          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          }
        `}
      </style>

      {notification && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'success' ? styles.notificationSuccess : {}),
          ...(notification.type === 'error' ? styles.notificationError : {}),
          ...(notification.type === 'info' ? styles.notificationInfo : {})
        }}>
          {notification.type === 'success' && <FaCheck />}
          {notification.type === 'error' && <FaTimes />}
          {notification.type === 'info' && <FaExclamationCircle />}
          <span>{notification.message}</span>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaUserPlus />
          Membership Approval
        </h1>
        <p style={styles.subtitle}>Review and approve pending membership requests</p>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconWrapper}>
            <FaClock />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Pending Requests</div>
            <div style={styles.statValue}>{pendingMembers.length}</div>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <FaUsers />
          Pending Members
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <div style={{ color: '#64748b' }}>Loading pending members...</div>
          </div>
        ) : pendingMembers.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <FaUserPlus />
            </div>
            <div style={styles.emptyText}>No pending membership requests</div>
            <div style={styles.emptySubtext}>All membership requests have been processed</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={{...styles.th, textAlign: 'left', minWidth: '140px'}}>Name</th>
                  <th style={{...styles.th, textAlign: 'left', minWidth: '180px'}}>Email Address</th>
                  <th style={{...styles.th, width: 'auto', minWidth: '100px'}}>Registration Date</th>
                  <th style={{...styles.th, width: 'auto', minWidth: '80px'}}>Current Role</th>
                  <th style={{...styles.th, width: 'auto', minWidth: '160px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMembers.map((member) => (
                  <tr key={member.id} style={styles.tr}>
                    <td style={{...styles.td, ...styles.tdName}}>
                      {member.first_name} {member.last_name}
                    </td>
                    <td style={{...styles.td, ...styles.tdEmail}}>
                      {member.email}
                    </td>
                    <td style={{...styles.td, ...styles.tdDate}}>
                      {formatDate(member.created_at)}
                    </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <span style={styles.roleBadge}>{member.role_name || 'USER'}</span>
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleApprove(member.id)}
                        disabled={processingId === member.id}
                        style={{
                          ...styles.approveButton,
                          ...(processingId === member.id ? styles.disabledButton : {})
                        }}
                      >
                        <FaCheck size={11} />
                        {processingId === member.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(member.id)}
                        disabled={processingId === member.id}
                        style={{
                          ...styles.rejectButton,
                          ...(processingId === member.id ? styles.disabledButton : {})
                        }}
                      >
                        <FaTimes size={11} />
                        {processingId === member.id ? 'Processing...' : 'Reject'}
                      </button>
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
  );
};

export default MembershipApproval;