// src/utils/validators.js
import { HEXIE_CATEGORIES, REGEX_PATTERNS } from '../config/constants.js';

/**
 * Validate hexie data
 * @param {Object} data - Hexie data to validate
 * @throws {Error} Validation error
 * @returns {boolean} Validation result
 */
export function validateHexieData(data) {
  if (!data) {
    throw new Error('Hexie data is required');
  }

  // Required fields check
  const requiredFields = ['title', 'category', 'summary'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  // Title validation
  if (data.title.length < 3 || data.title.length > 50) {
    throw new Error('Title must be between 3 and 50 characters');
  }

  // Category validation
  const validCategories = Object.values(HEXIE_CATEGORIES).map(cat => cat.id);
  if (!validCategories.includes(data.category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  // Summary validation
  if (data.summary.length < 10 || data.summary.length > 200) {
    throw new Error('Summary must be between 10 and 200 characters');
  }

  // Details validation (if provided)
  if (data.details && data.details.length > 1000) {
    throw new Error('Details must be less than 1000 characters');
  }

  // Reference URL validation (if provided)
  if (data.reference && !REGEX_PATTERNS.URL.test(data.reference)) {
    throw new Error('Reference must be a valid URL');
  }

  // Tags validation (if provided)
  if (data.tags && Array.isArray(data.tags)) {
    if (data.tags.length > 10) {
      throw new Error('Maximum of 10 tags allowed');
    }
    
    for (const tag of data.tags) {
      if (!REGEX_PATTERNS.TAG.test(tag)) {
        throw new Error('Tags must contain only letters, numbers, hyphens and underscores (1-20 characters)');
      }
    }
  }

  return true;
}

/**
 * Validate subscription data
 * @param {Object} data - Subscription data
 * @throws {Error} Validation error
 * @returns {boolean} Validation result
 */
export function validateSubscriptionData(data) {
  if (!data) {
    throw new Error('Subscription data is required');
  }

  // Required fields
  const requiredFields = ['planId'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  return true;
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Validation result
 */
export function validateEmail(email) {
  return REGEX_PATTERNS.EMAIL.test(email);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Validation result
 */
export function validateURL(url) {
  return REGEX_PATTERNS.URL.test(url);
}