import React, { useState } from 'react';
import AuthService from '../services/authService';

const FinancialReport = () => {
  const [range, setRange] = useState({ from: '', to: '' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setError('');
    try {
      setLoading(true);
      const q = [];
      if (range.from) q.push(`from=${encodeURIComponent(range.from)}`);
      if (range.to) q.push(`to=${encodeURIComponent(range.to)}`);
      const url = '/billing/reports/financial' + (q.length ? `?${q.join('&')}` : '');
      const res = await AuthService.get(url);
      if (res && res.report) setReport(res.report);
      else setError(res?.message || 'Failed to fetch report');
    } catch (err) {
      setError(err.message || 'Error fetching report');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Financial Report</h2>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div>
          <label>From</label>
          <input type="date" value={range.from} onChange={e => setRange({...range, from: e.target.value})} />
        </div>
        <div>
          <label>To</label>
          <input type="date" value={range.to} onChange={e => setRange({...range, to: e.target.value})} />
        </div>
        <div>
          <button onClick={fetchReport} disabled={loading} style={{ padding: '8px 12px' }}>{loading ? 'Loading...' : 'Get Report'}</button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!report ? (
          <div style={{ color: '#64748b' }}>No report loaded.</div>
        ) : (
          <div style={{ background: '#fff', padding: 14, borderRadius: 8 }}>
            <h3>Summary</h3>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#6b7280' }}>Income</td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>₱{(report.income || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ color: '#6b7280' }}>Expenses</td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>₱{(report.expenses || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ color: '#6b7280' }}>Profit</td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>₱{(report.profit || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 12 }}>
              <small style={{ color: '#6b7280' }}>Range: {report.fromDate || range.from || '—'} to {report.toDate || range.to || '—'}</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;
