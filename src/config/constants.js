// src/config/constants.js
export const MIRO_CONFIG = {
    CLIENT_ID: '3458764627724542091',
    CLIENT_SECRET: 'mdJ1hjK4m5LL8A2RaLvW5oN1OnKNoXs9',
    REDIRECT_URI: window.location.origin,
    SCOPES: ['boards:read', 'boards:write', 'identity:read']
  };
  
  export const API_CONFIG = {
    // Development
    DEV_URL: 'http://localhost:3001/api',
    // Production - replace with your Supabase URL
    PROD_URL: 'https://your-supabase-project.supabase.co/rest/v1',
    TIMEOUT: 10000
  };
  
  export const SUBSCRIPTION_PLANS = {
    FREE: {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        'Access to basic hexies',
        '5 custom hexies',
        'Community support'
      ],
      hexieLimit: 5
    },
    PRO: {
      id: 'pro',
      name: 'Professional',
      price: 9.99,
      interval: 'month',
      features: [
        'All hexies included',
        'Unlimited custom hexies',
        'Priority support',
        'Export capabilities'
      ],
      hexieLimit: -1 // unlimited
    },
    LIFETIME: {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: 99.99,
      features: [
        'All current and future hexies',
        'Unlimited custom hexies',
        'Priority support',
        'One-time payment'
      ],
      hexieLimit: -1
    }
  };
  
  export const HEXIE_CATEGORIES = {
    METHODS: {
      id: 'methods',
      name: 'Methods',
      color: '#4285f4',
      icon: '🔧',
      description: 'Proven frameworks and methodologies'
    },
    TEAMS: {
      id: 'teams',
      name: 'Teams',
      color: '#34a853',
      icon: '👥',
      description: 'Team building and collaboration tools'
    },
    PRODUCT: {
      id: 'product',
      name: 'Product',
      color: '#fbbc04',
      icon: '📦',
      description: 'Product management and strategy'
    },
    LEADERSHIP: {
      id: 'leadership',
      name: 'Leadership',
      color: '#ea4335',
      icon: '👑',
      description: 'Leadership and management frameworks'
    },
    ANTI_PATTERNS: {
      id: 'anti-patterns',
      name: 'Anti-patterns',
      color: '#9c27b0',
      icon: '⚠️',
      description: 'Common pitfalls to avoid'
    }
  };
  
  export const STORAGE_KEYS = {
    AUTH_TOKEN: 'hexies_auth_token',
    USER_PROFILE: 'hexies_user_profile',
    SUBSCRIPTION: 'hexies_subscription',
    PREFERENCES: 'hexies_preferences'
  };
  
  export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_REQUIRED: 'Authentication required. Please log in.',
    SUBSCRIPTION_REQUIRED: 'This feature requires a premium subscription.',
    INVALID_TOKEN: 'Invalid authentication token.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    GENERIC_ERROR: 'Something went wrong. Please try again.'
  };
  
  export const SUCCESS_MESSAGES = {
    HEXIE_CREATED: 'Hexie created successfully!',
    SUBSCRIPTION_UPDATED: 'Subscription updated successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PAYMENT_SUCCESS: 'Payment processed successfully!'
  };