// src/store/useHexieStore.js - Zustand store for hexie management
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import apiService from '../services/api.service.js';
import { HEXIE_CATEGORIES } from '../config/constants.js';

export const useHexieStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    hexies: [],
    userHexies: [],
    filteredHexies: [],
    categories: Object.values(HEXIE_CATEGORIES),
    selectedCategory: null,
    searchQuery: '',
    isLoading: false,
    error: null,
    createMode: false,
    selectedHexie: null,
    usage: null,

    // Actions
    loadHexies: async (category = null, includeUserHexies = true) => {
      set({ isLoading: true, error: null });
      
      try {
        const hexies = await apiService.getHexies(category, includeUserHexies);
        const systemHexies = hexies.filter(h => !h.isUserCreated);
        const userHexies = hexies.filter(h => h.isUserCreated);
        
        set({
          hexies: systemHexies,
          userHexies,
          isLoading: false
        });
        
        // Apply current filters
        get().applyFilters();
      } catch (error) {
        console.error('Failed to load hexies:', error);
        set({
          error: error.message,
          isLoading: false
        });
      }
    },

    createHexie: async (hexieData) => {
      set({ isLoading: true, error: null });
      
      try {
        const newHexie = await apiService.createHexie({
          ...hexieData,
          isUserCreated: true
        });
        
        // Add to user hexies
        set(state => ({
          userHexies: [...state.userHexies, newHexie],
          isLoading: false,
          createMode: false
        }));
        
        // Apply filters to update display
        get().applyFilters();
        
        // Track creation
        await apiService.trackHexieUsage(newHexie.id, 'created');
        
        return newHexie;
      } catch (error) {
        console.error('Failed to create hexie:', error);
        set({
          error: error.message,
          isLoading: false
        });
        throw error;
      }
    },

    updateHexie: async (hexieId, updates) => {
      set({ isLoading: true, error: null });
      
      try {
        const updatedHexie = await apiService.updateHexie(hexieId, updates);
        
        // Update in appropriate array
        set(state => {
          if (updatedHexie.isUserCreated) {
            return {
              userHexies: state.userHexies.map(h => 
                h.id === hexieId ? updatedHexie : h
              ),
              isLoading: false
            };
          } else {
            return {
              hexies: state.hexies.map(h => 
                h.id === hexieId ? updatedHexie : h
              ),
              isLoading: false
            };
          }
        });
        
        get().applyFilters();
        return updatedHexie;
      } catch (error) {
        console.error('Failed to update hexie:', error);
        set({
          error: error.message,
          isLoading: false
        });
        throw error;
      }
    },

    deleteHexie: async (hexieId) => {
      set({ isLoading: true, error: null });
      
      try {
        await apiService.deleteHexie(hexieId);
        
        // Remove from user hexies
        set(state => ({
          userHexies: state.userHexies.filter(h => h.id !== hexieId),
          isLoading: false
        }));
        
        get().applyFilters();
      } catch (error) {
        console.error('Failed to delete hexie:', error);
        set({
          error: error.message,
          isLoading: false
        });
        throw error;
      }
    },

    createHexieOnBoard: async (hexie) => {
      try {
        // Get current viewport center
        const viewport = await miro.board.viewport.get();
        const x = viewport.x + (Math.random() * 200) - 100;
        const y = viewport.y + (Math.random() * 200) - 100;

        // Create card on Miro board
        const card = await miro.board.createCard({
          title: hexie.title,
          description: get().formatHexieDescription(hexie),
          x,
          y,
          style: {
            cardTheme: get().getCardTheme(hexie.category),
            fillColor: get().getCategoryColor(hexie.category)
          }
        });

        // Add icon as text
        await miro.board.createText({
          content: hexie.icon,
          x,
          y: y - 60,
          style: {
            fontSize: 48,
            textAlign: 'center'
          }
        });

        // Focus on the created items
        await miro.board.viewport.zoomTo([card]);
        
        // Track usage
        await apiService.trackHexieUsage(hexie.id, 'added_to_board');
        
        return card;
      } catch (error) {
        console.error('Failed to create hexie on board:', error);
        throw error;
      }
    },

    // Filter and search
    setCategory: (category) => {
      set({ selectedCategory: category });
      get().applyFilters();
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
      get().applyFilters();
    },

    applyFilters: () => {
      const { hexies, userHexies, selectedCategory, searchQuery } = get();
      const allHexies = [...hexies, ...userHexies];
      
      let filtered = allHexies;
      
      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter(h => h.category === selectedCategory);
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(h => 
          h.title.toLowerCase().includes(query) ||
          h.summary.toLowerCase().includes(query) ||
          h.details?.toLowerCase().includes(query) ||
          h.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      set({ filteredHexies: filtered });
    },

    clearFilters: () => {
      set({ 
        selectedCategory: null, 
        searchQuery: '',
        filteredHexies: [...get().hexies, ...get().userHexies]
      });
    },

    // UI state
    setCreateMode: (enabled) => {
      set({ createMode: enabled });
    },

    selectHexie: (hexie) => {
      set({ selectedHexie: hexie });
    },

    clearSelection: () => {
      set({ selectedHexie: null });
    },

    clearError: () => {
      set({ error: null });
    },

    // Usage tracking
    loadUsage: async () => {
      try {
        const usage = await apiService.getHexieUsage();
        set({ usage });
        return usage;
      } catch (error) {
        console.error('Failed to load usage:', error);
        return null;
      }
    },

    // Helper functions
    formatHexieDescription: (hexie) => {
      let description = `**Category:** ${hexie.category.charAt(0).toUpperCase() + hexie.category.slice(1)}\n\n`;
      description += `**Summary:** ${hexie.summary}\n\n`;
      
      if (hexie.details) {
        description += `**Details:** ${hexie.details}\n\n`;
      }
      
      if (hexie.reference) {
        description += `**Reference:** ${hexie.reference}\n\n`;
      }
      
      if (hexie.tags && hexie.tags.length > 0) {
        description += `**Tags:** ${hexie.tags.join(', ')}`;
      }
      
      return description;
    },

    getCardTheme: (category) => {
      const themes = {
        'methods': 'blue',
        'teams': 'green',
        'product': 'yellow',
        'leadership': 'red',
        'anti-patterns': 'violet'
      };
      return themes[category] || 'blue';
    },

    getCategoryColor: (category) => {
      const categoryConfig = HEXIE_CATEGORIES[category.toUpperCase()];
      return categoryConfig?.color || '#4285f4';
    },

    // Computed values
    getHexiesByCategory: () => {
      const { filteredHexies } = get();
      const grouped = {};
      
      filteredHexies.forEach(hexie => {
        if (!grouped[hexie.category]) {
          grouped[hexie.category] = [];
        }
        grouped[hexie.category].push(hexie);
      });
      
      return grouped;
    },

    getDisplayHexies: () => {
      const { filteredHexies, selectedCategory, searchQuery } = get();
      
      if (selectedCategory || searchQuery) {
        return filteredHexies;
      }
      
      return [...get().hexies, ...get().userHexies];
    }
  }))
);

// Initialize hexies on store creation
useHexieStore.getState().loadHexies();