// src/ui/UIHelpers.js
export class UIHelpers {
    // Color manipulation utilities
    static darkenColor(color, percent) {
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
  
    static lightenColor(color, percent) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const factor = percent / 100;
      const newR = Math.round(r + (255 - r) * factor);
      const newG = Math.round(g + (255 - g) * factor);
      const newB = Math.round(b + (255 - b) * factor);
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
  
    static hexToRgba(hex, alpha = 1) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return `rgba(66, 133, 244, ${alpha})`;
      
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  
    // Animation utilities
    static createKeyframes(name, keyframes) {
      const style = document.createElement('style');
      style.textContent = `@keyframes ${name} { ${keyframes} }`;
      document.head.appendChild(style);
      return name;
    }
  
    static get spinAnimation() {
      return this.createKeyframes('hexie-spin', `
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      `);
    }
  
    static get pulseAnimation() {
      return this.createKeyframes('hexie-pulse', `
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      `);
    }
  
    // Modal and overlay utilities
    static createModalOverlay(onClick) {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      
      if (onClick) {
        overlay.addEventListener('click', onClick);
      }
      
      // Animate in
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });
      
      return overlay;
    }
  
    static createToast(message, type = 'info', duration = 5000) {
      const toast = document.createElement('div');
      const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
      };
      
      toast.className = `toast toast-${type}`;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 11000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;
      
      toast.innerHTML = `
        <div>${message}</div>
        <button onclick="this.parentElement.remove()" style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          opacity: 0.7;
        ">×</button>
      `;
      
      document.body.appendChild(toast);
      
      // Animate in
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
      });
      
      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          toast.style.transform = 'translateX(100%)';
          setTimeout(() => toast.remove(), 300);
        }, duration);
      }
      
      return toast;
    }
  
    // Performance utilities
    static debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  }
  
  export default UIHelpers;