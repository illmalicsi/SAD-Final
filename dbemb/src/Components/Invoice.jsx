
import React, { useEffect, useState } from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import AuthService from '../services/authService';

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // Use AuthService to make an authenticated request
      const data = await AuthService.get('/billing/invoices');
      if (data && data.invoices) {
        setInvoices(data.invoices);
      } else {
        setError(data.message || 'Failed to load invoices');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FaFileInvoiceDollar style={{ color: '#3b82f6', fontSize: '24px' }} />
          Customer Invoices
        </h1>
      </div>
  <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '28px 24px', boxShadow: '0 4px 12px -2px rgba(16,30,54,0.10)', border: '1px solid #e2e8f0', maxWidth: '100%', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: 15,
              background: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              tableLayout: 'fixed',
              minWidth: 900
            }}>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', color: '#fff' }}>
                  <th style={{ padding: '12px 10px', borderTopLeftRadius: 10, border: 'none', fontWeight: 700, letterSpacing: 0.5 }}>Invoice #</th>
                  <th style={{ padding: '12px 10px', border: 'none', fontWeight: 700, letterSpacing: 0.5 }}>Customer ID</th>
                  <th style={{ padding: '12px 10px', border: 'none', fontWeight: 700, letterSpacing: 0.5 }}>Amount Due</th>
                  <th style={{ padding: '12px 10px', border: 'none', fontWeight: 700, letterSpacing: 0.5 }}>Status</th>
                  <th style={{ padding: '12px 10px', border: 'none', fontWeight: 700, letterSpacing: 0.5 }}>Description</th>
                  <th style={{ padding: '12px 10px', borderTopRightRadius: 10, border: 'none', fontWeight: 700, letterSpacing: 0.5 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic', fontSize: 15 }}>No invoices found.</td>
                  </tr>
                ) : (
                  invoices.map((inv, idx) => (
                    <tr key={inv.invoice_id} style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff', transition: 'background 0.2s' }}>
                      <td style={{ padding: '10px 8px', border: 'none', textAlign: 'center', borderLeft: '4px solid #3b82f6', borderTopLeftRadius: 6, fontWeight: 600 }}>{inv.invoice_id}</td>
                      <td style={{ padding: '10px 8px', border: 'none', textAlign: 'center' }}>{inv.user_id}</td>
                      <td style={{ padding: '10px 8px', border: 'none', textAlign: 'right', color: '#059669', fontWeight: 700 }}>₱{parseFloat(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '10px 8px', border: 'none', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 12px',
                          borderRadius: 14,
                          background: inv.status === 'paid' ? '#d1fae5' : inv.status === 'pending' ? '#fef9c3' : '#fee2e2',
                          color: inv.status === 'paid' ? '#059669' : inv.status === 'pending' ? '#b45309' : '#dc2626',
                          fontWeight: 600,
                          fontSize: 14
                        }}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                      </td>
                      <td style={{ padding: '10px 8px', border: 'none', fontStyle: inv.description ? 'normal' : 'italic', color: inv.description ? '#0f172a' : '#64748b' }}>{inv.description || '-'}</td>
                      <td style={{ padding: '10px 8px', border: 'none', textAlign: 'center', borderTopRightRadius: 6 }}>{new Date(inv.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
