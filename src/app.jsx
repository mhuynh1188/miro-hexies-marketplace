import * as React from 'react'; 
import { createRoot } from 'react-dom/client'; 

import '../src/assets/style.css'; 

async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!', 
    }); 
    
    await miro.board.viewport.zoomTo(stickyNote); 
} 

const App = () => {
    React.useEffect(() => {
        addSticky(); 
    }, []); 
    
    return ( <div className="grid wrapper"> 
      <div className="cs1 ce12"> 
        <img src="/src/assets/congratulations.png" alt=""/> 
      </div> 
      <div className="cs1 ce12"> 
        <h1>Congratulations!</h1> 
        <p>You've just created your first Miro app!</p> 
        <p> 
          To explore more and build your own app, see the Miro Developer
          Platform documentation.
        </p> 
      </div> 
      <div className="cs1 ce12"> 
        <a  className="button button-primary"  target="_blank"  href="https://developers.miro.com" > 
          Read the documentation
        </a> 
      </div> 
    </div> ); 
}; 

async createTestSticky() {
  try {
    const sticky = await miro.board.createStickyNote({
      content: 'Test sticky note from Hexies app!',
      x: 0,
      y: 0,
      style: {
        fillColor: 'yellow',  // Changed from '#fff9b1' to valid color name
        textAlign: 'center'
      }
    });
    
    await miro.board.viewport.zoomTo(sticky);
    this.showOutput(`Created sticky note with ID: ${sticky.id}`);
  } catch (error) {
    this.showOutput(`Error: ${error.message}`);
  }
}

updateHexieDisplay() {
  const container = document.getElementById('hexagonLibrary');
  if (!container || !this.hexieManager) return;

  const selectedCategory = document.getElementById('categoryFilter')?.value || '';
  const hexies = this.hexieManager.getHexiesByCategory(selectedCategory);
  
  // Clear existing content
  container.innerHTML = '';
  
  // Add scrolling styles to container
  container.style.cssText = `
    max-height: 60vh;
    overflow-y: auto;
    padding: 16px 0;
  `;
  
  if (hexies.length === 0) {
    container.innerHTML = this.getEmptyState();
    return;
  }

  // Create hexie grid
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  `;

  hexies.forEach(hexie => {
    const card = this.hexieManager.createHexieCardElement(hexie);
    card.addEventListener('click', () => this.handleHexieClick(hexie));
    grid.appendChild(card);
  });

  container.appendChild(grid);
  
  // Force refresh of the display
  console.log(`Displaying ${hexies.length} hexies`);
}



const container = document.getElementById('root'); 
const root = createRoot(container); 
root.render(<App />); 
