// Reset Chat Logic
const ResetChat = {
  init: () => {
    const resetBtn = document.getElementById('reset-chat-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!window.ChatApp || !window.ChatApp.currentChatId) return;
        
        // Custom confirmation dialog
        window.UIUtils.showConfirmDialog(
          "Spill the chai?", 
          "Are you sure you want to spill the chai? Only this conversation will be permanently deleted.", 
          () => {
            window.Storage.deleteChat(window.ChatApp.currentChatId);
            window.ChatApp.startNewSession();
          }
        );
      });
    }
  }
};

window.ResetChat = ResetChat;
