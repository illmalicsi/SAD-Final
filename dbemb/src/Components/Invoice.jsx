import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaUser, FaDollarSign, FaEdit, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import AuthService from '../services/authService';

const API_BASE_URL = 'http://localhost:5000/api';

const Invoice = ({ user, onBackToHome }) => {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await AuthService.makeAuthenticatedRequest(
          `${API_BASE_URL}/users`
        );
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
        } else {
          console.error('Failed to fetch users:', data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    
    if (!userId || !amount) {
      setErrorMsg('Please fill in required fields');
      setIsSubmitting(false);
      return;
    }
    try {
      const res = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/billing/invoices`,
        {
          method: 'POST',
          body: JSON.stringify({ userId, amount: parseFloat(amount), description }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Invoice #${data.invoice.invoice_id} created successfully`);
        setUserId('');
        setAmount('');
        setDescription('');
      } else {
        setErrorMsg(data.message || 'Failed to create invoice');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
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
      color: '#3b82f6',
      fontSize: '24px'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      maxWidth: '600px'
    },
    alert: {
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500'
    },
    alertSuccess: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    alertError: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    labelIcon: {
      color: '#6b7280',
      fontSize: '16px'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit'
    },
    select: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '16px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit'
    },
    textarea: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '16px',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '100px',
      transition: 'all 0.2s ease'
    },
    submitButton: {
      padding: '16px 32px',
      backgroundColor: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '16px'
    },
    submitButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid #ffffff',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
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
          
          .input-focus:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .back-button:hover {
            background-color: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
          }
          
          .submit-button:hover:not(:disabled) {
            background-color: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
          }
        `}
      </style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaFileInvoiceDollar style={styles.titleIcon} />
          Create New Invoice
        </h1>
      </div>

      <div style={styles.card}>
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

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaUser style={styles.labelIcon} />
              Select User *
            </label>
            <select 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)} 
              required
              style={styles.select}
              className="input-focus"
            >
              <option value="">Choose a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaDollarSign style={styles.labelIcon} />
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              style={styles.input}
              className="input-focus"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaEdit style={styles.labelIcon} />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter invoice description or notes..."
              style={styles.textarea}
              className="input-focus"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              ...styles.submitButton, 
              ...(isSubmitting ? styles.submitButtonDisabled : {})
            }}
            className="submit-button"
          >
            {isSubmitting ? (
              <>
                <div style={styles.spinner}></div>
                Creating Invoice...
              </>
            ) : (
              <>
                <FaFileInvoiceDollar />
                Generate Invoice
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Invoice;
