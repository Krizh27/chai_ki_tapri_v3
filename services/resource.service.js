import { curatedResources } from '../config/resources.js';

export class ResourceService {
  
  detectResourceIntent(message) {
    const text = message.toLowerCase();
    
    const resourceKeywords = ['recommend', 'suggest', 'resource', 'course', 'video', 'playlist', 'tutorial', 'learn', 'where should i', 'documentation', 'reference', 'roadmap'];
    const hasIntent = resourceKeywords.some(keyword => text.includes(keyword));
    return hasIntent;
  }

  async fetchResources(message, persona) {
    const hasIntent = this.detectResourceIntent(message);
    if (!hasIntent) return [];

    const resources = curatedResources[persona] || [];
    return resources;
  }
  
  formatContextForLLM(resources) {
    if (!resources || resources.length === 0) return "";
    
    let context = "\n\n[SYSTEM RESOURCE CONTEXT]\n";
    context += "The user has asked for learning resources. You must recommend from the following official curated resources ONLY.\n";
    context += "ABSOLUTELY NO EXTERNAL RESOURCES (no Andrew Ng, no MIT, no Stanford, no FreeCodeCamp). Stick 100% to your own links provided below.\n\n";
    
    resources.forEach(r => {
      context += `Resource ID: [RES-${r.id}]\n`;
      context += `Title: ${r.title}\n`;
      context += `Type: ${r.type}\n`;
      context += `Platform/Channel: ${r.channel}\n`;
      context += `Description: ${r.description}\n\n`;
    });
    
    context += "IMPORTANT INSTRUCTIONS:\n";
    context += "1. Mention the resources naturally (e.g., 'I recommend starting with my Chai aur Code channel').\n";
    context += "2. You MUST append the exact ID format [RES-id] in your text when referring to a resource, so the UI can render a card.\n";
    context += "3. DO NOT wrap the ID in asterisks or markdown formatting (e.g., use just [RES-id], not **[RES-id]**).\n";
    context += "4. DO NOT recommend the same resource more than once per response.\n";
    context += "5. DO NOT output raw URLs or external links directly.\n";
    context += "6. Never recommend anything outside of this list.\n";
    context += "7. NEVER recommend specific playlists or individual videos. ALWAYS recommend the general YouTube Channel link provided in this list.\n";
    
    return context;
  }
}

export const globalResourceService = new ResourceService();

