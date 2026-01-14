import { format, parseISO, differenceInDays } from 'date-fns';

// Format date
export const formatDate = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};
// utils/helpers.js
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
// Format time
export const formatTime = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'hh:mm a');
  } catch {
    return 'Invalid time';
  }
};

// Calculate days left
export const daysLeft = (targetDate) => {
  try {
    const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
    const today = new Date();
    return differenceInDays(target, today);
  } catch {
    return 0;
  }
};

// Calculate progress percentage
export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};