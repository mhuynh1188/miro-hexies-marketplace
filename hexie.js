/*

// hexie.js - Professional Miro Marketplace Application (Fixed)
class HexieManager {
  constructor() {
    this.hexies = [];
    this.categoryColors = {
      'methods': '#4285f4',
      'teams': '#34a853', 
      'product': '#fbbc04',
      'leadership': '#ea4335',
      'anti-patterns': '#9c27b0'
    };
    this.userSubscription = null;
    this.initialized = false;
    this.authToken = null;
    this.userId = null;
    this.flipHandler = null;
    this.lastClickTime = 0;
    this.clickDelay = 300;
    this.lastSelectedId = null;
    
    // Browser-compatible API configuration
    this.apiBaseUrl = this.getApiBaseUrl();
    
    // Initialize with default hexies
    this.initializeDefaultHexies();
  }

  // Get API base URL in a browser-compatible way
  getApiBaseUrl() {
    // Check for environment-specific URLs
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001'; // Development
    } else {
      return 'https://api.hexies-marketplace.com'; // Production
    }
  }

  // Authentication and initialization
  async initialize() {
    try {
      console.log('🚀 Initializing Professional Hexies Marketplace...');
      
      // Authenticate with backend
      await this.authenticateUser();
      
      // Get subscription status
      await this.checkSubscriptionStatus();
      
      // Initialize flip handler
      this.initializeFlipHandler();
      
      // Track app initialization
      this.trackEvent('app_initialized');
      
      this.initialized = true;
      console.log('✅ HexieManager initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize HexieManager:', error);
      throw error;
    }
  }

  async authenticateUser() {
    try {
      // Get Miro user information
      const miroUser = await miro.board.getUserInfo();
      this.userId = miroUser.id;
      
      // For demo purposes, simulate authentication
      // In production, you would authenticate with your backend API
      this.authToken = `demo_token_${this.userId}_${Date.now()}`;
      
      console.log('✅ User authenticated:', { id: this.userId, name: miroUser.name });
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw new Error('Failed to authenticate with Miro');
    }
  }

  async getBoardId() {
    try {
      const boardInfo = await miro.board.getInfo();
      return boardInfo.id;
    } catch (error) {
      console.error('Failed to get board ID:', error);
      return null;
    }
  }

  async checkSubscriptionStatus() {
    try {
      // Simulate subscription check
      // In production, you would call your backend API
      this.userSubscription = {
        plan: { 
          id: 'free', 
          name: 'Free',
          features: ['basic_hexies', 'create_custom'],
          limit: 5
        },
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: null
      };
      
      console.log('💳 Subscription status:', this.userSubscription.plan.name);
      return this.userSubscription;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Fallback to free plan
      this.userSubscription = {
        plan: { 
          id: 'free', 
          name: 'Free',
          features: ['basic_hexies', 'create_custom'],
          limit: 5
        },
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: null
      };
      return this.userSubscription;
    }
  }

  // Default hexies with rich content
  initializeDefaultHexies() {
    const defaultHexies = [
      {
        id: 'hexie_1',
        title: 'Retrospective',
        category: 'methods',
        icon: '🔍',
        summary: 'Reflect and improve team processes through structured discussion',
        details: 'A collaborative session where teams discuss what went well, what didn\'t work, and how to improve in the next iteration. Essential for continuous improvement and team growth.',
        reference: 'https://www.atlassian.com/team-playbook/plays/retrospective',
        tags: ['agile', 'continuous-improvement', 'reflection', 'team-building'],
        benefits: ['Increases team transparency', 'Identifies improvement opportunities', 'Builds team trust'],
        free: true,
        difficulty: 'beginner',
        duration: '60-90 minutes',
        teamSize: '3-8 people'
      },
      {
        id: 'hexie_2', 
        title: 'User Story Mapping',
        category: 'product',
        icon: '🗺️',
        summary: 'Visualize user journey and prioritize features effectively',
        details: 'Create a shared understanding of the user experience by mapping user activities, tasks, and features. Helps prioritize development based on user value.',
        reference: 'https://www.jpattonassociates.com/user-story-mapping/',
        tags: ['user-experience', 'product-management', 'prioritization', 'planning'],
        benefits: ['Aligns team on user needs', 'Improves feature prioritization', 'Reduces scope creep'],
        free: true,
        difficulty: 'intermediate',
        duration: '2-4 hours',
        teamSize: '4-10 people'
      },
      {
        id: 'hexie_3',
        title: 'Team Charter',
        category: 'teams',
        icon: '🤝',
        summary: 'Define team purpose, values, and ways of working',
        details: 'Establish clear team mission, values, roles, and collaboration guidelines. Creates alignment and sets expectations for how the team will work together.',
        reference: 'https://rework.withgoogle.com/guides/teams-create-charter/steps/introduction/',
        tags: ['team-building', 'alignment', 'collaboration', 'governance'],
        benefits: ['Increases team cohesion', 'Clarifies expectations', 'Improves communication'],
        free: false,
        difficulty: 'intermediate',
        duration: '2-3 hours',
        teamSize: '5-12 people'
      },
      {
        id: 'hexie_4',
        title: 'Design Thinking',
        category: 'methods',
        icon: '💡',
        summary: 'Human-centered approach to innovation and problem-solving',
        details: 'A five-stage methodology for creative problem solving that focuses on understanding users and reframing problems.',
        reference: 'https://designthinking.ideo.com/',
        tags: ['innovation', 'creativity', 'human-centered', 'prototyping'],
        benefits: ['Drives innovation', 'Reduces risk', 'Improves user satisfaction'],
        free: false,
        difficulty: 'advanced',
        duration: '1-5 days',
        teamSize: '6-15 people'
      },
      {
        id: 'hexie_5',
        title: 'Leadership Canvas',
        category: 'leadership',
        icon: '👑',
        summary: 'Map your leadership vision and strategic direction',
        details: 'A visual tool to define and communicate leadership direction, values, and strategic initiatives.',
        reference: 'https://www.strategyzer.com/leadership-canvas',
        tags: ['strategy', 'vision', 'leadership', 'communication'],
        benefits: ['Clarifies leadership vision', 'Improves team alignment', 'Enhances communication'],
        free: false,
        difficulty: 'advanced',
        duration: '1-2 hours',
        teamSize: '1-5 people'
      },
      {
        id: 'hexie_6',
        title: 'Confirmation Bias',
        category: 'anti-patterns',
        icon: '🚫',
        summary: 'Recognize and avoid seeking only confirming information',
        details: 'The tendency to search for, interpret, and favor information that confirms preexisting beliefs.',
        reference: 'https://en.wikipedia.org/wiki/Confirmation_bias',
        tags: ['cognitive-bias', 'decision-making', 'critical-thinking', 'objectivity'],
        benefits: ['Improves decision quality', 'Reduces risk', 'Increases objectivity'],
        free: true,
        difficulty: 'beginner',
        duration: '30-45 minutes',
        teamSize: 'any'
      },
      {
        id: 'hexie_7',
        title: 'Analysis Paralysis',
        category: 'anti-patterns',
        icon: '🔄',
        summary: 'Break the cycle of endless analysis without action',
        details: 'The state of over-analyzing situations to the point where decisions or actions are never taken.',
        reference: 'https://www.psychologytoday.com/us/blog/stretching-theory/201903/analysis-paralysis',
        tags: ['decision-making', 'perfectionism', 'procrastination', 'action'],
        benefits: ['Increases speed to action', 'Reduces overthinking', 'Improves agility'],
        free: true,
        difficulty: 'intermediate',
        duration: '45-60 minutes',
        teamSize: 'any'
      },
      {
        id: 'hexie_8',
        title: 'OKRs Framework',
        category: 'methods',
        icon: '🎯',
        summary: 'Set and track ambitious goals with measurable results',
        details: 'Objectives and Key Results framework for setting challenging, ambitious goals with measurable outcomes.',
        reference: 'https://www.whatmatters.com/faqs/okr-meaning-definition-example',
        tags: ['goal-setting', 'measurement', 'alignment', 'performance'],
        benefits: ['Improves focus', 'Increases transparency', 'Drives results'],
        free: false,
        difficulty: 'intermediate',
        duration: '1-2 hours',
        teamSize: '3-15 people'
      }
    ];

    this.hexies = defaultHexies;
  }

  // Access control with detailed feature flags
  canAccessHexie(hexie) {
    if (!this.userSubscription) return false;
    if (hexie.free) return true;
    if (hexie.isUserCreated) return true;
    
    const plan = this.userSubscription.plan.id;
    
    // Premium features for paid plans
    if (plan === 'pro' || plan === 'enterprise') {
      return true;
    }
    
    return false;
  }

  hasFeatureAccess(feature) {
    if (!this.userSubscription) return false;
    return this.userSubscription.plan.features.includes(feature);
  }

  // Data management with persistence
  getHexiesByCategory(category = '') {
    let filtered = this.hexies;
    
    if (category) {
      filtered = this.hexies.filter(hexie => hexie.category === category);
    }
    
    return filtered;
  }

  async addHexie(hexieData) {
    // Check limits
    const userHexies = this.hexies.filter(h => h.isUserCreated).length;
    const limit = this.userSubscription.plan.limit || 5;
    
    if (userHexies >= limit && this.userSubscription.plan.id === 'free') {
      throw new Error(`Free plan limited to ${limit} custom hexies. Upgrade to create more.`);
    }

    const newHexie = {
      id: `user_hexie_${Date.now()}`,
      title: hexieData.title,
      category: hexieData.category,
      icon: hexieData.icon || '🔷',
      summary: hexieData.summary,
      details: hexieData.details || '',
      reference: hexieData.reference || '',
      tags: hexieData.tags || [],
      benefits: hexieData.benefits || [],
      free: true,
      isUserCreated: true,
      createdAt: new Date().toISOString(),
      userId: this.userId,
      difficulty: hexieData.difficulty || 'beginner',
      duration: hexieData.duration || 'varies',
      teamSize: hexieData.teamSize || 'any'
    };
    
    this.hexies.push(newHexie);
    
    // Track creation
    this.trackEvent('hexie_created', { hexieId: newHexie.id });
    
    console.log('✅ Added new hexie:', newHexie);
    return newHexie;
  }

  // Enhanced UI Components
  createHexieCardElement(hexie) {
    const card = document.createElement('div');
    card.className = 'hexagon-card';
    card.setAttribute('data-hexie-id', hexie.id);
    
    const canAccess = this.canAccessHexie(hexie);
    const color = this.categoryColors[hexie.category] || '#4285f4';
    
    card.style.cssText = `
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 2px solid transparent;
      overflow: hidden;
      min-height: 320px;
      display: flex;
      flex-direction: column;
    `;
    
    // Premium badge for locked hexies
    let badges = '';
    if (!canAccess && !hexie.free) {
      badges += `
        <div class="premium-badge" style="
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #ff6b35, #ff8142);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
          z-index: 2;
        ">
          ⭐ Premium
        </div>
      `;
    }
    
    // User created badge
    if (hexie.isUserCreated) {
      badges += `
        <div class="user-badge" style="
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #4caf50, #43a047);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
          z-index: 2;
        ">
          👤 Your Hexie
        </div>
      `;
    }

    // Difficulty badge
    const difficultyColors = {
      'beginner': '#4caf50',
      'intermediate': '#ff9800', 
      'advanced': '#f44336'
    };
    const difficultyColor = difficultyColors[hexie.difficulty] || '#666';
    
    card.innerHTML = `
      ${badges}
      
      <!-- Hexagon Shape with enhanced design -->
      <div class="hexie-icon" style="
        width: 120px;
        height: 104px;
        background: linear-gradient(135deg, ${color}, ${this.darkenColor(color, 20)});
        position: relative;
        margin: 0 auto 24px;
        clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(66, 133, 244, 0.2);
        transition: all 0.3s ease;
        ${!canAccess ? 'opacity: 0.6;' : ''}
      ">
        <div style="font-size: 36px; margin-bottom: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          ${canAccess ? hexie.icon : '🔒'}
        </div>
        <div style="font-size: 11px; font-weight: 700; text-align: center; line-height: 1.2; padding: 0 12px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
          ${hexie.title}
        </div>
      </div>
      
      <!-- Enhanced Card Content -->
      <div class="card-content" style="flex-grow: 1; display: flex; flex-direction: column;">
        <!-- Category and Difficulty -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="
            font-size: 12px;
            color: ${color};
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">
            ${hexie.category}
          </div>
          <div style="
            background: rgba(${this.hexToRgb(difficultyColor)}, 0.1);
            color: ${difficultyColor};
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          ">
            ${hexie.difficulty}
          </div>
        </div>
        
        <!-- Summary -->
        <div style="
          font-size: 14px;
          color: #333;
          line-height: 1.5;
          margin-bottom: 16px;
          flex-grow: 1;
        ">
          ${canAccess ? hexie.summary : 'Upgrade to premium to access this hexie and unlock advanced features.'}
        </div>
        
        <!-- Metadata -->
        ${canAccess ? `
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 16px;
            font-size: 11px;
            color: #666;
          ">
            <div>⏱️ ${hexie.duration}</div>
            <div>👥 ${hexie.teamSize}</div>
          </div>
        ` : ''}
        
        <!-- Tags -->
        ${hexie.tags && canAccess ? `
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 16px;
          ">
            ${hexie.tags.slice(0, 3).map(tag => `
              <span style="
                background: rgba(${this.hexToRgb(color)}, 0.1);
                color: ${color};
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
              ">#${tag}</span>
            `).join('')}
            ${hexie.tags.length > 3 ? `
              <span style="
                background: #f5f5f5;
                color: #666;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
              ">+${hexie.tags.length - 3}</span>
            ` : ''}
          </div>
        ` : ''}
        
        <!-- Action Button -->
        ${canAccess ? `
          <button class="add-to-board-btn" style="
            width: 100%;
            padding: 14px 20px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, ${color}, ${this.darkenColor(color, 15)});
            color: white;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
            position: relative;
            overflow: hidden;
          " data-hexie-id="${hexie.id}">
            <span style="position: relative; z-index: 1;">🚀 Add to Board</span>
          </button>
        ` : `
          <button class="upgrade-btn" onclick="window.app?.showUpgradeModal?.()" style="
            width: 100%;
            padding: 14px 20px;
            border: 2px solid #ff6b35;
            border-radius: 12px;
            background: white;
            color: #ff6b35;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          ">
            <span style="position: relative; z-index: 1;">⭐ Upgrade to Access</span>
          </button>
        `}
      </div>
    `;
    
    // Enhanced hover effects
    card.addEventListener('mouseenter', () => {
      if (canAccess) {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 16px 32px rgba(0,0,0,0.15)';
        card.style.borderColor = color;
        
        const hexieIcon = card.querySelector('.hexie-icon');
        if (hexieIcon) {
          hexieIcon.style.transform = 'scale(1.05)';
        }
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      card.style.borderColor = 'transparent';
      
      const hexieIcon = card.querySelector('.hexie-icon');
      if (hexieIcon) {
        hexieIcon.style.transform = 'scale(1)';
      }
    });
    
    // Add button click handler
    const addBtn = card.querySelector('.add-to-board-btn');
    if (addBtn) {
      addBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.handleAddToBoard(hexie, addBtn);
      });
    }
    
    return card;
  }

  async handleAddToBoard(hexie, button) {
    const originalText = button.innerHTML;
    
    try {
      button.disabled = true;
      button.innerHTML = '<span style="position: relative; z-index: 1;">🔄 Adding...</span>';
      button.style.background = '#666';
      
      await this.createHexieOnBoard(hexie);
      
      // Success feedback
      button.innerHTML = '<span style="position: relative; z-index: 1;">✅ Added!</span>';
      button.style.background = '#4caf50';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = `linear-gradient(135deg, ${this.categoryColors[hexie.category]}, ${this.darkenColor(this.categoryColors[hexie.category], 15)})`;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add hexie to board:', error);
      button.innerHTML = '<span style="position: relative; z-index: 1;">❌ Error</span>';
      button.style.background = '#f44336';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = `linear-gradient(135deg, ${this.categoryColors[hexie.category]}, ${this.darkenColor(this.categoryColors[hexie.category], 15)})`;
        button.disabled = false;
      }, 2000);
    }
  }

  // Create hexagon on board with proper functionality
  async createHexieOnBoard(hexie) {
    if (!this.canAccessHexie(hexie)) {
      this.showUpgradeMessage();
      return;
    }

    try {
      const viewport = await miro.board.viewport.get();
      const x = viewport.x + (Math.random() * 300) - 150;
      const y = viewport.y + (Math.random() * 300) - 150;

      // Create the hexagon with proper metadata
      const hexagonWidget = await this.createAdvancedHexagon(hexie, x, y, false);
      
      // Track usage
      this.trackEvent('hexie_added_to_board', { hexieId: hexie.id });
      
      await miro.board.viewport.zoomTo(hexagonWidget);
      return hexagonWidget;
    } catch (error) {
      console.error('Error creating hexie on board:', error);
      throw error;
    }
  }

  // Create hexagon with proper widget replacement for flipping
  async createAdvancedHexagon(hexie, x, y, isFlipped = false) {
    const color = this.categoryColors[hexie.category] || '#4285f4';
    
    // Generate SVG with modern design
    const hexagonSvg = this.generateModernHexagonSVG(hexie, color, isFlipped);
    const svgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(hexagonSvg)));

    // Create the hexagon widget
    const hexagonWidget = await miro.board.createImage({
      url: svgData,
      x: x,
      y: y,
      width: 180,
      height: 156,
      title: `${hexie.title} - ${isFlipped ? 'Details' : 'Summary'} (Double-click to flip)`,
      alt: `${hexie.title} - ${hexie.category}`
    });

    // Store comprehensive metadata for flip functionality
    await hexagonWidget.setMetadata('hexie', {
      ...hexie,
      isFlipped: isFlipped,
      position: { x, y },
      createdAt: new Date().toISOString()
    });

    return hexagonWidget;
  }

  // Enhanced SVG generation with modern design
  generateModernHexagonSVG(hexie, color, isFlipped) {
    const baseId = `hexie-${hexie.id}-${Date.now()}`;
    const darkColor = this.darkenColor(color, 30);
    
    if (!isFlipped) {
      // Modern front design with gradient and effects
      return `
        <svg width="180" height="156" viewBox="0 0 180 156" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${baseId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
              <stop offset="50%" style="stop-color:${this.lightenColor(color, 10)};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
            </linearGradient>
            <filter id="shadow-${baseId}" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="4" result="offset"/>
              <feFlood flood-color="rgba(0,0,0,0.3)"/>
              <feComposite in2="offset" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Main hexagon with modern gradient -->
          <polygon points="45,12 135,12 168,78 135,144 45,144 12,78" 
                   fill="url(#grad-${baseId})" 
                   stroke="#ffffff" 
                   stroke-width="3"
                   filter="url(#shadow-${baseId})"/>
          
          <!-- Inner highlight -->
          <polygon points="50,18 130,18 160,78 130,138 50,138 20,78" 
                   fill="none" 
                   stroke="rgba(255,255,255,0.3)"
                   stroke-width="1"/>
          
          <!-- Flip indicator -->
          <circle cx="155" cy="28" r="14" fill="rgba(255,255,255,0.95)" stroke="${color}" stroke-width="2"/>
          <text x="155" y="34" text-anchor="middle" font-size="12" font-family="Arial" fill="${color}" font-weight="bold">↻</text>
          
          <!-- Category badge -->
          <rect x="15" y="15" width="${hexie.category.length * 6 + 16}" height="20" rx="10" 
                fill="rgba(255,255,255,0.9)" stroke="${color}" stroke-width="1"/>
          <text x="25" y="28" font-size="9" font-family="Arial" fill="${color}" font-weight="bold">
            ${hexie.category.toUpperCase()}
          </text>
          
          <!-- Icon -->
          <text x="90" y="55" text-anchor="middle" font-size="32" font-family="Arial" fill="white" 
                style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
            ${hexie.icon}
          </text>
          
          <!-- Title -->
          <text x="90" y="85" text-anchor="middle" font-size="13" font-weight="bold" font-family="Arial" 
                fill="white" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
            ${this.wrapTextSVG(hexie.title, 18)}
          </text>
          
          <!-- Summary -->
          ${this.createModernSVGText(hexie.summary, 90, 108, 14, 9, 'rgba(255,255,255,0.95)', 2)}
          
          <!-- Difficulty indicator -->
          <rect x="25" y="125" width="35" height="16" rx="8" fill="rgba(255,255,255,0.2)"/>
          <text x="42" y="135" text-anchor="middle" font-size="8" font-family="Arial" fill="white" font-weight="bold">
            ${hexie.difficulty.toUpperCase()}
          </text>
          
          <!-- Instruction -->
          <text x="90" y="150" text-anchor="middle" font-size="8" font-family="Arial" 
                fill="rgba(255,255,255,0.8)" font-weight="bold">
            Double-click to see details →
          </text>
        </svg>
      `;
    } else {
      // Enhanced back design with structured content
      const details = hexie.details || 'No additional details available.';
      return `
        <svg width="180" height="156" viewBox="0 0 180 156" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-back-${baseId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${darkColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${this.darkenColor(color, 50)};stop-opacity:1" />
            </linearGradient>
            <filter id="shadow-${baseId}" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="4" result="offset"/>
              <feFlood flood-color="rgba(0,0,0,0.4)"/>
              <feComposite in2="offset" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Main hexagon with darker gradient -->
          <polygon points="45,12 135,12 168,78 135,144 45,144 12,78" 
                   fill="url(#grad-back-${baseId})" 
                   stroke="#ffffff" 
                   stroke-width="3"
                   filter="url(#shadow-${baseId})"/>
          
          <!-- Return indicator -->
          <circle cx="155" cy="28" r="14" fill="rgba(255,255,255,0.95)" stroke="${color}" stroke-width="2"/>
          <text x="155" y="34" text-anchor="middle" font-size="12" font-family="Arial" fill="${color}" font-weight="bold">↺</text>
          
          <!-- Content area -->
          <polygon points="55,25 125,25 145,78 125,131 55,131 35,78" 
                   fill="rgba(255,255,255,0.98)" 
                   stroke="rgba(255,255,255,0.8)"
                   stroke-width="1"/>
          
          <!-- Header -->
          <text x="38" y="45" text-anchor="start" font-size="16" font-family="Arial" fill="${color}">${hexie.icon}</text>
          <text x="60" y="45" text-anchor="start" font-size="11" font-weight="bold" font-family="Arial" fill="${color}">
            ${this.wrapTextSVG(hexie.title, 14)}
          </text>
          
          <!-- Details section -->
          <foreignObject x="40" y="50" width="100" height="75">
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              font-family: Arial, sans-serif;
              font-size: 8px;
              line-height: 1.4;
              color: #333;
              text-align: left;
              padding: 5px;
              overflow: hidden;
              word-wrap: break-word;
            ">
              <div style='font-weight: bold; color: ${color}; margin-bottom: 6px; font-size: 9px;'>
                Key Details:
              </div>
              ${this.formatDetailsForSVG(details, 180)}
            </div>
          </foreignObject>
          
          <!-- Tags -->
          ${hexie.tags && hexie.tags.length > 0 ? `
            <text x="90" y="115" text-anchor="middle" font-size="7" font-family="Arial" fill="${color}" font-weight="bold">
              Tags: ${hexie.tags.slice(0, 4).join(' • ')}
            </text>
          ` : ''}
          
          <!-- Reference indicator -->
          ${hexie.reference ? `
            <text x="90" y="128" text-anchor="middle" font-size="8" font-family="Arial" fill="${color}" 
                  font-weight="bold" text-decoration="underline">
              📎 Reference Available
            </text>
          ` : ''}
          
          <!-- Return instruction -->
          <text x="90" y="150" text-anchor="middle" font-size="8" font-family="Arial" 
                fill="rgba(255,255,255,0.9)" font-weight="bold">
            ← Double-click to return
          </text>
        </svg>
      `;
    }
  }

  // Double-click handler with proper widget replacement
  initializeFlipHandler() {
    if (this.flipHandler) {
      miro.board.ui.off('selection:update', this.flipHandler);
    }

    this.flipHandler = async (event) => {
      const selection = await miro.board.getSelection();
      
      if (selection.length !== 1) return;
      
      const item = selection[0];
      if (item.type !== 'image') return;
      
      try {
        const metadata = await item.getMetadata('hexie');
        if (!metadata || !metadata.id) return;
        
        // Check for double-click
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;
        
        if (timeDiff < this.clickDelay && this.lastSelectedId === item.id) {
          // Double-click detected - flip by replacing widget
          await this.performWidgetFlip(item, metadata);
          // Clear selection after flip
          setTimeout(() => miro.board.deselect(), 100);
        }
        
        this.lastClickTime = currentTime;
        this.lastSelectedId = item.id;
        
      } catch (error) {
        // Not a hexie, ignore silently
      }
    };

    miro.board.ui.on('selection:update', this.flipHandler);
    console.log('✅ Enhanced double-click flip handler initialized');
  }

  // Replace widget instead of updating (resolves the error)
  async performWidgetFlip(currentWidget, metadata) {
    try {
      // Get current widget properties
      const currentPosition = { x: currentWidget.x, y: currentWidget.y };
      const currentRotation = currentWidget.rotation || 0;
      const currentWidth = currentWidget.width;
      const currentHeight = currentWidget.height;
      
      const newFlippedState = !metadata.isFlipped;
      const color = this.categoryColors[metadata.category] || '#4285f4';
      
      // Generate new SVG for flipped state
      const newSvg = this.generateModernHexagonSVG(metadata, color, newFlippedState);
      const newSvgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(newSvg)));
      
      // Create new widget with same properties
      const newWidget = await miro.board.createImage({
        url: newSvgData,
        x: currentPosition.x,
        y: currentPosition.y,
        width: currentWidth,
        height: currentHeight,
        rotation: currentRotation,
        title: `${metadata.title} - ${newFlippedState ? 'Details' : 'Summary'} (Double-click to flip)`,
        alt: `${metadata.title} - ${metadata.category}`
      });
      
      // Update metadata for new widget
      await newWidget.setMetadata('hexie', {
        ...metadata,
        isFlipped: newFlippedState,
        position: currentPosition,
        lastFlipped: new Date().toISOString()
      });
      
      // Remove old widget
      await miro.board.remove(currentWidget);
      
      // Track the flip
      this.trackEvent(newFlippedState ? 'hexie_flipped_to_back' : 'hexie_flipped_to_front', { 
        hexieId: metadata.id 
      });
      
      // Focus on new widget
      await miro.board.viewport.zoomTo(newWidget);
      
      console.log(`⚡ Successfully flipped ${metadata.title} to ${newFlippedState ? 'back' : 'front'}`);
      
    } catch (error) {
      console.error('Error performing flip:', error);
      throw error;
    }
  }

  // Helper functions
  createModernSVGText(text, x, startY, maxWidth, fontSize, color, maxLines) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= charsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
        if (lines.length >= maxLines - 1) break;
      }
    }
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
    
    return lines.map((line, i) => 
      `<text x="${x}" y="${startY + (i * (fontSize + 3))}" text-anchor="middle" font-size="${fontSize}" 
             font-family="Arial" fill="${color}" style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">
         ${line}${i === maxLines - 1 && text.split(' ').length > lines.join(' ').split(' ').length ? '...' : ''}
       </text>`
    ).join('\n');
  }

  formatDetailsForSVG(details, maxLength) {
    if (details.length <= maxLength) return details;
    
    // Split into sentences and truncate thoughtfully
    const sentences = details.split('. ');
    let result = '';
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i] + (i < sentences.length - 1 ? '. ' : '');
      if ((result + sentence).length <= maxLength - 20) {
        result += sentence;
      } else {
        if (result.length === 0) {
          result = sentence.substring(0, maxLength - 3) + '...';
        }
        break;
      }
    }
    
    return result || details.substring(0, maxLength - 3) + '...';
  }

  wrapTextSVG(text, maxLength) {
    if (text.length <= maxLength) return text;
    
    const words = text.split(' ');
    if (words.length === 1) {
      return text.substring(0, maxLength - 1) + '…';
    }
    
    let result = '';
    for (const word of words) {
      if ((result + ' ' + word).length <= maxLength) {
        result += (result ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return result + '…';
  }

  // Utility functions
  lightenColor(color, percent) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const factor = 1 + (percent / 100);
    const newR = Math.min(255, Math.round(r * factor));
    const newG = Math.min(255, Math.round(g * factor));
    const newB = Math.min(255, Math.round(b * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  darkenColor(color, percent) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const factor = (100 - percent) / 100;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '66, 133, 244';
  }

  // Professional upgrade modal
  showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
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
      padding: 48px;
      border-radius: 20px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 600px;
      margin: 20px;
      position: relative;
      overflow: hidden;
    `;

    content.innerHTML = `
      <!-- Background Pattern -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: linear-gradient(135deg, #4285f4, #1976d2);
        opacity: 0.1;
      "></div>
      
      <!-- Content -->
      <div style="position: relative; z-index: 1;">
        <div style="font-size: 72px; margin-bottom: 24px;">🚀</div>
        <h2 style="margin-bottom: 16px; color: #050038; font-size: 32px; font-weight: 700;">
          Upgrade to Professional
        </h2>
        <p style="color: #626f86; margin-bottom: 32px; font-size: 18px; line-height: 1.6;">
          Unlock all premium hexies, advanced frameworks, and professional features to supercharge your team's development.
        </p>
        
        <!-- Features List -->
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
          text-align: left;
        ">
          <div style="
            background: #f8f9ff;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #4285f4;
          ">
            <h3 style="margin-bottom: 12px; color: #050038; font-size: 16px;">✨ Premium Features</h3>
            <ul style="color: #626f86; font-size: 14px; line-height: 1.6; list-style: none; padding: 0;">
              <li>• All 50+ premium hexies</li>
              <li>• Advanced frameworks</li>
              <li>• Custom hexie creation</li>
              <li>• Export capabilities</li>
            </ul>
          </div>
          <div style="
            background: #f0fdf4;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #34a853;
          ">
            <h3 style="margin-bottom: 12px; color: #050038; font-size: 16px;">🎯 Team Benefits</h3>
            <ul style="color: #626f86; font-size: 14px; line-height: 1.6; list-style: none; padding: 0;">
              <li>• Team collaboration tools</li>
              <li>• Usage analytics</li>
              <li>• Priority support</li>
              <li>• Regular content updates</li>
            </ul>
          </div>
        </div>
        
        <!-- Pricing Options -->
        <div style="
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 24px;
        ">
          <button onclick="window.app?.handleUpgrade?.('monthly')" style="
            padding: 16px 32px;
            border: 2px solid #4285f4;
            border-radius: 12px;
            background: white;
            color: #4285f4;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 140px;
          " onmouseover="this.style.background='#f8f9ff'" onmouseout="this.style.background='white'">
            $9.99/month
          </button>
          <button onclick="window.app?.handleUpgrade?.('yearly')" style="
            padding: 16px 32px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, #4285f4, #1976d2);
            color: white;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3);
            min-width: 140px;
            position: relative;
          " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            $99.99/year
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: #ff6b35;
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
            ">SAVE 16%</div>
          </button>
        </div>
        
        <!-- Close Button -->
        <button onclick="this.closest('.upgrade-modal').remove()" style="
          padding: 12px 24px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
          Maybe Later
        </button>
        
        <!-- Trust Indicators -->
        <div style="
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e1e5e9;
          color: #666;
          font-size: 14px;
        ">
          🔒 Secure payment • 📞 Cancel anytime • ⭐ 30-day money-back guarantee
        </div>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Track modal view
    this.trackEvent('upgrade_modal_viewed');

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  showUpgradeMessage() {
    if (window.app && window.app.showError) {
      window.app.showError('This hexie requires a premium subscription. Upgrade to unlock all professional development tools!');
    } else {
      this.showUpgradeModal();
    }
  }

  // Analytics and tracking
  async trackEvent(eventName, properties = {}) {
    try {
      const eventData = {
        event: eventName,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        ...properties
      };
      
      console.log('📊 Tracking event:', eventData);
      
      // In production, send to backend analytics
      // await this.apiCall('/api/analytics/track', 'POST', eventData);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Fail silently for analytics
    }
  }

  // Subscription and payment integration
  async handleUpgrade(plan) {
    try {
      this.trackEvent('upgrade_initiated', { plan });
      
      // In production, create Stripe checkout session
      // const response = await this.apiCall('/api/subscription/create-checkout', 'POST', {
      //   plan,
      //   userId: this.userId,
      //   successUrl: window.location.href,
      //   cancelUrl: window.location.href
      // });
      
      // For demo purposes
      alert(`Upgrade to ${plan} plan initiated.\n\nIn production, this would redirect to Stripe checkout.`);
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Sorry, there was an error processing your upgrade. Please try again.');
    }
  }

  // Cleanup
  destroy() {
    if (this.flipHandler) {
      miro.board.ui.off('selection:update', this.flipHandler);
    }
    console.log('🧹 HexieManager destroyed');
  }
}

// Global functions for app integration
window.showUpgradeModal = function() {
  if (window.hexieManager) {
    window.hexieManager.showUpgradeModal();
  } else {
    alert('Upgrade to Premium to access this hexie!\n\nPremium features include:\n• Access to all hexies\n• Advanced frameworks\n• Priority support\n\nUpgrade now to unlock professional development tools!');
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HexieManager;
}

*/






