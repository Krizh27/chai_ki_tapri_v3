// UI Rendering for Chat Area
const ChatUIManager = {
  container: null,
  input: null,
  sendBtn: null,
  
  init: () => {
    ChatUIManager.container = document.getElementById('messages-container');
    ChatUIManager.input = document.getElementById('message-input');
    ChatUIManager.sendBtn = document.getElementById('send-btn');
    
    // Auto-resize textarea and handle character limit
    if (ChatUIManager.input) {
      const warningEl = document.createElement('div');
      warningEl.id = 'char-limit-warning';
      warningEl.style.color = '#ef4444';
      warningEl.style.fontSize = '0.75rem';
      warningEl.style.position = 'absolute';
      warningEl.style.bottom = '-20px';
      warningEl.style.right = '0';
      warningEl.style.display = 'none';
      warningEl.textContent = 'Message is too long (maximum 1000 characters)';
      
      // We assume the input's parent has position relative to place this correctly
      ChatUIManager.input.parentNode.style.position = 'relative';
      ChatUIManager.input.parentNode.appendChild(warningEl);

      ChatUIManager.input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        const text = this.value.trim();
        const isTooLong = text.length > 1000;
        
        if (isTooLong) {
          warningEl.style.display = 'block';
        } else {
          warningEl.style.display = 'none';
        }
        
        // Enable/disable send button based on input
        if (ChatUIManager.sendBtn) {
          ChatUIManager.sendBtn.disabled = text === '' || isTooLong;
        }
      });
    }
  },

  scrollToBottom: () => {
    if (ChatUIManager.container) {
      ChatUIManager.container.scrollTop = ChatUIManager.container.scrollHeight;
    }
  },

  clearMessages: () => {
    if (ChatUIManager.container) {
      ChatUIManager.container.innerHTML = '';
    }
  },

  showEmptyState: (persona) => {
    let name = persona === 'hitesh' ? 'Hitesh' : 'Piyush';
    let subtitle = `Start a conversation with ${name}.`;
    
    let html = '';
    
    if (persona === 'adda') {
      html = `
        <div class="empty-state">
          <p style="font-size: 0.9rem; color: var(--color-orange-500); padding: 8px 16px; background: rgba(232, 124, 72, 0.1); border-radius: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <strong>Experimental:</strong> Both mentors will answer your questions.
          </p>
        </div>
      `;
    } else {
      html = `
        <div class="empty-state">
          <div class="empty-title">Grab a virtual chai.</div>
          <p>${subtitle}</p>
          <div class="suggestion-chips">
            <div class="suggestion-chip" onclick="ChatUIManager.setInputValue('Explain Backend Architecture')">Backend</div>
            <div class="suggestion-chip" onclick="ChatUIManager.setInputValue('How to learn AI?')">AI</div>
            <div class="suggestion-chip" onclick="ChatUIManager.setInputValue('System Design basics')">System Design</div>
            <div class="suggestion-chip" onclick="ChatUIManager.setInputValue('Career Advice for developers')">Career</div>
          </div>
        </div>
      `;
    }
    
    ChatUIManager.container.innerHTML = html;
  },

  setInputValue: (val) => {
    if (ChatUIManager.input) {
      ChatUIManager.input.value = val;
      // Trigger input event to resize
      ChatUIManager.input.dispatchEvent(new Event('input'));
      ChatUIManager.input.focus();
    }
  },

  appendMessage: (sender, content) => {
    // sender can be: 'user', 'hitesh', 'piyush', or 'ai' (fallback)
    if (!ChatUIManager.container) return;
    
    // Remove empty state if it exists
    const emptyState = ChatUIManager.container.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }

    const wrapper = document.createElement('div');
    const isUser = sender === 'user';
    wrapper.className = `message-wrapper ${isUser ? 'user' : 'ai'} ${sender}`;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    
    // Add specific border styling for different mentors in Adda mode
    if (sender === 'hitesh') msgDiv.style.borderLeft = '4px solid var(--color-orange-500)';
    if (sender === 'piyush') msgDiv.style.borderLeft = '4px solid #3b82f6'; // Blue
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // If it's a mentor, we can optionally show their name above the message text if in Adda mode
    const isAdda = document.getElementById('persona-id')?.value === 'adda';
    let nameHtml = '';
    
    if (isAdda && !isUser) {
       const avatarUrl = sender === 'hitesh' ? '/images/hitesh_choudhary.jpg' : 
                         (sender === 'piyush' ? '/images/piyush_garg.jpg' : '');
       const name = sender === 'hitesh' ? 'Hitesh Choudhary' : (sender === 'piyush' ? 'Piyush Garg' : 'AI Mentor');
       nameHtml = `
         <div style="display:flex; align-items:center; gap:8px; margin-bottom: 8px; font-family: var(--font-heading); font-weight:700; font-size: 0.85rem; color: var(--text-secondary);">
           ${avatarUrl ? `<img src="${avatarUrl}" style="width:20px; height:20px; border-radius:50%;">` : ''}
           ${name}
         </div>
       `;
    }
    
    if (!isUser) {
      // Use marked if available
      let htmlContent = '';
      if (typeof marked !== 'undefined') {
        htmlContent = marked.parse(content);
      } else {
        htmlContent = window.UIUtils.escapeHtml(content).replace(/\n/g, '<br>');
      }
      contentDiv.innerHTML = nameHtml + htmlContent;
    } else {
      contentDiv.textContent = content; // safer for user input
    }
    
    msgDiv.appendChild(contentDiv);
    wrapper.appendChild(msgDiv);
    ChatUIManager.container.appendChild(wrapper);
    ChatUIManager.scrollToBottom();
  },

  showLoading: (sender = 'ai') => {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ai`;
    wrapper.id = `loading-indicator-${sender}`;
    
    const name = sender === 'hitesh' ? 'Hitesh' : (sender === 'piyush' ? 'Piyush' : '');
    const loadingText = name ? `${name} is brewing chai` : `Brewing chai`;
    
    wrapper.innerHTML = `
      <div class="message" style="${sender==='hitesh' ? 'border-left: 4px solid var(--color-orange-500)' : (sender==='piyush' ? 'border-left: 4px solid #3b82f6' : '')}">
        <div class="message-content" style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size:0.85rem; color:var(--text-secondary);">${loadingText}</span>
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    ChatUIManager.container.appendChild(wrapper);
    ChatUIManager.scrollToBottom();
  },

  hideLoading: (sender = 'ai') => {
    const loading = document.getElementById(`loading-indicator-${sender}`);
    if (loading) loading.remove();
    // Also remove generic if any
    const generic = document.getElementById(`loading-indicator-ai`);
    if (generic) generic.remove();
  },

  showError: (message) => {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ai`;
    
    wrapper.innerHTML = `
      <div class="message" style="border-left: 4px solid #ef4444; background: rgba(239, 68, 68, 0.1);">
        <div class="message-content" style="color: var(--text-primary);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom: 8px; font-weight:700; color: #ef4444; font-size: 0.85rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            System Message
          </div>
          <p style="margin: 0; line-height: 1.5; font-size: 0.95rem;">${message}</p>
        </div>
      </div>
    `;
    if (ChatUIManager.container) {
      ChatUIManager.container.appendChild(wrapper);
      ChatUIManager.scrollToBottom();
    }
  },

};

window.ChatUIManager = ChatUIManager;
