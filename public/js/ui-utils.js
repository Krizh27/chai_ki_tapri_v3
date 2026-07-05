// Helper functions for UI
const UIUtils = {
  // Format a date for display
  formatDate: (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  },

  // Generate a unique ID
  generateId: () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  // Escape HTML to prevent XSS (if not using marked)
  escapeHtml: (unsafe) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  },

  // Show a custom confirm dialog
  showConfirmDialog: (title, message, onConfirm) => {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return; // Fallback to window.confirm if not present

    const titleEl = document.getElementById('confirm-modal-title');
    const messageEl = document.getElementById('confirm-modal-message');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    const confirmBtn = document.getElementById('confirm-modal-confirm');

    titleEl.textContent = title;
    // We allow innerHTML for message so we can bold the chat title
    messageEl.innerHTML = message;

    // Show modal
    modal.classList.add('active');

    // Remove old listeners
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newConfirmBtn = confirmBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new listeners
    newCancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    newConfirmBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      if (onConfirm) onConfirm();
    });
  }
};

window.UIUtils = UIUtils;
