// src/core/AuthenticationService.js
import { STORAGE_KEYS, ERROR_MESSAGES } from '../config/constants.js';
import apiService from '../data/api-service.js';

/**
 * Handles user authentication and subscription management
 * Follows 2025 security best practices with JWT tokens and secure storage
 */
class AuthenticationService {
  constructor() {
    this.isInitialized = false;
    this.isAuthenticated = false;
    this.miroUser = null;
    this.user = null;
    this.subscription = null;
    this.authToken = null;
    this.tokenExpiry = null;
    this.refreshTimer = null;
  }

  /**
   * Initialize authentication
   * @returns {Promise<boolean>} Authentication success
   */
  async initialize() {
    try {
      console.log('🔑 Initializing authentication service...');
      
      // Check for existing token
      const tokenData = this.getSecureToken();
      
      if (tokenData && tokenData.token && new Date(tokenData.expiry) > new Date()) {
        // Token exists and is not expired, verify with backend
        const isValid = await this.verifyToken(tokenData.token);
        if (isValid) {
          console.log('✅ Existing token verified');
          return true;
        }
      }
      
      // No valid token, authenticate with Miro
      return await this.authenticateWithMiro();
    } catch (error) {
      console.error('❌ Authentication error:', error);
      this.isAuthenticated = false;
      
      // For development only - create mock data to continue testing
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using mock authentication for development');
        return this.initializeMockAuth();
      }
      
      throw error;
    } finally {
      this.isInitialized = true;
    }
  }

  /**
   * Get secure token from storage
   * @returns {Object|null} Token data or null
   */
  getSecureToken() {
    try {
      const tokenData = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!tokenData) return null;
      
      return JSON.parse(tokenData);
    } catch (error) {
      console.error('Error reading auth token:', error);
      return null;
    }
  }

  /**
   * Store secure token
   * @param {string} token JWT token
   * @param {Date} expiry Token expiration date
   */
  setSecureToken(token, expiry) {
    if (!token) return;
    
    try {
      const tokenData = {
        token,
        expiry: expiry || new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24h expiry
      };
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(tokenData));
      
      // Set auth token in API service
      apiService.setAuthToken(token);
      
      // Store token info
      this.authToken = token;
      this.tokenExpiry = tokenData.expiry;
      
      // Set up token refresh
      this.setupTokenRefresh();
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  /**
   * Verify token with backend
   * @param {string} token JWT token to verify
   * @returns {Promise<boolean>} Is token valid
   */
  async verifyToken(token) {
    try {
      // Set token for API call
      apiService.setAuthToken(token);
      
      // Verify with backend
      const response = await apiService.verifyToken();
      
      // Set auth data
      this.isAuthenticated = true;
      this.user = response.user;
      this.subscription = response.subscription;
      this.authToken = token;
      
      // Set up token refresh
      this.setupTokenRefresh();
      
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Clear invalid token
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Authenticate with Miro
   * @returns {Promise<boolean>} Authentication success
   */
  async authenticateWithMiro() {
    try {
      // Get Miro user
      const miroUser = await miro.board.getUserInfo();
      this.miroUser = miroUser;
      
      // Get board info for context
      const boardInfo = await miro.board.getInfo();
      
      // Authenticate with backend
      const authResponse = await apiService.authenticateWithMiro({
        miroUserId: miroUser.id,
        name: miroUser.name,
        email: miroUser.email || null,
        boardId: boardInfo.id
      });
      
      // Set auth data
      this.isAuthenticated = true;
      this.user = authResponse.user;
      this.subscription = authResponse.subscription;
      
      // Store token securely
      this.setSecureToken(authResponse.token, authResponse.expiresAt);
      
      console.log('✅ Miro authentication successful');
      
      // Track successful login
      this.trackEvent('user_authenticated');
      
      return true;
    } catch (error) {
      console.error('Miro authentication failed:', error);
      this.isAuthenticated = false;
      throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
    }
  }

  /**
   * Setup token refresh timer
   */
  setupTokenRefresh() {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Calculate time to refresh (5 minutes before expiry)
    const expiry = new Date(this.tokenExpiry).getTime();
    const now = Date.now();
    const timeToRefresh = Math.max(expiry - now - (5 * 60 * 1000), 0);
    
    // Set timer for refresh
    if (timeToRefresh > 0 && timeToRefresh < 24 * 60 * 60 * 1000) {
      this.refreshTimer = setTimeout(() => this.refreshToken(), timeToRefresh);
      console.log(`🔄 Token refresh scheduled in ${Math.round(timeToRefresh / 60000)} minutes`);
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<boolean>} Refresh success
   */
  async refreshToken() {
    try {
      if (!this.isAuthenticated || !this.authToken) {
        return false;
      }
      
      // Call refresh endpoint
      const response = await apiService.refreshToken();
      
      // Update token
      this.setSecureToken(response.token, response.expiresAt);
      
      console.log('🔄 Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, try to re-authenticate
      return this.authenticateWithMiro();
    }
  }

  /**
   * Log out user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      if (this.isAuthenticated && this.authToken) {
        // Call logout endpoint
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data regardless of API call success
      this.clearAuthData();
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    // Clear timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Clear stored token
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    
    // Clear state
    this.isAuthenticated = false;
    this.user = null;
    this.subscription = null;
    this.authToken = null;
    this.tokenExpiry = null;
    
    // Clear API token
    apiService.removeAuthToken();
  }

  /**
   * Check if user can access a specific hexie
   * @param {Object} hexie Hexie to check
   * @returns {boolean} Can access
   */
  canAccessHexie(hexie) {
    // Free hexies are always accessible
    if (hexie.free) return true;
    
    // User's own hexies are always accessible
    if (hexie.isUserCreated && hexie.userId === this.user?.id) return true;
    
    // Check subscription for premium hexies
    if (!this.subscription) return false;
    
    // Based on subscription plan
    return this.subscription.plan_id !== 'free';
  }

  /**
   * Check if user can access a feature
   * @param {string} featureName Feature name
   * @returns {boolean} Can access
   */
  canAccessFeature(featureName) {
    // Feature-plan mapping
    const featurePlans = {
      'premium_hexies': ['pro', 'enterprise'],
      'unlimited_custom': ['pro', 'enterprise'],
      'export': ['pro', 'enterprise'],
      'analytics': ['enterprise'],
      'team_management': ['enterprise']
    };
    
    // Invalid feature
    if (!featurePlans[featureName]) return false;
    
    // No subscription
    if (!this.subscription) return false;
    
    // Check plan
    return featurePlans[featureName].includes(this.subscription.plan_id);
  }

  /**
   * Check if user has reached hexie creation limit
   * @returns {boolean} Has reached limit
   */
  hasReachedHexieLimit() {
    // No subscription
    if (!this.subscription) return true;
    
    // Unlimited for paid plans
    if (this.subscription.plan_id !== 'free') return false;
    
    // Check count against limit
    return (this.subscription.hexie_count || 0) >= 5;
  }

  /**
   * Refresh subscription data
   * @returns {Promise<Object>} Updated subscription
   */
  async refreshSubscription() {
    try {
      const subscriptionData = await apiService.getSubscription();
      this.subscription = subscriptionData;
      
      // Update UI based on new subscription
      window.dispatchEvent(new CustomEvent('subscription:updated', {
        detail: subscriptionData
      }));
      
      return subscriptionData;
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      throw error;
    }
  }

  /**
   * Track authentication events
   * @param {string} eventName Event name
   * @param {Object} properties Event properties
   */
  trackEvent(eventName, properties = {}) {
    if (apiService.isAuthenticated()) {
      apiService.trackEvent(eventName, properties).catch(error => {
        console.error('Failed to track event:', error);
      });
    }
  }

  /**
   * Initialize mock auth for development
   * @returns {boolean} Success
   */
  initializeMockAuth() {
    this.isAuthenticated = true;
    this.user = {
      id: 'mock_user_123',
      name: 'Mock User',
      email: 'mockuser@example.com'
    };
    this.subscription = {
      id: 'mock_sub_123',
      plan_id: 'free',
      status: 'active',
      hexie_count: 2,
      created_at: new Date().toISOString()
    };
    
    console.log('⚠️ Using mock authentication');
    return true;
  }
  
  // Getters for important properties
  getUserId() {
    return this.user?.id;
  }
  
  getUserProfile() {
    return this.user;
  }
  
  getSubscription() {
    return this.subscription;
  }
  
  getMiroUser() {
    return this.miroUser;
  }
}

// Export as singleton
const authService = new AuthenticationService();
export default authService;