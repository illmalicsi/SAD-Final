import React from 'react';
import { FaChevronDown } from '../icons/fa';

// Reusable styled select with a consistent chevron icon
const StyledSelect = React.forwardRef(({ children, style, iconStyle, containerStyle, className, ...props }, ref) => {
  const selectBase = {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #e6eefc',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    paddingRight: '44px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const containerBase = {
    position: 'relative',
    width: '100%'
  };

  const iconBase = {
    position: 'absolute',
    right: 18,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#334155',
    fontSize: 14
  };

  return (
    <div style={{ ...containerBase, ...(containerStyle || {}) }} className={className}>
      <select ref={ref} style={{ ...selectBase, ...(style || {}) }} {...props}>
        {children}
      </select>
      <FaChevronDown style={{ ...iconBase, ...(iconStyle || {}) }} />
    </div>
  );
});

export default StyledSelect;
