import React, { useEffect, useState } from 'react';
import { FaCreditCard, FaArrowLeft, FaDollarSign, FaUser, FaClock, FaCheck, FaTimes, FaSpinner, FaReceipt } from 'react-icons/fa';
import AuthService from '../services/authService';

const API_BASE_URL = 'http://localhost:5000/api';

const Payment = ({ onBackToHome }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/billing/invoices`
      );
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices);
      } else {
        setErrorMsg(data.message || 'Failed to load invoices');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayment = async (invoiceId, amount) => {
    setErrorMsg('');
    setSuccessMsg('');
    setProcessingId(invoiceId);
    
    try {
      const res = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/billing/payments`,
        {
          method: 'POST',
          body: JSON.stringify({ invoiceId, amountPaid: amount }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Payment recorded successfully for Invoice #${invoiceId}`);
        setInvoices(prev => prev.filter(inv => inv.invoice_id !== invoiceId));
      } else {
        setErrorMsg(data.message || 'Failed to process payment');
      }
    } catch (err) {
      setErrorMsg(err.message);
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
      approved: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        border: '1px solid #34d399'
      }
    };

    return (
      <span style={{...styles.base, ...styles[status] || styles.approved}}>
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
      color: '#059669',
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
      borderBottom: '1px solid',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500'
    },
    alertSuccess: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      borderColor: '#bbf7d0'
    },
    alertError: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#fecaca'
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
      letterSpacing: '0.5px'
    },
    td: {
      padding: '20px 24px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
      color: '#374151'
    },
    invoiceRow: {
      transition: 'background-color 0.2s ease'
    },
    invoiceCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
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
    payButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: '#059669',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    payButtonDisabled: {
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
          <div>Loading approved invoices...</div>
        </div>
      </div>
    );
  }

  const approvedInvoices = invoices.filter(inv => inv.status === 'approved');

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
          
          .pay-button:hover:not(:disabled) {
            background-color: #047857;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          }
        `}
      </style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaCreditCard style={styles.titleIcon} />
          Payment Processing
        </h1>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            Approved Invoices Ready for Payment ({approvedInvoices.length})
          </h2>
        </div>

        <div style={styles.cardBody}>
          {successMsg && (
            <div style={{...styles.alert, ...styles.alertSuccess}}>
              <FaCheck />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{...styles.alert, ...styles.alertError}}>
              <FaTimes />
              {errorMsg}
            </div>
          )}

          {approvedInvoices.length === 0 ? (
            <div style={styles.emptyState}>
              <FaReceipt style={styles.emptyIcon} />
              <div style={styles.emptyTitle}>No Approved Invoices</div>
              <div style={styles.emptyDescription}>
                There are no approved invoices ready for payment processing.
              </div>
            </div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Invoice</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Approved</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedInvoices.map(inv => (
                  <tr key={inv.invoice_id} style={styles.invoiceRow} className="invoice-row">
                    <td style={styles.td}>
                      <div style={styles.invoiceCard}>
                        <div style={styles.invoiceId}>#{inv.invoice_id}</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        <FaUser size={12} />
                        User ID: {inv.user_id}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.amount}>
                        ${parseFloat(inv.amount).toFixed(2)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.description} title={inv.description}>
                        {inv.description || 'No description'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateInfo}>
                        <FaClock size={12} />
                        {formatDate(inv.approved_at || inv.created_at)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {getStatusBadge(inv.status)}
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => handlePayment(inv.invoice_id, inv.amount)}
                        disabled={processingId === inv.invoice_id}
                        style={{
                          ...styles.payButton,
                          ...(processingId === inv.invoice_id ? styles.payButtonDisabled : {})
                        }}
                        className="pay-button"
                      >
                        {processingId === inv.invoice_id ? (
                          <>
                            <div style={styles.spinner}></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaDollarSign size={12} />
                            Process Payment
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;