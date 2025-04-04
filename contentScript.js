// Listen for block site message from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'BLOCK_SITE') {
    injectBlockingOverlay();
  }
});

// Create and inject the blocking overlay
function injectBlockingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'focububble-overlay';
  overlay.innerHTML = `
    <div class="focububble-content">
      <h1>🚫 Site Blocked</h1>
      <p>This site is blocked during focus mode.</p>
      <button id="focububble-close">Close Tab</button>
    </div>
  `;
  
  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    #focububble-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .focububble-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
    }
    
    .focububble-content h1 {
      font-size: 24px;
      margin-bottom: 1rem;
      color: #333;
    }
    
    .focububble-content p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    
    #focububble-close {
      background: #4A90E2;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s ease;
    }
    
    #focububble-close:hover {
      background: #357ABD;
    }
  `;
  
  document.head.appendChild(styles);
  document.body.appendChild(overlay);
  
  // Handle close button click
  document.getElementById('focububble-close').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
  });
} 