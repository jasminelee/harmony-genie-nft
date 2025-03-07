/**
 * Eliza API Client
 * 
 * This file provides utilities for interacting with the Eliza AI agent
 * for music generation in the harmony-genie-nft application.
 */

// Types for Eliza API responses
export interface ElizaResponse {
  id: string;
  content: {
    text?: string;
    music?: {
      url: string;
      title: string;
      genre: string;
      mood: string;
      duration?: number;
      bpm?: number;
      key?: string;
    };
  };
  createdAt: number;
  user: string;
}

// API client for communicating with the Eliza agent
export const elizaApiClient = {
  /**
   * Send a message to the Eliza AI agent
   * @param message - The user's message to send to the agent
   * @returns Promise with the agent's response
   */
  sendMessage: async (message: string): Promise<ElizaResponse> => {
    try {
      // Get the available agents first to ensure we're using a valid agent ID
      let agentId = 'b850bc30-45f8-0041-a00a-83df46d8555d'; // Default Eliza agent ID
      
      try {
        const agentsResponse = await elizaApiClient.getAgents();
        console.log('Agents response:', agentsResponse);
        
        if (agentsResponse && agentsResponse.agents && agentsResponse.agents.length > 0) {
          // Use the first available agent
          agentId = agentsResponse.agents[0].id;
          console.log(`Using agent: ${agentsResponse.agents[0].name} (${agentId})`);
        }
      } catch (error) {
        console.warn('Could not get agents, using default agent ID:', error);
      }
      
      const formData = new FormData();
      formData.append("text", message);
      formData.append("user", "user");
      
      // Hardcode the port to 3000 for the Eliza agent API
      const elizaPort = 3000; // This is the API port, not the dashboard port
      console.log(`Sending message to Eliza agent at http://localhost:${elizaPort}/${agentId}/message`);
      
      const response = await fetch(`http://localhost:${elizaPort}/${agentId}/message`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message to Eliza agent: ${response.status} ${response.statusText}`);
      }
      
      // Process the response to add music generation capabilities
      const responseText = await response.text();
      console.log('Raw response from Eliza:', responseText);
      
      let elizaResponse;
      try {
        elizaResponse = JSON.parse(responseText);
        console.log('Parsed Eliza response:', elizaResponse);
      } catch (error) {
        console.error('Error parsing Eliza response:', error);
        throw new Error(`Failed to parse Eliza response: ${error.message}`);
      }
      
      // Ensure the response has the expected structure
      if (!elizaResponse || !elizaResponse.content) {
        console.error('Unexpected Eliza response format:', elizaResponse);
        
        // Create a minimal valid response
        elizaResponse = {
          id: Date.now().toString(),
          content: {
            text: "I received your message but couldn't generate a proper response. Let me try to help with your music request anyway."
          },
          createdAt: Date.now(),
          user: "eliza"
        };
      }
      
      // If the message is about music generation, add music content
      if (isMusicGenerationRequest(message) && elizaResponse.content) {
        // Extract music details from the response text or the original message
        const responseText = elizaResponse.content.text || "";
        const musicDetails = extractMusicDetails(responseText, message);
        
        console.log('Extracted music details:', musicDetails);
        
        // Add music content to the response
        elizaResponse.content.music = {
          url: "https://example.com/generated-music.mp3", // This would be a real URL in production
          title: musicDetails.title,
          genre: musicDetails.genre,
          mood: musicDetails.mood,
          bpm: musicDetails.bpm,
          key: musicDetails.key
        };
        
        // If there's no text in the response, add a default message
        if (!elizaResponse.content.text) {
          elizaResponse.content.text = `I've created a ${musicDetails.mood} ${musicDetails.genre} track called "${musicDetails.title}" for you. It's in ${musicDetails.key} with a tempo of ${musicDetails.bpm} BPM. Would you like to mint this as an NFT?`;
        }
      }
      
      return elizaResponse;
    } catch (error) {
      console.error('Error sending message to Eliza agent:', error);
      
      // Create a fallback response
      const fallbackResponse: ElizaResponse = {
        id: Date.now().toString(),
        content: {
          text: `I encountered an error while processing your request: ${error.message}. Let me try to help with your music request anyway.`,
          music: {
            url: "https://example.com/fallback-music.mp3",
            title: "Fallback Track",
            genre: "Electronic",
            mood: "Ambient",
            bpm: 120,
            key: "C Major"
          }
        },
        createdAt: Date.now(),
        user: "eliza"
      };
      
      return fallbackResponse;
    }
  },

  /**
   * Get the list of available Eliza agents
   * @returns Promise with the list of agents
   */
  getAgents: async () => {
    try {
      // Hardcode the port to 3000 for the Eliza agent API
      const elizaPort = 3000;
      console.log(`Getting Eliza agents from http://localhost:${elizaPort}/agents`);
      
      const response = await fetch(`http://localhost:${elizaPort}/agents`);
      
      if (!response.ok) {
        throw new Error(`Failed to get Eliza agents: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Raw agents response:', responseText);
      
      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error('Error parsing agents response:', error);
        throw new Error(`Failed to parse agents response: ${error.message}`);
      }
    } catch (error) {
      console.error('Error getting Eliza agents:', error);
      throw error;
    }
  }
};

/**
 * Check if a message is requesting music generation
 * @param message - The user's message
 * @returns boolean indicating if this is a music generation request
 */
function isMusicGenerationRequest(message: string): boolean {
  const musicKeywords = [
    'music', 'song', 'track', 'beat', 'melody', 'tune', 'audio',
    'generate', 'create', 'make', 'compose', 'produce',
    'ambient', 'pop', 'rock', 'jazz', 'hip hop', 'lo-fi', 'electronic'
  ];
  
  const lowerMessage = message.toLowerCase();
  return musicKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Extract music details from the response text
 * @param responseText - The text response from Eliza
 * @param originalMessage - The original user message
 * @returns Object with music details
 */
function extractMusicDetails(responseText: string, originalMessage: string): any {
  // Default values
  const details = {
    title: "Generated Track",
    genre: "Electronic",
    mood: "Ambient",
    bpm: 120,
    key: "C Major"
  };
  
  // Try to extract genre from the response or original message
  const genrePatterns = [
    /genre:?\s*([a-zA-Z0-9 &-]+)/i,
    /([a-zA-Z]+)\s+music/i,
    /([a-zA-Z]+)\s+track/i,
    /([a-zA-Z]+)\s+beat/i
  ];
  
  for (const pattern of genrePatterns) {
    const match = responseText.match(pattern) || originalMessage.match(pattern);
    if (match && match[1]) {
      details.genre = match[1].trim();
      break;
    }
  }
  
  // Try to extract mood
  const moodPatterns = [
    /mood:?\s*([a-zA-Z0-9 ]+)/i,
    /feeling:?\s*([a-zA-Z0-9 ]+)/i,
    /([a-zA-Z]+)\s+vibe/i,
    /([a-zA-Z]+)\s+feeling/i
  ];
  
  for (const pattern of moodPatterns) {
    const match = responseText.match(pattern) || originalMessage.match(pattern);
    if (match && match[1]) {
      details.mood = match[1].trim();
      break;
    }
  }
  
  // Try to extract title
  const titlePatterns = [
    /title:?\s*["']?([^"']+)["']?/i,
    /called:?\s*["']?([^"']+)["']?/i,
    /named:?\s*["']?([^"']+)["']?/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = responseText.match(pattern) || originalMessage.match(pattern);
    if (match && match[1]) {
      details.title = match[1].trim();
      break;
    }
  }
  
  // If no title was found, generate one based on genre and mood
  if (details.title === "Generated Track") {
    details.title = `${details.mood} ${details.genre} Experience`;
  }
  
  // Try to extract BPM
  const bpmPatterns = [
    /bpm:?\s*(\d+)/i,
    /(\d+)\s*bpm/i,
    /tempo:?\s*(\d+)/i
  ];
  
  for (const pattern of bpmPatterns) {
    const match = responseText.match(pattern) || originalMessage.match(pattern);
    if (match && match[1]) {
      details.bpm = parseInt(match[1].trim(), 10);
      break;
    }
  }
  
  // Try to extract key
  const keyPatterns = [
    /key:?\s*([A-G][#b]?\s*(?:major|minor|maj|min))/i,
    /in\s+([A-G][#b]?\s*(?:major|minor|maj|min))/i
  ];
  
  for (const pattern of keyPatterns) {
    const match = responseText.match(pattern) || originalMessage.match(pattern);
    if (match && match[1]) {
      details.key = match[1].trim();
      break;
    }
  }
  
  return details;
} 