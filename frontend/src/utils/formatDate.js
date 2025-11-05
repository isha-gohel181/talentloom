/**
 * Format a date to a human-readable string
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Unknown';

  const now = new Date();
  const dateObj = new Date(date);
  const diffInMs = now - dateObj;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Less than 1 minute ago
  if (diffInMinutes < 1) {
    return 'just now';
  }

  // Less than 1 hour ago
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Less than 24 hours ago
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Less than 7 days ago
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // More than 7 days ago, show actual date
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format a date to show only the date part (no time)
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string (e.g., "Dec 25, 2023")
 */
export const formatDateOnly = (date) => {
  if (!date) return 'Unknown';

  const dateObj = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format a date to show relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';

  const now = new Date();
  const dateObj = new Date(date);
  const diffInMs = now - dateObj;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${diffInYears}y ago`;
};
