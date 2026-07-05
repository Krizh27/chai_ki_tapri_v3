export const securityConfig = {
  // Input Constraints
  MAX_INPUT_CHARS: 1000,
  MAX_INPUT_WORDS: 200,
  
  // Output Constraints (Adaptive length handled via prompt instructions)
  MAX_OUTPUT_TOKENS: 2048, 
  
  // History Trimming
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_CHARS: 4000,
  
  // Rate Limiting & Timeouts
  LLM_TIMEOUT_MS: 15000, // 15 seconds idle timeout
  
  // Personas
  ALLOWED_PERSONAS: ["hitesh", "piyush", "adda"],
  
  // Prompt Injection Signatures (Regexes)
  PROMPT_INJECTION_PATTERNS: [
    /ignore (all )?previous instructions/i,
    /(show|print|reveal|repeat) (your )?(system|developer) prompt/i,
    /act as (chatgpt|dan)/i,
    /jailbreak/i,
    /developer mode/i,
    /override instructions/i,
    /pretend you are/i,
    /simulate being/i,
    /bypass restrictions/i,
    /forget (all )?previous instructions/i
  ]
};
