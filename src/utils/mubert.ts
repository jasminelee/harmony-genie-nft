
/**
 * Mubert API Integration
 * Documentation: https://mubert2.docs.apiary.io/#introduction/track-generation/text-to-music
 */

export interface MubertTrackMetadata {
  title: string;
  genre: string;
  mood?: string;
  duration?: number;
}

export interface MubertGenerateResponse {
  success: boolean;
  trackUrl: string;
  metadata: MubertTrackMetadata;
  error?: string;
}

// In a real implementation, this would use an actual API key
const API_KEY = "DEMO_KEY";
const API_ENDPOINT = "https://api.mubert.com/v2/TTMGenerate";

export const generateTrack = async (prompt: string): Promise<MubertGenerateResponse> => {
  try {
    // This is a mock implementation - in a real app, we would make an actual API call
    console.log(`Generating track with prompt: ${prompt}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock response
    const mockResponse: MubertGenerateResponse = {
      success: true,
      trackUrl: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3", // Sample track URL
      metadata: {
        title: generateMockTitle(prompt),
        genre: generateMockGenre(prompt),
        mood: generateMockMood(prompt),
        duration: 180 // 3 minutes
      }
    };
    
    return mockResponse;
  } catch (error) {
    console.error("Failed to generate track:", error);
    return {
      success: false,
      trackUrl: "",
      metadata: { title: "", genre: "" },
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Helper functions to generate mock data based on the prompt
function generateMockTitle(prompt: string): string {
  const titles = [
    "Cosmic Dreams",
    "Midnight Echoes",
    "Urban Pulse",
    "Ethereal Journey",
    "Digital Horizon",
    "Ambient Reflection"
  ];
  
  // Generate a somewhat relevant title based on the prompt
  if (prompt.toLowerCase().includes("lo-fi") || prompt.toLowerCase().includes("lofi")) {
    return "Lo-fi Sunset";
  } else if (prompt.toLowerCase().includes("dance") || prompt.toLowerCase().includes("edm")) {
    return "Electric Pulse";
  } else if (prompt.toLowerCase().includes("ambient") || prompt.toLowerCase().includes("chill")) {
    return "Ambient Waves";
  } else if (prompt.toLowerCase().includes("jazz")) {
    return "Jazzy Moments";
  } else {
    // Random title if no match
    return titles[Math.floor(Math.random() * titles.length)];
  }
}

function generateMockGenre(prompt: string): string {
  if (prompt.toLowerCase().includes("lo-fi") || prompt.toLowerCase().includes("lofi")) {
    return "Lo-Fi";
  } else if (prompt.toLowerCase().includes("dance") || prompt.toLowerCase().includes("edm")) {
    return "EDM";
  } else if (prompt.toLowerCase().includes("ambient") || prompt.toLowerCase().includes("chill")) {
    return "Ambient";
  } else if (prompt.toLowerCase().includes("jazz")) {
    return "Jazz";
  } else if (prompt.toLowerCase().includes("rock")) {
    return "Rock";
  } else {
    return "Electronic";
  }
}

function generateMockMood(prompt: string): string {
  if (prompt.toLowerCase().includes("happy") || prompt.toLowerCase().includes("upbeat")) {
    return "Happy";
  } else if (prompt.toLowerCase().includes("sad") || prompt.toLowerCase().includes("melancholy")) {
    return "Melancholic";
  } else if (prompt.toLowerCase().includes("relax") || prompt.toLowerCase().includes("chill")) {
    return "Relaxing";
  } else if (prompt.toLowerCase().includes("energetic") || prompt.toLowerCase().includes("dance")) {
    return "Energetic";
  } else {
    const moods = ["Dreamy", "Reflective", "Peaceful", "Dynamic", "Mysterious"];
    return moods[Math.floor(Math.random() * moods.length)];
  }
}
