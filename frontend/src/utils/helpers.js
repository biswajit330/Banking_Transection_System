/**
 * Utility functions for Banking Transaction System
 */

export function formatCurrency(amount, currency = 'INR') {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  const curr = currency || 'INR';
  const locale = curr === 'INR' ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateIdempotencyKey() {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `tx_idem_${timestamp}_${randomPart}`;
}

export function truncateId(id, len = 8) {
  if (!id) return '';
  const str = String(id);
  if (str.length <= len) return str;
  return `${str.substring(0, len)}...`;
}
