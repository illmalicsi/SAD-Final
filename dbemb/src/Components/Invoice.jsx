import React, { useEffect, useState } from 'react';
import { FaFileInvoiceDollar, FaEye, FaDownload } from '../icons/fa';
import AuthService from '../services/authService';

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Helper to compute status badge style in one place
  const getBadgeStyle = (statusRaw) => {
    const st = String(statusRaw || '').toLowerCase();
    return {
      background: st === 'paid' ? '#ecfdf5' : st === 'approved' ? '#fef3c7' : st === 'unpaid' ? '#fef2f2' : '#f3f4f6',
      color: st === 'paid' ? '#047857' : st === 'approved' ? '#92400e' : st === 'unpaid' ? '#b91c1c' : '#374151',
      border: `1px solid ${st === 'paid' ? '#a7f3d0' : st === 'approved' ? '#fcd34d' : st === 'unpaid' ? '#fecaca' : '#d1d5db'}`,
      padding: '4px 8px',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '11px',
      display: 'inline-block',
      textTransform: 'capitalize'
    };
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // Check if user is admin
      const user = AuthService.getUser();
      const isAdmin = user && user.role === 'admin';
      
      // Use appropriate endpoint based on user role
      const endpoint = isAdmin ? '/billing/invoices' : '/billing/my-invoices';
      
      // Use AuthService to make an authenticated request
      const data = await AuthService.get(endpoint);
      if (data && data.invoices) {
        setInvoices(data.invoices);
        // Fetch user details for displayed invoices
        try {
          const userIds = [...new Set(data.invoices.map(inv => inv.user_id).filter(Boolean))];
          const details = {};
          for (const uid of userIds) {
            try {
              const udata = await AuthService.get(`/users/${uid}`);
              // Accept both { success:true, user } and { user } shapes
              if (udata && udata.user) {
                details[uid] = udata.user;
              } else if (udata && udata.success && udata.user) {
                details[uid] = udata.user;
              }
            } catch (e) {
              // ignore missing user details
            }
          }
          setUserDetails(details);
        } catch (e) {
          console.warn('Failed to fetch user details for invoices', e);
        }
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
    <>
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <FaFileInvoiceDollar style={{ color: '#0ea5e9', fontSize: 24 }} />
        <div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Manage and review customer invoices</div>
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Loading invoices...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#dc2626', padding: 24 }}>{error}</div>
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 28, fontStyle: 'italic' }}>No invoices found.</div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <style>{`
                .invoices-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                .invoices-table th { 
                  background: #f8fafc; 
                  padding: 8px 10px; 
                  text-align: left; 
                  font-weight: 600; 
                  color: #475569; 
                  font-size: 11px; 
                  border-bottom: 2px solid #e2e8f0;
                  position: sticky;
                  top: 0;
                  z-index: 10;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .invoices-table td { 
                  padding: 8px 10px; 
                  border-bottom: 1px solid #f1f5f9; 
                  color: #374151; 
                  font-size: 12px;
                  vertical-align: middle;
                }
                .invoices-table tbody tr:hover { background: #f8fafc; transition: background 0.15s ease; }
                .amount { text-align: center; font-weight: 600; color: #0f172a; font-variant-numeric: tabular-nums; }
                .status-badge { 
                  padding: 3px 8px; 
                  border-radius: 4px; 
                  font-weight: 600; 
                  font-size: 10px; 
                  display: inline-block; 
                  text-transform: uppercase;
                  letter-spacing: 0.3px;
                }
                .btn { 
                  display: inline-flex; 
                  align-items: center; 
                  gap: 4px; 
                  padding: 6px 10px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  border: none; 
                  font-weight: 500; 
                  font-size: 11px; 
                  transition: all 0.15s ease;
                }
                .btn-primary { background: #0ea5e9; color: #fff; }
                .btn-primary:hover { background: #0284c7; }
                .btn-outline { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
                .btn-outline:hover { background: #f1f5f9; }
              `}</style>

              <table className="invoices-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>User</th>
                    <th style={{ width: '22%' }}>Description</th>
                    <th style={{ width: '14%' }}>Invoice #</th>
                    <th style={{ width: '12%' }}>Date</th>
                    <th style={{ width: '12%', textAlign: 'center' }} className="amount">Amount</th>
                    <th style={{ width: '12%' }}>Status</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .slice()
                    .sort((a, b) => Number(b.invoice_id || b.invoiceId || 0) - Number(a.invoice_id || a.invoiceId || 0))
                    .map((inv) => {
                    const status = String(inv.status || '').toLowerCase();
                    const paymentStatus = String(inv.payment_status || 'unpaid').toLowerCase();
                    
                    const statusColor = status === 'paid' ? '#10b981' : status === 'approved' ? '#f59e0b' : status === 'pending' ? '#6b7280' : '#ef4444';
                    const statusBg = status === 'paid' ? '#d1fae5' : status === 'approved' ? '#fef3c7' : status === 'pending' ? '#f3f4f6' : '#fee2e2';
                    
                    return (
                      <tr key={inv.invoice_id}>
                        <td style={{ fontWeight: 500, color: '#0f172a', fontSize: '12px' }}>
                          {(() => {
                            const u = userDetails[inv.user_id];
                            if (u && (u.firstName || u.lastName)) return `${u.firstName || ''} ${u.lastName || ''}`.trim();
                            if (u && u.email) return u.email.split('@')[0];
                            return (inv.user_email || inv.userId || inv.user_id || '').toString().split('@')[0];
                          })()}
                        </td>
                        <td style={{ 
                          color: '#475569', 
                          whiteSpace: 'normal', 
                          overflowWrap: 'break-word', 
                          wordBreak: 'break-word',
                          textOverflow: 'ellipsis', 
                          maxWidth: '100%',
                          fontSize: '12px'
                        }}>
                          {inv.description || '-'}
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }}>
                          {inv.invoice_number || `#${inv.invoice_id}`}
                        </td>
                        <td style={{ fontSize: 11, color: '#64748b' }}>
                          {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-')}
                        </td>
                        <td className="amount" style={{ fontSize: '13px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                          ₱{parseFloat(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span className="status-badge" style={{ background: statusBg, color: statusColor }}>
                              {status}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => { setActiveInvoice(inv); setShowInvoiceModal(true); }}
                              title="View Invoice"
                            >
                              <FaEye size={12} />
                              View
                            </button>
                          </div>
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
    </div>
    {/* Invoice Modal */}
    {showInvoiceModal && activeInvoice && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>DB</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Davao Blue Eagles Marching Band</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Matina Crossing, Davao City</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Invoice</div>
              <div style={{ marginTop: 4, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>#{activeInvoice.invoice_number || activeInvoice.invoice_id}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{activeInvoice.issue_date ? new Date(activeInvoice.issue_date).toLocaleDateString() : (activeInvoice.created_at ? new Date(activeInvoice.created_at).toLocaleDateString() : '-')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={getBadgeStyle(activeInvoice.status)}>{(activeInvoice.status || '').charAt(0).toUpperCase() + (activeInvoice.status || '').slice(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div id="printable-invoice" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Bill To</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>
                  {(() => { const u = userDetails[activeInvoice.user_id]; if (u && (u.firstName || u.lastName)) return `${u.firstName || ''} ${u.lastName || ''}`.trim(); if (u && u.email) return u.email; return activeInvoice.user_email || activeInvoice.userId || activeInvoice.user_id; })()}
                </div>
                <div style={{ marginTop: 6, color: '#374151' }}>{activeInvoice.description || '-'}</div>
              </div>

              <div style={{ width: 240, borderLeft: '1px dashed #eef2f7', paddingLeft: 18 }}>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Invoice Summary</div>
                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
                  <div style={{ color: '#6b7280' }}>Invoice Date</div><div style={{ textAlign: 'right' }}>{new Date(activeInvoice.created_at).toLocaleDateString()}</div>
                  <div style={{ color: '#6b7280' }}>Due Date</div><div style={{ textAlign: 'right' }}>{activeInvoice.due_date ? new Date(activeInvoice.due_date).toLocaleDateString() : '-'}</div>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: 18 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #eef2f7' }}>
                    <th style={{ padding: '12px 8px', fontSize: 13, color: '#374151' }}>Description</th>
                    <th style={{ padding: '12px 8px', width: 80, textAlign: 'right', fontSize: 13, color: '#374151' }}>Qty</th>
                    <th style={{ padding: '12px 8px', width: 120, textAlign: 'right', fontSize: 13, color: '#374151' }}>Unit</th>
                    <th style={{ padding: '12px 8px', width: 160, textAlign: 'right', fontSize: 13, color: '#374151' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // invoice items fallback
                    const items = activeInvoice.items && activeInvoice.items.length ? activeInvoice.items : [{ description: activeInvoice.description || 'Service', qty: 1, unit: 'pcs', amount: parseFloat(activeInvoice.amount || 0) }];
                    return items.map((it, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f6f9' }}>
                        <td style={{ padding: '12px 8px', color: '#374151' }}>{it.description || it.name}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#374151' }}>{it.qty || 1}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#374151' }}>{it.unit || it.unit_of_measure || '-'}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#065f46' }}>₱{parseFloat(it.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <div style={{ width: 300 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, fontSize: 13 }}>
                  <div style={{ color: '#6b7280' }}>Subtotal</div><div style={{ textAlign: 'right' }}>₱{parseFloat(activeInvoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div style={{ color: '#6b7280' }}>Discount</div><div style={{ textAlign: 'right' }}>{activeInvoice.discount ? `₱${parseFloat(activeInvoice.discount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}</div>
                  <div style={{ color: '#6b7280' }}>Tax</div><div style={{ textAlign: 'right' }}>{activeInvoice.tax ? `₱${parseFloat(activeInvoice.tax).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}</div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 700, fontSize: 14 }}>Total</div><div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, textAlign: 'right', fontWeight: 700, fontSize: 14 }}>₱{parseFloat(activeInvoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {activeInvoice.notes && (
              <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Notes</div>
                <div style={{ marginTop: 6, color: '#374151', fontSize: 12 }}>{activeInvoice.notes || activeInvoice.description || 'No additional notes.'}</div>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8, position: 'sticky', bottom: 0, background: '#fff' }}>
            <button onClick={() => { window.print(); }} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>Print</button>
            <button onClick={() => setShowInvoiceModal(false)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 12 }}>Close</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default Invoice;