////////////////////////




// hexie.js - Fixed Professional Miro Application (Corrected Authentication)
class HexieManager {
  constructor() {
    this.hexies = [];
    this.categoryColors = {
      'methods': '#4285f4',
      'teams': '#34a853', 
      'product': '#fbbc04',
      'leadership': '#ea4335',
      'anti-patterns': '#9c27b0'
    };
    this.userSubscription = null;
    this.initialized = false;
    this.authToken = null;
    this.userId = null;
    this.flipHandler = null;
    this.lastClickTime = 0;
    this.clickDelay = 300;
    this.lastSelectedId = null;
    
    // Initialize with default hexies
    this.initializeDefaultHexies();
  }

  // Authentication and initialization
  async initialize() {
    try {
      console.log('🚀 Initializing Professional Hexies Marketplace...');
      
      // Check if running in development mode (no backend)
      const isDevelopment = this.checkDevelopmentMode();
      
      if (isDevelopment) {
        console.log('🔧 Running in development mode without backend');
        await this.initializeDevelopmentMode();
      } else {
        // Production mode with backend
        await this.authenticateWithBackend();
        await this.checkSubscriptionStatus();
      }
      
      // Initialize flip handler
      this.initializeFlipHandler();
      
      // Track app initialization
      this.trackEvent('app_initialized');
      
      this.initialized = true;
      console.log('✅ HexieManager initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize HexieManager:', error);
      
      // Fallback to development mode if backend fails
      console.log('⚠️ Falling back to development mode...');
      await this.initializeDevelopmentMode();
      this.initialized = true;
      return true;
    }
  }

