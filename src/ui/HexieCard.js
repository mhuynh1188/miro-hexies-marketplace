// src/ui/HexieCard.js
import { UIHelpers } from './UIHelpers.js';
import { HEXIE_CATEGORIES } from '../config/constants.js';
import authService from '../core/AuthService.js';

/**
 * Professional UI component for displaying Hexie cards
 */
export class HexieCard {
  /**
   * Create a HexieCard instance
   * @param {Object} hexie - Hexie data
   * @param {Object} options - Display options
   */
  constructor(hexie, options = {}) {
    this.hexie = hexie;
    this.options = {
      showActions: true,
      onClick: null,
      onEdit: null,
      onDelete: null,
      onAddToBoard: null,
      ...options
    };
    this.element = null;
    this.isAnimating = false;
  }

  /**
   * Render the hexie card
   * @returns {HTMLElement} Rendered card element
   */
  render() {
    this.element = document.createElement('div');
    this.element.className = 'hexie-card';
    this.element.setAttribute('data-hexie-id', this.hexie.id);
    
    const canAccess = authService.canAccessHexie(this.hexie);
    const categoryColor = HEXIE_CATEGORIES[this.hexie.category.toUpperCase()]?.color || '#4285f4';
    
    // Apply base styles
    this.applyCardStyles(canAccess, categoryColor);
    
    // Build card content
    this.element.innerHTML = `
      ${this.renderBadges(canAccess)}
      ${this.renderHexagonIcon(canAccess, categoryColor)}
      ${this.renderCardContent(canAccess, categoryColor)}
    `;
    
    // Setup interactions
    this.setupEventListeners(canAccess, categoryColor);
    
    return this.element;
  }

  /**
   * Apply base card styles
   * @param {boolean} canAccess - If hexie is accessible
   * @param {string} categoryColor - Hexie category color
   */
  applyCardStyles(canAccess, categoryColor) {
    this.element.style.cssText = `
      position: relative;
      cursor: ${canAccess ? 'pointer' : 'default'};
      transition: all 0.3s ease;
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      border: 2px solid transparent;
      overflow: hidden;
      min-height: 320px;
      display: flex;
      flex-direction: column;
      opacity: ${canAccess ? '1' : '0.75'};
      transform: translateY(0);
      backdrop-filter: blur(8px);
    `;
  }

  /**
   * Render badge indicators (premium, user-created)
   * @param {boolean} canAccess - If hexie is accessible
   * @returns {string} Badge HTML
   */
  renderBadges(canAccess) {
    let badges = '';
    
    // Premium badge
    if (!canAccess && !this.hexie.free) {
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
          backdrop-filter: blur(4px);
        ">
          <span style="margin-right: 6px;">⭐</span>Premium
        </div>
      `;
    }
    
    // User created badge
    if (this.hexie.isUserCreated) {
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
          backdrop-filter: blur(4px);
        ">
          <span style="margin-right: 6px;">👤</span>Your Hexie
        </div>
      `;
    }
    
    // Difficulty badge
    if (this.hexie.difficulty && canAccess) {
      const difficultyColors = {
        beginner: '#4caf50',
        intermediate: '#ff9800',
        advanced: '#f44336'
      };
      
      const color = difficultyColors[this.hexie.difficulty] || difficultyColors.beginner;
      
      badges += `
        <div class="difficulty-badge" style="
          position: absolute;
          top: 16px;
          left: 16px;
          background: ${color};
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 10px;
          font-weight: 600;
          text-transform: capitalize;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 2;
        ">
          ${this.hexie.difficulty}
        </div>
      `;
    }
    
    return badges;
  }

