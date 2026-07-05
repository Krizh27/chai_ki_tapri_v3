// Persona Switch Logic
const PersonaSwitch = {
  init: () => {
    const controls = document.querySelectorAll('.persona-segmented-control');
    if (!controls.length) return;

    controls.forEach(control => {
      const btns = control.querySelectorAll('.segment-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetPersona = btn.getAttribute('data-persona');
          const currentInput = document.getElementById('persona-id');
          
          if (currentInput.value === targetPersona) return; // Already active
          
          // Update styling of buttons in ALL controls
          controls.forEach(ctrl => {
            const allBtns = ctrl.querySelectorAll('.segment-btn');
            allBtns.forEach(b => {
              b.classList.remove('active');
              b.style.background = 'transparent';
              b.style.color = 'var(--text-secondary)';
              b.style.boxShadow = 'none';
            });
            const activeBtn = ctrl.querySelector(`[data-persona="${targetPersona}"]`);
            if (activeBtn) {
              activeBtn.classList.add('active');
              activeBtn.style.background = 'var(--bg-secondary)';
              activeBtn.style.color = 'var(--text-primary)';
              activeBtn.style.boxShadow = 'var(--shadow-sm)';
            }
          });

        // Update hidden input
        currentInput.value = targetPersona;

        // Update URL without reload
        window.history.pushState({}, '', '/chat?persona=' + targetPersona);
        document.title = 'Chat with ' + (targetPersona === 'hitesh' ? 'Hitesh Choudhary' : 'Piyush Garg');

        // Update Header UI
        const headerAvatar = document.getElementById('chat-header-avatar');
        const headerName = document.getElementById('chat-header-name');
        
        if (headerAvatar && headerName) {
          if (targetPersona === 'hitesh') {
            headerAvatar.src = '/images/hitesh_choudhary.jpg';
            headerAvatar.alt = 'hitesh';
            headerName.textContent = 'Hitesh Choudhary';
          } else {
            headerAvatar.src = '/images/piyush_garg.jpg';
            headerAvatar.alt = 'piyush';
            headerName.textContent = 'Piyush Garg';
          }
        }

        // Handle Chat state
        if (window.ChatApp) {
          window.ChatApp.persona = targetPersona;
          
          const latestChat = window.Storage.getLatestChat(targetPersona);
          if (latestChat) {
            window.ChatApp.loadSession(latestChat.id);
          } else {
            window.ChatApp.startNewSession();
          }
        }
        
        // Also update sidebar list since persona changed
        if (window.SidebarManager) {
          window.SidebarManager.renderList();
        }
      });
      });
    });
  }
};

window.PersonaSwitch = PersonaSwitch;
