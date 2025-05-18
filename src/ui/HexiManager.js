// src/ui/HexieCard.js - Professional card component with animations and interactions
import { UIHelpers } from './UIHelpers.js';
import { CATEGORY_COLORS } from '../data/hexie-data.js';

export class HexieCard {
  constructor(hexie, authService, hexieManager) {
    this.hexie = hexie;
    this.authService = authService;
    this.hexieManager = hexieManager;
    this.element = null;
    this.isAnimating = false;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'hexie-card';
    this.element.setAttribute('data-hexie-id', this.hexie.id);
    
    const canAccess = this.authService.canAccessHexie(this.hexie);
    const categoryColor = CATEGORY_COLORS[this.hexie.category] || '#4285f4';
    
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

  renderBadges(canAccess) {
    let badges = '';
    
    // Premium badge
    if (!canAccess && !this.hexie.free) {
      badges += `
        <div class="premium-badge" style="${UIHelpers.premiumBadgeStyles}">
          <span style="margin-right: 6px;">⭐</span>Premium
        </div>
      `;
    }
    
    // User created badge
    if (this.hexie.isUserCreated) {
      badges += `
        <div class="user-badge" style="${UIHelpers.userBadgeStyles}">
          <span style="margin-right: 6px;">👤</span>Your Hexie
        </div>
      `;
    }
    
    // Difficulty badge
    if (this.hexie.difficulty && canAccess) {
      badges += `
        <div class="difficulty-badge" style="${UIHelpers.getDifficultyBadgeStyles(this.hexie.difficulty)}">
          ${this.hexie.difficulty}
        </div>
      `;
    }
    
    return badges;
  }

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
        ${canAccess ? this.renderAccessibilityRing(categoryColor) : ''}
      </div>
    `;
  }

  renderAccessibilityRing(categoryColor) {
    return `
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
    `;
  }

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
        ${this.renderActionButton(canAccess, categoryColor)}
      </div>
    `;
  }

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
  }

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

  handleCardClick(e) {
    // Don't trigger if clicking on buttons
    if (e.target.closest('button')) return;
    
    // Show hexie details modal
    this.hexieManager.showHexieDetails(this.hexie);
  }

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
      
      // Add to board
      await this.hexieManager.createHexieOnBoard(this.hexie);
      
      // Success feedback
      button.innerHTML = `
        <span class="btn-content" style="color: white;">
          <span style="margin-right: 8px;">✅</span>Added Successfully!
        </span>
      `;
      button.style.background = UIHelpers.successGradient;
      
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
      button.style.background = UIHelpers.errorGradient;
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.background = '';
        button.disabled = false;
        this.isAnimating = false;
      }, 3000);
    }
  }

  handleUpgradeClick(e) {
    e.stopPropagation();
    this.hexieManager.showUpgradeModal();
  }

  handleButtonHover(button, categoryColor) {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = `0 6px 20px ${categoryColor}40`;
  }

  handleButtonLeave(button, categoryColor) {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = `0 4px 12px ${categoryColor}30`;
  }

  handleUpgradeHover(button) {
    button.style.background = '#ff6b35';
    button.style.color = 'white';
    button.style.transform = 'translateY(-2px)';
  }

  handleUpgradeLeave(button) {
    button.style.background = 'white';
    button.style.color = '#ff6b35';
    button.style.transform = 'translateY(0)';
  }

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
    }, 100);
  }

  // Public methods for external control
  setDisabled(disabled) {
    const button = this.element.querySelector('.add-to-board-btn, .upgrade-btn');
    if (button) {
      button.disabled = disabled;
      this.element.style.opacity = disabled ? '0.5' : '1';
      this.element.style.pointerEvents = disabled ? 'none' : 'auto';
    }
  }

  highlightCard(duration = 2000) {
    const originalBorder = this.element.style.borderColor;
    this.element.style.borderColor = '#4285f4';
    this.element.style.animation = `${UIHelpers.pulseAnimation} 1s ease-in-out`;
    
    setTimeout(() => {
      this.element.style.borderColor = originalBorder;
      this.element.style.animation = '';
    }, duration);
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.element = null;
  }
}