import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaCheckCircle, FaTimes } from 'react-icons/fa';

const TestPaymentGateway = ({ amount, bookingDetails, onSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    if (cleanCardNumber === '4111111111111111' || cleanCardNumber === '4242424242424242') {
      setProcessing(false);
      onSuccess({
        transactionId: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount,
        method: 'Credit Card (Test)',
        cardLast4: cleanCardNumber.slice(-4),
        cardName,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    } else if (cleanCardNumber === '4000000000000002') {
      setProcessing(false);
      setError('Card declined. Please try another card.');
    } else if (cleanCardNumber === '4000000000009995') {
      setProcessing(false);
      setError('Insufficient funds. Please try another card.');
    } else {
      setProcessing(false);
      setError('Invalid card number. Use test cards: 4111111111111111 or 4242424242424242');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 500,
        width: '100%',
        padding: 32,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <FaLock style={{ fontSize: 40, color: '#10b981', marginBottom: 12 }} />
          <h2 style={{ margin: 0, fontSize: 24, color: '#0f172a', fontWeight: 700 }}>
            Secure Payment Gateway
          </h2>
          <div style={{
            marginTop: 8,
            padding: '6px 12px',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: 6,
            display: 'inline-block'
          }}>
            <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>TEST MODE</span>
          </div>
          <p style={{ margin: '12px 0 0 0', color: '#64748b', fontSize: 14 }}>
            Amount to pay: <strong style={{ fontSize: 24, color: '#0ea5e9' }}>{amount.toLocaleString()}</strong>
          </p>
          {bookingDetails && (
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 12 }}>
              {bookingDetails.service} - {bookingDetails.date}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            marginBottom: 16,
            padding: 12,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#dc2626',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FaTimes />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Card Number *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  if (formatted.replace(/\s/g, '').length <= 16) {
                    setCardNumber(formatted);
                  }
                }}
                placeholder="4111 1111 1111 1111"
                required
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <FaCreditCard style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: 20
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Success: 4111111111111111 or 4242424242424242 | Declined: 4000000000000002
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Cardholder Name *
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="JOHN DOE"
              required
              style={{
                width: '100%',
                padding: 12,
                border: '2px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 16,
                boxSizing: 'border-box',
                textTransform: 'uppercase',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Expiry Date *
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => {
                  const formatted = formatExpiry(e.target.value);
                  if (formatted.replace(/\D/g, '').length <= 4) {
                    setExpiry(formatted);
                  }
                }}
                placeholder="MM/YY"
                required
                style={{
                  width: '100%',
                  padding: 12,
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>
                CVV *
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 3) {
                    setCvv(value);
                  }
                }}
                placeholder="123"
                required
                style={{
                  width: '100%',
                  padding: 12,
                  border: '2px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              style={{
                flex: 1,
                padding: 14,
                border: '2px solid #e2e8f0',
                background: 'white',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                color: '#64748b',
                cursor: processing ? 'not-allowed' : 'pointer',
                opacity: processing ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              style={{
                flex: 2,
                padding: 14,
                border: 'none',
                background: processing ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                color: 'white',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {processing ? 'Processing...' : 'Pay' }
            </button>
          </div>
        </form>

        <div style={{
          marginTop: 20,
          padding: 12,
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 8,
          fontSize: 12,
          color: '#166534',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <FaCheckCircle />
          <span>This is a TEST payment gateway. No real transactions will be processed.</span>
        </div>
      </div>
    </div>
  );
};

export default TestPaymentGateway;
