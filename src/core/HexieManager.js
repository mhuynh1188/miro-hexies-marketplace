// src/core/HexieManager.js
import { HEXIE_CATEGORIES } from '../config/constants.js';
import authService from './AuthService.js';
import boardService from './BoardService.js';
import apiService from '../data/api.js';
import { validateHexieData } from '../utils/validators.js';

/**
 * Manages hexie data and operations
 */
class HexieManager {
  constructor() {
    this.hexies = [];
    this.filteredHexies = [];
    this.userHexies = [];
    this.selectedCategory = '';
    this.searchQuery = '';
    this.initialized = false;
  }

  /**
   * Initialize HexieManager
   * @returns {Promise<boolean>}
   */
  async initialize() {
    try {
      // Load hexies from backend or default data
      await this.loadHexies();
      
      this.initialized = true;
      console.log('HexieManager initialized successfully');
      return true;
    } catch (error) {
      console.error('HexieManager initialization error:', error);
      throw error;
    }
  }

  /**
   * Load hexies from backend
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} - Loaded hexies
   */
  async loadHexies(category = null) {
    try {
      let hexies = [];
      
      // Try to load from API
      if (apiService.isAuthenticated()) {
        hexies = await apiService.getHexies(category);
        console.log('Hexies loaded from API:', hexies.length);
      } else {
        // Fall back to default data if API fails
        hexies = this.getDefaultHexies();
        console.log('Using default hexies');
      }
      
      // Separate system and user hexies
      this.hexies = hexies.filter(h => !h.isUserCreated);
      this.userHexies = hexies.filter(h => h.isUserCreated);
      
      // Apply any existing filters
      this.applyFilters();
      
      return hexies;
    } catch (error) {
      console.error('Failed to load hexies:', error);
      
      // Fall back to default data on error
      const defaultHexies = this.getDefaultHexies();
      this.hexies = defaultHexies;
      this.filteredHexies = defaultHexies;
      
      throw error;
    }
  }

  /**
   * Get default hexies data
   * @returns {Array} - Default hexies
   */
  getDefaultHexies() {
    return [
      {
        id: 'default_1',
        title: 'Retrospective',
        category: 'methods',
        icon: '🔍',
        summary: 'Reflect and improve team processes',
        details: 'A collaborative session where teams discuss what went well, what didn\'t work, and how to improve in the next iteration.',
        free: true,
        tags: ['agile', 'improvement', 'team']
      },
      {
        id: 'default_2',
        title: 'User Story Mapping',
        category: 'product',
        icon: '🗺️',
        summary: 'Visualize user journey and features',
        details: 'Create a shared understanding of the user experience by mapping activities, tasks, and features.',
        free: true,
        tags: ['user-experience', 'planning']
      },
      {
        id: 'default_3',
        title: 'Team Charter',
        category: 'teams',
        icon: '🤝',
        summary: 'Define team purpose and ways of working',
        details: 'Establish clear team mission, values, roles, and collaboration guidelines.',
        free: false,
        tags: ['team-building', 'alignment']
      }
    ];
  }

  /**
   * Apply category and search filters
   */
  applyFilters() {
    let filtered = [...this.hexies, ...this.userHexies];
    
    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(h => h.category === this.selectedCategory);
    }
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(h => 
        h.title.toLowerCase().includes(query) ||
        h.summary.toLowerCase().includes(query) ||
        h.details?.toLowerCase().includes(query) ||
        h.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    this.filteredHexies = filtered;
  }

  /**
   * Set category filter
   * @param {string} category - Category to filter by
   */
  setCategory(category) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  /**
   * Set search query
   * @param {string} query - Search query
   */
  setSearchQuery(query) {
    this.searchQuery = query;
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.applyFilters();
  }

  /**
   * Get hexies for display
   * @returns {Array} - Filtered hexies
   */
  getDisplayHexies() {
    return this.filteredHexies;
  }

