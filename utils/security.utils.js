import { securityConfig } from '../config/security.js';

export const SecurityUtils = {
  /**
   * Checks if the text contains obvious prompt injection patterns.
   * Returns true if an attack is detected, false otherwise.
   */
  analyzePromptInjection: (text) => {
    if (!text || typeof text !== 'string') return false;
    
    for (const pattern of securityConfig.PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }
};
