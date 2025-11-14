import React, { useEffect, useState } from 'react';
import AuthService from '../services/authService';
import theme from '../theme';
import { FaDownload } from '../icons/fa';

const API_BASE = 'http://localhost:5000/api';

const SalesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AuthService.makeAuthenticatedRequest(`${API_BASE}/billing/invoices`);
      const data = await res.json();
      if (res.ok && data.invoices) setInvoices(data.invoices);
      else setError(data.message || 'Failed to load invoices - make sure you are an admin');
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filtered = invoices.filter(inv => {
    if (!from && !to) return true;
    const created = new Date(inv.created_at || inv.createdAt || inv.created);
    if (from) {
      const f = new Date(from + 'T00:00:00');
      if (created < f) return false;
    }
    if (to) {
      const t = new Date(to + 'T23:59:59');
      if (created > t) return false;
    }
    return true;
  });

  const totals = filtered.reduce((acc, i) => {
    acc.count++;
    acc.total += Number(i.amount || i.total || 0);
    if (i.status === 'paid') acc.paid++;
    else if (i.status === 'approved') acc.approved++;
    else acc.pending++;
    return acc;
  }, { count: 0, total: 0, paid: 0, approved: 0, pending: 0 });

  const exportCSV = () => {
    const rows = [['Invoice ID','User ID','Amount','Status','Created At','Description']];
    filtered.forEach(inv => rows.push([inv.invoice_id || inv.id || '', inv.user_id || inv.userId || '', inv.amount || inv.total || 0, inv.status || '', inv.created_at || inv.createdAt || '', (inv.description||'').replace(/\n/g,' ')]));
    const csv = rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sales-report.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 24, fontFamily: theme.fonts.base, background: theme.palette.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Sales Report</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{ padding: 8, borderRadius: 6, border: `1px solid ${theme.palette.border}` }} />
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{ padding: 8, borderRadius: 6, border: `1px solid ${theme.palette.border}` }} />
          <button onClick={exportCSV} style={{ background: theme.palette.primary, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}><FaDownload /> Export CSV</button>
        </div>
      </div>
      {error && <div style={{ color: theme.palette.danger, marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: theme.palette.card, padding: 16, borderRadius: 8, border: `1px solid ${theme.palette.border}` }}>
          <h3 style={{ marginTop: 0 }}>Summary</h3>
          <div>Total invoices: {totals.count}</div>
          <div>Total amount: ₱{totals.total}</div>
          <div>Paid: {totals.paid}</div>
          <div>Approved: {totals.approved}</div>
          <div>Pending: {totals.pending}</div>
        </div>

        <div style={{ background: theme.palette.card, padding: 16, borderRadius: 8, border: `1px solid ${theme.palette.border}` }}>
          <h3 style={{ marginTop: 0 }}>Invoices (filtered)</h3>
          {loading ? <div>Loading...</div> : (
            <div style={{ maxHeight: 420, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.invoice_id || inv.id}>
                      <td style={{ padding: 8 }}>{inv.invoice_id || inv.id}</td>
                      <td style={{ padding: 8 }}>₱{inv.amount || inv.total || 0}</td>
                      <td style={{ padding: 8 }}>{inv.status}</td>
                      <td style={{ padding: 8 }}>{new Date(inv.created_at || inv.createdAt || inv.created || '').toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
