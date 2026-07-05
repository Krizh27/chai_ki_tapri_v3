import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { securityConfig } from '../config/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ChatService = {
  
  getSystemPrompt: (persona) => {
    try {
      // Go up one dir from services/ to root
      const rootDir = path.join(__dirname, '..');
      const filePath = path.join(rootDir, 'prompts', `${persona}.md`);
      const basePrompt = fs.readFileSync(filePath, 'utf-8');
      
      // Append adaptive output length constraints and strict resource rules
      const dynamicConstraints = `\n\n[OUTPUT LENGTH CONSTRAINTS]\nAdapt your length to the question type:\n- Simple question -> 100–150 words\n- Technical explanation -> 150–250 words\n- Career / Motivation -> 200–250 words\n- Broad/Vague question (e.g. 'explain AI', 'teach me javascript') -> DO NOT EXPLAIN. Keep it under 50 words, state that the topic is too broad for chat, and ONLY provide resource links.\n\nCRITICAL: Never stop a response mid-sentence. If the topic is too large, summarize naturally and invite a follow-up. MAXIMUM RESPONSE LENGTH IS 270 WORDS FOR ANY QUERY. Always finish your thoughts completely.\n\n[SPAM / GIBBERISH HANDLING]\nIf the user sends meaningless text, gibberish, random letters/numbers, or just symbols (e.g. 'effef', '56r6eurr344r4224', '????'), DO NOT attempt to answer. You MUST reply EXACTLY with this phrase and nothing else: "Maaf karna lekin muje apka sawal samajh nhi aya, thoda elaborate kijiye"\n\n[STRICT RESOURCE CONSTRAINTS]\nABSOLUTE RULE: You are FORBIDDEN from recommending external learning resources (e.g., Andrew Ng, Stanford, MIT, Coursera, Udemy, FreeCodeCamp, Fireship, etc.). You may ONLY recommend resources that belong to YOU. NEVER recommend specific playlists or individual videos, ALWAYS recommend your general YouTube Channel instead. If you do not have a specific resource for a topic, simply state that you don't have one and recommend your general channel/website instead. Do not hallucinate links.`;
      
      return basePrompt + dynamicConstraints;
    } catch (error) {
      console.error(`Error loading prompt for ${persona}:`, error);
      return `You are ${persona}. Respond helpfully and concisely.`;
    }
  },

  trimHistory: (messages) => {
    // Exclude the current message (last one) from history
    let history = messages.slice(0, -1);
    
    // 1. Trim by message count limit
    if (history.length > securityConfig.MAX_HISTORY_MESSAGES) {
      history = history.slice(history.length - securityConfig.MAX_HISTORY_MESSAGES);
    }
    
    // 2. Trim by character/token budget
    let totalChars = 0;
    let budgetedHistory = [];
    
    // Process backwards to keep most recent context
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (totalChars + msg.content.length <= securityConfig.MAX_HISTORY_CHARS) {
        budgetedHistory.unshift(msg);
        totalChars += msg.content.length;
      } else {
        break; // Budget exceeded, drop older messages
      }
    }
    
    // 3. ENFORCE GEMINI RULE: History must ALWAYS start with a 'user' message
    // If the first message in our trimmed history is a 'model' message, drop it.
    if (budgetedHistory.length > 0 && budgetedHistory[0].role !== 'user') {
      budgetedHistory.shift();
    }
    
    return budgetedHistory;
  },

  formatHistoryForGemini: (trimmedHistory) => {
    return trimmedHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }
};