  checkDevelopmentMode() {
    // Check if we're in development by trying to detect if backend is available
    // You can also use environment variables or other indicators
    return !window.apiService || window.location.hostname === 'localhost';
  }

  async initializeDevelopmentMode() {
    try {
      // Get Miro user for development
      const miroUser = await miro.board.getUserInfo();
      this.userId = miroUser.id;
      
      // Set up mock subscription
      this.userSubscription = {
        plan: { 
          id: 'free', 
          name: 'Free',
          features: ['basic_hexies', 'create_custom'],
          limit: 5
        },
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: null
      };
      
      console.log('✅ Development mode initialized');
      return true;
    } catch (error) {
      console.error('❌ Development mode initialization failed:', error);
      throw error;
    }
  }

  async authenticateWithBackend() {
    try {
      // Ensure apiService is available
      if (!window.apiService) {
        throw new Error('API Service not loaded');
      }

      // Get Miro user information
      const miroUser = await miro.board.getUserInfo();
      this.userId = miroUser.id;
      
      // Authenticate with backend
      const response = await window.apiService.authenticateWithBackend(miroUser);
      this.authToken = response.token;
      
      console.log('✅ Backend authentication successful');
      return true;
    } catch (error) {
      console.error('❌ Backend authentication failed:', error);
      throw new Error('Failed to authenticate with backend: ' + error.message);
    }
  }

