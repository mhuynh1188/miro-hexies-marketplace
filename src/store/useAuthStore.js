// src/store/useAuthStore.js - Zustand store for authentication
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import authService from '../services/auth.service.js';

export const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    isAuthenticated: false,
    isLoading: true,
    user: null,
    miroUser: null,
    subscription: null,
    error: null,

    // Actions
    initialize: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const success = await authService.initializeMiroAuth();
        
        if (success) {
          set({
            isAuthenticated: true,
            user: authService.getUserProfile(),
            miroUser: authService.getMiroUser(),
            subscription: authService.getSubscription(),
            isLoading: false
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
            miroUser: null,
            subscription: null,
            isLoading: false,
            error: 'Authentication failed'
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        set({
          isAuthenticated: false,
          user: null,
          miroUser: null,
          subscription: null,
          isLoading: false,
          error: error.message
        });
      }
    },

    login: async () => {
      set({ isLoading: true, error: null });
      
      try {
        await authService.authenticateWithBackend();
        
        set({
          isAuthenticated: true,
          user: authService.getUserProfile(),
          miroUser: authService.getMiroUser(),
          subscription: authService.getSubscription(),
          isLoading: false
        });
      } catch (error) {
        console.error('Login error:', error);
        set({
          isAuthenticated: false,
          isLoading: false,
          error: error.message
        });
      }
    },

    logout: async () => {
      set({ isLoading: true });
      
      try {
        await authService.logout();
        
        set({
          isAuthenticated: false,
          user: null,
          miroUser: null,
          subscription: null,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Logout error:', error);
        set({ isLoading: false, error: error.message });
      }
    },

    refreshSubscription: async () => {
      try {
        const subscription = await authService.refreshSubscriptionData();
        set({ subscription });
        return subscription;
      } catch (error) {
        console.error('Subscription refresh error:', error);
        set({ error: error.message });
        return null;
      }
    },

    updateSubscription: (newSubscription) => {
      set({ subscription: newSubscription });
    },

    clearError: () => {
      set({ error: null });
    },

    // Computed values
    canAccessFeature: (featureName) => {
      return authService.canAccessFeature(featureName);
    },

    hasPermission: (permission) => {
      return authService.hasPermission(permission);
    },

    getSubscriptionPlan: () => {
      const { subscription } = get();
      return subscription?.plan || null;
    },

    isSubscriptionActive: () => {
      const { subscription } = get();
      if (!subscription) return false;
      
      if (subscription.plan.id === 'free') return true;
      
      return subscription.status === 'active' && 
             new Date(subscription.currentPeriodEnd) > new Date();
    }
  }))
);

// Set up auth state change listener
authService.onAuthStateChange(() => {
  useAuthStore.getState().logout();
});

// Listen for subscription events
window.addEventListener('subscription:updated', (event) => {
  useAuthStore.getState().updateSubscription(event.detail);
});

window.addEventListener('subscription:cancelled', () => {
  useAuthStore.getState().refreshSubscription();
});