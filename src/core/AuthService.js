// src/core/AuthService.js
import apiService from '../data/api.js';
import { STORAGE_KEYS, SUBSCRIPTION_PLANS } from '../config/constants.js';

/**
 * Authentication and subscription management service
 */
class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.subscription = null;
    this.miroUser = null;
  }

  /**
   * Initialize authentication
   * @returns {Promise<boolean>} - Authentication status
   */
  async initialize() {
    try {
      console.log('Initializing authentication...');
      
      // Check for existing token
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (token) {
        // Verify token with backend
        await this.verifyToken();
      } else {
        // Authenticate with Miro
        await this.authenticateWithMiro();
      }
      
      return this.isAuthenticated;
    } catch (error) {
      console.error('Authentication initialization error:', error);
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * Verify existing token
   * @returns {Promise<boolean>} - Verification status
   */
  async verifyToken() {
    try {
      const response = await apiService.verifyToken();
      
      this.isAuthenticated = true;
      this.user = response.user;
      this.subscription = response.subscription;
      
      console.log('Token verified successfully');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Clear invalid token
      apiService.removeAuthToken();
      this.isAuthenticated = false;
      
      // Try Miro authentication as fallback
      return this.authenticateWithMiro();
    }
  }

  /**
   * Authenticate with Miro
   * @returns {Promise<boolean>} - Authentication status
   */
  async authenticateWithMiro() {
    try {
      // Get Miro user info
      this.miroUser = await miro.board.getUserInfo();
      console.log('Miro user:', this.miroUser);
      
      // Authenticate with backend
      const authResponse = await apiService.authenticateWithMiro(this.miroUser);
      
      this.isAuthenticated = true;
      this.user = authResponse.user;
      this.subscription = authResponse.subscription;
      
      // Save user profile to localStorage
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.user));
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(this.subscription));
      
      console.log('Miro authentication successful');
      return true;
    } catch (error) {
      console.error('Miro authentication failed:', error);
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
      
      // Reset state
      this.isAuthenticated = false;
      this.user = null;
      this.subscription = null;
      
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Refresh subscription data
   * @returns {Promise<Object>} - Updated subscription
   */
  async refreshSubscription() {
    try {
      this.subscription = await apiService.getSubscription();
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(this.subscription));
      return this.subscription;
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      throw error;
    }
  }

  /**
   * Check if user can access a specific hexie
   * @param {Object} hexie - Hexie object
   * @returns {boolean} - Access status
   */
  canAccessHexie(hexie) {
    // Free hexies are always accessible
    if (hexie.free) return true;
    
    // User-created hexies are always accessible
    if (hexie.isUserCreated) return true;
    
    // Check subscription for premium hexies
    if (!this.subscription) return false;
    
    // Free plan can only access free hexies
    return this.subscription.plan_id !== 'free';
  }

  /**
   * Check if user can access a specific feature
   * @param {string} featureName - Feature name
   * @returns {boolean} - Access status
   */
  canAccessFeature(featureName) {
    if (!this.subscription) return false;
    
    // Map features to plans
    const featurePlans = {
      'premium_hexies': ['pro', 'lifetime'],
      'unlimited_hexies': ['pro', 'lifetime'],
      'export': ['pro', 'lifetime'],
      'analytics': ['pro', 'lifetime']
    };
    
    // Check if feature exists
    if (!featurePlans[featureName]) return false;
    
    // Check if user's plan has access to feature
    return featurePlans[featureName].includes(this.subscription.plan_id);
  }

  /**
   * Check if user has reached hexie limit
   * @returns {boolean} - Limit reached status
   */
  hasReachedHexieLimit() {
    if (!this.subscription) return true;
    
    // Find plan config
    const planId = this.subscription.plan_id;
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    
    // If unlimited (-1), return false
    if (plan && plan.hexieLimit === -1) return false;
    
    // Check current count against limit
    return this.subscription.hexie_count >= (plan?.hexieLimit || 5);
  }

  /**
   * Get user profile
   * @returns {Object} - User profile
   */
  getUserProfile() {
    return this.user;
  }

  /**
   * Get user subscription
   * @returns {Object} - Subscription data
   */
  getSubscription() {
    return this.subscription;
  }

  /**
   * Get Miro user
   * @returns {Object} - Miro user data
   */
  getMiroUser() {
    return this.miroUser;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;