  async checkSubscriptionStatus() {
    try {
      if (!window.apiService) {
        // Fallback subscription for development
        this.userSubscription = {
          plan: { id: 'free', name: 'Free' },
          status: 'active'
        };
        return this.userSubscription;
      }

      const response = await window.apiService.getSubscriptionStatus();
      this.userSubscription = response.subscription;
      
      console.log('💳 Subscription status:', this.userSubscription.plan.name);
      return this.userSubscription;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Fallback to free plan
      this.userSubscription = {
        plan: { 
          id: 'free', 
          name: 'Free',
          features: ['basic_hexies', 'create_custom'],
          limit: 5
        },
        status: 'active'
      };
      return this.userSubscription;
    }
  }

  // Default hexies with rich content
  initializeDefaultHexies() {
    const defaultHexies = [
      {
        id: 'hexie_1',
        title: 'Retrospective',
        category: 'methods',
        icon: '🔍',
        summary: 'Reflect and improve team processes through structured discussion',
        details: 'A collaborative session where teams discuss what went well, what didn\'t work, and how to improve in the next iteration. Essential for continuous improvement and team growth. Include activities like Start/Stop/Continue, Mad/Sad/Glad, or 4Ls.',
        reference: 'https://www.atlassian.com/team-playbook/plays/retrospective',
        tags: ['agile', 'continuous-improvement', 'reflection', 'team-building'],
        benefits: ['Increases team transparency', 'Identifies improvement opportunities', 'Builds team trust'],
        free: true,
        difficulty: 'beginner',
        duration: '60-90 minutes',
        teamSize: '3-8 people'
      },
      {
        id: 'hexie_2', 
        title: 'User Story Mapping',
        category: 'product',
        icon: '🗺️',
        summary: 'Visualize user journey and prioritize features effectively',
        details: 'Create a shared understanding of the user experience by mapping user activities, tasks, and features. Start with user backbone activities, add user tasks, then prioritize features by release.',
        reference: 'https://www.jpattonassociates.com/user-story-mapping/',
        tags: ['user-experience', 'product-management', 'prioritization', 'planning'],
        benefits: ['Aligns team on user needs', 'Improves feature prioritization', 'Reduces scope creep'],
        free: true,
        difficulty: 'intermediate',
        duration: '2-4 hours',
        teamSize: '4-10 people'
      },
      {
        id: 'hexie_3',
        title: 'Team Charter',
        category: 'teams',
        icon: '🤝',
        summary: 'Define team purpose, values, and ways of working',
        details: 'Establish clear team mission, values, roles, and collaboration guidelines. Creates alignment and sets expectations for how the team will work together.',
        reference: 'https://rework.withgoogle.com/guides/teams-create-charter/steps/introduction/',
        tags: ['team-building', 'alignment', 'collaboration', 'governance'],
        benefits: ['Increases team cohesion', 'Clarifies expectations', 'Improves communication'],
        free: false,
        difficulty: 'intermediate',
        duration: '2-3 hours',
        teamSize: '5-12 people'
      }
      // Add more hexies as needed...
    ];

    this.hexies = defaultHexies;
  }

