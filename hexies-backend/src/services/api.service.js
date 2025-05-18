// src/services/api.service.js - Fixed API service for frontend
class ApiService {
    constructor() {
      // Use relative URLs since the app runs in Miro's environment
      this.baseURL = 'http://localhost:3001/api'; // Point to your backend
      this.authToken = null;
      
      // Initialize with any stored token
      this.authToken = localStorage.getItem('hexies_auth_token');
    }
  
    // Set authentication token
    setAuthToken(token) {
      this.authToken = token;
      localStorage.setItem('hexies_auth_token', token);
    }
  
    // Remove authentication token
    removeAuthToken() {
      this.authToken = null;
      localStorage.removeItem('hexies_auth_token');
    }
  
    // Make authenticated API calls
    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        },
        ...options
      };
  
      try {
        const response = await fetch(url, config);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
          }
          
          return data;
        } else {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return await response.text();
        }
      } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
      }
    }
  
    // Authentication endpoints
    async authenticateWithBackend(miroUser) {
      const response = await this.request('/auth/miro', {
        method: 'POST',
        body: JSON.stringify({
          miroUserId: miroUser.id,
          email: miroUser.email,
          name: miroUser.name
        })
      });
  
      if (response.token) {
        this.setAuthToken(response.token);
      }
  
      return response;
    }
  
    // Subscription endpoints
    async getSubscriptionStatus() {
      return this.request('/subscriptions/status');
    }
  
    async createCheckoutSession(planId) {
      return this.request('/subscriptions/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          successUrl: window.location.href,
          cancelUrl: window.location.href
        })
      });
    }
  
    // Hexie endpoints
    async getHexies(category = null, includeUserHexies = true) {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (includeUserHexies) params.append('includeUser', 'true');
      
      return this.request(`/hexies?${params}`);
    }
  
    async createHexie(hexieData) {
      return this.request('/hexies', {
        method: 'POST',
        body: JSON.stringify(hexieData)
      });
    }
  
    async updateHexie(hexieId, hexieData) {
      return this.request(`/hexies/${hexieId}`, {
        method: 'PUT',
        body: JSON.stringify(hexieData)
      });
    }
  
    async deleteHexie(hexieId) {
      return this.request(`/hexies/${hexieId}`, {
        method: 'DELETE'
      });
    }
  
    // Analytics endpoints
    async trackEvent(eventName, properties = {}) {
      return this.request('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
          event: eventName,
          ...properties
        })
      });
    }
  
    // Health check
    async healthCheck() {
      try {
        return await this.request('/health');
      } catch (error) {
        return { status: 'error', message: error.message };
      }
    }
  }
  
  // Create global instance
  window.apiService = new ApiService();
  
  // Export for modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
  }