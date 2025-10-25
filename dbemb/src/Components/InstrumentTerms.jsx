import React from 'react';

const InstrumentTerms = ({ acceptedTerms, setAcceptedTerms, user }) => {
  // Only show to non-member users (regular public renters)
  if (user && user.role && user.role !== 'user') return null;

  const containerStyle = {
    marginTop: 16,
    fontSize: 14,
    color: '#0f172a'
  };

  const checkboxStyle = {
    marginRight: 10,
    width: 18,
    height: 18,
    cursor: 'pointer',
    accentColor: '#0369a1'
  };

  const noticeStyle = { color: '#ef4444', fontSize: 12, marginTop: 8 };

  const termsBox = {
    marginTop: 12,
    maxHeight: 220,
    overflow: 'auto',
    padding: 14,
    background: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e6eef8',
    fontSize: 13,
    color: '#334155',
    boxSizing: 'border-box',
    lineHeight: 1.5
  };

  const olStyle = { marginTop: 8, paddingLeft: 20, listStylePosition: 'outside' };
  const ulStyle = { paddingLeft: 18, marginTop: 6 };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <input
          id="instrument-terms-checkbox"
          aria-label="Agree to Instrument Rental Terms and Policy"
          type="checkbox"
          checked={acceptedTerms}
          onChange={e => setAcceptedTerms(e.target.checked)}
          style={checkboxStyle}
        />
        <label htmlFor="instrument-terms-checkbox" style={{ fontWeight: 700, lineHeight: '18px' }}>
          I have read and agree to the Instrument Rental Terms and Policy <span style={{ color: '#ef4444' }}>*</span>
        </label>
      </div>

      {!acceptedTerms && (
        <div role="alert" style={noticeStyle}>You must agree to the rental terms and policy to proceed.</div>
      )}

      <div style={termsBox}>
        <strong>Instrument Rental Terms and Policy</strong>
        <ol style={olStyle}>
          <li><strong>Rental Eligibility</strong>
            <ul style={ulStyle}>
              <li>The renter must be at least 18 years old.</li>
              <li>A valid government-issued ID must be presented upon rental.</li>
              <li>A signed rental agreement and down/full payment are required before release.</li>
            </ul>
          </li>
          <li><strong>Rental Period</strong>
            <ul style={ulStyle}>
              <li>The rental period starts on the pickup date and ends on the agreed return date.</li>
              <li>Extensions must be requested at least 3 days before the due date and are subject to approval and additional fees.</li>
            </ul>
          </li>
          <li><strong>Rental Fees, Down Payment, and Payments</strong>
            <ul style={ulStyle}>
              <li>Rental fees are charged per instrument, per agreed term.</li>
              <li>A down payment of 50% is required upon booking or before pickup.</li>
              <li>The remaining balance must be paid in full upon returning the instrument.</li>
              <li>Payments are non-refundable once the instrument has been released.</li>
              <li>Accepted Payment Methods: Cash, GCash, or Bank Transfer.</li>
            </ul>
          </li>
          <li><strong>Pickup and Return</strong>
            <ul style={ulStyle}>
              <li>Instruments must be picked up and returned at the Davao Blue Eagles Marching Band bandroom, Sunrise Village, Matina Aplaya.</li>
              <li>The renter must inspect and confirm the instrument’s condition before signing the release form.</li>
              <li>Late returns will incur a ₱500 per day late fee.</li>
            </ul>
          </li>
          <li><strong>Care and Maintenance</strong>
            <ul style={ulStyle}>
              <li>The renter agrees to handle all instruments with care and keep them in good playing condition.</li>
              <li>Instruments must not be altered or repaired without approval.</li>
            </ul>
          </li>
          <li><strong>Damage, Loss, or Theft</strong>
            <ul style={ulStyle}>
              <li>The renter is fully responsible for any damage, loss, or theft during the rental period.</li>
            </ul>
          </li>
          <li><strong>Ownership & Liability</strong>
            <ul style={ulStyle}>
              <li>All rented instruments remain the property of the Davao Blue Eagles Marching Band.</li>
              <li>The renter assumes full responsibility for safe use; the band is not liable for injury or damage resulting from improper use.</li>
            </ul>
          </li>
          <li><strong>Termination</strong>
            <ul style={ulStyle}>
              <li>The band reserves the right to terminate the rental if terms are violated or payments are not completed.</li>
            </ul>
          </li>
          <li><strong>Agreement and Signature</strong>
            <ul style={ulStyle}>
              <li>By checking the box above, the renter acknowledges they have read, understood, and agree to comply with these terms.</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default InstrumentTerms;
