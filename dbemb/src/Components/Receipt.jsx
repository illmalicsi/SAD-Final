import React from 'react';

// Props:
// - receipt: object containing all receipt data (see README usage below)
// - onClose: optional function when closing the receipt view
// - printable: optional boolean (if true will auto-open print dialog)

const Receipt = ({ receipt = {}, onClose, printable = false }) => {
  const company = receipt.company || {
    name: 'Espana Matina Band',
    address: '123 Music Ave, Manila, Philippines',
    phone: '+63 912 345 6789',
    email: 'info@espanamatina.ph',
    website: 'https://espanamatina.ph'
  };

  const r = receipt; // shorthand

  const formatMoney = (v) => {
    const n = typeof v === 'number' ? v : parseFloat(v || 0);
    return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const receiptType = (r.type || 'full').toLowerCase(); // 'down' or 'full'

  React.useEffect(() => {
    if (printable) {
      setTimeout(() => window.print(), 250);
    }
  }, [printable]);

  const qrData = r.qrLink || (r.invoiceLink || window.location.href);
  const qrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=${encodeURIComponent(qrData || '')}`;

  const headerBadgeStyle = receiptType === 'down' ? { background: '#fef08a', color: '#92400e' } : { background: '#bbf7d0', color: '#065f46' };

  return (
    <div style={{ fontFamily: 'Inter, Roboto, -apple-system, sans-serif', color: '#0f172a', padding: 20 }}>
      <style>{`
        @media print { .no-print { display: none; } .receipt-card { box-shadow: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="receipt-card" style={{ maxWidth: 880, margin: '0 auto', background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 6px 30px rgba(2,6,23,0.12)', position: 'relative' }}>
        {/* Watermark */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, fontWeight: 800, transform: 'rotate(-20deg)', color: '#000' }}>OFFICIAL RECEIPT</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 88, height: 88, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(2,6,23,0.06)' }}>
              {/* Company logo placeholder */}
              {company.logo ? <img src={company.logo} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <div style={{ fontWeight: 700, color: '#0f172a' }}>{company.name.split(' ').slice(0,2).map(s=>s[0]).join('')}</div>}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{company.name}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>{company.address}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{company.phone} • {company.email}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{company.website}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>INSTRUMENT RENTAL RECEIPT</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 8, fontWeight: 700, ...headerBadgeStyle }}>{receiptType === 'down' ? 'DOWNPAYMENT' : 'FULL PAYMENT'}</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#475569' }}>
              <div><strong>Receipt #:</strong> {r.receiptNumber || r.id || 'RR-XXXX-000'}</div>
              <div><strong>Issue Date:</strong> {r.issueDate || new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>

        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eef2ff' }} />

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Customer Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><strong>Name:</strong> {r.customer?.name || r.user?.firstName + ' ' + r.user?.lastName || '—'}</div>
              <div><strong>Customer ID:</strong> {r.customer?.id || r.user?.id || '—'}</div>
              <div><strong>Email:</strong> {r.customer?.email || r.user?.email || '—'}</div>
              <div><strong>Phone:</strong> {r.customer?.phone || '—'}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {r.customer?.address || r.user?.address || '—'}</div>
            </div>
          </div>

          <div style={{ width: 180, textAlign: 'center' }}>
            <img src={qrSrc} alt="qr" style={{ width: 140, height: 140 }} />
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>Scan to view details</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Rental Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div><strong>Request ID:</strong> {r.rental?.requestId || r.rentalRequestId || 'REQ-XXXX-000'}</div>
            <div><strong>Instrument:</strong> {r.rental?.instrumentName || r.instrumentName || '—'}</div>
            <div><strong>Category:</strong> {r.rental?.category || '—'}</div>
            <div><strong>Serial No.:</strong> {Array.isArray(r.rental?.serials) ? r.rental.serials.join(', ') : (r.rental?.serial || '—')}</div>
            <div><strong>Quantity:</strong> {r.rental?.quantity || r.quantity || 1}</div>
            <div>
              <strong>Rental Period:</strong>
              <div style={{ fontSize: 12, color: '#475569' }}>{r.rental?.startDate || '—'} — {r.rental?.endDate || '—'}</div>
            </div>
            <div><strong>Duration:</strong> {r.rental?.duration || r.duration || '—'} days</div>
            <div><strong>Daily Rate:</strong> {formatMoney(r.rental?.dailyRate || r.dailyRate || 0)}</div>
            <div /><div /><div />
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Financial Breakdown</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ padding: 8, color: '#475569' }}>Instrument Rental Fee</td>
                  <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>{formatMoney(r.charges?.rentalFee || r.rentalFee || 0)}</td>
                </tr>
                <tr>
                  <td style={{ padding: 8, color: '#475569' }}>Subtotal</td>
                  <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>{formatMoney(r.charges?.subtotal || r.subtotal || 0)}</td>
                </tr>
                <tr>
                  <td style={{ padding: 8, color: '#475569' }}>Taxes / Fees</td>
                  <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>{formatMoney(r.charges?.taxes || r.taxes || 0)}</td>
                </tr>
                <tr style={{ borderTop: '1px dashed #e6edf3' }}>
                  <td style={{ padding: 8, fontWeight: 800 }}>Total</td>
                  <td style={{ padding: 8, textAlign: 'right', fontWeight: 800 }}>{formatMoney(r.total || r.charges?.total || 0)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 12, fontSize: 13 }}>
              {receiptType === 'down' ? (
                <div>
                  <div><strong>Required Downpayment (50%):</strong> {formatMoney((r.total || 0) * 0.5)}</div>
                  <div><strong>Amount Paid Today:</strong> {formatMoney(r.paid || r.amountPaid || 0)} { (r.paid || r.amountPaid) ? '✓' : '' }</div>
                  <div><strong>Remaining Balance:</strong> {formatMoney((r.total || 0) - (r.paid || r.amountPaid || 0))}</div>
                  <div><strong>Balance Due Date:</strong> {r.balanceDueDate || r.dueDate || 'Before rental start'}</div>
                  <div style={{ marginTop: 8, fontWeight: 800, color: '#92400e' }}>Status: PARTIALLY PAID - DOWNPAYMENT RECEIVED</div>
                </div>
              ) : (
                <div>
                  <div><strong>Total Amount:</strong> {formatMoney(r.total || 0)}</div>
                  <div><strong>Amount Paid Today:</strong> {formatMoney(r.paid || r.amountPaid || r.total || 0)} ✓</div>
                  <div><strong>Remaining Balance:</strong> {formatMoney(Math.max(0, (r.total || 0) - (r.paid || r.amountPaid || r.total || 0)))}</div>
                  <div style={{ marginTop: 8, fontWeight: 800, color: '#065f46' }}>Status: FULLY PAID</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ width: 300 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Payment Information</div>
            <div style={{ fontSize: 13 }}>
              <div><strong>Payment Method:</strong> {r.payment?.method || r.paymentMethod || '—'}</div>
              <div><strong>Transaction Ref:</strong> {r.payment?.reference || r.transactionRef || '—'}</div>
              <div><strong>Payment Date:</strong> {r.payment?.date || r.paymentDate || r.issueDate || '—'}</div>
              <div><strong>Processed By:</strong> {r.processedBy || '—'}</div>
              <div><strong>Invoice #:</strong> {r.invoiceNumber || r.invoice || '—'}</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Thank you for choosing Espana Matina Band! We look forward to serving you.</div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Receipt: {r.receiptNumber || r.id || 'RR-XXXX'}</div>
                <svg width="220" height="40" style={{ display: 'block' }}>
                  <rect x="0" y="0" width="220" height="40" fill="#fff" />
                  <text x="8" y="24" fontSize="14" fill="#0f172a">{r.receiptNumber || r.id || 'RR-XXXX-000'}</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>This is a computer-generated receipt. No signature required for digital copies.</div>
          <div className="no-print">
            {onClose && <button onClick={onClose} style={{ marginRight: 8 }} className="btn btn-outline">Close</button>}
            <button onClick={() => window.print()} className="btn btn-primary">Print</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;

/*
Usage:

Import and render <Receipt receipt={receiptData} onClose={()=>setShow(false)} printable={false} />

Expected receiptData structure (example):
{
  id: 'RR-2025-00123',
  receiptNumber: 'RR-2025-00123',
  issueDate: '2025-11-14 10:23',
  type: 'down' | 'full',
  company: { name, address, phone, email, website, logo },
  customer: { id, name, email, phone, address },
  rental: { requestId, instrumentName, category, serials: [], quantity, startDate, endDate, duration, dailyRate },
  charges: { rentalFee, subtotal, taxes, total },
  total: 12345,
  paid: 6172.5,
  amountPaid: 6172.5,
  balanceDueDate: '2025-12-01',
  payment: { method: 'cash', reference: 'N/A', date: '2025-11-14 10:20' },
  processedBy: 'Admin User',
  invoiceLink: 'https://app/..',
}

*/
