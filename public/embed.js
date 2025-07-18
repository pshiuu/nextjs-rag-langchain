(function () {
    const chatbotContainer = document.querySelector('[data-chatbot-id]');
    if (!chatbotContainer) {
      console.error('Chatbot container with [data-chatbot-id] not found.');
      return;
    }
  
    const chatbotId = chatbotContainer.dataset.chatbotId;
    const appOrigin = new URL(document.currentScript.src).origin;
  
    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${appOrigin}/embed/${chatbotId}`;
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '400px';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e5e7eb';
    iframe.style.borderRadius = '0.5rem';
    iframe.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    iframe.style.display = 'none'; // Initially hidden
    iframe.style.zIndex = '9999';
  
    // Create a chat bubble button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Chat';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.width = '60px';
    toggleButton.style.height = '60px';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.backgroundColor = '#007bff'; // Example color
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    toggleButton.style.fontSize = '16px';
    toggleButton.style.zIndex = '9998';
  
    // Toggle iframe visibility
    toggleButton.addEventListener('click', () => {
      if (iframe.style.display === 'none') {
        iframe.style.display = 'block';
        toggleButton.textContent = 'X';
      } else {
        iframe.style.display = 'none';
        toggleButton.textContent = 'Chat';
      }
    });
  
    // Append to the body
    document.body.appendChild(iframe);
    document.body.appendChild(toggleButton);
  
  })();