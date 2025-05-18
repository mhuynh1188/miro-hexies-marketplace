// src/ui/ModalManager.js - Professional modal system for Hexies Marketplace
import { UIHelpers } from './UIHelpers.js';
import { SUBSCRIPTION_PLANS, CATEGORY_COLORS } from '../data/hexie-data.js';

export class ModalManager {
  constructor() {
    this.activeModals = new Map();
    this.modalCounter = 0;
    this.escapeHandler = null;
    this.focusTrap = null;
    
    this.setupKeyboardHandlers();
    console.log('🔄 ModalManager initialized');
  }

  setupKeyboardHandlers() {
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeTopModal();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  // Main modal creation method
  createModal(config) {
    const modalId = `modal-${++this.modalCounter}`;
    const {
      title = 'Modal',
      content = '',
      size = 'medium',
      closable = true,
      onClose = null,
      className = '',
      animation = 'scale'
    } = config;

    // Create overlay
    const overlay = UIHelpers.createModalOverlay((e) => {
      if (e.target === overlay && closable) {
        this.closeModal(modalId);
      }
    });
    overlay.setAttribute('data-modal-id', modalId);

    // Create modal container
    const modal = document.createElement('div');
    modal.className = `modal-container ${className}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', `${modalId}-title`);
    modal.setAttribute('aria-modal', 'true');
    
    this.applyModalStyles(modal, size, animation);

    // Create modal content
    modal.innerHTML = `
      <div class="modal-header">
        <h2 id="${modalId}-title" class="modal-title">${title}</h2>
        ${closable ? `
          <button class="modal-close-btn" aria-label="Close modal" style="${UIHelpers.closeButtonStyles}">
            ×
          </button>
        ` : ''}
      </div>
      <div class="modal-body">
        ${content}
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Setup close handler
    if (closable) {
      const closeBtn = modal.querySelector('.modal-close-btn');
      closeBtn?.addEventListener('click', () => this.closeModal(modalId));
    }

    // Store modal reference
    this.activeModals.set(modalId, { overlay, modal, onClose });

    // Setup focus trap
    this.setupFocusTrap(modal);

    // Animate in
    this.animateModal(modal, 'in', animation);

    return modalId;
  }

  applyModalStyles(modal, size, animation) {
    const sizes = {
      small: { width: '400px', maxHeight: '60vh' },
      medium: { width: '600px', maxHeight: '80vh' },
      large: { width: '900px', maxHeight: '90vh' },
      fullscreen: { width: '95vw', maxHeight: '95vh' }
    };

    const { width, maxHeight } = sizes[size] || sizes.medium;

    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15);
      width: ${width};
      max-width: 90vw;
      max-height: ${maxHeight};
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transform: ${animation === 'scale' ? 'scale(0.95)' : 'translateY(20px)'};
      opacity: 0;
      transition: all 0.3s ease;
    `;

    // Add modal header and body styles
    const style = document.createElement('style');
    style.textContent = `
      .modal-container .modal-header {
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e1e5e9;
        background: #f8f9fa;
        border-radius: 16px 16px 0 0;
      }
      
      .modal-container .modal-title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #050038;
        padding-right: 40px;
      }
      
      .modal-container .modal-body {
        padding: 24px;
        overflow-y: auto;
        flex-grow: 1;
      }
      
      .modal-close-btn:hover {
        background: #f5f5f5;
        color: #333;
      }
    `;
    document.head.appendChild(style);
  }

  animateModal(modal, direction, animation) {
    if (direction === 'in') {
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.style.transform = animation === 'scale' ? 'scale(1)' : 'translateY(0)';
      });
    } else {
      modal.style.opacity = '0';
      modal.style.transform = animation === 'scale' ? 'scale(0.95)' : 'translateY(20px)';
    }
  }

  setupFocusTrap(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    // Trap focus within modal
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
  }

  closeModal(modalId) {
    const modalData = this.activeModals.get(modalId);
    if (!modalData) return;

    const { overlay, modal, onClose } = modalData;

    // Animate out
    this.animateModal(modal, 'out');
    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.remove();
      this.activeModals.delete(modalId);
      
      // Call onClose callback
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    }, 300);
  }

  closeTopModal() {
    const modalIds = Array.from(this.activeModals.keys());
    if (modalIds.length > 0) {
      this.closeModal(modalIds[modalIds.length - 1]);
    }
  }

  closeAllModals() {
    const modalIds = Array.from(this.activeModals.keys());
    modalIds.forEach(id => this.closeModal(id));
  }

  // Specialized modal methods
  showUpgradeModal(currentSubscription = null) {
    return this.createModal({
      title: 'Upgrade Your Plan',
      content: this.renderUpgradeContent(currentSubscription),
      size: 'large',
      className: 'upgrade-modal',
      onClose: () => {
        console.log('Upgrade modal closed');
      }
    });
  }

  renderUpgradeContent(currentSubscription) {
    const currentPlanId = currentSubscription?.plan?.id || 'free';
    
    return `
      <div class="upgrade-content">
        <!-- Header -->
        <div class="upgrade-header" style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
          <h2 style="font-size: 28px; font-weight: 600; color: #050038; margin-bottom: 8px;">
            ${currentPlanId === 'free' ? 'Unlock Premium Features' : 'Upgrade Your Plan'}
          </h2>
          <p style="color: #626f86; font-size: 16px;">
            Access all hexies and professional development tools
          </p>
        </div>

