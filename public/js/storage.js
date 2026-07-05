// LocalStorage Wrapper for Chats
const Storage = {
  KEY: 'chai_sessions',
  
  // Get all chats
  getAllChats: () => {
    try {
      const data = localStorage.getItem(Storage.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return [];
    }
  },
  
  // Get chats for a specific persona
  getChatsByPersona: (persona) => {
    const chats = Storage.getAllChats();
    return chats.filter(chat => chat.persona === persona).sort((a, b) => b.updatedAt - a.updatedAt);
  },
  
  // Get latest chat for a persona
  getLatestChat: (persona) => {
    const chats = Storage.getChatsByPersona(persona);
    return chats.length > 0 ? chats[0] : null;
  },
  
  // Get a specific chat by ID
  getChat: (id) => {
    const chats = Storage.getAllChats();
    return chats.find(chat => chat.id === id) || null;
  },
  
  // Create or Update a chat
  saveChat: (chat) => {
    const chats = Storage.getAllChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    chat.updatedAt = Date.now();
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }
    
    localStorage.setItem(Storage.KEY, JSON.stringify(chats));
    return chat;
  },
  
  // Delete a chat
  deleteChat: (id) => {
    let chats = Storage.getAllChats();
    chats = chats.filter(chat => chat.id !== id);
    localStorage.setItem(Storage.KEY, JSON.stringify(chats));
  },
  
  // Add a message to a chat
  addMessage: (chatId, persona, sender, content) => {
    let chat = Storage.getChat(chatId);
    
    // Create new if doesn't exist
    if (!chat) {
      chat = {
        id: chatId,
        persona: persona,
        title: 'New Session', // Will be updated by history.js
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
      };
    }
    
    chat.messages.push({ sender, content, timestamp: Date.now() });
    return Storage.saveChat(chat);
  }
};

window.Storage = Storage;
