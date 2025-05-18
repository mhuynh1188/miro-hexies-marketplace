// src/data/api-service.js
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Centralized API service for all backend communications
 * Implements secure request handling, error management,
 * and authentication headers
 */
class ApiService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? API_CONFIG.PRODUCTION.BASE_URL 
      : API_CONFIG.DEVELOPMENT.BASE_URL;
    
    this.authToken = null;
    this.pendingRequests = new Map();
    this.retryQueue = [];
    
    // Get token from storage if exists
    this.initializeFromStorage();
  }

  /**
   * Initialize from storage
   */
  initializeFromStorage() {
    try {
      const tokenData = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (tokenData) {
        const { token } = JSON.parse(tokenData);
        this.authToken = token;
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
    }
  }

  /**
   * Set auth token for API requests
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Remove auth token
   */
  removeAuthToken() {
    this.authToken = null;
  }

  /**
   * Check if authenticated
   * @returns {boolean} Is authenticated with token
   */
  isAuthenticated() {
    return !!this.authToken;
  }

  /**
   * Make a secure API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}, retryCount = 0) {
    // Calculate full URL
    const url = this.getFullUrl(endpoint);
    
    // Request ID for deduplication
    const requestId = `${options.method || 'GET'}-${url}-${Date.now()}`;
    
    // If identical request is pending, return that promise
    if (this.pendingRequests.has(requestId)) {
      return this.pendingRequests.get(requestId);
    }
    
    // Prepare headers
    const headers = this.prepareHeaders(options.headers);
    
    // Prepare fetch options
    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      credentials: 'same-origin',
      ...options
    };
    
    // Add body for non-GET requests
    if (fetchOptions.method !== 'GET' && options.body) {
      fetchOptions.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
    }
    
    // Create request promise
    const requestPromise = new Promise(async (resolve, reject) => {
      try {
        // Add request timeout
        const timeoutId = setTimeout(() => {
          this.pendingRequests.delete(requestId);
          reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
        }, API_CONFIG.TIMEOUT);
        
        // Make request
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        // Handle response
        if (!response.ok) {
          // Handle specific status codes
          switch (response.status) {
            case 401:
              this.handleUnauthorized();
              reject(new Error(ERROR_MESSAGES.AUTH_REQUIRED));
              return;
            case 403:
              reject(new Error(ERROR_MESSAGES.PERMISSION_DENIED));
              return;
            case 429:
              if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
                // Add to retry queue with exponential backoff
                const delay = this.calculateBackoff(retryCount);
                setTimeout(() => {
                  this.request(endpoint, options, retryCount + 1)
                    .then(resolve)
                    .catch(reject);
                }, delay);
                return;
              }
              reject(new Error(ERROR_MESSAGES.RATE_LIMITED));
              return;
            default:
              // Try to parse error message from response
              try {
                const errorData = await response.json();
                reject(new Error(errorData.message || ERROR_MESSAGES.GENERIC_ERROR));
              } catch (e) {
                reject(new Error(`HTTP Error: ${response.status}`));
              }
              return;
          }
        }
        
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          resolve(data);
        } else {
          const text = await response.text();
          resolve(text || {});
        }
      } catch (error) {
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
        
        // Handle fetch errors (network issues)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
          return;
        }
        
        reject(error);
      }
    });
    
    // Store in pending requests
    this.pendingRequests.set(requestId, requestPromise);
    
    return requestPromise;
  }

  /**
   * Get full URL for endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} Full URL
   */
  getFullUrl(endpoint) {
    // Handle absolute URLs
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') 
      ? endpoint 
      : `/${endpoint}`;
    
    return `${this.baseUrl}${normalizedEndpoint}`;
  }

  /**
   * Prepare request headers
   * @param {Object} customHeaders - Custom headers
   * @returns {Object} Complete headers
   */
  prepareHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };
    
    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Calculate exponential backoff delay
   * @param {number} attempt - Current attempt
   * @returns {number} Delay in ms
   */
  calculateBackoff(attempt) {
    const baseDelay = API_CONFIG.RETRY_DELAY;
    const maxDelay = 30000; // 30 seconds
    
    // Calculate exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.5 + 0.5; // Between 0.5 and 1
    
    return Math.min(exponentialDelay * jitter, maxDelay);
  }

  /**
   * Handle unauthorized responses
   */
  handleUnauthorized() {
    // Trigger auth event for app to handle
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    
    // Clear token
    this.removeAuthToken();
  }

  // Authentication endpoints
  
  /**
   * Authenticate with Miro user data
   * @param {Object} miroUserData - Miro user data
   * @returns {Promise<Object>} Auth response
   */
  async authenticateWithMiro(miroUserData) {
    return this.request('/auth/miro', {
      method: 'POST',
      body: miroUserData
    });
  }

  /**
   * Verify current token
   * @returns {Promise<Object>} Verification response
   */
  async verifyToken() {
    return this.request('/auth/verify');
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token
   */
  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST'
    });
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  // Hexie endpoints
  
  /**
   * Get all hexies
   * @param {string} category - Optional category filter
   * @param {boolean} includeUserHexies - Include user-created hexies
   * @returns {Promise<Array>} Hexies
   */
  async getHexies(category = null, includeUserHexies = true) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (includeUserHexies) params.append('includeUser', 'true');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/hexies${query}`);
  }

  /**
   * Create new hexie
   * @param {Object} hexieData - Hexie data
   * @returns {Promise<Object>} Created hexie
   */
  async createHexie(hexieData) {
    return this.request('/hexies', {
      method: 'POST',
      body: hexieData
    });
  }

  /**
   * Update hexie
   * @param {string} hexieId - Hexie ID
   * @param {Object} hexieData - Updated hexie data
   * @returns {Promise<Object>} Updated hexie
   */
  async updateHexie(hexieId, hexieData) {
    return this.request(`/hexies/${hexieId}`, {
      method: 'PUT',
      body: hexieData
    });
  }

  /**
   * Delete hexie
   * @param {string} hexieId - Hexie ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteHexie(hexieId) {
    return this.request(`/hexies/${hexieId}`, {
      method: 'DELETE'
    });
  }

  // Subscription endpoints
  
  /**
   * Get current subscription
   * @returns {Promise<Object>} Subscription data
   */
  async getSubscription() {
    return this.request('/subscriptions/current');
  }

  /**
   * Create checkout session
   * @param {string} planId - Plan ID
   * @returns {Promise<Object>} Checkout session
   */
  async createCheckoutSession(planId) {
    const returnUrl = window.location.href;
    
    return this.request('/subscriptions/checkout', {
      method: 'POST',
      body: {
        planId,
        successUrl: `${returnUrl}?checkout=success`,
        cancelUrl: `${returnUrl}?checkout=cancel`
      }
    });
  }

  /**
   * Verify payment
   * @param {string} sessionId - Checkout session ID
   * @returns {Promise<Object>} Verification response
   */
  async verifyPayment(sessionId) {
    return this.request('/subscriptions/verify', {
      method: 'POST',
      body: { sessionId }
    });
  }

  /**
   * Cancel subscription
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelSubscription() {
    return this.request('/subscriptions/cancel', {
      method: 'POST'
    });
  }

  // Analytics endpoints
  
  /**
   * Track event
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   * @returns {Promise<Object>} Tracking response
   */
  async trackEvent(eventName, properties = {}) {
    return this.request('/analytics/track', {
      method: 'POST',
      body: {
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      }
    });
  }

  /**
   * Get usage analytics
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/analytics${query}`);
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health check response
   */
  async healthCheck() {
    return this.request('/health');
  }
}

// Export as singleton
const apiService = new ApiService();
export default apiService;