  // Access control
  canAccessHexie(hexie) {
    if (!this.userSubscription) return false;
    if (hexie.free) return true;
    if (hexie.isUserCreated) return true;
    
    const plan = this.userSubscription.plan.id;
    return plan === 'pro' || plan === 'pro_yearly' || plan === 'enterprise';
  }

  // Data management
  getHexiesByCategory(category = '') {
    let filtered = this.hexies;
    
    if (category) {
      filtered = this.hexies.filter(hexie => hexie.category === category);
    }
    
    return filtered;
  }

  async addHexie(hexieData) {
    // Check limits
    const userHexies = this.hexies.filter(h => h.isUserCreated).length;
    const limit = this.userSubscription.plan.limit || 5;
    
    if (userHexies >= limit && this.userSubscription.plan.id === 'free') {
      throw new Error(`Free plan limited to ${limit} custom hexies. Upgrade to create more.`);
    }

    const newHexie = {
      id: `user_hexie_${Date.now()}`,
      title: hexieData.title,
      category: hexieData.category,
      icon: hexieData.icon || '🔷',
      summary: hexieData.summary,
      details: hexieData.details || '',
      reference: hexieData.reference || '',
      tags: hexieData.tags || [],
      benefits: hexieData.benefits || [],
      free: true,
      isUserCreated: true,
      createdAt: new Date().toISOString(),
      userId: this.userId,
      difficulty: hexieData.difficulty || 'beginner',
      duration: hexieData.duration || 'varies',
      teamSize: hexieData.teamSize || 'any'
    };
    
    this.hexies.push(newHexie);
    
    // Save to backend if available
    if (window.apiService && window.apiService.authToken) {
      try {
        await window.apiService.createHexie(newHexie);
        this.trackEvent('hexie_created', { hexieId: newHexie.id });
      } catch (error) {
        console.error('Failed to save hexie to backend:', error);
      }
    }
    
    console.log('✅ Added new hexie:', newHexie);
    return newHexie;
  }

