// src/components/HexieCard.js - Professional hexie card component
import { useAuthStore } from '../store/useAuthStore.js';
import { HEXIE_CATEGORIES } from '../config/constants.js';

export class HexieCard {
  constructor(hexie, options = {}) {
    this.hexie = hexie;
    this.options = {
      showActions: true,
      onClick: null,
      onEdit: null,
      onDelete: null,
      ...options
    };
    this.element = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'hexie-card';
    this.element.setAttribute('data-hexie-id', this.hexie.id);
    
    const categoryConfig = Object.values(HEXIE_CATEGORIES)
      .find(cat => cat.id === this.hexie.category);
    
    const canAccess = this.canAccess();
    const isPremium = !this.hexie.free && !this.hexie.isUserCreated;
    
    this.element.style.cssText = `
      position: relative;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: ${canAccess ? 'pointer' : 'default'};
      opacity: ${canAccess ? '1' : '0.6'};
      border: 2px solid transparent;
      overflow: hidden;
    `;

    // Premium badge
    let premiumBadge = '';
    if (isPremium && !canAccess) {
      premiumBadge = `
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
        ">
          Premium
        </div>
      `;
    }

    // User-created badge
    let userBadge = '';
    if (this.hexie.isUserCreated) {
      userBadge = `
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
        ">
          Your Hexie
        </div>
      `;
    }

    // Card content
    this.element.innerHTML = `
      ${premiumBadge}
      ${userBadge}
      
      <!-- Hexagon shape -->
      <div style="
        position: relative;
        width: 120px;
        height: 104px;
        margin: 20px auto 16px;
        align-self: center;
      ">
        <div class="hexagon-shape" style="
          width: 100%;
          height: 100%;
          background: ${categoryConfig?.color || '#4285f4'};
          position: relative;
          transform: rotate(0deg);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(66, 133, 244, 0.2);
        ">
          <!-- Icon and title in center -->
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            padding: 8px;
          ">
            <div style="font-size: 32px; margin-bottom: 4px;">${canAccess ? this.hexie.icon : '🔒'}</div>
            <div style="
              font-size: 11px;
              font-weight: 600;
              line-height: 1.2;
              max-width: 90px;
              word-wrap: break-word;
            ">${this.hexie.title}</div>
          </div>
        </div>
      </div>

      <!-- Card body -->
      <div style="padding: 0 20px 20px; flex-grow: 1;">
        <!-- Category -->
        <div style="
          font-size: 12px;
          color: ${categoryConfig?.color || '#4285f4'};
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          text-align: center;
        ">
          ${categoryConfig?.name || this.hexie.category}
        </div>

        <!-- Summary -->
        <div style="
          font-size: 14px;
          color: #333;
          line-height: 1.4;
          text-align: center;
          margin-bottom: ${this.hexie.tags ? '12px' : '0'};
        ">
          ${canAccess ? this.hexie.summary : 'Upgrade to premium to access this hexie'}
        </div>

        <!-- Tags -->
        ${this.hexie.tags && canAccess ? `
          <div style="
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 6px;
            margin-bottom: 12px;
          ">
            ${this.hexie.tags.slice(0, 3).map(tag => `
              <span style="
                background: #f5f5f5;
                color: #666;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
              ">${tag}</span>
            `).join('')}
            ${this.hexie.tags.length > 3 ? `
              <span style="
                background: #e3f2fd;
                color: #1976d2;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
              ">+${this.hexie.tags.length - 3}</span>
            ` : ''}
          </div>
        ` : ''}

        <!-- Actions -->
        ${this.options.showActions ? this.renderActions() : ''}
      </div>
    `;

    this.setupEventListeners();
    return this.element;
  }

  renderActions() {
    const canAccess = this.canAccess();
    const isUserHexie = this.hexie.isUserCreated;
    
    let actions = '';
    
    if (canAccess) {
      actions += `
        <button class="hexie-action-btn primary" data-action="add-to-board" style="
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #4285f4, #1976d2);
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
        ">
          Add to Board
        </button>
      `;
      
      if (isUserHexie) {
        actions += `
          <div style="display: flex; gap: 8px;">
            <button class="hexie-action-btn" data-action="edit" style="
              flex: 1;
              padding: 8px 12px;
              border: 1px solid #e1e5e9;
              border-radius: 6px;
              background: white;
              color: #666;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            ">
              Edit
            </button>
            <button class="hexie-action-btn" data-action="delete" style="
              flex: 1;
              padding: 8px 12px;
              border: 1px solid #f44336;
              border-radius: 6px;
              background: white;
              color: #f44336;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            ">
              Delete
            </button>
          </div>
        `;
      }
    } else {
      actions = `
        <button class="hexie-action-btn upgrade" data-action="upgrade" style="
          width: 100%;
          padding: 10px;
          border: 2px solid #ff6b35;
          border-radius: 8px;
          background: white;
          color: #ff6b35;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          Upgrade to Access
        </button>
      `;
    }
    
    return actions;
  }

