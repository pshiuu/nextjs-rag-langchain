(function () {
    const chatbotContainer = document.querySelector('[data-chatbot-id]');
    if (!chatbotContainer) {
      console.error('Chatbot container with [data-chatbot-id] not found.');
      return;
    }
  
    const chatbotId = chatbotContainer.dataset.chatbotId;
    const appOrigin = new URL(document.currentScript.src).origin;
    
    // Default styles (fallback)
    const defaultStyles = {
      primaryColor: '#0f172a',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: '12px',
      maxWidth: '400px',
      height: '600px',
      buttonBackgroundColor: '#0f172a',
      buttonTextColor: '#ffffff',
      buttonHoverColor: '#334155'
    };
    
    let currentStyles = defaultStyles;
    let isOpen = false;
    
    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${appOrigin}/embed/${chatbotId}`;
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.display = 'none'; // Initially hidden
    iframe.style.zIndex = '9999';
    iframe.style.border = 'none';
    iframe.style.transition = 'all 0.3s ease-in-out';
    
    // Create a chat bubble button
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H16M8 8H16M8 16H13M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H7L3 24V6C3 4.89543 3.89543 4 5 4H7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.width = '60px';
    toggleButton.style.height = '60px';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    toggleButton.style.zIndex = '9998';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.transition = 'all 0.3s ease';
    toggleButton.style.fontFamily = 'Inter, system-ui, sans-serif';
    
    // Function to apply custom styles
    function applyStyles(styles) {
      currentStyles = { ...defaultStyles, ...styles };
      
      // Apply iframe styles
      iframe.style.width = currentStyles.maxWidth || '400px';
      iframe.style.height = currentStyles.height || '600px';
      iframe.style.borderRadius = currentStyles.borderRadius || '12px';
      iframe.style.backgroundColor = currentStyles.backgroundColor || '#ffffff';
      iframe.style.boxShadow = `0 10px 25px rgba(0, 0, 0, 0.15)`;
      iframe.style.overflow = 'hidden';
      
      // Apply button styles
      toggleButton.style.backgroundColor = currentStyles.buttonBackgroundColor || '#0f172a';
      toggleButton.style.color = currentStyles.buttonTextColor || '#ffffff';
      
      // Update button hover effects
      toggleButton.onmouseenter = () => {
        if (!isOpen) {
          toggleButton.style.backgroundColor = currentStyles.buttonHoverColor || '#334155';
          toggleButton.style.transform = 'scale(1.05)';
        }
      };
      
      toggleButton.onmouseleave = () => {
        if (!isOpen) {
          toggleButton.style.backgroundColor = currentStyles.buttonBackgroundColor || '#0f172a';
          toggleButton.style.transform = 'scale(1)';
        }
      };
    }
    
    // Function to toggle chat
    function toggleChat() {
      if (!isOpen) {
        iframe.style.display = 'block';
        toggleButton.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        toggleButton.style.backgroundColor = currentStyles.borderColor || '#e2e8f0';
        toggleButton.style.color = currentStyles.primaryColor || '#0f172a';
        isOpen = true;
      } else {
        closeChat();
      }
    }
    
    // Function to close chat
    function closeChat() {
      iframe.style.display = 'none';
      toggleButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12H16M8 8H16M8 16H13M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H7L3 24V6C3 4.89543 3.89543 4 5 4H7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      toggleButton.style.backgroundColor = currentStyles.buttonBackgroundColor || '#0f172a';
      toggleButton.style.color = currentStyles.buttonTextColor || '#ffffff';
      isOpen = false;
    }
    
    // Listen for close message from iframe
    window.addEventListener('message', (event) => {
      // Security: Check origin
      if (event.origin !== appOrigin) return;
      
      if (event.data && event.data.type === 'CLOSE_CHAT') {
        closeChat();
      }
    });
    
    // Toggle iframe visibility
    toggleButton.addEventListener('click', toggleChat);
    
    // Fetch custom styles
    fetch(`${appOrigin}/api/public/styles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: chatbotId }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.styles) {
        applyStyles(data.styles);
      } else {
        applyStyles(defaultStyles);
      }
    })
    .catch(error => {
      console.log('Could not fetch custom styles, using defaults:', error);
      applyStyles(defaultStyles);
    });
    
    // Apply initial default styles
    applyStyles(defaultStyles);
    
    // Append to the body
    document.body.appendChild(iframe);
    document.body.appendChild(toggleButton);
    
  })();