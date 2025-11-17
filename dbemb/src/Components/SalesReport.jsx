import React, { useEffect, useState } from 'react';
import AuthService from '../services/authService';
import theme from '../theme';
import { FaDownload, FaCalendarAlt, FaChartLine, FaDollarSign, FaFileInvoiceDollar, FaCheckCircle, FaClock, FaExclamationCircle } from '../icons/fa';

const SalesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [financeReport, setFinanceReport] = useState({ income: 0, expenses: 0, profit: 0 });

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      // Use admin endpoint for admins, otherwise fetch only the logged-in user's invoices
      const endpoint = AuthService.isAdmin() ? '/billing/invoices' : '/billing/my-invoices';
      const data = await AuthService.get(endpoint);
      if (data && data.invoices) setInvoices(data.invoices);
      else setError(data?.message || 'Failed to load invoices - make sure you are an admin');
    } catch (e) {
      setError(e.message || 'Network error while fetching invoices');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  // If admin, also fetch aggregated financial report (income/expenses)
  React.useEffect(() => {
    async function fetchFinance() {
      if (!AuthService.isAdmin()) return;
      try {
        const res = await AuthService.get('/billing/reports/financial');
        if (res && res.report) setFinanceReport(res.report);
      } catch (e) {
        console.warn('Failed to fetch financial report:', e && e.message);
      }
    }
    fetchFinance();
  }, []);

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

  const StatCard = ({ icon: Icon, label, value, color, sublabel }) => (
    <div style={{ 
      background: '#fff', 
      padding: 20, 
      borderRadius: 12, 
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{value}</div>
          {sublabel && <div style={{ fontSize: 12, color: '#94a3b8' }}>{sublabel}</div>}
        </div>
        <div style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 10, 
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          <Icon style={{ fontSize: 22 }} />
        </div>
      </div>
    </div>
  );

  const getStatusStyle = (status) => {
    const styles = {
      paid: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
      approved: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
      pending: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' }
    };
    return styles[status] || styles.pending;
  };

  return (
    <div style={{ 
      padding: 32, 
      fontFamily: theme.fonts.base, 
      background: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              Sales Report
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
              Track invoices, payments, and revenue for the marching band
            </p>
          </div>
          <button 
            onClick={exportCSV}
            disabled={filtered.length === 0}
            style={{ 
              background: theme.palette.primary, 
              color: '#fff', 
              border: 'none', 
              padding: '12px 20px', 
              borderRadius: 10, 
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.2s',
              opacity: filtered.length === 0 ? 0.5 : 1
            }}
            onMouseEnter={e => {
              if (filtered.length > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.35)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)';
            }}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div style={{ 
        background: '#fff', 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: 24,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FaCalendarAlt style={{ color: '#64748b', fontSize: 18 }} />
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>Filter by Date Range</span>
          <div style={{ flex: 1, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>From:</label>
              <input 
                type="date" 
                value={from} 
                onChange={e=>setFrom(e.target.value)} 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = theme.palette.primary}
                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>To:</label>
              <input 
                type="date" 
                value={to} 
                onChange={e=>setTo(e.target.value)} 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = theme.palette.primary}
                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>
            {(from || to) && (
              <button 
                onClick={() => { setFrom(''); setTo(''); }}
                style={{
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500
                }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          color: '#991b1b', 
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20, 
        marginBottom: 24 
      }}>
        <StatCard 
          icon={FaFileInvoiceDollar}
          label="Total Invoices"
          value={totals.count}
          sublabel={`${filtered.length} filtered`}
          color="#6366f1"
        />
        <StatCard 
          icon={FaDollarSign}
          label="Total Revenue"
          value={`₱${Number(AuthService.isAdmin() ? (financeReport.income || totals.total) : totals.total).toLocaleString()}`}
          sublabel="From all invoices"
          color="#10b981"
        />
        <StatCard 
          icon={FaCheckCircle}
          label="Paid Invoices"
          value={totals.paid}
          sublabel={`${totals.count > 0 ? Math.round(totals.paid/totals.count*100) : 0}% completion rate`}
          color="#22c55e"
        />
        <StatCard 
          icon={FaClock}
          label="Pending"
          value={totals.pending}
          sublabel={`${totals.approved} approved`}
          color="#f59e0b"
        />
      </div>

      {/* Invoice Table */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            Invoice Details
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
            Showing {filtered.length} of {invoices.length} invoices
          </p>
        </div>
        
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 16 }}>Loading invoices...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <FaFileInvoiceDollar style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 16 }}>No invoices found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice ID</th>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => {
                  const statusStyle = getStatusStyle(inv.status);
                  return (
                    <tr 
                      key={inv.invoice_id || inv.id}
                      style={{ 
                        borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#0f172a', fontWeight: 500 }}>
                        #{inv.invoice_id || inv.id}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#0f172a', fontWeight: 600 }}>
                        ₱{Number(inv.amount || inv.total || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          textTransform: 'capitalize'
                        }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>
                        {new Date(inv.created_at || inv.createdAt || inv.created || '').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;