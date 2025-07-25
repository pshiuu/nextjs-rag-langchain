(function () {
    const chatbotContainer = document.querySelector('[data-chatbot-id]');
    if (!chatbotContainer) {
      console.error('Chatbot container with [data-chatbot-id] not found.');
      return;
    }
  
    const chatbotId = chatbotContainer.dataset.chatbotId;
    const appOrigin = new URL(document.currentScript.src).origin;
    
    // Default styles (fallback) - matches the ChatbotStyle interface
    const defaultStyles = {
      primaryColor: '#0f172a',
      backgroundColor: '#ffffff',
      userMessageColor: '#f8fafc',
      botMessageColor: '#0f172a',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      borderRadius: '12px',
      padding: '16px',
      maxWidth: '400px',
      height: '600px',
      messageSpacing: '16px',
      messagePadding: '16px',
      inputBackgroundColor: '#ffffff',
      inputBorderColor: '#e2e8f0',
      inputTextColor: '#0f172a',
      buttonBackgroundColor: '#0f172a',
      buttonTextColor: '#ffffff',
      buttonHoverColor: '#334155',
      toggleButtonBackgroundColor: '#0f172a',
      toggleButtonTextColor: '#ffffff',
      toggleButtonHoverColor: '#334155',
      toggleButtonSize: '60px',
      toggleButtonBorderRadius: '50%',
      toggleButtonCloseBackgroundColor: '#0f172a',
      toggleButtonCloseTextColor: '#ffffff',
      toggleButtonCloseHoverColor: '#334155',
      sendButtonText: 'Send',
      placeholderText: 'Type your message...',
      showInitialMessage: true,
      initialMessage: 'Hello! How can I help you today?',
      showHeader: true,
      headerTitle: 'Chatbot',
      showOnlineStatus: true,
      autoOpen: 'never',
      autoOpenDelay: 0
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
    iframe.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    iframe.style.transform = 'translateY(100%) scale(0.95)';
    iframe.style.opacity = '0';
    iframe.style.transformOrigin = 'bottom right';
    
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
      
      console.log('Embed.js: Applying styles to iframe:', currentStyles);
      
      // Apply iframe styles with mobile-first responsive design
      const maxWidth = currentStyles.maxWidth || '400px';
      const height = currentStyles.height || '600px';
      
      // Parse values to numbers (handle px, rem, etc.)
      const parseValue = (value) => {
        if (typeof value === 'string') {
          if (value.includes('rem')) {
            return parseFloat(value) * 16; // Convert rem to px
          } else if (value.includes('%')) {
            return (parseFloat(value) / 100) * window.innerWidth;
          }
          return parseFloat(value) || 400;
        }
        return value || 400;
      };
      
      const parsedMaxWidth = parseValue(maxWidth);
      const parsedHeight = parseValue(height);
      
      // Mobile-first responsive calculations
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate responsive button size early (needed for iframe positioning)
      const buttonSize = currentStyles.toggleButtonSize || '60px';
      const parsedButtonSize = parseValue(buttonSize);
      
      let responsiveButtonSize;
      if (viewportWidth <= 480) {
        responsiveButtonSize = Math.max(48, Math.min(parsedButtonSize, 56)); // 48-56px on mobile
      } else if (viewportWidth <= 768) {
        responsiveButtonSize = Math.max(52, Math.min(parsedButtonSize, 64)); // 52-64px on tablet
      } else {
        responsiveButtonSize = Math.max(56, Math.min(parsedButtonSize, 80)); // 56-80px on desktop
      }
      
      // Calculate responsive dimensions
      let finalWidth, finalHeight;
      
      if (viewportWidth <= 480) {
        // Mobile: Position chat from bottom-right for visual continuity with button
        finalWidth = Math.min(viewportWidth - 32, parsedMaxWidth); // 16px margins on each side
        finalHeight = Math.min(viewportHeight - 100, parsedHeight);
        
        iframe.style.left = 'auto';
        iframe.style.right = '16px';
        iframe.style.width = `${finalWidth}px`;
        iframe.style.maxWidth = 'calc(100vw - 32px)';
        
      } else if (viewportWidth <= 768) {
        // Tablet: 95% width or maxWidth, whichever is smaller
        finalWidth = Math.min(viewportWidth * 0.95, parsedMaxWidth);
        finalHeight = Math.min(viewportHeight - 120, parsedHeight);
        
        iframe.style.left = 'auto';
        iframe.style.right = '10px';
        iframe.style.width = `${finalWidth}px`;
        iframe.style.maxWidth = '95vw';
        
      } else {
        // Desktop: Use configured width
        finalWidth = parsedMaxWidth;
        finalHeight = Math.min(viewportHeight - 120, parsedHeight);
        
        iframe.style.left = 'auto';
        iframe.style.right = '20px';
        iframe.style.width = `${finalWidth}px`;
        iframe.style.maxWidth = 'calc(100vw - 40px)';
      }
      
      // Set height with viewport considerations
      iframe.style.height = `${finalHeight}px`;
      iframe.style.maxHeight = 'calc(100vh - 100px)';
      
      // Apply other styles
      iframe.style.borderRadius = `clamp(8px, ${currentStyles.borderRadius || '12px'}, 20px)`;
      iframe.style.backgroundColor = currentStyles.backgroundColor || '#ffffff';
      iframe.style.border = `1px solid ${currentStyles.borderColor || '#e2e8f0'}`;
      iframe.style.boxShadow = `0 4px 20px rgba(0, 0, 0, 0.15)`;
      iframe.style.overflow = 'hidden';
      
      // Positioning - ensure iframe appears above button
      iframe.style.position = 'fixed';
      iframe.style.bottom = viewportWidth <= 480 ? `${responsiveButtonSize + 24}px` : `${responsiveButtonSize + 30}px`; // Leave space for button + margin
      iframe.style.zIndex = '9999';
      
      // Ensure minimum dimensions for usability
      iframe.style.minWidth = '280px';
      iframe.style.minHeight = '300px';
      
      console.log('Embed.js: Applied iframe dimensions:', iframe.style.width, 'x', iframe.style.height);
      console.log('Embed.js: Applied iframe position:', 'bottom:', iframe.style.bottom, 'right:', iframe.style.right);
      
      // Apply toggle button styles with responsive sizing (variables calculated earlier)
      toggleButton.style.backgroundColor = currentStyles.toggleButtonBackgroundColor || '#0f172a';
      toggleButton.style.color = currentStyles.toggleButtonTextColor || '#ffffff';
      toggleButton.style.width = `${responsiveButtonSize}px`;
      toggleButton.style.height = `${responsiveButtonSize}px`;
      toggleButton.style.borderRadius = currentStyles.toggleButtonBorderRadius || '50%';
      
      // Position button responsively - align with chat position
      if (viewportWidth <= 480) {
        // On mobile, keep button in bottom-right so chat opens from same location
        toggleButton.style.bottom = '16px';
        toggleButton.style.right = '16px';
        toggleButton.style.left = 'auto';
      } else {
        toggleButton.style.bottom = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.left = 'auto';
      }
      
      // Update toggle button hover effects
      toggleButton.onmouseenter = () => {
        if (!isOpen) {
          toggleButton.style.backgroundColor = currentStyles.toggleButtonHoverColor || '#334155';
          toggleButton.style.transform = 'scale(1.05)';
        } else {
          toggleButton.style.backgroundColor = currentStyles.toggleButtonCloseHoverColor || '#334155';
          toggleButton.style.transform = 'scale(1.05)';
        }
      };
      
      toggleButton.onmouseleave = () => {
        if (!isOpen) {
          toggleButton.style.backgroundColor = currentStyles.toggleButtonBackgroundColor || '#0f172a';
          toggleButton.style.transform = 'scale(1)';
        } else {
          toggleButton.style.backgroundColor = currentStyles.toggleButtonCloseBackgroundColor || '#0f172a';
          toggleButton.style.transform = 'scale(1)';
        }
      };
    }
    
    // Function to toggle chat
    function toggleChat() {
      if (!isOpen) {
        openChat();
      } else {
        closeChat();
      }
    }
    
    // Function to open chat with animation
    function openChat() {
      console.log('Embed.js: Opening chat, iframe dimensions:', iframe.style.width, 'x', iframe.style.height);
      
      // Set initial state and show iframe
      iframe.style.display = 'block';
      iframe.style.position = 'fixed';
      iframe.style.bottom = '90px'; // Leave space for the button
      iframe.style.right = '20px';
      iframe.style.zIndex = '9999';
      
      // Force a reflow to ensure the display change takes effect
      iframe.offsetHeight;
      
      // Animate in
      requestAnimationFrame(() => {
        iframe.style.transform = 'translateY(0) scale(1)';
        iframe.style.opacity = '1';
      });
      
      // Update button appearance
      toggleButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      toggleButton.style.backgroundColor = currentStyles.toggleButtonCloseBackgroundColor || '#0f172a';
      toggleButton.style.color = currentStyles.toggleButtonCloseTextColor || '#ffffff';
      isOpen = true;
    }
    
    // Function to close chat with animation
    function closeChat() {
      // Animate out
      iframe.style.transform = 'translateY(100%) scale(0.95)';
      iframe.style.opacity = '0';
      
      // Hide after animation completes
      setTimeout(() => {
        iframe.style.display = 'none';
      }, 400); // Match the transition duration
      
      // Update button appearance
      toggleButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12H16M8 8H16M8 16H13M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H7L3 24V6C3 4.89543 3.89543 4 5 4H7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      toggleButton.style.backgroundColor = currentStyles.toggleButtonBackgroundColor || '#0f172a';
      toggleButton.style.color = currentStyles.toggleButtonTextColor || '#ffffff';
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
    
    // Apply initial default styles first
    applyStyles(defaultStyles);
    
    // Fetch custom styles and override defaults
    console.log('Embed.js: Fetching styles for chatbot ID:', chatbotId);
    console.log('Embed.js: Styles API URL:', `${appOrigin}/api/public/styles`);
    
    fetch(`${appOrigin}/api/public/styles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: chatbotId }),
    })
    .then(response => {
      console.log('Embed.js: Styles fetch response status:', response.status);
      console.log('Embed.js: Styles fetch response headers:', response.headers);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Embed.js: Received styles data:', data);
      if (data && data.styles && typeof data.styles === 'object') {
        console.log('Embed.js: Applying custom styles:', data.styles);
        applyStyles(data.styles);
        handleAutoOpen(); // Handle auto-open with custom styles
      } else if (data && data.error) {
        console.error('Embed.js: Styles API returned error:', data.error);
        console.log('Embed.js: Using default styles due to API error');
        handleAutoOpen(); // Handle auto-open with default styles
      } else {
        console.log('Embed.js: No custom styles found (data.styles is null/undefined), keeping defaults');
        console.log('Embed.js: Full response data:', data);
        handleAutoOpen(); // Handle auto-open with default styles
      }
    })
    .catch(error => {
      console.error('Embed.js: Could not fetch custom styles:', error);
      console.log('Embed.js: Using default styles due to fetch error');
      handleAutoOpen(); // Handle auto-open with default styles when fetch fails
    });
    
    // Auto-open functionality
    function handleAutoOpen() {
      if (currentStyles.autoOpen === 'immediately') {
        setTimeout(() => {
          if (!isOpen) {
            openChat();
          }
        }, 500); // Small delay to ensure everything is loaded
      } else if (currentStyles.autoOpen === 'delayed') {
        setTimeout(() => {
          if (!isOpen) {
            openChat();
          }
        }, (currentStyles.autoOpenDelay || 5) * 1000); // Convert seconds to milliseconds
      }
    }
    
    // Apply initial default styles first
    applyStyles(defaultStyles);
    
    // Handle window resize for responsiveness
    window.addEventListener('resize', () => {
      if (currentStyles) {
        applyStyles(currentStyles);
      }
    });
    
    // Append to the body
    document.body.appendChild(iframe);
    document.body.appendChild(toggleButton);
    
  })();