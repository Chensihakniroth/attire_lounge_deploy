/**
 * Format a number as currency (USD)
 * @param {number} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format a date string to readable format
 * @param {string} dateStr - ISO date string
 * @param {Object} options - Optional format config
 * @param {string} options.fallback - Fallback string for invalid dates (default: '')
 * @param {'long'|'short'} options.month - Month format (default: 'long')
 * @returns {string}
 */
export const formatDate = (dateStr, options = {}) => {
  const { fallback = '', month = 'long' } = options;
  if (!dateStr) return fallback;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month,
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Format audit log changes into readable text
 * @param {Object} changes - Object with before/after values
 * @returns {string}
 */
export const formatChanges = (changes) => {
  if (!changes || typeof changes !== 'object') return 'No changes recorded';
  return Object.entries(changes)
    .map(([key, value]) => {
      const before = value?.before ?? 'N/A';
      const after = value?.after ?? 'N/A';
      return `${key}: "${before}" → "${after}"`;
    })
    .join('\n');
};

/**
 * Format a time string (HH:mm) to readable format (h:mm A)
 * @param {string} timeStr
 * @returns {string}
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeStr;
  }
};
