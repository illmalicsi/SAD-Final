
import React, { useEffect, useState } from 'react';
import { FaFileInvoiceDollar, FaEye, FaDownload } from 'react-icons/fa';
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
      background: st === 'paid' ? '#ecfdf5' : st === 'pending' ? '#fffbeb' : '#fff1f2',
      color: st === 'paid' ? '#047857' : st === 'pending' ? '#92400e' : '#b91c1c',
      padding: '6px 10px',
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 12,
      display: 'inline-block'
    };
  };


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
    <div style={{ padding: '28px', backgroundColor: '#f3f6fb', minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FaFileInvoiceDollar style={{ color: '#0ea5e9', fontSize: 28 }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Customer Invoices</h1>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Manage and review customer invoices</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 6px 18px rgba(16,24,40,0.04)', border: '1px solid #e6eef8' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Loading invoices...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#dc2626', padding: 24 }}>{error}</div>
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 28, fontStyle: 'italic' }}>No invoices found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <style>{`
                .invoices-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
                .invoices-table th { position: sticky; top: 0; background: linear-gradient(90deg,#f8fafc,#f1f5f9); backdrop-filter: blur(4px); z-index: 2; }
                .invoices-table th, .invoices-table td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #eef2f7; }
                .invoices-table thead th { font-size: 13px; color: #374151; font-weight: 700; letter-spacing: 0.6px; }
                .invoices-table tbody tr:hover { background: #fbfdff; }
                .amount { text-align: right; font-weight: 800; color: #065f46; }
                .actions { text-align: center; }
                /* Actions column layout */
                .actions-cell { display: flex; align-items: center; gap: 12px; justify-content: center; }
                .status-badge { padding: 6px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; display: inline-block; }
                .btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: none; font-weight: 700; }
                .btn .btn-label { display: inline-block; }
                .btn-primary { background: #0ea5e9; color: #fff; }
                .btn-outline { background: #fff; border: 1px solid #e6eef8; color: #0f172a; }
                .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(16,24,40,0.06); }
                /* Responsive: hide labels on narrow screens to save space */
                @media (max-width: 640px) {
                  .btn .btn-label { display: none; }
                  .invoices-table thead th:nth-child(4), .invoices-table td:nth-child(4) { text-align: right; }
                }
                @media (max-width: 900px) { .invoices-table { min-width: 900px; } }
              `}</style>

              <table className="invoices-table" style={{ width: '100%' }}>
                <colgroup>
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Description</th>
                    <th>Invoice #</th>
                    <th className="amount">Amount</th>
                    <th>Status</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .slice()
                    .sort((a, b) => Number(b.invoice_id || b.invoiceId || 0) - Number(a.invoice_id || a.invoiceId || 0))
                    .map((inv, idx) => {
                    const status = String(inv.status || '').toLowerCase();
                    const badgeStyle = getBadgeStyle(status);
                    return (
                      <tr key={inv.invoice_id}>
                        <td style={{ color: '#374151' }}>
                          {(() => {
                            const u = userDetails[inv.user_id];
                            if (u && (u.firstName || u.lastName)) return `${u.firstName || ''} ${u.lastName || ''}`.trim();
                            if (u && u.email) return u.email;
                            return inv.user_email || inv.userId || inv.user_id;
                          })()}
                        </td>
                        <td style={{ color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 520 }}>{inv.description || '-'}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>#{inv.invoice_id}</td>
                        <td className="amount">₱{parseFloat(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>
                          <span className="status-badge" style={badgeStyle}>{(inv.status || '').charAt(0).toUpperCase() + (inv.status || '').slice(1)}</span>
                        </td>
                        <td className="actions">
                          <div className="actions-cell">
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <button title="View" className="btn btn-primary" style={{ padding: '8px 10px' }} onClick={() => { setActiveInvoice(inv); setShowInvoiceModal(true); }}>
                                <FaEye />
                                <span className="btn-label">View</span>
                              </button>
                              <button title="Download" className="btn btn-outline" style={{ padding: '8px 10px' }}>
                                <FaDownload />
                                <span className="btn-label">Download</span>
                              </button>
                            </div>
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
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 980, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 60px rgba(2,6,23,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eef2f7' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20 }}>DB</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Davao Blue Eagles Music Studio</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Blk 12 Barangay XYZ, Davao City · (0917) 123-4567 · info@blueeagles.com</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Invoice</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>#{activeInvoice.invoice_id}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(activeInvoice.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <span style={getBadgeStyle(activeInvoice.status)}>{(activeInvoice.status || '').charAt(0).toUpperCase() + (activeInvoice.status || '').slice(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div id="printable-invoice" style={{ padding: 24 }}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 360 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <div style={{ color: '#6b7280' }}>Subtotal</div><div style={{ textAlign: 'right' }}>₱{parseFloat(activeInvoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div style={{ color: '#6b7280' }}>Discount</div><div style={{ textAlign: 'right' }}>{activeInvoice.discount ? `₱${parseFloat(activeInvoice.discount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}</div>
                  <div style={{ color: '#6b7280' }}>Tax</div><div style={{ textAlign: 'right' }}>{activeInvoice.tax ? `₱${parseFloat(activeInvoice.tax).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}</div>
                  <div style={{ borderTop: '1px solid #eef2f7', paddingTop: 10, fontWeight: 800 }}>Total</div><div style={{ borderTop: '1px solid #eef2f7', paddingTop: 10, textAlign: 'right', fontWeight: 800 }}>₱{parseFloat(activeInvoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22, borderTop: '1px solid #eef2f7', paddingTop: 12 }}>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Notes</div>
              <div style={{ marginTop: 8, color: '#374151' }}>{activeInvoice.notes || activeInvoice.description || 'No additional notes.'}</div>
            </div>
          </div>

          <div style={{ padding: '14px 24px', borderTop: '1px solid #eef2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>If you have questions about this invoice, contact us at info@blueeagles.com</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { window.print(); }} className="btn btn-primary" style={{ padding: '8px 12px' }}>Print</button>
              <button onClick={() => setShowInvoiceModal(false)} className="btn btn-outline" style={{ padding: '8px 12px' }}>Close</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default Invoice;