  // Enhanced UI Components
  createHexieCardElement(hexie) {
    const card = document.createElement('div');
    card.className = 'hexagon-card';
    card.setAttribute('data-hexie-id', hexie.id);
    
    const canAccess = this.canAccessHexie(hexie);
    const color = this.categoryColors[hexie.category] || '#4285f4';
    
    card.style.cssText = `
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 2px solid transparent;
      overflow: hidden;
      min-height: 320px;
      display: flex;
      flex-direction: column;
    `;
    
    // Premium badge for locked hexies
    let badges = '';
    if (!canAccess && !hexie.free) {
      badges += `
        <div class="premium-badge" style="
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #ff6b35, #ff8142);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
          z-index: 2;
        ">
          ⭐ Premium
        </div>
      `;
    }
    
    // User created badge
    if (hexie.isUserCreated) {
      badges += `
        <div class="user-badge" style="
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #4caf50, #43a047);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
          z-index: 2;
        ">
          👤 Your Hexie
        </div>
      `;
    }

    // Build card content
    card.innerHTML = `
      ${badges}
      
      <!-- Hexagon Shape -->
      <div class="hexie-icon" style="
        width: 120px;
        height: 104px;
        background: linear-gradient(135deg, ${color}, ${this.darkenColor(color, 20)});
        position: relative;
        margin: 0 auto 24px;
        clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(66, 133, 244, 0.2);
        transition: all 0.3s ease;
        ${!canAccess ? 'opacity: 0.6;' : ''}
      ">
        <div style="font-size: 36px; margin-bottom: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          ${canAccess ? hexie.icon : '🔒'}
        </div>
        <div style="font-size: 11px; font-weight: 700; text-align: center; line-height: 1.2; padding: 0 12px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
          ${hexie.title}
        </div>
      </div>
      
      <!-- Card Content -->
      <div class="card-content" style="flex-grow: 1; display: flex; flex-direction: column;">
        <div style="
          font-size: 12px;
          color: ${color};
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        ">
          ${hexie.category}
        </div>
        
        <div style="
          font-size: 14px;
          color: #333;
          line-height: 1.5;
          margin-bottom: 16px;
          flex-grow: 1;
        ">
          ${canAccess ? hexie.summary : 'Upgrade to premium to access this hexie'}
        </div>
        
        ${canAccess ? `
          <button class="add-to-board-btn" style="
            width: 100%;
            padding: 14px 20px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, ${color}, ${this.darkenColor(color, 15)});
            color: white;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
          " data-hexie-id="${hexie.id}">
            🚀 Add to Board
          </button>
        ` : `
          <button class="upgrade-btn" onclick="window.app?.showUpgradeModal?.()" style="
            width: 100%;
            padding: 14px 20px;
            border: 2px solid #ff6b35;
            border-radius: 12px;
            background: white;
            color: #ff6b35;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            ⭐ Upgrade to Access
          </button>
        `}
      </div>
    `;
    
