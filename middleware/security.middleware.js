import { securityConfig } from '../config/security.js';

export const SecurityMiddleware = {
  
  /**
   * 1. Validate Input Size & Payload
   */
  validateInput: (req, res, next) => {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid payload: messages array is required.' });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== 'string') {
      return res.status(400).json({ error: 'Invalid payload: message content is required.' });
    }

    const content = lastMessage.content.trim();
    
    if (content.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty or whitespace only.' });
    }

    if (content.length > securityConfig.MAX_INPUT_CHARS) {
      console.warn(`[SECURITY] Rejected oversized input from user`);
      return res.status(400).json({ error: `Message exceeds maximum length of ${securityConfig.MAX_INPUT_CHARS} characters.` });
    }

    const wordCount = content.split(/\s+/).length;
    if (wordCount > securityConfig.MAX_INPUT_WORDS) {
      console.warn(`[SECURITY] Rejected oversized input (words) from user`);
      return res.status(400).json({ error: `Message exceeds maximum length of ${securityConfig.MAX_INPUT_WORDS} words.` });
    }

    // Update the message in the request with trimmed content
    req.body.messages[req.body.messages.length - 1].content = content;
    next();
  },

  /**
   * 2. Validate Persona
   */
  validatePersona: (req, res, next) => {
    const { persona } = req.body;
    if (!persona || !securityConfig.ALLOWED_PERSONAS.includes(persona)) {
      console.warn(`[SECURITY] Invalid persona requested: ${persona}`);
      return res.status(400).json({ error: 'Invalid persona requested.' });
    }
    next();
  }
};
