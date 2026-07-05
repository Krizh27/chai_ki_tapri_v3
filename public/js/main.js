// Main Application Entry Point
const ChatApp = {
  currentChatId: null,
  persona: null,
  currentResources: {},
  
  init: () => {
    const personaInput = document.getElementById('persona-id');
    if (!personaInput) return;
    
    ChatApp.persona = personaInput.value;
    
    window.ThemeManager.init();
    window.ChatUIManager.init();
    window.SidebarManager.init();
    window.PersonaSwitch?.init();
    window.ResetChat?.init();
    
    if (window.ChatUIManager.input) {
      window.ChatUIManager.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          ChatApp.handleSend();
        }
      });
    }
    
    if (window.ChatUIManager.sendBtn) {
      window.ChatUIManager.sendBtn.addEventListener('click', () => {
        ChatApp.handleSend();
      });
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const explicitChatId = urlParams.get('chatId');
    const isNew = urlParams.get('new') === 'true';
    
    if (isNew) {
      ChatApp.startNewSession();
      // Clean up the URL
      window.history.replaceState({}, '', `/chat?persona=${ChatApp.persona}`);
    } else if (explicitChatId && window.Storage.getChat(explicitChatId)) {
      ChatApp.loadSession(explicitChatId);
    } else {
      const latestChat = window.Storage.getLatestChat(ChatApp.persona);
      if (latestChat) {
        ChatApp.loadSession(latestChat.id);
      } else {
        ChatApp.startNewSession();
      }
    }
    
    // Initial usage fetch
    ChatApp.updateUsage();
  },
  
  updateUsage: async () => {
    try {
      const res = await fetch('/api/usage');
      if (res.ok) {
        const data = await res.json();
        const badge = document.getElementById('usage-badge');
        const text = document.getElementById('usage-text');
        if (badge && text) {
          badge.style.display = 'flex';
          text.textContent = `${data.remaining}/${data.total} left`;
          if (data.remaining <= 2) {
            badge.style.color = '#ef4444';
            badge.style.border = '1px solid #ef4444';
            badge.style.background = 'rgba(239, 68, 68, 0.1)';
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch usage limit', e);
    }
  },
  
  startNewSession: () => {
    ChatApp.currentChatId = window.UIUtils.generateId();
    window.ChatUIManager.clearMessages();
    window.ChatUIManager.showEmptyState(ChatApp.persona);
    window.SidebarManager.renderList();
  },
  
  loadSession: (chatId) => {
    ChatApp.currentChatId = chatId;
    window.ChatUIManager.clearMessages();
    
    const chat = window.Storage.getChat(chatId);
    if (chat && chat.messages.length > 0) {
      chat.messages.forEach(msg => {
        window.ChatUIManager.appendMessage(msg.sender || msg.role, msg.content);
      });
    } else {
      window.ChatUIManager.showEmptyState(ChatApp.persona);
    }
    window.SidebarManager.renderList();
  },
  
  formatHistoryForBackend: (rawMessages) => {
    // Combine consecutive AI messages to prevent Gemini API crashes (must alternate user/model)
    let formatted = [];
    let currentAIBlock = null;
    
    for (let msg of rawMessages) {
      const isUser = (msg.sender === 'user' || msg.role === 'user');
      if (isUser) {
        if (currentAIBlock) {
          formatted.push({ role: 'model', content: currentAIBlock });
          currentAIBlock = null;
        }
        formatted.push({ role: 'user', content: msg.content });
      } else {
        let prefix = msg.sender === 'hitesh' ? 'Hitesh' : (msg.sender === 'piyush' ? 'Piyush' : 'AI');
        if (!currentAIBlock) currentAIBlock = "";
        else currentAIBlock += "\n\n";
        currentAIBlock += `[${prefix}]: ${msg.content}`;
      }
    }
    
    if (currentAIBlock) {
      formatted.push({ role: 'model', content: currentAIBlock });
    }
    
    return formatted;
  },

  fetchMentorStream: async (targetPersona) => {
    const fullHistory = window.Storage.getChat(ChatApp.currentChatId).messages;
    const formattedMessages = ChatApp.formatHistoryForBackend(fullHistory);

    window.ChatUIManager.showLoading(targetPersona);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: targetPersona,
          messages: formattedMessages
        })
      });
      
      window.ChatUIManager.hideLoading(targetPersona);
      
      if (!response.ok) {
        return false;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiFullResponse = "";
      
      window.ChatUIManager.appendMessage(targetPersona, '');
      const messageElements = window.ChatUIManager.container.querySelectorAll(`.message-wrapper.${targetPersona} .message-content`);
      const currentMessageEl = messageElements[messageElements.length - 1];
      
      // Reset current resources for this message
      window.ChatApp.currentResources = {};

      let done = false;
      let streamBuffer = ""; // Buffer to hold incomplete chunks
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          streamBuffer += chunk;
          
          // Split by newlines, but keep the last incomplete part in the buffer
          const lines = streamBuffer.split('\n');
          streamBuffer = lines.pop(); // The last element is incomplete unless it ends with \n
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
              try {
                const data = JSON.parse(trimmedLine.substring(6));
                if (data.error) {
                  console.error("API Streaming Error:", data.error);
                } else if (data.resources) {
                  // Save resources to map by id
                  data.resources.forEach(r => {
                    window.ChatApp.currentResources[r.id] = r;
                  });
                } else if (data.content) {
                  aiFullResponse += data.content;
                }
                
                let processedResponse = aiFullResponse;
                
                // 1. First parse markdown (prevents marked.js from treating our raw HTML as code blocks)
                if (typeof marked !== 'undefined') {
                  // We remove asterisks around tags before parsing so the LLM doesn't accidentally wrap the tag in bold tags
                  processedResponse = processedResponse.replace(/\*\*\[RES-([a-zA-Z0-9_-]+)\]\*\*/g, '[RES-$1]');
                  processedResponse = marked.parse(processedResponse);
                } else {
                  processedResponse = window.UIUtils.escapeHtml(processedResponse).replace(/\n/g, '<br>');
                }

                // 2. Then replace [RES-id] tags with inline HTML links
                if (Object.keys(window.ChatApp.currentResources).length > 0) {
                  const seenResIds = new Set();
                  processedResponse = processedResponse.replace(/\[RES-([a-zA-Z0-9_-]+)\]/g, (match, id) => {
                    const res = window.ChatApp.currentResources[id];
                    if (!res) return match;
                    
                    // Prevent duplicate links in the same message
                    if (seenResIds.has(id)) return '';
                    seenResIds.add(id);
                    
                    const safeTitle = window.UIUtils.escapeHtml(res.title);
                    return `<a href="${res.url}" target="_blank" style="color: var(--color-orange-500); text-decoration: underline; font-weight: 600;">${safeTitle}</a>`;
                  });
                }
                
                // Update UI in real-time
                let nameHtml = '';
                if (ChatApp.persona === 'adda') {
                   const avatarUrl = targetPersona === 'hitesh' ? '/images/hitesh_choudhary.jpg' : '/images/piyush_garg.jpg';
                   const name = targetPersona === 'hitesh' ? 'Hitesh Choudhary' : 'Piyush Garg';
                   nameHtml = `<div style="display:flex; align-items:center; gap:8px; margin-bottom: 8px; font-weight:600; font-size: 0.85rem; color: var(--text-secondary);"><img src="${avatarUrl}" style="width:20px; height:20px; border-radius:50%;">${name}</div>`;
                }

                currentMessageEl.innerHTML = nameHtml + processedResponse;
                window.ChatUIManager.scrollToBottom();
              } catch (parseError) {
                console.error("Error parsing stream chunk:", parseError, trimmedLine);
              }
            }
          }
        }
      }
      
      window.Storage.addMessage(ChatApp.currentChatId, ChatApp.persona, targetPersona, aiFullResponse);
      return true;
    } catch (error) {
      window.ChatUIManager.hideLoading(targetPersona);
      console.error("Fetch API Error Detailed:", error);
      return false;
    }
  },
  
  handleSend: async () => {
    if (!window.ChatUIManager.input) return;
    
    const message = window.ChatUIManager.input.value.trim();
    if (!message) return;
    
    window.ChatUIManager.input.value = '';
    window.ChatUIManager.input.disabled = true;
    window.ChatUIManager.sendBtn.disabled = true;
    
    window.ChatUIManager.appendMessage('user', message);
    window.Storage.addMessage(ChatApp.currentChatId, ChatApp.persona, 'user', message);
    
    window.HistoryManager.updateChatTitleIfNeeded(ChatApp.currentChatId, message);
    window.SidebarManager.renderList();
    
    if (ChatApp.persona === 'adda') {
      const order = Math.random() > 0.5 ? ['hitesh', 'piyush'] : ['piyush', 'hitesh'];
      // Sequential execution so the second mentor sees the first's response in history!
      const success1 = await ChatApp.fetchMentorStream(order[0]);
      const success2 = await ChatApp.fetchMentorStream(order[1]);
      
      if (!success1 && !success2) {
        window.ChatUIManager.appendMessage('ai', "Lagta hai developer sahab ne error handling ka lecture bunk kardiya tha 😅");
      }
    } else {
      const success = await ChatApp.fetchMentorStream(ChatApp.persona);
      if (!success) {
        window.ChatUIManager.appendMessage('ai', "Lagta hai developer sahab ne error handling ka lecture bunk kardiya tha 😅");
      }
    }
    
    // Update limit after sending message
    ChatApp.updateUsage();
    
    window.ChatUIManager.input.disabled = false;
    window.ChatUIManager.input.focus();
    window.ChatUIManager.sendBtn.disabled = false;
    window.SidebarManager.renderList();
  }
};

window.ChatApp = ChatApp;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('messages-container')) {
    ChatApp.init();
  } else {
    if (window.ThemeManager) window.ThemeManager.init();
  }
});
