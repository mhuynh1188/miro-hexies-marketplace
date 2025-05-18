// index.js - Entry point for the Miro app

async function init() {
    try {
      console.log('Miro app starting...');
      
      // Add a button to the toolbar
      await miro.board.ui.openButton({
        icon: '🔷', // Simple emoji icon for now
        tooltip: 'Hexies Marketplace',
        onClick: async () => {
          console.log('Opening app panel...');
          // Open the main app panel
          await miro.board.ui.openPanel({
            url: 'app.html',
            width: 400,
            height: 600
          });
        }
      });
      
      console.log('Miro app button added successfully');
      
    } catch (error) {
      console.error('Error initializing Miro app:', error);
    }
  }
  
  // Initialize when the script loads
  init();