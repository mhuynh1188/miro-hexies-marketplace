// src/utils/helpers.js
import { STORAGE_KEYS } from '../config/constants.js';

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @param {string} format - Date format type
 * @returns {string} Formatted date
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    withTime: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
  };
  
  return date.toLocaleDateString(undefined, options[format] || options.short);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get storage item with expiration check
 * @param {string} key - Storage key
 * @returns {any|null} Storage value or null if expired/missing
 */
export function getStorageItem(key) {
  const value = localStorage.getItem(key);
  if (!value) return null;
  
  try {
    const item = JSON.parse(value);
    
    // Check expiration if exists
    if (item.expiry && new Date(item.expiry) < new Date()) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (error) {
    // Return raw value if not JSON
    return value;
  }
}

/**
 * Set storage item with optional expiration
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} expiryHours - Hours until expiry (optional)
 */
export function setStorageItem(key, value, expiryHours = 0) {
  if (expiryHours > 0) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);
    
    localStorage.setItem(key, JSON.stringify({
      value,
      expiry: expiryDate.toISOString()
    }));
  } else {
    // Store raw value if no expiration
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }
}

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'hexie') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Get user preferences from storage
 * @returns {Object} User preferences
 */
export function getUserPreferences() {
  return getStorageItem(STORAGE_KEYS.PREFERENCES) || {};
}

/**
 * Save user preferences to storage
 * @param {Object} preferences - User preferences
 */
export function saveUserPreferences(preferences) {
  const current = getUserPreferences();
  setStorageItem(STORAGE_KEYS.PREFERENCES, {
    ...current,
    ...preferences
  });
}

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @returns {string} Error message
 */
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    // Standard HTTP error
    switch (error.response.status) {
      case 401: return 'Authentication required. Please log in.';
      case 403: return 'You don\'t have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'Server error. Please try again later.';
      default: return `Error: ${error.response.status}`;
    }
  }
  
  if (error.request) {
    // No response received
    return 'Network error. Please check your connection and try again.';
  }
  
  // Everything else
  return error.message || 'An unknown error occurred.';
}