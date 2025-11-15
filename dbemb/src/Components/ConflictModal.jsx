import React from 'react';
import { FaExclamationTriangle, FaTimes, FaEnvelope, FaClock, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const ConflictModal = ({ open, conflicts = [], onClose, onView }) => {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '672px',
        maxHeight: '90vh',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f3f4f6',
          background: 'linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              flexShrink: 0,
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)'
            }}>
              <FaExclamationTriangle style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                Scheduling Conflict Detected
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#4b5563',
                lineHeight: '1.5',
                margin: 0
              }}>
                This booking overlaps with {conflicts.length} existing {conflicts.length === 1 ? 'appointment' : 'appointments'}. Please review and resolve before approving.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                flexShrink: 0,
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaTimes style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px'
        }}>
          {conflicts.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 0',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <FaExclamationTriangle style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
              </div>
              <p style={{ color: '#6b7280', margin: 0 }}>No conflict details available</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conflicts.map((c, idx) => {
                const name = c.customer_name || c.customerName || c.customer || 'Unknown Customer';
                const service = c.service || c.title || 'Untitled Service';
                const date = c.date || c.bookingDate || '';
                const start = c.start_time || c.startTime || '';
                const end = c.end_time || c.endTime || '';
                const location = c.location || '';
                const bid = c.bookingId || c.booking_id || c.id || null;

                return (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fed7aa';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Accent bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'linear-gradient(180deg, #f97316 0%, #dc2626 100%)'
                    }} />
                    
                    <div style={{ paddingLeft: '20px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontWeight: 600,
                            color: '#111827',
                            fontSize: '18px',
                            margin: '0 0 4px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {name}
                          </h3>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            background: '#ffedd5',
                            color: '#c2410c',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}>
                            {service}
                          </div>
                        </div>
                      </div>

                      {/* Details grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                          <FaCalendarAlt style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                          <span style={{ fontWeight: 500 }}>{date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                          <FaClock style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                          <span>{start} — {end}</span>
                        </div>
                        {location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                            <FaMapMarkerAlt style={{ width: '16px', height: '16px', color: '#9ca3af', flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{location}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 12px',
                              background: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#374151',
                              textDecoration: 'none',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f9fafb';
                              e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                          >
                            <FaEnvelope style={{ width: '16px', height: '16px' }} />
                            Contact
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f3f4f6',
          background: 'rgba(249, 250, 251, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Resolve conflicts before approving this booking
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;