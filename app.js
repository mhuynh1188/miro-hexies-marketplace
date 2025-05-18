// app.js - Professional Miro Marketplace Application (Fixed)
class HexiesApp {
  constructor() {
    this.isInitialized = false;
    this.currentView = 'library';
    this.hexieManager = null;
    this.searchQuery = '';
    this.selectedCategory = '';
    this.isOnline = navigator.onLine;
    
    // Initialize connection status monitoring
    this.initializeConnectionMonitoring();
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Professional Hexies Marketplace...');
      this.updateStatus('loading', '🔄 Initializing application...');
      
      // Ensure Miro SDK is available
      if (!window.miro) {
        throw new Error('Miro SDK not loaded. Please refresh the page.');
      }

      // Get user info first
      this.user = await miro.board.getUserInfo();
      console.log('✅ User authenticated:', this.user);

      // Initialize hexie manager with enhanced features
      this.hexieManager = new HexieManager();
      window.hexieManager = this.hexieManager; // Make globally accessible
      
      await this.hexieManager.initialize();
      
      // Setup UI components and event listeners
      this.setupEventListeners();
      this.initializeQuickSearch();
      this.updateHexieDisplay();
      this.updateSubscriptionDisplay();
      
      // Initialize app-level features
      await this.initializeAppFeatures();
      
      this.isInitialized = true;
      this.updateStatus('success', '✅ Hexies Marketplace ready!');
      
      // Track successful initialization
      this.hexieManager.trackEvent('app_ready', {
        userId: this.user.id,
        userEmail: this.user.email
      });
      
      console.log('✅ Professional Hexies Marketplace fully loaded');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.updateStatus('error', '❌ Failed to initialize application', error.message);
      this.showRetryButton();
    }
  }

  async initializeAppFeatures() {
    // Initialize keyboard shortcuts
    this.initializeKeyboardShortcuts();
    
    // Setup auto-save for user preferences
    this.initializeAutoSave();
    
    // Initialize tooltips and help system
    this.initializeHelpSystem();
    
    // Setup periodic subscription status check
    this.initializeSubscriptionMonitoring();
  }

  initializeConnectionMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showConnectionStatus('Connected', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showConnectionStatus('Offline - Some features disabled', 'warning');
    });
  }

  showConnectionStatus(message, type) {
    const toast = this.createToast(message, type, 3000);
    document.body.appendChild(toast);
  }

  setupEventListeners() {
    // Tab navigation with enhanced UX
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-tab');
        this.switchView(targetView);
        this.hexieManager.trackEvent('view_switched', { view: targetView });
      });
    });

    // Enhanced category filter with real-time updates
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.filterHexies();
        this.hexieManager.trackEvent('category_filtered', { category: e.target.value });
      });
    }

    // Real-time search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.filterHexies();
          if (e.target.value) {
            this.hexieManager.trackEvent('search_performed', { query: e.target.value });
          }
        }, 300);
      });
    }

    // Enhanced form handling with validation
    const createForm = document.getElementById('createHexieForm');
    if (createForm) {
      createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateHexie();
      });
      
      // Add real-time validation
      this.setupFormValidation(createForm);
    }

    // Test functionality buttons
    this.setupTestButtons();
    
    // Window visibility API for pause/resume
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.hexieManager.trackEvent('app_backgrounded');
      } else {
        this.hexieManager.trackEvent('app_foregrounded');
      }
    });
  }

  setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      // Character count for text inputs
      if (input.hasAttribute('maxlength')) {
        this.addCharacterCounter(input);
      }
      
      // Real-time validation
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearValidationError(input));
    });
  }

  addCharacterCounter(input) {
    const maxLength = input.getAttribute('maxlength');
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = `
      font-size: 12px;
      color: #666;
      text-align: right;
      margin-top: 4px;
    `;
    
    const updateCounter = () => {
      const remaining = maxLength - input.value.length;
      counter.textContent = `${remaining} characters remaining`;
      counter.style.color = remaining < 10 ? '#f44336' : '#666';
    };
    
    input.addEventListener('input', updateCounter);
    updateCounter();
    
    input.parentNode.insertBefore(counter, input.nextSibling);
  }

  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (input.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    
    // Email validation
    if (input.type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
    
    // URL validation
    if (input.type === 'url' && value && !this.isValidURL(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid URL';
    }
    
    this.showFieldValidation(input, isValid, errorMessage);
    return isValid;
  }

  showFieldValidation(input, isValid, errorMessage) {
    // Remove existing error
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Update input styling
    input.style.borderColor = isValid ? '#ddd' : '#f44336';
    
    // Add error message if invalid
    if (!isValid && errorMessage) {
      const errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      errorEl.style.cssText = `
        color: #f44336;
        font-size: 12px;
        margin-top: 4px;
      `;
      errorEl.textContent = errorMessage;
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
  }

  clearValidationError(input) {
    input.style.borderColor = '#ddd';
    const error = input.parentNode.querySelector('.field-error');
    if (error) error.remove();
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            this.focusSearch();
            break;
          case 'n':
            e.preventDefault();
            this.switchView('create');
            break;
          case '1':
          case '2':
          case '3':
            e.preventDefault();
            const viewIndex = parseInt(e.key) - 1;
            const views = ['library', 'create', 'test'];
            if (views[viewIndex]) this.switchView(views[viewIndex]);
            break;
        }
      }
      
      // Escape key handling
      if (e.key === 'Escape') {
        this.clearSearch();
        this.closeModals();
      }
    });
  }

  initializeAutoSave() {
    // Auto-save user preferences
    setInterval(() => {
      const preferences = {
        lastView: this.currentView,
        lastCategory: this.selectedCategory,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('hexies_preferences', JSON.stringify(preferences));
    }, 30000); // Save every 30 seconds
  }

  initializeHelpSystem() {
    // Add help tooltips to various elements
    const helpElements = document.querySelectorAll('[data-help]');
    helpElements.forEach(element => {
      this.addTooltip(element, element.getAttribute('data-help'));
    });
  }

  addTooltip(element, text) {
    let tooltip;
    
    element.addEventListener('mouseenter', () => {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = text;
      tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 3000;
        max-width: 200px;
        word-wrap: break-word;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        pointer-events: none;
      `;
      
      document.body.appendChild(tooltip);
      
      // Position tooltip
      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      let top = rect.top - tooltipRect.height - 8;
      
      // Adjust if tooltip goes off screen
      if (left < 8) left = 8;
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      if (top < 8) top = rect.bottom + 8;
      
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    });
  }

  initializeSubscriptionMonitoring() {
    // Check subscription status periodically
    setInterval(async () => {
      if (this.hexieManager && this.isOnline) {
        try {
          await this.hexieManager.checkSubscriptionStatus();
          this.updateSubscriptionDisplay();
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  initializeQuickSearch() {
    // Add quick search functionality
    const quickSearchBtn = document.getElementById('quickSearchBtn');
    if (quickSearchBtn) {
      quickSearchBtn.addEventListener('click', this.showQuickSearch.bind(this));
    }
  }

  showQuickSearch() {
    // Implementation for quick search modal
    console.log('Quick search activated');
  }

  switchView(view) {
    if (this.currentView === view) return;
    
    this.currentView = view;
    
    // Update tab states with animation
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
      tab.style.transform = 'scale(1)';
    });
    
    const activeTab = document.querySelector(`[data-tab="${view}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.style.transform = 'scale(1.05)';
      setTimeout(() => {
        activeTab.style.transform = 'scale(1)';
      }, 150);
    }
    
    // Show/hide content with fade effect
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.opacity = '0';
      setTimeout(() => {
        content.classList.add('hidden');
      }, 150);
    });
    
    setTimeout(() => {
      const targetContent = document.getElementById(`${view}Tab`);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.style.opacity = '1';
      }
    }, 150);
    
    // View-specific initialization
    this.handleViewSwitch(view);
  }

  handleViewSwitch(view) {
    switch (view) {
      case 'library':
        this.updateHexieDisplay();
        this.focusSearch();
        break;
      case 'create':
        this.focusCreateForm();
        this.loadFormPreferences();
        break;
      case 'test':
        this.initializeTestView();
        break;
    }
  }

  focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  }

  focusCreateForm() {
    const titleInput = document.getElementById('hexieTitle');
    if (titleInput) {
      setTimeout(() => titleInput.focus(), 200);
    }
  }

  loadFormPreferences() {
    // Load previously saved form data
    const saved = localStorage.getItem('hexies_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        Object.entries(draft).forEach(([key, value]) => {
          const input = document.getElementById(key);
          if (input && !input.value) {
            input.value = value;
          }
        });
      } catch (error) {
        console.error('Failed to load form preferences:', error);
      }
    }
  }

  filterHexies() {
    if (!this.hexieManager) return;
    
    this.updateHexieDisplay();
    
    // Update URL without page reload
    const params = new URLSearchParams();
    if (this.selectedCategory) params.set('category', this.selectedCategory);
    if (this.searchQuery) params.set('search', this.searchQuery);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
      this.searchQuery = '';
      this.filterHexies();
    }
  }

  closeModals() {
    document.querySelectorAll('.modal, .upgrade-modal').forEach(modal => {
      modal.remove();
    });
  }

  updateHexieDisplay() {
    const container = document.getElementById('hexagonLibrary');
    if (!container || !this.hexieManager) return;

    // Get filtered hexies
    let hexies = this.hexieManager.getHexiesByCategory(this.selectedCategory);
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      hexies = hexies.filter(hexie => 
        hexie.title.toLowerCase().includes(query) ||
        hexie.summary.toLowerCase().includes(query) ||
        hexie.details?.toLowerCase().includes(query) ||
        hexie.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Clear container with fade effect
    container.style.opacity = '0';
    
    setTimeout(() => {
      container.innerHTML = '';
      
      if (hexies.length === 0) {
        container.innerHTML = this.getEmptyState();
      } else {
        // Group by category for better organization
        const grouped = this.groupHexiesByCategory(hexies);
        
        Object.entries(grouped).forEach(([category, categoryHexies]) => {
          if (categoryHexies.length === 0) return;
          
          const section = this.createCategorySection(category, categoryHexies);
          container.appendChild(section);
        });
      }
      
      // Fade in
      container.style.opacity = '1';
      
      // Update results count
      this.updateResultsCount(hexies.length);
    }, 150);
  }

  groupHexiesByCategory(hexies) {
    const grouped = {};
    
    hexies.forEach(hexie => {
      if (!grouped[hexie.category]) {
        grouped[hexie.category] = [];
      }
      grouped[hexie.category].push(hexie);
    });
    
    return grouped;
  }

  createCategorySection(category, hexies) {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.style.cssText = `
      margin-bottom: 32px;
      animation: slideInUp 0.4s ease-out;
    `;
    
    // Category header
    const categoryColor = this.hexieManager.categoryColors[category] || '#4285f4';
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid ${categoryColor}20;
    `;
    
    const categoryIcon = this.getCategoryIcon(category);
    header.innerHTML = `
      <span style="font-size: 24px; margin-right: 12px;">${categoryIcon}</span>
      <h3 style="
        color: ${categoryColor};
        font-size: 20px;
        font-weight: 700;
        text-transform: capitalize;
        margin: 0;
      ">
        ${category.replace('-', ' ')} 
        <span style="
          color: #666;
          font-size: 14px;
          font-weight: 400;
          margin-left: 8px;
        ">(${hexies.length})</span>
      </h3>
    `;
    
    section.appendChild(header);
    
    // Hexie grid
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    `;
    
    hexies.forEach((hexie, index) => {
      const card = this.hexieManager.createHexieCardElement(hexie);
      
      // Stagger animation
      card.style.animation = `slideInUp 0.4s ease-out ${index * 0.1}s both`;
      
      card.addEventListener('click', (e) => {
        // Only handle click if not clicking on a button
        if (!e.target.closest('button')) {
          this.showHexieDetails(hexie);
        }
      });
      
      grid.appendChild(card);
    });
    
    section.appendChild(grid);
    return section;
  }

  getCategoryIcon(category) {
    const icons = {
      'methods': '🔧',
      'teams': '👥',
      'product': '📦',
      'leadership': '👑',
      'anti-patterns': '⚠️'
    };
    return icons[category] || '📁';
  }

  updateResultsCount(count) {
    const counter = document.getElementById('resultsCount');
    if (counter) {
      counter.textContent = `${count} hexie${count !== 1 ? 's' : ''} found`;
    }
  }

  getEmptyState() {
    if (this.searchQuery || this.selectedCategory) {
      return `
        <div style="
          text-align: center;
          padding: 60px 20px;
          color: #666;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">🔍</div>
          <h3 style="margin-bottom: 12px; color: #333;">No hexies found</h3>
          <p style="margin-bottom: 24px;">
            ${this.searchQuery ? `No results for "${this.searchQuery}"` : `No hexies in ${this.selectedCategory} category`}
          </p>
          <button onclick="app.clearFilters()" style="
            padding: 12px 24px;
            border: 2px solid #4285f4;
            border-radius: 8px;
            background: white;
            color: #4285f4;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseover="this.style.background='#4285f4'; this.style.color='white'"
             onmouseout="this.style.background='white'; this.style.color='#4285f4'">
            Clear Filters
          </button>
        </div>
      `;
    }
    
    return `
      <div style="
        text-align: center;
        padding: 60px 20px;
        color: #666;
      ">
        <div style="font-size: 72px; margin-bottom: 24px;">🚀</div>
        <h3 style="margin-bottom: 16px; color: #333; font-weight: 700;">Welcome to Hexies Marketplace!</h3>
        <p style="margin-bottom: 32px; font-size: 18px; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;">
          Discover and create powerful tools for your professional development. Start building better teams today.
        </p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <button onclick="app.switchView('create')" style="
            padding: 16px 24px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #4285f4, #1976d2);
            color: white;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'"
             onmouseout="this.style.transform='translateY(0)'">
            🎨 Create Your First Hexie
          </button>
          <button onclick="app.showUpgradeModal()" style="
            padding: 16px 24px;
            border: 2px solid #4285f4;
            border-radius: 10px;
            background: white;
            color: #4285f4;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.background='#f8f9ff'"
             onmouseout="this.style.background='white'">
            ⭐ View Premium Features
          </button>
        </div>
      </div>
    `;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    
    this.filterHexies();
    this.hexieManager.trackEvent('filters_cleared');
  }

  async handleCreateHexie() {
    const form = document.getElementById('createHexieForm');
    if (!form) return;
    
    // Validate form
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      this.showError('Please fix the validation errors before submitting.');
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '🔄 Creating...';
      
      const formData = new FormData(form);
      const hexieData = {
        title: formData.get('hexieTitle').trim(),
        category: formData.get('hexieCategory'),
        icon: formData.get('hexieIcon') || '🔷',
        summary: formData.get('hexieSummary').trim(),
        details: formData.get('hexieDetails').trim(),
        reference: formData.get('hexieReference').trim(),
        difficulty: formData.get('hexieDifficulty') || 'beginner',
        duration: formData.get('hexieDuration') || 'varies',
        teamSize: formData.get('hexieTeamSize') || 'any',
        tags: formData.get('hexieTags') ? 
          formData.get('hexieTags').split(',').map(tag => tag.trim()).filter(tag => tag) : 
          []
      };
      
      // Create hexie
      const newHexie = await this.hexieManager.addHexie(hexieData);
      
      // Success feedback with enhanced animation
      submitBtn.innerHTML = '✅ Created Successfully!';
      submitBtn.style.background = '#4caf50';
      this.showSuccess(`"${newHexie.title}" created successfully!`);
      
      // Save as draft (clear after success)
      localStorage.removeItem('hexies_draft');
      
      // Reset form with delay
      setTimeout(() => {
        form.reset();
        this.switchView('library');
        
        // Scroll to new hexie if visible
        setTimeout(() => {
          const newCard = document.querySelector(`[data-hexie-id="${newHexie.id}"]`);
          if (newCard) {
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newCard.style.animation = 'pulse 1s ease-in-out';
          }
        }, 500);
      }, 1500);
      
    } catch (error) {
      console.error('Create hexie error:', error);
      submitBtn.innerHTML = '❌ Error - Try Again';
      submitBtn.style.background = '#f44336';
      this.showError(error.message);
      
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }
  }

  showHexieDetails(hexie) {
    const modal = document.createElement('div');
    modal.className = 'hexie-details-modal modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      backdrop-filter: blur(8px);
      animation: modalFadeIn 0.3s ease-out;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      margin: 20px;
      position: relative;
    `;

    const categoryColor = this.hexieManager.categoryColors[hexie.category] || '#4285f4';
    
    content.innerHTML = `
      <button onclick="this.closest('.modal').remove()" style="
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        color: #666;
        transition: all 0.2s;
      " onmouseover="this.style.color='#333'" onmouseout="this.style.color='#666'">
        ×
      </button>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 64px; margin-bottom: 16px;">${hexie.icon}</div>
        <h2 style="color: ${categoryColor}; font-size: 28px; font-weight: 700; margin-bottom: 8px;">
          ${hexie.title}
        </h2>
        <div style="color: #666; text-transform: uppercase; font-size: 12px; font-weight: 600; letter-spacing: 1px;">
          ${hexie.category} • ${hexie.difficulty || 'Beginner'}
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h3 style="color: #333; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Summary</h3>
        <p style="color: #666; line-height: 1.6; font-size: 14px;">${hexie.summary}</p>
      </div>
      
      ${hexie.details ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #333; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Details</h3>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">${hexie.details}</p>
        </div>
      ` : ''}
      
      ${hexie.benefits && hexie.benefits.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #333; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Benefits</h3>
          <ul style="color: #666; line-height: 1.6; font-size: 14px; padding-left: 20px;">
            ${hexie.benefits.map(benefit => `<li style="margin-bottom: 4px;">${benefit}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
        ${hexie.duration ? `
          <div style="text-align: center; padding: 16px; background: #f8f9ff; border-radius: 12px;">
            <div style="font-size: 20px; margin-bottom: 8px;">⏱️</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">Duration</div>
            <div style="font-size: 12px; color: #666;">${hexie.duration}</div>
          </div>
        ` : ''}
        ${hexie.teamSize ? `
          <div style="text-align: center; padding: 16px; background: #f0fdf4; border-radius: 12px;">
            <div style="font-size: 20px; margin-bottom: 8px;">👥</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">Team Size</div>
            <div style="font-size: 12px; color: #666;">${hexie.teamSize}</div>
          </div>
        ` : ''}
      </div>
      
      ${hexie.tags && hexie.tags.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #333; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Tags</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${hexie.tags.map(tag => `
              <span style="
                background: rgba(${this.hexieManager.hexToRgb(categoryColor)}, 0.1);
                color: ${categoryColor};
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
              ">#${tag}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 12px; justify-content: center;">
        ${this.hexieManager.canAccessHexie(hexie) ? `
          <button onclick="app.addHexieToBoard('${hexie.id}', this)" style="
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, ${categoryColor}, ${this.hexieManager.darkenColor(categoryColor, 15)});
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
          " onmouseover="this.style.transform='translateY(-2px)'"
             onmouseout="this.style.transform='translateY(0)'">
            🚀 Add to Board
          </button>
        ` : `
          <button onclick="app.showUpgradeModal()" style="
            padding: 12px 24px;
            border: 2px solid #ff6b35;
            border-radius: 10px;
            background: white;
            color: #ff6b35;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
          " onmouseover="this.style.background='#ff6b35'; this.style.color='white'"
             onmouseout="this.style.background='white'; this.style.color='#ff6b35'">
            ⭐ Upgrade to Access
          </button>
        `}
        ${hexie.reference ? `
          <button onclick="window.open('${hexie.reference}', '_blank')" style="
            padding: 12px 24px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background: white;
            color: #333;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
          " onmouseover="this.style.background='#f5f5f5'"
             onmouseout="this.style.background='white'">
            📖 View Reference
          </button>
        ` : ''}
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Track detail view
    this.hexieManager.trackEvent('hexie_details_viewed', { hexieId: hexie.id });
  }

  async addHexieToBoard(hexieId, button) {
    if (!this.hexieManager) return;
    
    const hexie = this.hexieManager.hexies.find(h => h.id === hexieId);
    if (!hexie) {
      this.showError('Hexie not found');
      return;
    }
    
    const originalText = button.innerHTML;
    
    try {
      button.disabled = true;
      button.innerHTML = '🔄 Adding...';
      
      await this.hexieManager.createHexieOnBoard(hexie);
      
      button.innerHTML = '✅ Added!';
      button.style.background = '#4caf50';
      
      // Close modal after success
      setTimeout(() => {
        const modal = button.closest('.modal');
        if (modal) modal.remove();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to add hexie to board:', error);
      button.innerHTML = '❌ Error';
      button.style.background = '#f44336';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
        button.disabled = false;
      }, 2000);
    }
  }

  updateSubscriptionDisplay() {
    const statusElement = document.getElementById('subscriptionStatus');
    if (!statusElement || !this.hexieManager) return;
    
    const subscription = this.hexieManager.userSubscription;
    if (!subscription) return;
    
    const plan = subscription.plan;
    const isActive = subscription.status === 'active';
    
    statusElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: ${plan.id === 'free' ? '#f5f5f5' : '#e3f2fd'};
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        border: 2px solid ${plan.id === 'free' ? '#e1e5e9' : '#4285f4'};
      ">
        <span style="color: ${plan.id === 'free' ? '#666' : '#4285f4'};">${plan.name} Plan</span>
        ${isActive && plan.id !== 'free' ? '<span style="color: #4caf50;">✓</span>' : ''}
        ${!isActive ? '<span style="color: #f44336;">⚠️</span>' : ''}
      </div>
    `;
    
    // Add click handler for subscription management
    statusElement.style.cursor = 'pointer';
    statusElement.onclick = () => this.showSubscriptionModal();
  }

  showSubscriptionModal() {
    // Implementation for subscription management modal
    this.showUpgradeModal();
  }

  setupTestButtons() {
    const testBtn = document.getElementById('testBtn');
    const userInfoBtn = document.getElementById('userInfoBtn');
    const createStickyBtn = document.getElementById('createStickyBtn');
    
    if (testBtn) {
      testBtn.disabled = false;
      testBtn.addEventListener('click', this.runBasicTest.bind(this));
    }
    
    if (userInfoBtn) {
      userInfoBtn.disabled = false;
      userInfoBtn.addEventListener('click', this.getUserInfo.bind(this));
    }
    
    if (createStickyBtn) {
      createStickyBtn.disabled = false;
      createStickyBtn.addEventListener('click', this.createTestSticky.bind(this));
    }
  }

  async runBasicTest() {
    this.showOutput('🧪 Running comprehensive tests...');
    
    try {
      // Test 1: Board info
      const board = await miro.board.getInfo();
      this.showOutput(`✅ Board Info: ${JSON.stringify(board, null, 2)}`);
      
      // Test 2: Current user
      const user = await miro.board.getUserInfo();
      this.showOutput(`✅ User Info: ${JSON.stringify(user, null, 2)}`);
      
      // Test 3: Permissions
      const permissions = await miro.board.getPermissions();
      this.showOutput(`✅ Permissions: ${JSON.stringify(permissions, null, 2)}`);
      
      // Test 4: Viewport
      const viewport = await miro.board.viewport.get();
      this.showOutput(`✅ Viewport: ${JSON.stringify(viewport, null, 2)}`);
      
      this.showSuccess('All tests passed successfully!');
    } catch (error) {
      this.showOutput(`❌ Test failed: ${error.message}`);
      this.showError('Some tests failed. Check console for details.');
    }
  }

  async getUserInfo() {
    try {
      const user = await miro.board.getUserInfo();
      this.showOutput(`👤 User Information:\n${JSON.stringify(user, null, 2)}`);
    } catch (error) {
      this.showOutput(`❌ Error getting user info: ${error.message}`);
    }
  }

  async createTestSticky() {
    try {
      const sticky = await miro.board.createStickyNote({
        content: `🧪 Test note created at ${new Date().toLocaleTimeString()}`,
        x: 0,
        y: 0,
        style: {
          fillColor: 'yellow',
          textAlign: 'center'
        }
      });
      
      await miro.board.viewport.zoomTo(sticky);
      this.showOutput(`✅ Created test sticky note with ID: ${sticky.id}`);
      
      // Track test action
      this.hexieManager?.trackEvent('test_sticky_created', { stickyId: sticky.id });
    } catch (error) {
      this.showOutput(`❌ Error creating sticky note: ${error.message}`);
    }
  }

  showOutput(message) {
    const output = document.getElementById('output');
    const content = document.getElementById('outputContent');
    
    if (output && content) {
      output.style.display = 'block';
      content.textContent = message;
      
      // Auto-scroll to bottom
      content.scrollTop = content.scrollHeight;
    }
  }

  updateStatus(type, message, submessage = '') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    statusEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div>${message}</div>
        ${type === 'loading' ? '<div class="spinner"></div>' : ''}
      </div>
      ${submessage ? `<div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">${submessage}</div>` : ''}
    `;
    
    statusEl.className = `status ${type}`;
    
    // Add spinner CSS if not exists
    if (type === 'loading' && !document.querySelector('.spinner-style')) {
      const spinnerStyle = document.createElement('style');
      spinnerStyle.className = 'spinner-style';
      spinnerStyle.textContent = `
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #4285f4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinnerStyle);
    }
  }

  showRetryButton() {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry Initialization';
    retryBtn.style.cssText = `
      margin-top: 16px;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      background: #4285f4;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    
    retryBtn.addEventListener('mouseover', () => {
      retryBtn.style.background = '#1976d2';
      retryBtn.style.transform = 'translateY(-2px)';
    });
    
    retryBtn.addEventListener('mouseout', () => {
      retryBtn.style.background = '#4285f4';
      retryBtn.style.transform = 'translateY(0)';
    });
    
    retryBtn.onclick = () => {
      statusEl.removeChild(retryBtn);
      this.initialize();
    };
    
    statusEl.appendChild(retryBtn);
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showWarning(message) {
    this.showToast(message, 'warning');
  }

  showInfo(message) {
    this.showToast(message, 'info');
  }

  createToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      z-index: 3000;
      backdrop-filter: blur(8px);
      animation: slideInRight 0.3s ease-out;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    
    const colors = {
      success: { bg: '#4caf50', icon: '✅' },
      error: { bg: '#f44336', icon: '❌' },
      warning: { bg: '#ff9800', icon: '⚠️' },
      info: { bg: '#2196f3', icon: 'ℹ️' }
    };
    
    const config = colors[type] || colors.info;
    toast.style.background = config.bg;
    
    toast.innerHTML = `
      <span style="font-size: 18px;">${config.icon}</span>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.7;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }
    
    return toast;
  }

  showToast(message, type = 'info', duration = 5000) {
    return this.createToast(message, type, duration);
  }

  showUpgradeModal() {
    if (this.hexieManager && this.hexieManager.showUpgradeModal) {
      this.hexieManager.showUpgradeModal();
    } else {
      // Fallback upgrade modal
      this.createToast('Upgrade functionality will be available soon!', 'info');
    }
  }

  // Handle upgrade process
  async handleUpgrade(plan) {
    if (this.hexieManager && this.hexieManager.handleUpgrade) {
      return this.hexieManager.handleUpgrade(plan);
    } else {
      this.createToast(`Upgrade to ${plan} plan initiated`, 'info');
    }
  }

  initializeTestView() {
    // Additional test view initialization
    console.log('Test view initialized');
  }

  destroy() {
    // Cleanup when app is destroyed
    if (this.hexieManager) {
      this.hexieManager.destroy();
    }
    
    // Remove event listeners
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
    
    console.log('🧹 App destroyed and cleaned up');
  }
}