  /**
   * Create new hexie
   * @param {Object} hexieData - Hexie data
   * @returns {Promise<Object>} - Created hexie
   */
  async createHexie(hexieData) {
    // Validate hexie data
    validateHexieData(hexieData);
    
    // Check subscription limits
    if (authService.hasReachedHexieLimit()) {
      throw new Error('You have reached your hexie limit. Upgrade to create more.');
    }
    
    // Create hexie object
    const newHexie = {
      id: `hexie_${Date.now()}`,
      ...hexieData,
      isUserCreated: true,
      free: true,
      createdAt: new Date().toISOString(),
      userId: authService.getUserProfile()?.id
    };
    
    try {
      // Save to backend if authenticated
      if (apiService.isAuthenticated()) {
        const savedHexie = await apiService.createHexie(newHexie);
        
        // Use server-generated ID or keep local ID
        newHexie.id = savedHexie.id || newHexie.id;
      }
      
      // Add to local array
      this.userHexies.push(newHexie);
      
      // Update filters
      this.applyFilters();
      
      // Track usage
      if (apiService.isAuthenticated()) {
        await apiService.trackEvent('hexie_created', { hexieId: newHexie.id });
      }
      
      return newHexie;
    } catch (error) {
      console.error('Failed to create hexie:', error);
      throw error;
    }
  }

  /**
   * Update existing hexie
   * @param {string} hexieId - Hexie ID to update
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} - Updated hexie
   */
  async updateHexie(hexieId, updates) {
    // Find hexie index
    const hexieIndex = this.userHexies.findIndex(h => h.id === hexieId);
    
    if (hexieIndex === -1) {
      throw new Error('Hexie not found');
    }
    
    // Create updated object
    const hexie = this.userHexies[hexieIndex];
    const updatedHexie = {
      ...hexie,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Update in backend if authenticated
      if (apiService.isAuthenticated()) {
        await apiService.updateHexie(hexieId, updates);
      }
      
      // Update local array
      this.userHexies[hexieIndex] = updatedHexie;
      
      // Update filters
      this.applyFilters();
      
      return updatedHexie;
    } catch (error) {
      console.error('Failed to update hexie:', error);
      throw error;
    }
  }

  /**
   * Delete a hexie
   * @param {string} hexieId - Hexie ID to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteHexie(hexieId) {
    // Only user-created hexies can be deleted
    const index = this.userHexies.findIndex(h => h.id === hexieId);
    
    if (index === -1) {
      throw new Error('Hexie not found or cannot be deleted');
    }
    
    try {
      // Delete from backend if authenticated
      if (apiService.isAuthenticated()) {
        await apiService.deleteHexie(hexieId);
      }
      
      // Remove from local array
      this.userHexies.splice(index, 1);
      
      // Update filters
      this.applyFilters();
      
      return true;
    } catch (error) {
      console.error('Failed to delete hexie:', error);
      throw error;
    }
  }

  /**
   * Add hexie to Miro board
   * @param {string|Object} hexieIdOrObject - Hexie ID or object
   * @returns {Promise<Object>} - Created board widget
   */
  async addHexieToBoard(hexieIdOrObject) {
    let hexie = null;
    
    if (typeof hexieIdOrObject === 'string') {
      // Find by ID
      hexie = this.findHexieById(hexieIdOrObject);
    } else if (typeof hexieIdOrObject === 'object') {
      // Use provided object
      hexie = hexieIdOrObject;
    }
    
    if (!hexie) {
      throw new Error('Hexie not found');
    }
    
    return await boardService.createHexieOnBoard(hexie);
  }

  /**
   * Find hexie by ID
   * @param {string} hexieId - Hexie ID to find
   * @returns {Object|null} - Found hexie or null
   */
  findHexieById(hexieId) {
    return [...this.hexies, ...this.userHexies].find(h => h.id === hexieId) || null;
  }

  /**
   * Get hexies by category
   * @param {string} category - Category to filter by
   * @returns {Array} - Filtered hexies
   */
  getHexiesByCategory(category) {
    return this.filteredHexies.filter(h => !category || h.category === category);
  }

  /**
   * Get hexies grouped by category
   * @returns {Object} - Grouped hexies
   */
  getHexiesByCategories() {
    const grouped = {};
    
    this.filteredHexies.forEach(hexie => {
      if (!grouped[hexie.category]) {
        grouped[hexie.category] = [];
      }
      grouped[hexie.category].push(hexie);
    });
    
    return grouped;
  }

  /**
   * Get free hexies
   * @returns {Array} - Free hexies
   */
  getFreeHexies() {
    return this.hexies.filter(h => h.free === true);
  }

  /**
   * Get premium hexies
   * @returns {Array} - Premium hexies
   */
  getPremiumHexies() {
    return this.hexies.filter(h => h.free !== true);
  }

  /**
   * Get user created hexies
   * @returns {Array} - User hexies
   */
  getUserHexies() {
    return this.userHexies;
  }
}

// Export singleton instance
const hexieManager = new HexieManager();
export default hexieManager;