// src/data/api.js
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../config/constants.js';

class ApiService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? API_CONFIG.PROD_URL 
      : API_CONFIG.DEV_URL;
    this.authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.authToken = token;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Remove authentication token
   */
  removeAuthToken() {
    this.authToken = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Make authenticated API call
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Set up headers with authentication if available
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: API_CONFIG.TIMEOUT
      });
      
      // Check for response errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP Error ${response.status}`);
      }

      // Parse JSON response
      return response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : await response.text();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      if (error.message.includes('401')) {
        // Handle unauthorized access by clearing token
        this.removeAuthToken();
        throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
      }
      
      if (error.message.includes('403')) {
        throw new Error(ERROR_MESSAGES.SUBSCRIPTION_REQUIRED);
      }
      
      if (error.message.includes('429')) {
        throw new Error(ERROR_MESSAGES.RATE_LIMITED);
      }
      
      throw error;
    }
  }

  /**
   * Authenticate with Miro
   * @param {Object} miroUserData - Miro user data
   * @returns {Promise<Object>} - Authentication response
   */
  async authenticateWithMiro(miroUserData) {
    const response = await this.request('/auth/miro', {
      method: 'POST',
      body: JSON.stringify({
        miroUserId: miroUserData.id,
        email: miroUserData.email,
        name: miroUserData.name
      })
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * Verify authentication token
   * @returns {Promise<Object>} - User data and subscription status
   */
  async verifyToken() {
    return this.request('/auth/verify');
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile() {
    return this.request('/users/profile');
  }

  /**
   * Get subscription status
   * @returns {Promise<Object>} - Subscription data
   */
  async getSubscription() {
    return this.request('/subscriptions/current');
  }

  /**
   * Get hexies library
   * @param {string|null} category - Category filter
   * @param {boolean} includeUserHexies - Include user created hexies
   * @returns {Promise<Array>} - List of hexies
   */
  async getHexies(category = null, includeUserHexies = true) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (includeUserHexies) params.append('includeUser', 'true');
    
    return this.request(`/hexies?${params}`);
  }

  /**
   * Create a new hexie
   * @param {Object} hexieData - Hexie data
   * @returns {Promise<Object>} - Created hexie
   */
  async createHexie(hexieData) {
    return this.request('/hexies', {
      method: 'POST',
      body: JSON.stringify(hexieData)
    });
  }

  /**
   * Update an existing hexie
   * @param {string} hexieId - Hexie ID
   * @param {Object} hexieData - Updated hexie data
   * @returns {Promise<Object>} - Updated hexie
   */
  async updateHexie(hexieId, hexieData) {
    return this.request(`/hexies/${hexieId}`, {
      method: 'PUT',
      body: JSON.stringify(hexieData)
    });
  }

  /**
   * Delete hexie
   * @param {string} hexieId - Hexie ID
   * @returns {Promise<void>}
   */
  async deleteHexie(hexieId) {
    return this.request(`/hexies/${hexieId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Create checkout session
   * @param {string} planId - Subscription plan ID
   * @returns {Promise<Object>} - Checkout session data
   */
  async createCheckoutSession(planId) {
    return this.request('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }

  /**
   * Track hexie usage
   * @param {string} hexieId - Hexie ID
   * @param {string} action - Action performed
   * @returns {Promise<void>}
   */
  async trackHexieUsage(hexieId, action) {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        hexieId,
        action,
        timestamp: new Date().toISOString()
      })
    });
  }

  /**
   * Get usage analytics
   * @returns {Promise<Object>} - Usage data
   */
  async getAnalytics() {
    return this.request('/analytics');
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;