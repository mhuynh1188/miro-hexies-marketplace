// src/core/BoardService.js
import { HEXIE_CATEGORIES } from '../config/constants.js';
import authService from './AuthService.js';

/**
 * Handles all interactions with the Miro board
 */
class BoardService {
  constructor() {
    this.initialized = false;
    this.flipHandler = null;
  }

  /**
   * Initialize the board service
   * @returns {Promise<boolean>}
   */
  async initialize() {
    try {
      // Verify Miro SDK is available
      if (!window.miro) {
        throw new Error('Miro SDK not available');
      }

      // Initialize flip handler for hexie interactions on the board
      this.initializeFlipHandler();
      
      this.initialized = true;
      console.log('BoardService initialized successfully');
      return true;
    } catch (error) {
      console.error('BoardService initialization error:', error);
      throw error;
    }
  }

  /**
   * Initialize flip handler for hexies on board
   */
  initializeFlipHandler() {
    // Remove existing handler if any
    if (this.flipHandler) {
      miro.board.ui.off('selection:update', this.flipHandler);
    }

    // Create new handler
    this.flipHandler = async (event) => {
      const selection = await miro.board.getSelection();
      
      for (const item of selection) {
        // Check if selected item is a hexie
        if (item.type === 'shape' || item.type === 'image') {
          try {
            const metadata = await item.getMetadata('hexie');
            if (metadata && metadata.id) {
              // Handle hexie flip
              await this.handleHexieFlip(item, metadata);
              break;
            }
          } catch (error) {
            // Not a hexie or error reading metadata
            console.error('Error reading metadata:', error);
          }
        }
      }
    };

    // Register handler
    miro.board.ui.on('selection:update', this.flipHandler);
    console.log('Flip handler initialized');
  }

  /**
   * Handle flipping a hexie on the board
   * @param {Object} item - Miro board item
   * @param {Object} metadata - Hexie metadata
   */
  async handleHexieFlip(item, metadata) {
    try {
      // Create new hexagon with flipped state
      const newHexagon = await this.createFlippableHexagon(
        metadata, 
        metadata.position?.x || item.x, 
        metadata.position?.y || item.y,
        !metadata.isFlipped
      );
      
      // Remove old hexagon
      await miro.board.remove(item);
      
      // Focus on the new hexagon
      await miro.board.viewport.zoomTo(newHexagon);
      
      // Track flip event
      if (window.apiService) {
        await window.apiService.trackEvent('hexie_flipped', { 
          hexieId: metadata.id 
        });
      }
    } catch (error) {
      console.error('Error flipping hexie:', error);
    }
  }

  /**
   * Create hexie on board
   * @param {Object} hexie - Hexie data
   * @returns {Promise<Object>} - Created Miro widget
   */
  async createHexieOnBoard(hexie) {
    if (!hexie) {
      throw new Error('Invalid hexie data');
    }

    // Check access permission
    if (!authService.canAccessHexie(hexie)) {
      throw new Error('Upgrade required to access this hexie');
    }

    try {
      // Get current viewport
      const viewport = await miro.board.viewport.get();
      const x = viewport.x + (Math.random() * 200) - 100;
      const y = viewport.y + (Math.random() * 200) - 100;

      // Create flippable hexagon
      const hexagonWidget = await this.createFlippableHexagon(hexie, x, y, false);
      
      // Track usage
      if (window.apiService) {
        await window.apiService.trackEvent('hexie_added_to_board', { 
          hexieId: hexie.id 
        });
      }

      await miro.board.viewport.zoomTo(hexagonWidget);
      return hexagonWidget;
    } catch (error) {
      console.error('Error creating hexie on board:', error);
      throw error;
    }
  }

  /**
   * Create flippable hexagon on board
   * @param {Object} hexie - Hexie data
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {boolean} isFlipped - Is showing back side
   * @returns {Promise<Object>} - Created widget
   */
  async createFlippableHexagon(hexie, x, y, isFlipped = false) {
    const categoryColor = HEXIE_CATEGORIES[hexie.category.toUpperCase()]?.color || '#4285f4';
    
    try {
      let widget;
      
      if (isFlipped) {
        // Back side (details)
        widget = await miro.board.createShape({
          content: this.generateDetailedContent(hexie),
          shape: 'hexagon',
          x: x,
          y: y,
          width: 240,
          height: 200,
          style: {
            fillColor: '#ffffff',
            borderColor: categoryColor,
            borderWidth: 2,
            textAlign: 'center',
            textAlignVertical: 'middle',
            fontFamily: 'Arial',
            fontSize: 14
          }
        });
      } else {
        // Front side (summary)
        widget = await miro.board.createShape({
          content: this.generateSummaryContent(hexie),
          shape: 'hexagon',
          x: x,
          y: y,
          width: 240,
          height: 200,
          style: {
            fillColor: categoryColor,
            borderColor: 'transparent',
            textColor: '#ffffff',
            textAlign: 'center',
            textAlignVertical: 'middle',
            fontFamily: 'Arial',
            fontSize: 16
          }
        });
      }

      // Store metadata for flip functionality
      await widget.setMetadata('hexie', {
        ...hexie,
        isFlipped: isFlipped,
        position: { x, y }
      });

      return widget;
    } catch (error) {
      console.error('Error creating flippable hexagon:', error);
      throw error;
    }
  }

  /**
   * Generate content for summary side
   * @param {Object} hexie - Hexie data
   * @returns {string} - Formatted content
   */
  generateSummaryContent(hexie) {
    return `<p style="font-size:32px;margin-bottom:16px;">${hexie.icon}</p>
<p style="font-size:18px;font-weight:bold;margin-bottom:8px;">${hexie.title}</p>
<p style="font-size:12px;margin-bottom:8px;">${hexie.category.toUpperCase()}</p>
<p style="font-size:14px;">${hexie.summary}</p>
<p style="font-size:12px;font-style:italic;margin-top:16px;">Click to flip for details</p>`;
  }

  /**
   * Generate content for detailed side
   * @param {Object} hexie - Hexie data
   * @returns {string} - Formatted content
   */
  generateDetailedContent(hexie) {
    let content = `<p style="font-size:16px;font-weight:bold;color:#333;margin-bottom:8px;">${hexie.title}</p>
<p style="font-size:24px;margin-bottom:12px;">${hexie.icon}</p>`;

    if (hexie.details) {
      content += `<p style="font-size:12px;color:#333;margin-bottom:12px;">${hexie.details}</p>`;
    }

    if (hexie.tags && hexie.tags.length > 0) {
      content += `<p style="font-size:10px;color:#666;">Tags: ${hexie.tags.join(', ')}</p>`;
    }

    content += `<p style="font-size:10px;font-style:italic;margin-top:12px;color:#666;">Click to flip back</p>`;

    return content;
  }

  /**
   * Create simple sticky note on board
   * @param {string} text - Note text
   * @returns {Promise<Object>} - Created sticky note
   */
  async createStickyNote(text) {
    try {
      const viewport = await miro.board.viewport.get();
      
      const sticky = await miro.board.createStickyNote({
        content: text,
        x: viewport.x,
        y: viewport.y,
        width: 200
      });
      
      await miro.board.viewport.zoomTo(sticky);
      return sticky;
    } catch (error) {
      console.error('Error creating sticky note:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.flipHandler) {
      miro.board.ui.off('selection:update', this.flipHandler);
      this.flipHandler = null;
    }
    console.log('BoardService destroyed');
  }
}

// Export singleton instance
const boardService = new BoardService();
export default boardService;