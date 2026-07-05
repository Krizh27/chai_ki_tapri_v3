// Sidebar Logic
const SidebarManager = {
  init: () => {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const newChatBtn = document.getElementById('new-chat-btn');
    const overlay = document.getElementById('sidebar-overlay');
    
    // Mobile toggle
    const mobileToggle = document.getElementById('sidebar-toggle');
    const desktopToggle = document.getElementById('desktop-sidebar-toggle');

    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('show');
      });
    }

    // Desktop toggle
    if (desktopToggle && sidebar) {
      desktopToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Close sidebar when clicking outside on mobile
    if (mobileToggle && sidebar) {
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            e.target !== mobileToggle &&
            !mobileToggle.contains(e.target)) {
          sidebar.classList.remove('open');
          if (overlay) overlay.classList.remove('show');
        }
      });
    }

    // New Chat Button Dropdown Logic
    const dropdown = document.getElementById('new-chat-dropdown');
    if (newChatBtn && dropdown) {
      newChatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!newChatBtn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove('show');
        }
      });
      
      // Handle dropdown selection
      const items = dropdown.querySelectorAll('.dropdown-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          dropdown.classList.remove('show');
          const targetPersona = item.getAttribute('data-persona');
          const currentPersona = document.getElementById('persona-id')?.value;
          
          if (targetPersona === currentPersona) {
            if (window.ChatApp) {
              window.ChatApp.startNewSession();
            }
          } else {
            // Redirect to the selected persona to start a new chat explicitly
            window.location.href = `/chat?persona=${targetPersona}&new=true`;
          }
        });
      });
    }

    SidebarManager.renderList();
  },

  renderList: () => {
    const listContainer = document.getElementById('chat-history-list');
    if (!listContainer) return;
    
    const currentPersona = document.getElementById('persona-id')?.value;
    if (!currentPersona) return;

    // Get all chats and sort by most recent
    const chats = window.Storage.getAllChats().sort((a, b) => b.updatedAt - a.updatedAt);
    const currentChatId = window.ChatApp ? window.ChatApp.currentChatId : null;
    
    listContainer.innerHTML = '';
    
    if (chats.length === 0) {
      listContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: var(--spacing-2);">No previous sessions</div>';
      return;
    }

    chats.forEach(chat => {
      const item = document.createElement('div');
      item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
      
      // Determine avatar and display name based on chat persona
      let avatarUrl = '☕'; // Adda fallback
      let displayName = 'Chai Adda';
      if (chat.persona === 'hitesh') {
        avatarUrl = `<img src="/images/hitesh_choudhary.jpg" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        displayName = 'Hitesh';
      } else if (chat.persona === 'piyush') {
        avatarUrl = `<img src="/images/piyush_garg.jpg" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        displayName = 'Piyush';
      } else {
        avatarUrl = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">☕</div>`;
      }
      
      const timeAgo = window.UIUtils.formatDate(chat.updatedAt);
      
      item.innerHTML = `
        <div class="history-item-icon" style="padding:0; overflow:hidden; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
          ${avatarUrl}
        </div>
        <div class="history-item-content">
          <div class="history-item-title">${window.UIUtils.escapeHtml(chat.title || 'Session')}</div>
          <div class="history-item-date" style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
            ${displayName} • ${timeAgo}
          </div>
        </div>
        <button class="delete-chat-btn" title="Delete Session" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:4px; font-size:1.1rem; opacity:0.6; transition:0.2s; display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 100 125" width="32" height="32">
            <g transform="translate(0,-952.36219)">
              <path d="m 68.859614,965.35007 c -9.2928,-0.15001 -11.5517,6.15485 -11.5517,12.12023 0,0.27429 0.017,0.5373 0.042,0.79515 l -1.6158,-0.0394 c -1.5326,0 -3.9265,-0.39826 -5.4075,-0.89957 -1.8642,-0.63105 -3.1406,-0.93411 -4.2264,-0.0364 -6.1769,5.10737 -6.9813,35.33272 -0.4258,40.43892 2.8059,1.8307 6.9506,0.5182 6.9506,0.5182 l 37.1512,-2.612 c 2.0436,-1.8837 4.3192,-7.4813 5.0354,-12.3864 0.2463,-1.6862 0.2524,-7.23334 0.01,-9.18671 -0.6644,-5.35556 -2.5451,-11.15426 -4.219,-13.00704 -0.9724,-1.07642 -2.659,-1.79775 -4.907,-2.09887 l -1.9449,-0.0476 c -0.012,-0.0786 -0.025,-0.1578 -0.039,-0.23823 -2.1002,-11.36606 -7.8102,-13.20663 -14.8518,-13.32031 z m 2.7528,6.70888 c 4.2944,0.0217 4.649,1.73562 5.3785,6.66441 l -12.6207,-0.28696 c -1.0202,-2.97392 0.089,-5.98696 5.778,-6.33142 0.5334,-0.0323 1.02,-0.0483 1.4642,-0.046 z m -23.4998,7.13934 c 2.5127,0.0316 5.0281,5.90718 5.3344,18.47559 1.1793,26.22022 -10.6812,23.90242 -10.6812,0.2665 0,-12.18728 2.6719,-18.77578 5.3468,-18.74209 z m 3.9235,29.62971 c -1.0347,-0.01 -5.2449,1.3223 -6.8396,1.3223 -0.544,0 1.337,5.4845 3.4757,5.399 2.5214,-0.1008 3.911,-6.3377 3.5766,-6.6721 -0.033,-0.033 -0.1056,-0.048 -0.2127,-0.049 z m -30.7416,1.7903 c -1.5491,0.053 -2.9134,0.8579 -4.1498,3.1094 -1.5253,2.9688 -1.3994,4.3003 -4.919,6.6613 -21.8519995,2.7155 11.8298,30.3798 22.4211,13.6413 3.3737,-5.0845 -0.6685,-9.5184 3.8002,-10.9016 4.4688,-1.3831 8.5987,10.8251 13.3018,9.8013 4.703,-1.0237 5.7007,-10.4013 6.0007,-10.8014 0.3,-0.4 23.1027,0.4001 23.1027,0 0,-0.3956 5.8214,-0.3085 3.9606,-5.4307 -9.0462,0.5462 -24.5395,1.9437 -31.1148,2.3739 0,0 -7.1825,1.2885 -8.9223,-0.8029 -1.9235,-2.3122 -2.9542,-4.8686 -3.4559,-7.3029 -3.7767,1.1139 -9.1097,2.5511 -11.8735,2.0617 -3.2292,-0.9605 -5.8878,-2.4874 -8.1518,-2.4094 z" fill="currentColor" />
            </g>
          </svg>
        </button>
      `;
      
      // Handle delete
      const deleteBtn = item.querySelector('.delete-chat-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent opening the chat
        window.UIUtils.showConfirmDialog(
          "Delete this chat?", 
          `"${chat.title || 'Session'}" will be permanently removed. This action cannot be undone.`, 
          () => {
            window.Storage.deleteChat(chat.id);
            // If deleting the current chat, start a new one
            if (chat.id === currentChatId && window.ChatApp) {
               window.ChatApp.startNewSession();
            } else {
               SidebarManager.renderList();
            }
          }
        );
      });
      
      // Handle open
      item.addEventListener('click', () => {
        if (chat.persona === currentPersona) {
          if (window.ChatApp) {
            window.ChatApp.loadSession(chat.id);
            // Close mobile sidebar and overlay if open
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (sidebar && window.innerWidth <= 768) {
              sidebar.classList.remove('open');
              if (overlay) overlay.classList.remove('show');
            }
          }
        } else {
          // It's a different persona, redirect and pass chatId
          window.location.href = `/chat?persona=${chat.persona}&chatId=${chat.id}`;
        }
      });
      
      // Hover effects for delete button
      item.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
      item.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0.6');
      deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.color = '#dc3545');
      deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.color = 'var(--text-muted)');
      
      listContainer.appendChild(item);
    });
  }
};

window.SidebarManager = SidebarManager;
