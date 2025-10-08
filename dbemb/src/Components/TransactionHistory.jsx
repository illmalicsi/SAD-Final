import React, { useEffect, useState } from 'react';
import { FaHistory, FaArrowLeft, FaDollarSign, FaReceipt, FaClock, FaFilter, FaDownload, FaSearch } from 'react-icons/fa';
import AuthService from '../services/authService';

const API_BASE_URL = 'http://localhost:5000/api';

const TransactionHistory = ({ onBackToHome }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTransactions = async () => {
    try {
      const res = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/billing/transactions`
      );
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions);
      } else {
        setErrorMsg(data.message || 'Failed to load transactions');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
      completed: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        border: '1px solid #34d399'
      },
      pending: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fbbf24'
      },
      failed: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #fca5a5'
      }
    };

    return (
      <span style={{...styles.base, ...styles[status] || styles.pending}}>
        {status}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'payment':
        return <FaDollarSign style={{color: '#059669'}} />;
      default:
        return <FaReceipt style={{color: '#6b7280'}} />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.transaction_id.toString().includes(searchTerm) ||
                         tx.invoice_id?.toString().includes(searchTerm) ||
                         tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
      color: '#8b5cf6',
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
    cardHeaderTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#374151',
      margin: 0
    },
    filters: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: '#fff'
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      width: '200px'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: '#fff',
      fontSize: '14px',
      cursor: 'pointer'
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
      letterSpacing: '0.5px'
    },
    td: {
      padding: '20px 24px',
      borderBottom: '1px solid #f1f5f9',
      fontSize: '14px',
      color: '#374151'
    },
    transactionRow: {
      transition: 'background-color 0.2s ease'
    },
    transactionId: {
      fontWeight: '600',
      color: '#1f2937'
    },
    invoiceLink: {
      color: '#3b82f6',
      fontWeight: '500',
      textDecoration: 'none'
    },
    amount: {
      fontWeight: '600',
      fontSize: '16px',
      color: '#059669'
    },
    typeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    dateInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#6b7280'
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
    summaryCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    summaryCard: {
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      textAlign: 'center'
    },
    summaryValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '4px'
    },
    summaryLabel: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{...styles.card, padding: '64px', textAlign: 'center'}}>
          <div>Loading transaction history...</div>
        </div>
      </div>
    );
  }

  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const completedTransactions = transactions.filter(tx => tx.status === 'completed').length;

  return (
    <div style={styles.container}>
      <style>
        {`
          .back-button:hover {
            background-color: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
          }
          
          .transaction-row:hover {
            background-color: #f8fafc;
          }
          
          .invoice-link:hover {
            text-decoration: underline;
          }
        `}
      </style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaHistory style={styles.titleIcon} />
          Transaction History
        </h1>
      </div>

      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{totalTransactions}</div>
          <div style={styles.summaryLabel}>Total Transactions</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>${totalAmount.toFixed(2)}</div>
          <div style={styles.summaryLabel}>Total Amount</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{completedTransactions}</div>
          <div style={styles.summaryLabel}>Completed</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderTop}>
            <h2 style={styles.cardTitle}>
              All Transactions ({filteredTransactions.length})
            </h2>
            <div style={styles.filters}>
              <div style={styles.searchBox}>
                <FaSearch size={14} style={{color: '#6b7280'}} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div style={styles.cardBody}>
          {errorMsg && (
            <div style={styles.alert}>
              {errorMsg}
            </div>
          )}

          {filteredTransactions.length === 0 ? (
            <div style={styles.emptyState}>
              <FaHistory style={styles.emptyIcon} />
              <div style={styles.emptyTitle}>No Transactions Found</div>
              <div style={styles.emptyDescription}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'No transactions match your current filters.' 
                  : 'You haven\'t made any transactions yet.'}
              </div>
            </div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Transaction ID</th>
                  <th style={styles.th}>Invoice</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Invoice Amount</th>
                  <th style={styles.th}>Invoice Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.transaction_id} style={styles.transactionRow} className="transaction-row">
                    <td style={styles.td}>
                      <div style={styles.transactionId}>#{tx.transaction_id}</div>
                    </td>
                    <td style={styles.td}>
                      {tx.invoice_id ? (
                        <a href="#" style={styles.invoiceLink} className="invoice-link">
                          Invoice #{tx.invoice_id}
                        </a>
                      ) : (
                        <span style={{color: '#9ca3af'}}>N/A</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.amount}>
                        ${parseFloat(tx.amount).toFixed(2)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.typeInfo}>
                        {getTypeIcon(tx.transaction_type)}
                        <span style={{textTransform: 'capitalize'}}>{tx.transaction_type}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {getStatusBadge(tx.status)}
                    </td>
                    <td style={styles.td}>
                      {tx.invoice_amount ? (
                        <span>${parseFloat(tx.invoice_amount).toFixed(2)}</span>
                      ) : (
                        <span style={{color: '#9ca3af'}}>N/A</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {tx.invoice_status ? (
                        getStatusBadge(tx.invoice_status)
                      ) : (
                        <span style={{color: '#9ca3af'}}>N/A</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateInfo}>
                        <FaClock size={12} />
                        {formatDate(tx.created_at)}
                      </div>
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

export default TransactionHistory;