        <!-- Current Plan Indicator -->
        ${currentSubscription ? `
          <div class="current-plan-indicator" style="
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
          ">
            <span style="color: #1976d2; font-weight: 600;">
              Current Plan: ${currentSubscription.plan.name}
            </span>
          </div>
        ` : ''}

        <!-- Pricing Plans -->
        <div class="pricing-grid" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        ">
          ${this.renderPricingPlans(currentPlanId)}
        </div>

        <!-- Features Comparison -->
        <div class="features-section">
          <h3 style="text-align: center; margin-bottom: 24px; color: #050038;">Feature Comparison</h3>
          ${this.renderFeatureComparison()}
        </div>

        <!-- Trust Indicators -->
        <div class="trust-indicators" style="
          border-top: 1px solid #e1e5e9;
          padding-top: 24px;
          margin-top: 32px;
          text-align: center;
          color: #626f86;
          font-size: 14px;
        ">
          <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>🔒</span>
              <span>Secure payment</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>📞</span>
              <span>Cancel anytime</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>⭐</span>
              <span>30-day money back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPricingPlans(currentPlanId) {
    return Object.values(SUBSCRIPTION_PLANS).map(plan => {
      const isCurrent = currentPlanId === plan.id;
      const isPopular = plan.id === 'premium';
      
      return `
        <div class="pricing-card ${isPopular ? 'popular' : ''}" data-plan="${plan.id}" style="
          border: 2px solid ${isCurrent ? '#4285f4' : (isPopular ? '#4285f4' : '#e1e5e9')};
          border-radius: 16px;
          padding: 24px;
          position: relative;
          background: ${isCurrent ? '#f8f9ff' : 'white'};
          cursor: ${isCurrent ? 'default' : 'pointer'};
          transition: all 0.3s ease;
          transform: ${isPopular ? 'scale(1.05)' : 'scale(1)'};
        ">
          ${isPopular ? `
            <div class="popular-badge" style="
              position: absolute;
              top: -12px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #4285f4, #1976d2);
              color: white;
              padding: 6px 20px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              Most Popular
            </div>
          ` : ''}
          
          ${isCurrent ? `
            <div class="current-badge" style="
              position: absolute;
              top: -12px;
              right: 16px;
              background: #4caf50;
              color: white;
              padding: 6px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            ">
              Current Plan
            </div>
          ` : ''}

          <div class="plan-header" style="text-align: center; margin-bottom: 24px;">
            <h3 style="font-size: 24px; font-weight: 600; color: #050038; margin-bottom: 8px;">
              ${plan.name}
            </h3>
            <div style="font-size: 36px; font-weight: 700; color: #4285f4; margin-bottom: 4px;">
              ${plan.price === 0 ? 'Free' : `$${plan.price}`}
            </div>
            ${plan.billing ? `
              <div style="color: #626f86; font-size: 14px;">per ${plan.billing}</div>
            ` : ''}
          </div>

          <ul class="feature-list" style="list-style: none; padding: 0; margin-bottom: 24px;">
            ${plan.features.map(feature => `
              <li style="
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                font-size: 14px;
                color: #333;
              ">
                <span style="color: #4caf50; margin-right: 8px; font-size: 16px;">✓</span>
                ${feature}
              </li>
            `).join('')}
          </ul>

          ${!isCurrent ? `
            <button class="select-plan-btn" data-plan="${plan.id}" style="
              width: 100%;
              padding: 12px;
              border: none;
              border-radius: 8px;
              background: ${plan.id === 'free' ? '#f5f5f5' : 'linear-gradient(135deg, #4285f4, #1976d2)'};
              color: ${plan.id === 'free' ? '#333' : 'white'};
              font-weight: 600;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.2s;
            ">
              ${plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
            </button>
          ` : `
            <div style="
              width: 100%;
              padding: 12px;
              text-align: center;
              border: 2px solid #4caf50;
              border-radius: 8px;
              color: #4caf50;
              font-weight: 600;
              font-size: 16px;
            ">
              Current Plan
            </div>
          `}
        </div>
      `;
    }).join('');
  }

  renderFeatureComparison() {
    const features = [
      { name: 'Create unlimited hexies', free: true, premium: true, enterprise: true },
      { name: 'Access to basic hexies', free: true, premium: true, enterprise: true },
      { name: 'Premium hexie collection', free: false, premium: true, enterprise: true },
      { name: 'Advanced frameworks', free: false, premium: true, enterprise: true },
      { name: 'Priority support', free: false, premium: true, enterprise: true },
      { name: 'Usage analytics', free: false, premium: false, enterprise: true },
      { name: 'Team management', free: false, premium: false, enterprise: true },
      { name: 'Custom integrations', free: false, premium: false, enterprise: true }
    ];

    return `
      <div class="feature-comparison" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e1e5e9; color: #050038;">
                Features
              </th>
              <th style="text-align: center; padding: 12px; border-bottom: 2px solid #e1e5e9; color: #050038;">
                Free
              </th>
              <th style="text-align: center; padding: 12px; border-bottom: 2px solid #e1e5e9; color: #050038;">
                Premium
              </th>
              <th style="text-align: center; padding: 12px; border-bottom: 2px solid #e1e5e9; color: #050038;">
                Enterprise
              </th>
            </tr>
          </thead>
          <tbody>
            ${features.map(feature => `
              <tr style="border-bottom: 1px solid #f5f5f5;">
                <td style="padding: 12px; color: #333;">${feature.name}</td>
                <td style="text-align: center; padding: 12px;">
                  ${feature.free ? '<span style="color: #4caf50; font-size: 18px;">✓</span>' : '<span style="color: #ccc;">–</span>'}
                </td>
                <td style="text-align: center; padding: 12px;">
                  ${feature.premium ? '<span style="color: #4caf50; font-size: 18px;">✓</span>' : '<span style="color: #ccc;">–</span>'}
                </td>
                <td style="text-align: center; padding: 12px;">
                  ${feature.enterprise ? '<span style="color: #4caf50; font-size: 18px;">✓</span>' : '<span style="color: #ccc;">–</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  showHexieDetails(hexie, authService, hexieManager) {
    const canAccess = authService.canAccessHexie(hexie);
    const categoryColor = CATEGORY_COLORS[hexie.category] || '#4285f4';

    return this.createModal({
      title: hexie.title,
      content: this.renderHexieDetailsContent(hexie, canAccess, categoryColor, authService, hexieManager),
      size: 'large',
      className: 'hexie-details-modal'
    });
  }

  renderHexieDetailsContent(hexie, canAccess, categoryColor, authService, hexieManager) {
    return `
      <div class="hexie-details">
        <!-- Header Section -->
        <div class="hexie-header" style="text-align: center; margin-bottom: 32px;">
          <div class="hexie-icon-large" style="
            font-size: 64px;
            margin-bottom: 16px;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
          ">${canAccess ? hexie.icon : '🔒'}</div>
          
          <h2 style="color: ${categoryColor}; font-size: 28px; font-weight: 700; margin-bottom: 8px;">
            ${hexie.title}
          </h2>
          
          <div class="hexie-meta" style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 16px;
          ">
            <span class="category-badge" style="
              background: ${categoryColor}20;
              color: ${categoryColor};
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">${hexie.category.replace('-', ' ')}</span>
            
            ${hexie.difficulty ? `
              <span class="difficulty-badge" style="
                background: #f5f5f5;
                color: #666;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
              ">${hexie.difficulty}</span>
            ` : ''}
            
            ${!canAccess ? `
              <span class="premium-badge" style="
                background: linear-gradient(135deg, #ff6b35, #ff8142);
                color: white;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
              ">Premium</span>
            ` : ''}
          </div>
        </div>

        <!-- Summary Section -->
        <div class="hexie-summary" style="margin-bottom: 32px;">
          <h3 style="color: #333; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Summary</h3>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            ${canAccess ? hexie.summary : 'This is a premium hexie. Upgrade your plan to access the full content and functionality.'}
          </p>
        </div>

        ${canAccess && hexie.details ? `
          <!-- Details Section -->
          <div class="hexie-details-content" style="margin-bottom: 32px;">
            <h3 style="color: #333; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Details</h3>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">${hexie.details}</p>
          </div>
        ` : ''}

        ${canAccess && hexie.benefits && hexie.benefits.length > 0 ? `
          <!-- Benefits Section -->
          <div class="hexie-benefits" style="margin-bottom: 32px;">
            <h3 style="color: #333; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Benefits</h3>
            <ul style="color: #666; line-height: 1.6; font-size: 16px; padding-left: 20px;">
              ${hexie.benefits.map(benefit => `<li style="margin-bottom: 8px;">${benefit}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Metadata Grid -->
        ${canAccess ? this.renderHexieMetadata(hexie) : ''}

        ${canAccess && hexie.tags && hexie.tags.length > 0 ? `
          <!-- Tags Section -->
          <div class="hexie-tags-section" style="margin-bottom: 32px;">
            <h3 style="color: #333; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Tags</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${hexie.tags.map(tag => `
                <span style="
                  background: ${categoryColor}15;
                  color: ${categoryColor};
                  padding: 8px 12px;
                  border-radius: 16px;
                  font-size: 14px;
                  font-weight: 600;
                  border: 1px solid ${categoryColor}25;
                ">#${tag}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="hexie-actions" style="
          display: flex;
          gap: 16px;
          justify-content: center;
          padding-top: 24px;
          border-top: 1px solid #e1e5e9;
        ">
          ${canAccess ? `
            <button class="add-to-board-btn" onclick="this.closest('.modal-container').querySelector('.modal-close-btn').click(); window.hexieManager?.createHexieOnBoard?.(${JSON.stringify(hexie).replace(/"/g, '&quot;')})" style="
              padding: 14px 28px;
              border: none;
              border-radius: 10px;
              background: linear-gradient(135deg, ${categoryColor}, ${UIHelpers.darkenColor(categoryColor, 15)});
              color: white;
              font-weight: 600;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 4px 12px ${categoryColor}30;
            ">
              <span style="margin-right: 8px;">🚀</span>Add to Board
            </button>
            ${hexie.reference ? `
              <button onclick="window.open('${hexie.reference}', '_blank')" style="
                padding: 14px 28px;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                background: white;
                color: #333;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
              ">
                <span style="margin-right: 8px;">📖</span>View Reference
              </button>
            ` : ''}
          ` : `
            <button onclick="this.closest('.modal-container').querySelector('.modal-close-btn').click(); window.hexieManager?.showUpgradeModal?.()" style="
              padding: 14px 28px;
              border: none;
              border-radius: 10px;
              background: linear-gradient(135deg, #ff6b35, #ff8142);
              color: white;
              font-weight: 600;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            ">
              <span style="margin-right: 8px;">⭐</span>Upgrade to Access
            </button>
          `}
        </div>
      </div>

      <!-- Enhanced button hover styles -->
      <style>
        .hexie-details .add-to-board-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px ${categoryColor}40;
        }
        
        .hexie-details button:hover {
          transform: translateY(-2px);
        }
        
        .hexie-details button:active {
          transform: translateY(0);
        }
      </style>
    `;
  }

  renderHexieMetadata(hexie) {
    const metadata = [];
    
    if (hexie.duration) {
      metadata.push({ icon: '⏱️', label: 'Duration', value: hexie.duration });
    }
    
    if (hexie.teamSize) {
      metadata.push({ icon: '👥', label: 'Team Size', value: hexie.teamSize });
    }
    
    if (hexie.difficulty) {
      metadata.push({ icon: '📊', label: 'Difficulty', value: hexie.difficulty });
    }
    
    if (metadata.length === 0) return '';
    
    return `
      <div class="hexie-metadata-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      ">
        ${metadata.map(item => `
          <div class="metadata-card" style="
            text-align: center;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 1px solid #e1e5e9;
          ">
            <div style="font-size: 24px; margin-bottom: 8px;">${item.icon}</div>
            <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">${item.label}</div>
            <div style="font-size: 12px; color: #666; text-transform: capitalize;">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  showCreateHexieModal(onSubmit) {
    return this.createModal({
      title: 'Create New Hexie',
      content: this.renderCreateHexieContent(),
      size: 'large',
      className: 'create-hexie-modal',
      onClose: () => {
        console.log('Create hexie modal closed');
      }
    });
  }

  renderCreateHexieContent() {
    return `
      <form id="createHexieForm" class="create-hexie-form">
        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div class="form-group">
            <label for="hexieTitle" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
              Title *
            </label>
            <input type="text" id="hexieTitle" name="title" maxlength="50" required style="
              width: 100%;
              padding: 12px;
              border: 2px solid #e1e5e9;
              border-radius: 8px;
              font-size: 14px;
              transition: border-color 0.2s;
            ">
            <div class="char-count" style="font-size: 12px; color: #666; margin-top: 4px; text-align: right;">
              50 characters remaining
            </div>
          </div>
          
          <div class="form-group">
            <label for="hexieCategory" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
              Category *
            </label>
            <select id="hexieCategory" name="category" required style="
              width: 100%;
              padding: 12px;
              border: 2px solid #e1e5e9;
              border-radius: 8px;
              