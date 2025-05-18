// src/components/SubscriptionModal.js - Modern subscription modal with Stripe integration
import paymentService from '../services/payment.service.js';
import { SUBSCRIPTION_PLANS } from '../config/constants.js';
import { useAuthStore } from '../store/useAuthStore.js';

class SubscriptionModal {
  constructor() {
    this.isVisible = false;
    this.modal = null;
    this.onClose = null;
  }

  show(onClose = null) {
    this.onClose = onClose;
    this.createModal();
    this.isVisible = true;
  }

  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    this.isVisible = false;
    if (this.onClose) this.onClose();
  }

  createModal() {
    // Remove existing modal if any
    this.hide();

    this.modal = document.createElement('div');
    this.modal.className = 'subscription-modal-overlay';
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      backdrop-filter: blur(4px);
    `;

    const content = document.createElement('div');
    content.className = 'subscription-modal-content';
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 64px rgba(0, 0, 0, 0.1);
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: modalSlideIn 0.3s ease-out;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);

    content.innerHTML = this.getModalContent();
    this.modal.appendChild(content);

    // Event listeners
    this.setupEventListeners();

    document.body.appendChild(this.modal);
  }

  getModalContent() {
    const currentSubscription = useAuthStore.getState().subscription;
    const isUpgrade = currentSubscription && currentSubscription.plan.id !== 'free';

    return `
      <div style="padding: 32px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <button id="closeModal" style="
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            color: #666;
            transition: all 0.2s;
          " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='none'">
            ×
          </button>
          
          <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
          <h1 style="font-size: 28px; font-weight: 600; color: #050038; margin-bottom: 8px;">
            ${isUpgrade ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h1>
          <p style="color: #626f86; font-size: 16px;">
            Unlock the full potential of your professional development toolkit
          </p>
        </div>

        <!-- Current Plan Indicator -->
        ${currentSubscription ? `
          <div style="
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
          ">
            <span style="color: #1976d2; font-weight: 500;">
              Current Plan: ${currentSubscription.plan.name}
            </span>
          </div>
        ` : ''}

        <!-- Pricing Plans -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px;">
          ${this.generatePlanCards()}
        </div>

        <!-- Features Comparison -->
        <div style="margin-top: 32px;">
          <h3 style="text-align: center; margin-bottom: 24px; color: #050038;">Feature Comparison</h3>
          ${this.generateFeatureComparison()}
        </div>

        <!-- Trust Indicators -->
        <div style="
          border-top: 1px solid #e1e5e9;
          padding-top: 24px;
          margin-top: 32px;
          text-align: center;
          color: #626f86;
          font-size: 14px;
        ">
          <div style="margin-bottom: 12px;">
            🔒 Secure payment powered by Stripe
          </div>
          <div style="margin-bottom: 12px;">
            📞 Cancel anytime • No hidden fees
          </div>
          <div>
            ⭐ Join thousands of professionals improving their skills
          </div>
        </div>
      </div>
    `;
  }

  generatePlanCards() {
    const plans = Object.values(SUBSCRIPTION_PLANS);
    const currentPlan = useAuthStore.getState().subscription?.plan;
    
    return plans.map(plan => {
      const isCurrent = currentPlan?.id === plan.id;
      const isPopular = plan.id === 'premium';
      
      return `
        <div class="plan-card" data-plan="${plan.id}" style="
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
            <div style="
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
            <div style="
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

          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="font-size: 24px; font-weight: 600; color: #050038; margin-bottom: 8px;">
              ${plan.name}
            </h3>
            <div style="font-size: 36px; font-weight: 700; color: #4285f4; margin-bottom: 4px;">
              ${plan.price === 0 ? 'Free' : `$${plan.price}`}
            </div>
            ${plan.price > 0 ? `
              <div style="color: #626f86; font-size: 14px;">per ${plan.interval}</div>
            ` : ''}
          </div>

          <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
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
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              ${plan.id === 'free' ? 'Select Free Plan' : `Upgrade to ${plan.name}`}
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

  generateFeatureComparison() {
    const features = [
      { name: 'Create unlimited hexies', free: true, premium: true, enterprise: true },
      { name: 'Access to basic hexies', free: true, premium: true, enterprise: true },
      { name: 'Premium hexie collection', free: false, premium: true, enterprise: true },
      { name: 'Advanced frameworks', free: false, premium: true, enterprise: true },
      { name: 'Export capabilities', free: false, premium: true, enterprise: true },
      { name: 'Priority support', free: false, premium: true, enterprise: true },
      { name: 'Team management', free: false, premium: false, enterprise: true },
      { name: 'Custom hexie templates', free: false, premium: false, enterprise: true },
      { name: 'Analytics dashboard', free: false, premium: false, enterprise: true },
      { name: 'SSO integration', free: false, premium: false, enterprise: true }
    ];

    return `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e1e5e9; color: #050038;">
                Features
              </th>
              ${Object.values(SUBSCRIPTION_PLANS).map(plan => `
                <th style="text-align: center; padding: 12px; border-bottom: 2px solid #e1e5e9; color: #050038;">
                  ${plan.name}
                </th>
              `).join('')}
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

  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('#closeModal');
    closeBtn.addEventListener('click', () => this.hide());

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    // Plan selection buttons
    const planBtns = this.modal.querySelectorAll('.select-plan-btn');
    planBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const planId = e.target.getAttribute('data-plan');
        await this.handlePlanSelection(planId);
      });
    });

    // Plan card hover effects
    const planCards = this.modal.querySelectorAll('.plan-card');
    planCards.forEach(card => {
      if (!card.style.cursor.includes('default')) {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'none';
        });
      }
    });
  }

  async handlePlanSelection(planId) {
    const btn = this.modal.querySelector(`[data-plan="${planId}"]`);
    const originalText = btn.textContent;
    
    try {
      // Update button state
      btn.disabled = true;
      btn.textContent = 'Processing...';
      btn.style.opacity = '0.7';

      if (planId === 'free') {
        // Handle free plan selection (if downgrading)
        await this.handleFreePlanSelection();
      } else {
        // Handle paid plan selection
        await paymentService.subscribeToPlan(planId);
      }
    } catch (error) {
      console.error('Plan selection error:', error);
      
      // Show error message
      this.showError(error.message);
      
      // Reset button
      btn.disabled = false;
      btn.textContent = originalText;
      btn.style.opacity = '1';
    }
  }

  async handleFreePlanSelection() {
    const currentSub = useAuthStore.getState().subscription;
    
    if (currentSub && currentSub.plan.id !== 'free') {
      // Show downgrade confirmation
      const confirmed = confirm(
        'Are you sure you want to downgrade to the free plan? You will lose access to premium features.'
      );
      
      if (confirmed) {
        await paymentService.cancelSubscription();
        this.hide();
      }
    } else {
      // Already on free plan or no subscription
      this.hide();
    }
  }

  showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
      z-index: 3000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

export default SubscriptionModal;