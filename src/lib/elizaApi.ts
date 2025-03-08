/**
 * Eliza API Client
 * 
 * This file provides utilities for interacting with the Eliza AI agent
 * for music generation in the harmony-genie-nft application.
 */

import { generateMusic, extractMusicParameters } from './piApiClient';

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
      lyrics?: string;
      status?: string;
      taskId?: string;
    };
  };
  createdAt: number;
  user: string;
}

/**
 * Extract PiAPI parameters from Eliza's response and user message
 * @param userMessage - The original user message
 * @param elizaText - Eliza's response text
 * @returns Object with parameters for PiAPI
 */
function extractPiApiParameters(userMessage: string, elizaText: string): {
  prompt: string;
  model: 'music-s' | 'music-u';
  negative_tags: string;
  tags: string;
  title: string;
  make_instrumental: boolean;
  lyrics_type: 'generate' | 'user' | 'instrumental';
} {
  // Extract basic music parameters
  const userParams = extractMusicParameters(userMessage);
  const elizaParams = extractMusicParameters(elizaText);
  
  // Combine parameters, preferring user parameters when available
  const genre = userParams.genre || elizaParams.genre || '';
  const mood = userParams.mood || elizaParams.mood || '';
  const tags = [...(userParams.tags || []), ...(elizaParams.tags || [])];
  const uniqueTags = [...new Set(tags)]; // Remove duplicates
  
  // Determine if instrumental
  const makeInstrumental = userParams.instrumental || elizaParams.instrumental || false;
  
  // Create a rich prompt combining user request and Eliza's creative input
  let prompt = userMessage;
  if (elizaText && !elizaText.includes("couldn't generate a proper response")) {
    // Extract the most descriptive parts of Eliza's response
    const descriptiveParts = elizaText
      .split('.')
      .filter(part => 
        part.toLowerCase().includes('genre') || 
        part.toLowerCase().includes('mood') || 
        part.toLowerCase().includes('style') ||
        part.toLowerCase().includes('sound') ||
        part.toLowerCase().includes('feel')
      )
      .join('. ');
    
    if (descriptiveParts) {
      prompt = `${userMessage}. ${descriptiveParts}`;
    }
  }
  
  // Limit prompt to 200 characters to avoid API errors
  if (prompt.length > 200) {
    prompt = prompt.substring(0, 197) + '...';
  }
  
  // Extract title from the message if possible
  const titleMatch = userMessage.match(/title:?\s*["']?([^"']+)["']?/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Determine lyrics type
  let lyricsType: 'generate' | 'user' | 'instrumental' = 'generate';
  if (makeInstrumental) {
    lyricsType = 'instrumental';
  } else if (userMessage.toLowerCase().includes('my lyrics') || 
             userMessage.toLowerCase().includes('these lyrics') ||
             userMessage.toLowerCase().includes('with lyrics:')) {
    lyricsType = 'user';
  }
  
  // Determine model - default to music-s (Suno)
  const model: 'music-s' | 'music-u' = 
    userMessage.toLowerCase().includes('udio') ? 'music-u' : 'music-s';
  
  // Extract negative tags
  const negativeTagsMatch = userMessage.match(/no\s+([a-z\s,]+)/i) || 
                           userMessage.match(/without\s+([a-z\s,]+)/i) ||
                           userMessage.match(/negative:?\s*["']?([^"']+)["']?/i);
  const negativeTags = negativeTagsMatch ? negativeTagsMatch[1].trim() : '';
  
  return {
    prompt,
    model,
    negative_tags: negativeTags,
    tags: uniqueTags.join(', '),
    title,
    make_instrumental: makeInstrumental,
    lyrics_type: lyricsType
  };
}

// API client for communicating with the Eliza agent
export const elizaApiClient = {
  /**
   * Send a message to the Eliza AI agent
   * @param message - The user's message to send to the agent
   * @returns Promise with the agent's response
   */
  sendMessage: async (message: string, onStatusUpdate?: (status: string) => void): Promise<ElizaResponse> => {
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
      
      // Process the response to add music generation
      const responseText = await response.text();
      console.log('Raw response from Eliza:', responseText);
      
      let elizaResponse;
      try {
        const parsedResponse = JSON.parse(responseText);
        console.log('Parsed Eliza response:', parsedResponse);
        
        // Handle array response format
        if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
          const firstResponse = parsedResponse[0];
          console.log('First response item:', firstResponse);
          
          // Extract text and user from the array item
          if (firstResponse.text && firstResponse.user) {
            elizaResponse = {
              id: Date.now().toString(),
              content: {
                text: firstResponse.text
              },
              createdAt: Date.now(),
              user: firstResponse.user.toLowerCase()
            };
          } else {
            throw new Error('Invalid response format: missing text or user');
          }
        } else if (parsedResponse.content) {
          // Handle object response format
          elizaResponse = parsedResponse;
        } else {
          throw new Error('Unexpected response format');
        }
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
      
      // If the message is about music generation, generate music with PiAPI
      if (isMusicGenerationRequest(message) && elizaResponse.content) {
        try {
          // Extract parameters for PiAPI from the user message and Eliza's response
          const elizaText = elizaResponse.content.text || '';
          const piApiParams = extractPiApiParameters(message, elizaText);
          console.log('Extracted PiAPI parameters:', piApiParams);
          
          // Add initial music content to the response with pending status
          elizaResponse.content.music = {
            url: "",
            title: piApiParams.title || "Generating your song...",
            genre: piApiParams.tags.split(',')[0] || "Unknown",
            mood: extractMusicParameters(message).mood || "Unknown",
            status: "pending"
          };
          
          // Start the music generation process
          if (onStatusUpdate) {
            onStatusUpdate('Starting music generation...');
          }
          
          // Generate music with PiAPI (this will be handled asynchronously)
          generateMusic(piApiParams.prompt, {
            model: piApiParams.model,
            negative_tags: piApiParams.negative_tags,
            tags: piApiParams.tags,
            title: piApiParams.title,
            make_instrumental: piApiParams.make_instrumental,
            lyrics_type: piApiParams.lyrics_type,
            onStatusUpdate: (status) => {
              if (onStatusUpdate) {
                onStatusUpdate(status);
              }
              
              // Extract task ID from status message if available
              const taskIdMatch = status.match(/Task created: ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
              if (taskIdMatch && taskIdMatch[1] && elizaResponse.content.music) {
                elizaResponse.content.music.taskId = taskIdMatch[1];
              }
            }
          }).then(result => {
            // This will be handled by the polling mechanism in the Chat component
            console.log('Music generation completed:', result);
          }).catch(error => {
            console.error('Error generating music:', error);
          });
        } catch (error) {
          console.error('Error setting up music generation:', error);
          
          // If there was an error setting up music generation, add a message
          if (elizaResponse.content.text) {
            elizaResponse.content.text += "\n\nI encountered an error while setting up music generation. Please try again later.";
          } else {
            elizaResponse.content.text = "I encountered an error while setting up music generation. Please try again later.";
          }
        }
      }
      
      return elizaResponse;
    } catch (error) {
      console.error('Error sending message to Eliza agent:', error);
      
      // Create a fallback response
      const fallbackResponse: ElizaResponse = {
        id: Date.now().toString(),
        content: {
          text: `I encountered an error while processing your request: ${error.message}. Please try again later.`
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
  },
  
  /**
   * Check the status of a music generation task
   * @param taskId - The task ID to check
   * @returns Promise with the task status and output
   */
  checkMusicGenerationStatus: async (taskId: string): Promise<{
    status: string;
    url?: string;
    title?: string;
    lyrics?: string;
  }> => {
    try {
      // This is a placeholder for now - we'll implement the actual status checking in the Chat component
      return {
        status: 'pending'
      };
    } catch (error) {
      console.error('Error checking music generation status:', error);
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