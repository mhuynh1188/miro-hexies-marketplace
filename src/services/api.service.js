// src/services/api.service.js - Centralized API service
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../config/constants.js';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NODE_ENV === 'production' 
        ? API_CONFIG.PROD_BASE_URL 
        : API_CONFIG.DEV_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  setAuthToken(token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  removeAuthToken() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  handleApiError(error) {
    if (!error.response) {
      console.error('Network Error:', error.message);
      return;
    }

    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        console.error('Unauthorized:', data?.message || ERROR_MESSAGES.AUTH_REQUIRED);
        this.removeAuthToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        break;
      case 403:
        console.error('Forbidden:', data?.message || ERROR_MESSAGES.SUBSCRIPTION_REQUIRED);
        break;
      case 429:
        console.error('Rate Limited:', ERROR_MESSAGES.RATE_LIMITED);
        break;
      case 500:
        console.error('Server Error:', data?.message || ERROR_MESSAGES.GENERIC_ERROR);
        break;
      default:
        console.error('API Error:', data?.message || ERROR_MESSAGES.GENERIC_ERROR);
    }
  }

  // Authentication endpoints
  async login(miroUserId) {
    const response = await this.client.post('/auth/login', { miroUserId });
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data;
  }

  async verifyToken() {
    const response = await this.client.get('/auth/verify');
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    this.removeAuthToken();
  }

  // User endpoints
  async getUserProfile() {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(profileData) {
    const response = await this.client.put('/users/profile', profileData);
    return response.data;
  }

  // Subscription endpoints
  async getSubscription() {
    const response = await this.client.get('/subscriptions/current');
    return response.data;
  }

  async createCheckoutSession(planId) {
    const response = await this.client.post('/subscriptions/checkout', { planId });
    return response.data;
  }

  async verifyPayment(sessionId) {
    const response = await this.client.post('/subscriptions/verify', { sessionId });
    return response.data;
  }

  async cancelSubscription() {
    const response = await this.client.delete('/subscriptions/current');
    return response.data;
  }

  // Hexie endpoints
  async getHexies(category = null, includeUserHexies = true) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (includeUserHexies) params.append('includeUser', 'true');
    
    const response = await this.client.get(`/hexies?${params}`);
    return response.data;
  }

  async createHexie(hexieData) {
    const response = await this.client.post('/hexies', hexieData);
    return response.data;
  }

  async updateHexie(hexieId, hexieData) {
    const response = await this.client.put(`/hexies/${hexieId}`, hexieData);
    return response.data;
  }

  async deleteHexie(hexieId) {
    const response = await this.client.delete(`/hexies/${hexieId}`);
    return response.data;
  }

  async getHexieUsage() {
    const response = await this.client.get('/hexies/usage');
    return response.data;
  }

  // Analytics endpoints
  async trackHexieUsage(hexieId, action) {
    const response = await this.client.post('/analytics/track', {
      hexieId,
      action,
      timestamp: new Date().toISOString()
    });
    return response.data;
  }

  async getAnalytics(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const response = await this.client.get(`/analytics?${params}`);
    return response.data;
  }
}

export default new ApiService();