  /**
   * Render hexagon icon
   * @param {boolean} canAccess - If hexie is accessible
   * @param {string} categoryColor - Hexie category color
   * @returns {string} Hexagon HTML
   */
  renderHexagonIcon(canAccess, categoryColor) {
    return `
      <div class="hexie-icon-container" style="
        width: 120px;
        height: 104px;
        margin: 0 auto 24px;
        position: relative;
      ">
        <div class="hexie-icon" style="
          width: 100%;
          height: 100%;
          background: ${canAccess ? 
            `linear-gradient(135deg, ${categoryColor}, ${UIHelpers.darkenColor(categoryColor, 20)})` : 
            `linear-gradient(135deg, #ccc, #999)`};
          position: relative;
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-direction: column;
          box-shadow: 0 8px 24px ${canAccess ? `${categoryColor}30` : 'rgba(0,0,0,0.1)'};
          transition: all 0.3s ease;
          transform: scale(1);
        ">
          <div class="hexie-icon-emoji" style="
            font-size: 36px;
            margin-bottom: 8px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            transition: all 0.3s ease;
          ">
            ${canAccess ? this.hexie.icon : '🔒'}
          </div>
          <div class="hexie-title" style="
            font-size: 11px;
            font-weight: 700;
            text-align: center;
            line-height: 1.2;
            padding: 0 12px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            max-width: 100px;
            word-wrap: break-word;
          ">
            ${this.hexie.title}
          </div>
        </div>
        ${canAccess ? `
          <div class="accessibility-ring" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 130px;
            height: 115px;
            border: 2px solid ${categoryColor}40;
            border-radius: 50%;
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
          "></div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render card content
   * @param {boolean} canAccess - If hexie is accessible
   * @param {string} categoryColor - Hexie category color
   * @returns {string} Card content HTML
   */
  renderCardContent(canAccess, categoryColor) {
    return `
      <div class="card-content" style="flex-grow: 1; display: flex; flex-direction: column;">
        <!-- Category Tag -->
        <div class="category-tag" style="
          font-size: 12px;
          color: ${categoryColor};
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          padding: 4px 8px;
          background: ${categoryColor}15;
          border-radius: 6px;
          display: inline-block;
          width: fit-content;
        ">
          ${this.hexie.category.replace('-', ' ')}
        </div>
        
        <!-- Summary -->
        <div class="hexie-summary" style="
          font-size: 14px;
          color: #333;
          line-height: 1.5;
          margin-bottom: 16px;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">
          ${canAccess ? this.hexie.summary : 'Upgrade to premium to access this hexie'}
        </div>
        
        <!-- Tags (if accessible) -->
        ${canAccess && this.hexie.tags ? this.renderTags(categoryColor) : ''}
        
        <!-- Metadata (if accessible and available) -->
        ${canAccess ? this.renderMetadata() : ''}
        
        <!-- Action Button -->
        ${this.options.showActions ? this.renderActionButton(canAccess, categoryColor) : ''}
      </div>
    `;
  }

  /**
   * Render tags
   * @param {string} categoryColor - Hexie category color
   * @returns {string} Tags HTML
   */
  renderTags(categoryColor) {
    if (!this.hexie.tags || this.hexie.tags.length === 0) return '';
    
    const visibleTags = this.hexie.tags.slice(0, 3);
    const remainingCount = this.hexie.tags.length - 3;
    
    return `
      <div class="hexie-tags" style="
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 16px;
      ">
        ${visibleTags.map(tag => `
          <span class="hexie-tag" style="
            background: ${categoryColor}15;
            color: ${categoryColor};
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            border: 1px solid ${categoryColor}25;
          ">#${tag}</span>
        `).join('')}
        ${remainingCount > 0 ? `
          <span class="hexie-tag-more" style="
            background: #f5f5f5;
            color: #666;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
          ">+${remainingCount}</span>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render metadata
   * @returns {string} Metadata HTML
   */
  renderMetadata() {
    const metadata = [];
    
    if (this.hexie.difficulty) {
      metadata.push({ icon: '📊', label: this.hexie.difficulty });
    }
    
    if (this.hexie.duration) {
      metadata.push({ icon: '⏱️', label: this.hexie.duration });
    }
    
    if (this.hexie.teamSize) {
      metadata.push({ icon: '👥', label: this.hexie.teamSize });
    }
    
    if (metadata.length === 0) return '';
    
    return `
      <div class="hexie-metadata" style="
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      ">
        ${metadata.map(item => `
          <div class="metadata-item" style="
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            color: #666;
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 6px;
          ">
            <span>${item.icon}</span>
            <span>${item.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render action button
   * @param {boolean} canAccess - If hexie is accessible
   * @param {string} categoryColor - Hexie category color
   * @returns {string} Button HTML
   */
  renderActionButton(canAccess, categoryColor) {
    if (canAccess) {
      return `
        <button class="add-to-board-btn" style="
          width: 100%;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, ${categoryColor}, ${UIHelpers.darkenColor(categoryColor, 15)});
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px ${categoryColor}30;
          position: relative;
          overflow: hidden;
        " data-hexie-id="${this.hexie.id}">
          <span class="btn-content">
            <span style="margin-right: 8px;">🚀</span>Add to Board
          </span>
          <div class="btn-ripple" style="
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            transform: translate(-50%, -50%);
            transition: all 0.6s ease;
          "></div>
        </button>
      `;
    } else {
      return `
        <button class="upgrade-btn" style="
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
          <span class="btn-content">
            <span style="margin-right: 8px;">⭐</span>Upgrade to Access
          </span>
        </button>
      `;
    }
  }

  /**
   * Setup event listeners
   * @param {boolean} canAccess - If hexie is accessible
   * @param {string} categoryColor - Hexie category color
   */
  setupEventListeners(canAccess, categoryColor) {
    // Card hover effects
    this.element.addEventListener('mouseenter', () => this.handleMouseEnter(canAccess, categoryColor));
    this.element.addEventListener('mouseleave', () => this.handleMouseLeave());
    
    // Card click for details
    this.element.addEventListener('click', (e) => this.handleCardClick(e));
    
    // Button interactions
    const addBtn = this.element.querySelector('.add-to-board-btn');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => this.handleAddToBoard(e));
      addBtn.addEventListener('mouseenter', () => this.handleButtonHover(addBtn, categoryColor));
      addBtn.addEventListener('mouseleave', () => this.handleButtonLeave(addBtn, categoryColor));
    }
    
    const upgradeBtn = this.element.querySelector('.upgrade-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', (e) => this.handleUpgradeClick(e));
      upgradeBtn.addEventListener('mouseenter', () => this.handleUpgradeHover(upgradeBtn));
      upgradeBtn.addEventListener('mouseleave', () => this.handleUpgradeLeave(upgradeBtn));
    }
    
    // If there are edit/delete options (user-created)
    if (this.hexie.isUserCreated) {
      const editBtn = this.element.querySelector('.edit-hexie-btn');
      const deleteBtn = this.element.querySelector('.delete-hexie-btn');
      
      if (editBtn && this.options.onEdit) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.options.onEdit(this.hexie);
        });
      }
      
      if (deleteBtn && this.options.onDelete) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${this.hexie.title}"?`)) {
            this.options.onDelete(this.hexie.id);
          }
        });
      }
    }
  }

  /**
   * Handle mouse enter
   * @param {boolean} canAccess - If hexie is accessible
   * @param {string} categoryColor - Hexie category color
   */
  handleMouseEnter(canAccess, categoryColor) {
    if (!canAccess || this.isAnimating) return;
    
    // Card elevation
    this.element.style.transform = 'translateY(-8px)';
    this.element.style.boxShadow = `0 16px 32px rgba(0,0,0,0.15)`;
    this.element.style.borderColor = categoryColor;
    
    // Icon animation
    const icon = this.element.querySelector('.hexie-icon');
    const ring = this.element.querySelector('.accessibility-ring');
    
    if (icon) {
      icon.style.transform = 'scale(1.05)';
    }
    
    if (ring) {
      ring.style.opacity = '1';
      ring.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }
    
    // Emoji bounce
    const emoji = this.element.querySelector('.hexie-icon-emoji');
    if (emoji) {
      emoji.style.transform = 'scale(1.1) translateY(-2px)';
    }
  }

  /**
   * Handle mouse leave
   */
  handleMouseLeave() {
    if (this.isAnimating) return;
    
    // Reset card styles
    this.element.style.transform = 'translateY(0)';
    this.element.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
    this.element.style.borderColor = 'transparent';
    
    // Reset icon
    const icon = this.element.querySelector('.hexie-icon');
    const ring = this.element.querySelector('.accessibility-ring');
    const emoji = this.element.querySelector('.hexie-icon-emoji');
    
    if (icon) icon.style.transform = 'scale(1)';
    if (ring) {
      ring.style.opacity = '0';
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
    }
    if (emoji) emoji.style.transform = 'scale(1) translateY(0)';
  }

  /**
   * Handle card click
   * @param {Event} e - Click event
   */
  handleCardClick(e) {
    // Don't trigger if clicking on buttons
    if (e.target.closest('button')) return;
    
    // Call onClick callback if provided
    if (this.options.onClick) {
      this.options.onClick(this.hexie);
    }
  }

  /**
   * Handle add to board button click
   * @param {Event} e - Click event
   */
  async handleAddToBoard(e) {
    e.stopPropagation();
    
    const button = e.currentTarget;
    const originalContent = button.innerHTML;
    
    try {
      this.isAnimating = true;
      
      // Button loading state
      button.disabled = true;
      button.innerHTML = `
        <span class="btn-content">
          <span class="spinner" style="
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: ${UIHelpers.spinAnimation} 1s linear infinite;
            margin-right: 8px;
          "></span>Adding...
        </span>
      `;
      
      // Create ripple effect
      this.createRippleEffect(button, e);
      
      // Call onAddToBoard callback if provided
      if (this.options.onAddToBoard) {
        await this.options.onAddToBoard(this.hexie);
      }
      
      // Success feedback
      button.innerHTML = `
        <span class="btn-content" style="color: white;">
          <span style="margin-right: 8px;">✅</span>Added Successfully!
        </span>
      `;
      button.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
      
      // Reset after delay
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.background = '';
        button.disabled = false;
        this.isAnimating = false;
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add hexie to board:', error);
      
      // Error feedback
      button.innerHTML = `
        <span class="btn-content">
          <span style="margin-right: 8px;">❌</span>Error - Try Again
        </span>
      `;
      button.style.background = 'linear-gradient(135deg, #f44336, #e53935)';
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.background = '';
        button.disabled = false;
        this.isAnimating = false;
      }, 3000);
    }
  }

  /**
   * Handle upgrade button click
   * @param {Event} e - Click event
   */
  handleUpgradeClick(e) {
    e.stopPropagation();
    
    // Trigger upgrade modal - typically handled at app level
    if (window.app && window.app.showUpgradeModal) {
      window.app.showUpgradeModal();
    } else if (window.showUpgradeModal) {
      window.showUpgradeModal();
    }
  }

  /**
   * Handle button hover
   * @param {HTMLElement} button - Button element
   * @param {string} categoryColor - Category color
   */
  handleButtonHover(button, categoryColor) {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = `0 6px 20px ${categoryColor}40`;
  }

  /**
   * Handle button leave
   * @param {HTMLElement} button - Button element
   * @param {string} categoryColor - Category color
   */
  handleButtonLeave(button, categoryColor) {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = `0 4px 12px ${categoryColor}30`;
  }

  /**
   * Handle upgrade button hover
   * @param {HTMLElement} button - Button element
   */
  handleUpgradeHover(button) {
    button.style.background = '#ff6b35';
    button.style.color = 'white';
    button.style.transform = 'translateY(-2px)';
  }

  /**
   * Handle upgrade button leave
   * @param {HTMLElement} button - Button element
   */
  handleUpgradeLeave(button) {
    button.style.background = 'white';
    button.style.color = '#ff6b35';
    button.style.transform = 'translateY(0)';
  }

  /**
   * Create ripple effect
   * @param {HTMLElement} button - Button element
   * @param {Event} event - Click event
   */
  createRippleEffect(button, event) {
    const ripple = button.querySelector('.btn-ripple');
    if (!ripple) return;
    
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '300px';
    ripple.style.height = '300px';
    
    setTimeout(() => {
      ripple.style.width = '0';
      ripple.style.height = '0';
    }, 600);
  }

  /**
   * Set card as disabled
   * @param {boolean} disabled - Disabled state
   */
  setDisabled(disabled) {
    const button = this.element.querySelector('.add-to-board-btn, .upgrade-btn');
    if (button) {
      button.disabled = disabled;
      this.element.style.opacity = disabled ? '0.5' : '1';
      this.element.style.pointerEvents = disabled ? 'none' : 'auto';
    }
  }

  /**
   * Highlight card (for attention)
   * @param {number} duration - Animation duration
   */
  highlightCard(duration = 2000) {
    const originalBorder = this.element.style.borderColor;
    this.element.style.borderColor = '#4285f4';
    this.element.style.animation = `${UIHelpers.pulseAnimation} 1s ease-in-out`;
    
    setTimeout(() => {
      this.element.style.borderColor = originalBorder;
      this.element.style.animation = '';
    }, duration);
  }

  /**
   * Destroy card and clean up
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.element = null;
  }
}

export default HexieCard;