    // Enhanced hover effects
    card.addEventListener('mouseenter', () => {
      if (canAccess) {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 16px 32px rgba(0,0,0,0.15)';
        card.style.borderColor = color;
        
        const hexieIcon = card.querySelector('.hexie-icon');
        if (hexieIcon) {
          hexieIcon.style.transform = 'scale(1.05)';
        }
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      card.style.borderColor = 'transparent';
      
      const hexieIcon = card.querySelector('.hexie-icon');
      if (hexieIcon) {
        hexieIcon.style.transform = 'scale(1)';
      }
    });
    
    // Add click handler for button
    const addBtn = card.querySelector('.add-to-board-btn');
    if (addBtn) {
      addBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.handleAddToBoard(hexie, addBtn);
      });
    }
    
    return card;
  }

  async handleAddToBoard(hexie, button) {
    const originalText = button.innerHTML;
    
    try {
      button.disabled = true;
      button.innerHTML = '🔄 Adding...';
      button.style.background = '#666';
      
      await this.createHexieOnBoard(hexie);
      
      // Success feedback
      button.innerHTML = '✅ Added!';
      button.style.background = '#4caf50';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = `linear-gradient(135deg, ${this.categoryColors[hexie.category]}, ${this.darkenColor(this.categoryColors[hexie.category], 15)})`;
        button.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add hexie to board:', error);
      button.innerHTML = '❌ Error';
      button.style.background = '#f44336';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = `linear-gradient(135deg, ${this.categoryColors[hexie.category]}, ${this.darkenColor(this.categoryColors[hexie.category], 15)})`;
        button.disabled = false;
      }, 2000);
    }
  }

  // Board creation
  async createHexieOnBoard(hexie) {
    if (!this.canAccessHexie(hexie)) {
      this.showUpgradeMessage();
      return;
    }

    try {
      const viewport = await miro.board.viewport.get();
      const x = viewport.x + (Math.random() * 300) - 150;
      const y = viewport.y + (Math.random() * 300) - 150;

      // Create the hexagon
      const hexagonWidget = await this.createAdvancedHexagon(hexie, x, y, false);
      
      // Track usage
      this.trackEvent('hexie_added_to_board', { hexieId: hexie.id });
      
      await miro.board.viewport.zoomTo(hexagonWidget);
      return hexagonWidget;
    } catch (error) {
      console.error('Error creating hexie on board:', error);
      throw error;
    }
  }

  async createAdvancedHexagon(hexie, x, y, isFlipped = false) {
    const color = this.categoryColors[hexie.category] || '#4285f4';
    
    // Simple hexagon for now
    const hexagon = await miro.board.createShape({
      shape: 'round_rectangle',
      content: `${hexie.icon}\n${hexie.title}`,
      x: x,
      y: y,
      width: 160,
      height: 140,
      style: {
        fillColor: color,
        fillOpacity: 1,
        fontFamily: 'Arial',
        fontSize: 16,
        textAlign: 'center',
        textColor: '#ffffff'
      }
    });

    // Store metadata
    await hexagon.setMetadata('hexie', {
      ...hexie,
      isFlipped: isFlipped,
      position: { x, y }
    });

    return hexagon;
  }

  // Flip handler (simplified for development)
  initializeFlipHandler() {
    if (this.flipHandler) {
      miro.board.ui.off('selection:update', this.flipHandler);
    }

    this.flipHandler = async (event) => {
      // Simplified flip handler for development
      console.log('Flip handler triggered', event);
    };

    miro.board.ui.on('selection:update', this.flipHandler);
    console.log('✅ Flip handler initialized');
  }

  // Utility functions
  darkenColor(color, percent) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const factor = (100 - percent) / 100;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '66, 133, 244';
  }

  // Upgrade modal
  showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
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
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 500px;
      margin: 20px;
    `;

    content.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 20px;">🚀</div>
      <h2 style="margin-bottom: 16px; color: #050038; font-size: 28px;">Upgrade to Premium</h2>
      <p style="color: #626f86; margin-bottom: 30px; font-size: 16px;">
        Unlock all premium hexies and professional features
      </p>
      <button onclick="this.closest('.upgrade-modal').remove()" style="
        padding: 14px 28px;
        border: none;
        border-radius: 10px;
        background: #4285f4;
        color: white;
        font-weight: 600;
        cursor: pointer;
        margin-right: 12px;
      ">
        Upgrade Now
      </button>
      <button onclick="this.closest('.upgrade-modal').remove()" style="
        padding: 14px 28px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background: white;
        color: #666;
        font-weight: 600;
        cursor: pointer;
      ">
        Maybe Later
      </button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  showUpgradeMessage() {
    this.showUpgradeModal();
  }

  // Analytics tracking
  async trackEvent(eventName, properties = {}) {
    try {
      if (window.apiService && window.apiService.authToken) {
        await window.apiService.trackEvent(eventName, properties);
      }
      console.log('📊 Tracked event:', eventName, properties);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  // Cleanup
  destroy() {
    if (this.flipHandler) {
      miro.board.ui.off('selection:update', this.flipHandler);
    }
    console.log('🧹 HexieManager destroyed');
  }
}

// Global functions
window.showUpgradeModal = function() {
  if (window.hexieManager) {
    window.hexieManager.showUpgradeModal();
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HexieManager;
}