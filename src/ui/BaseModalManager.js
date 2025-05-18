// src/ui/modals/BaseModalManager.js
import { UIHelpers } from '../UIHelpers.js';

/**
 * Base modal manager for handling common modal functionality
 */
export class BaseModalManager {
  constructor() {
    this.activeModals = new Map();
    this.modalCounter = 0;
    this.setupKeyboardHandlers();
  }

  /**
   * Set up keyboard handlers for modals
   */
  setupKeyboardHandlers() {
    // Handle escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTopModal();
      }
    });
  }

  /**
   * Create a new modal
   * @param {Object} config - Modal configuration
   * @returns {string} Modal ID
   */
  createModal(config = {}) {
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
    
    // Apply modal styles based on size
    this.applyModalStyles(modal, size, animation);

    // Create modal content
    modal.innerHTML = `
      <div class="modal-header">
        <h2 id="${modalId}-title" class="modal-title">${title}</h2>
        ${closable ? `
          <button class="modal-close-btn" aria-label="Close modal" type="button">
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

  /**
   * Apply styles to modal based on size
   * @param {HTMLElement} modal - Modal element
   * @param {string} size - Modal size
   * @param {string} animation - Animation type
   */
  applyModalStyles(modal, size, animation) {
    const sizes = {
      small: { width: '400px', maxHeight: '60vh' },
      medium: { width: '600px', maxHeight: '80vh' },
      large: { width: '800px', maxHeight: '90vh' },
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

    // Add additional styles for header and body
    const style = document.createElement('style');
    style.textContent = `
      .modal-container .modal-header {
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e1e5e9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
        border-radius: 16px 16px 0 0;
      }
      
      .modal-container .modal-title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #050038;
      }
      
      .modal-container .modal-body {
        padding: 24px;
        overflow-y: auto;
        flex-grow: 1;
      }
      
      .modal-container .modal-close-btn {
        background: none;
        border: none;
        font-size: 32px;
        color: #666;
        cursor: pointer;
        padding: 0;
        line-height: 0.8;
        transition: color 0.2s ease;
      }
      
      .modal-container .modal-close-btn:hover {
        color: #333;
      }
    `;
    
    // Only add style once
    if (!document.querySelector('style[data-modal-styles]')) {
      style.setAttribute('data-modal-styles', 'true');
      document.head.appendChild(style);
    }
  }

  /**
   * Animate modal
   * @param {HTMLElement} modal - Modal element
   * @param {string} direction - Animation direction ('in' or 'out')
   * @param {string} animation - Animation type
   */
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

  /**
   * Setup focus trap within modal
   * @param {HTMLElement} modal - Modal element
   */
  setupFocusTrap(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    setTimeout(() => firstElement.focus(), 100);

    // Trap focus within modal
    modal.addEventListener('keydown', (e) => {
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
    });
  }

  /**
   * Close specific modal
   * @param {string} modalId - Modal ID
   */
  closeModal(modalId) {
    const modalData = this.activeModals.get(modalId);
    if (!modalData) return;

    const { overlay, modal, onClose } = modalData;

    // Animate out
    this.animateModal(modal, 'out');
    overlay.style.opacity = '0';

    // Remove modal after animation completes
    setTimeout(() => {
      overlay.remove();
      this.activeModals.delete(modalId);
      
      // Call onClose callback
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    }, 300);
  }

  /**
   * Close top-most modal
   */
  closeTopModal() {
    const modalIds = Array.from(this.activeModals.keys());
    if (modalIds.length > 0) {
      this.closeModal(modalIds[modalIds.length - 1]);
    }
  }

  /**
   * Close all modals
   */
  closeAllModals() {
    const modalIds = Array.from(this.activeModals.keys());
    modalIds.forEach(id => this.closeModal(id));
  }

  /**
   * Get modal element by ID
   * @param {string} modalId - Modal ID
   * @returns {HTMLElement|null} - Modal element or null
   */
  getModalElement(modalId) {
    const modalData = this.activeModals.get(modalId);
    return modalData ? modalData.modal : null;
  }

  /**
   * Update modal content
   * @param {string} modalId - Modal ID
   * @param {string} content - New content
   */
  updateModalContent(modalId, content) {
    const modal = this.getModalElement(modalId);
    if (modal) {
      const contentEl = modal.querySelector('.modal-body');
      if (contentEl) {
        contentEl.innerHTML = content;
      }
    }
  }

  /**
   * Update modal title
   * @param {string} modalId - Modal ID
   * @param {string} title - New title
   */
  updateModalTitle(modalId, title) {
    const modal = this.getModalElement(modalId);
    if (modal) {
      const titleEl = modal.querySelector('.modal-title');
      if (titleEl) {
        titleEl.textContent = title;
      }
    }
  }
}

export default BaseModalManager;