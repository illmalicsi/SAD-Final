import React from 'react';

const ModalCard = ({ open, title, message, onClose, children }) => {
  if (!open) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    maxWidth: 560,
    width: '90%',
    boxShadow: '0 20px 60px rgba(2,6,23,0.25)'
  };

  const titleStyle = { margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' };
  const messageStyle = { marginTop: 10, fontSize: 14, color: '#475569', lineHeight: 1.5 };
  const actions = { marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 8 };
  const okStyle = { padding: '10px 14px', background: '#0b62d6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={cardStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <div style={messageStyle}>{message}</div>
        {children}
        <div style={actions}>
          <button style={okStyle} onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default ModalCard;