// Global app instance
window.app = new HexiesApp();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 Starting Professional Hexies Marketplace...');
  window.app.initialize();
});

// Add required CSS animations and styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  .status.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #4caf50;
    border-radius: 8px;
    padding: 12px 16px;
  }
  
  .status.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #f44336;
    border-radius: 8px;
    padding: 12px 16px;
  }
  
  .status.loading {
    background-color: #e3f2fd;
    color: #1565c0;
    border: 1px solid #2196f3;
    border-radius: 8px;
    padding: 12px 16px;
  }
  
  .status.warning {
    background-color: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ff9800;
    border-radius: 8px;
    padding: 12px 16px;
  }
  
  .hexagon-card {
    transition: all 0.3s ease;
  }
  
  .hexagon-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  
  .tab {
    transition: all 0.2s ease;
  }
  
  .tab:hover {
    background-color: rgba(66, 133, 244, 0.1);
  }
  
  .tab.active {
    background-color: rgba(66, 133, 244, 0.1);
    border-bottom: 2px solid #4285f4;
  }
  
  .field-error {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* Improve button interactions */
  button {
    transition: all 0.2s ease;
  }
  
  button:active {
    transform: scale(0.98);
  }
  
  /* Loading states */
  .loading {
    opacity: 0.7;
    pointer-events: none;
  }
  
  .loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #4285f4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);