  setupEventListeners() {
    // Card click (for preview/details)
    if (this.options.onClick) {
      this.element.addEventListener('click', (e) => {
        // Don't trigger if clicking an action button
        if (!e.target.closest('.hexie-action-btn')) {
          this.options.onClick(this.hexie);
        }
      });
    }

    // Action buttons
    const actionBtns = this.element.querySelectorAll('.hexie-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAction(btn.getAttribute('data-action'));
      });

      // Hover effects
      btn.addEventListener('mouseenter', () => {
        if (btn.classList.contains('primary')) {
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = '0 4px 16px rgba(66, 133, 244, 0.3)';
        } else if (btn.classList.contains('upgrade')) {
          btn.style.background = '#ff6b35';
          btn.style.color = 'white';
        } else {
          btn.style.background = '#f5f5f5';
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (btn.classList.contains('primary')) {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        } else if (btn.classList.contains('upgrade')) {
          btn.style.background = 'white';
          btn.style.color = '#ff6b35';
        } else {
          btn.style.background = 'white';
        }
      });
    });

    // Card hover effects
    this.element.addEventListener('mouseenter', () => {
      if (this.canAccess()) {
        this.element.style.transform = 'translateY(-4px)';
        this.element.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
        this.element.style.borderColor = this.getCategoryColor();
      }
    });

    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = 'translateY(0)';
      this.element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      this.element.style.borderColor = 'transparent';
    });
  }

  async handleAction(action) {
    const btn = this.element.querySelector(`[data-action="${action}"]`);
    
    switch (action) {
      case 'add-to-board':
        await this.addToBoard(btn);
        break;
      case 'edit':
        if (this.options.onEdit) {
          this.options.onEdit(this.hexie);
        }
        break;
      case 'delete':
        await this.deleteHexie(btn);
        break;
      case 'upgrade':
        this.showUpgradeModal();
        break;
    }
  }

  async addToBoard(btn) {
    const originalText = btn.textContent;
    
    try {
      btn.disabled = true;
      btn.textContent = 'Adding...';
      
      // Import hexie store dynamically to avoid circular imports
      const { useHexieStore } = await import('../store/useHexieStore.js');
      await useHexieStore.getState().createHexieOnBoard(this.hexie);
      
      // Success feedback
      btn.textContent = '✓ Added!';
      btn.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = 'linear-gradient(135deg, #4285f4, #1976d2)';
        btn.disabled = false;
      }, 1500);
    } catch (error) {
      console.error('Failed to add hexie to board:', error);
      btn.textContent = 'Error';
      btn.style.background = '#f44336';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = 'linear-gradient(135deg, #4285f4, #1976d2)';
        btn.disabled = false;
      }, 2000);
    }
  }

  async deleteHexie(btn) {
    if (!confirm(`Are you sure you want to delete "${this.hexie.title}"?`)) {
      return;
    }

    const originalText = btn.textContent;
    
    try {
      btn.disabled = true;
      btn.textContent = 'Deleting...';
      
      if (this.options.onDelete) {
        await this.options.onDelete(this.hexie.id);
      }
      
      // Animate card removal
      this.element.style.transition = 'all 0.3s ease';
      this.element.style.transform = 'scale(0.95)';
      this.element.style.opacity = '0';
      
      setTimeout(() => {
        this.element.remove();
      }, 300);
    } catch (error) {
      console.error('Failed to delete hexie:', error);
      btn.textContent = 'Error';
      btn.style.color = '#f44336';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.color = '#f44336';
        btn.disabled = false;
      }, 2000);
    }
  }

  showUpgradeModal() {
    // Import and show subscription modal
    import('./SubscriptionModal.js').then(({ default: SubscriptionModal }) => {
      const modal = new SubscriptionModal();
      modal.show();
    });
  }

  canAccess() {
    // User-created hexies are always accessible
    if (this.hexie.isUserCreated) {
      return true;
    }
    
    // Free hexies are always accessible
    if (this.hexie.free) {
      return true;
    }
    
    // Check subscription for premium hexies
    const authStore = useAuthStore.getState();
    return authStore.canAccessFeature('premium_hexies');
  }

  getCategoryColor() {
    const categoryConfig = Object.values(HEXIE_CATEGORIES)
      .find(cat => cat.id === this.hexie.category);
    return categoryConfig?.color || '#4285f4';
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}