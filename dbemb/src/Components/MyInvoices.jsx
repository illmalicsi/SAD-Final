import React, { useEffect, useState } from 'react';
import { FaFileInvoiceDollar, FaClock, FaCheckCircle, FaTimesCircle, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import AuthService from '../services/authService';

const API_BASE_URL = 'http://localhost:5000/api';

const MyInvoices = ({ user }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMyInvoices();
  }, []);

  const fetchMyInvoices = async () => {
    try {
      setLoading(true);
      const res = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/billing/invoices`
      );
      const data = await res.json();
      if (res.ok) {
        // Filter invoices for current user
        const myInvoices = data.invoices.filter(inv => inv.user_id === user.id);
        setInvoices(myInvoices);
      } else {
        setErrorMsg(data.message || 'Failed to load invoices');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        bg: '#fef3c7',
        color: '#92400e',
        icon: <FaClock size={12} />,
        text: 'Pending'
      },
      approved: {
        bg: '#dbeafe',
        color: '#1e40af',
        icon: <FaCheckCircle size={12} />,
        text: 'Approved - Awaiting Payment'
      },
      paid: {
        bg: '#d1fae5',
        color: '#065f46',
        icon: <FaCheckCircle size={12} />,
        text: 'Paid'
      },
      rejected: {
        bg: '#fee2e2',
        color: '#991b1b',
        icon: <FaTimesCircle size={12} />,
        text: 'Rejected'
      }
    };

    const config = configs[status] || configs.pending;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.color
      }}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '16px'
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
    invoiceCard: {
      padding: '24px',
      borderBottom: '1px solid #f1f5f9',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer'
    },
    invoiceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    invoiceId: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#0f172a'
    },
    amount: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#059669'
    },
    description: {
      color: '#64748b',
      fontSize: '14px',
      marginBottom: '16px',
      lineHeight: '1.6'
    },
    invoiceFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid #f1f5f9'
    },
    dateInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#64748b'
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
    alert: {
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '16px',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      fontSize: '14px',
      fontWeight: '500'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f1f5f9',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '40px auto'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={styles.loadingSpinner}></div>
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '16px' }}>
          Loading your invoices...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .invoice-card:hover {
            background-color: #f8fafc;
          }
        `}
      </style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaFileInvoiceDollar />
          My Invoices
        </h1>
        <p style={styles.subtitle}>
          View your invoices and payment status
        </p>
      </div>

      {errorMsg && (
        <div style={styles.alert}>
          {errorMsg}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            All Invoices ({invoices.length})
          </h2>
        </div>

        {invoices.length === 0 ? (
          <div style={styles.emptyState}>
            <FaFileInvoiceDollar style={styles.emptyIcon} />
            <div style={styles.emptyTitle}>No Invoices</div>
            <div style={styles.emptyDescription}>
              You don't have any invoices yet. They will appear here when your bookings are approved.
            </div>
          </div>
        ) : (
          <div>
            {invoices.map((invoice) => (
              <div
                key={invoice.invoice_id}
                style={styles.invoiceCard}
                className="invoice-card"
              >
                <div style={styles.invoiceHeader}>
                  <div>
                    <div style={styles.invoiceId}>
                      Invoice #{invoice.invoice_id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={styles.amount}>
                      ₱{parseFloat(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div style={styles.description}>
                  {invoice.description || 'No description provided'}
                </div>

                <div style={styles.invoiceFooter}>
                  <div style={styles.dateInfo}>
                    <FaCalendarAlt />
                    Created: {formatDate(invoice.created_at)}
                    {invoice.approved_at && (
                      <> • Approved: {formatDate(invoice.approved_at)}</>
                    )}
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>

                {invoice.status === 'approved' && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '8px', fontSize: '14px' }}>
                      💳 Payment Instructions
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                      Your booking has been approved! Please wait for an admin to process your payment. 
                      You will be notified once the payment has been recorded.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInvoices;
