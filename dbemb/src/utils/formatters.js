export function formatCurrency(value, { currency = 'PHP', minimumFractionDigits = 2 } = {}) {
  const num = Number(value);
  if (!isFinite(num)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency, currencyDisplay: 'symbol', minimumFractionDigits }).format(num);
}

export default formatCurrency;
