import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { elizaApiClient, ElizaResponse } from '@/lib/elizaApi';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

interface ChatProps {
  onMusicGenerated?: (trackUrl: string, metadata: any) => void;
  className?: string;
}

const Chat: React.FC<ChatProps> = ({ onMusicGenerated, className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI music assistant. Tell me what kind of music you'd like to create today.",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check available agents on component mount
  useEffect(() => {
    const checkAgents = async () => {
      try {
        console.log('Checking available Eliza agents...');
        const response = await elizaApiClient.getAgents();
        console.log('Available Eliza agents:', response);
        
        // Check if we have a valid response with agents
        if (!response || !response.agents || response.agents.length === 0) {
          console.error('No Eliza agents found:', response);
          setMessages(prev => [
            ...prev, 
            {
              id: Date.now().toString(),
              content: "Warning: No Eliza agents found. Please check your Eliza server configuration.",
              sender: 'ai',
              timestamp: new Date(),
            }
          ]);
        }
      } catch (error) {
        console.error('Error checking Eliza agents:', error);
        setMessages(prev => [
          ...prev, 
          {
            id: Date.now().toString(),
            content: "Warning: Could not connect to the Eliza AI agent. Please make sure the Eliza server is running.",
            sender: 'ai',
            timestamp: new Date(),
          }
        ]);
      }
    };
    
    checkAgents();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Format the user's message to guide Eliza toward music generation
    let formattedInput = input;
    
    // If the message is about music but doesn't explicitly ask for generation,
    // add a prompt to guide Eliza
    if (isMusicRelated(input) && !input.toLowerCase().includes('generate')) {
      formattedInput = `I want to generate music that is ${input}. Please describe what this music would sound like in detail, including genre, mood, tempo, and key.`;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input, // Show the original input to the user
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to Eliza agent
      const response = await elizaApiClient.sendMessage(formattedInput);
      
      // Process the response from the Eliza agent
      if (response && response.content) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.content.text || "I'm generating your music based on your description. This will take a moment...",
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Check if the response contains music generation data
        if (response.content.music) {
          const completionMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: "Your track is ready! Would you like to mint it as an NFT?",
            sender: 'ai',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, completionMessage]);
          
          // Extract track data from the response
          const trackUrl = response.content.music.url || "https://example.com/track.mp3";
          const metadata = {
            title: response.content.music.title || "Generated Track",
            genre: response.content.music.genre || "Unknown",
            mood: response.content.music.mood || "Unknown",
            bpm: response.content.music.bpm || 120,
            key: response.content.music.key || "C Major"
          };
          
          if (onMusicGenerated) {
            onMusicGenerated(trackUrl, metadata);
          }
        }
      } else {
        // Fallback message if the response format is unexpected
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I couldn't generate music at this time. Please try again with a different description.",
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Error communicating with Eliza agent:', error);
      
      // Error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error while trying to generate your music. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a message is related to music
  const isMusicRelated = (message: string): boolean => {
    const musicKeywords = [
      'music', 'song', 'track', 'beat', 'melody', 'tune', 'audio',
      'ambient', 'pop', 'rock', 'jazz', 'hip hop', 'lo-fi', 'electronic',
      'piano', 'guitar', 'drums', 'bass', 'synth', 'orchestra',
      'upbeat', 'relaxing', 'energetic', 'calm', 'intense'
    ];
    
    const lowerMessage = message.toLowerCase();
    return musicKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Suggest music generation prompts
  const musicPrompts = [
    "Create a relaxing ambient track with piano and soft synths",
    "Generate an upbeat pop song with a catchy chorus",
    "Make a lo-fi hip hop beat with jazzy samples",
    "Compose an electronic dance track with a driving beat",
    "Create a cinematic orchestral piece for a dramatic scene"
  ];

  return (
    <div className={cn("flex flex-col h-full bg-secondary/30 rounded-xl overflow-hidden", className)}>
      <div className="p-4 border-b bg-white/50">
        <h3 className="font-medium">Chat with AI Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "chat-bubble animate-slide-up",
                message.sender === 'user' ? "user" : "ai"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble ai flex items-center space-x-2">
              <span>Thinking</span>
              <span className="flex space-x-1">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse delay-100">.</span>
                <span className="animate-pulse delay-200">.</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestion chips */}
      {messages.length < 3 && (
        <div className="px-4 py-2 flex flex-wrap gap-2">
          {musicPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(prompt);
              }}
              className="text-xs bg-white/80 hover:bg-white px-3 py-1 rounded-full border border-gray-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      
      <div className="p-4 bg-white/50 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask AI to generate music..."
            className="flex-1 px-4 py-2 rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-music-primary/30 transition-all-250"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-full bg-music-primary text-white hover:bg-music-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all-250"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
