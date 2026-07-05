// History Logic
const HistoryManager = {
  // Generate title from first message
  generateTitle: (message) => {
    // Truncate to first 4-5 words or ~30 characters
    if (!message) return "New Session";
    const cleanMsg = message.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (!cleanMsg) return "Session";
    
    const words = cleanMsg.split(' ');
    if (words.length <= 4) return cleanMsg;
    return words.slice(0, 4).join(' ') + '...';
  },

  updateChatTitleIfNeeded: (chatId, firstUserMessage) => {
    const chat = window.Storage.getChat(chatId);
    if (chat && (chat.title === 'New Session' || !chat.title)) {
      chat.title = HistoryManager.generateTitle(firstUserMessage);
      window.Storage.saveChat(chat);
      // Refresh sidebar if available
      if (window.SidebarManager) window.SidebarManager.renderList();
    }
  }
};

window.HistoryManager = HistoryManager;
