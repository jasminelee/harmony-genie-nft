import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, Loader, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { elizaApiClient, ElizaResponse } from '@/lib/elizaApi';
import { checkTaskStatus, TaskStatus, PiApiTaskResponse } from '@/lib/piApiClient';

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
      id: 'initial-message',
      content: "Hi! I'm your AI music assistant. Tell me what kind of music you'd like to create today.",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [musicGenerationStatus, setMusicGenerationStatus] = useState<string | null>(null);
  const [musicTaskId, setMusicTaskId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Check available agents on component mount
  useEffect(() => {
    const checkAgents = async () => {
      try {
        console.log('Checking available Eliza agents...');
        const response = await elizaApiClient.getAgents();
        console.log('Available Eliza agents:', response);
        
        // The response has an 'agents' property that is an array
        if (!response || !response.agents || response.agents.length === 0) {
          console.error('No Eliza agents found:', response);
          setMessages(prev => [
            ...prev, 
            {
              id: `warning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              content: "Warning: No Eliza agents found. Please check your Eliza server configuration.",
              sender: 'ai',
              timestamp: new Date(),
            }
          ]);
        } else {
          console.log(`Found ${response.agents.length} Eliza agents. Using: ${response.agents[0].name}`);
        }
      } catch (error) {
        console.error('Error checking Eliza agents:', error);
        setMessages(prev => [
          ...prev, 
          {
            id: `connection-error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: "Warning: Could not connect to the Eliza AI agent. Please make sure the Eliza server is running.",
            sender: 'ai',
            timestamp: new Date(),
          }
        ]);
      }
    };
    
    checkAgents();
  }, []);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Poll for music generation status
  useEffect(() => {
    if (musicTaskId && musicGenerationStatus !== 'completed' && musicGenerationStatus !== 'failed') {
      console.log(`Setting up polling for music task ${musicTaskId}`);
      console.log(`Task ID length: ${musicTaskId.length}`);
      console.log(`Task ID parts: ${musicTaskId.split('-').join(', ')}`);
      
      // Clear any existing interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      
      // Initial check immediately
      const checkStatus = async () => {
        try {
          console.log(`Checking status of music generation task ${musicTaskId}...`);
          const taskStatus = await checkTaskStatus(musicTaskId);
          console.log('Task status:', taskStatus);
          
          handleTaskStatus(taskStatus);
        } catch (error) {
          console.error('Error checking music generation status:', error);
        }
      };
      
      // Function to handle task status updates
      const handleTaskStatus = (taskStatus: PiApiTaskResponse) => {
        console.log('Handling task status update:', taskStatus);
        
        // Update the status message in the UI
        if (taskStatus.status !== musicGenerationStatus) {
          setMusicGenerationStatus(taskStatus.status);
          
          // Update the last message if it's a status message
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.content.includes('Music generation')) {
              const statusText = taskStatus.status === TaskStatus.PROCESSING 
                ? 'in progress' 
                : taskStatus.status.toLowerCase();
              
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: `Music generation ${statusText}... ${taskStatus.status === TaskStatus.COMPLETED ? 'Done!' : 'Please wait...'}`
                }
              ];
            }
            return prev;
          });
        }
        
        if (taskStatus.status === TaskStatus.COMPLETED) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          if (taskStatus.output && taskStatus.output.audio_url) {
            console.log('Music generation completed with audio URL:', taskStatus.output.audio_url);
            
            // Add a message about the completed music
            const completionMessage: Message = {
              id: `completion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              content: `Your song "${taskStatus.output.title || 'Generated Song'}" is ready! Would you like to mint it as an NFT?`,
              sender: 'ai',
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, completionMessage]);
            
            // Call the onMusicGenerated callback with the track URL and metadata
            if (onMusicGenerated) {
              console.log('Calling onMusicGenerated with:', taskStatus.output.audio_url);
              onMusicGenerated(taskStatus.output.audio_url, {
                title: taskStatus.output.title || 'Generated Song',
                genre: 'Generated Music',
                mood: 'Custom',
                lyrics: taskStatus.output.lyrics || ''
              });
            } else {
              console.warn('onMusicGenerated callback is not defined');
            }
          } else {
            console.error('Task is completed but no audio URL found:', taskStatus);
            
            // Add a message about the missing audio URL
            const errorMessage: Message = {
              id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              content: `Your song was generated but I couldn't find the audio URL. Please try again.`,
              sender: 'ai',
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, errorMessage]);
          }
        } else if (taskStatus.status === TaskStatus.FAILED) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          // Add a message about the failed music generation
          const failureMessage: Message = {
            id: `failure-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: `Sorry, I couldn't generate your music. ${taskStatus.error || 'Please try again with a different description.'}`,
            sender: 'ai',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, failureMessage]);
        }
      };
      
      // Run the initial check
      checkStatus();
      
      // Set up polling interval
      const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
      
      setPollingInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [musicTaskId, musicGenerationStatus, onMusicGenerated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStatusUpdate = (status: string) => {
    console.log('Music generation status update:', status);
    setMusicGenerationStatus(status);
    
    // Extract task ID from status message if available
    // Use a regex that captures the full UUID format (8-4-4-4-12 characters)
    const taskIdMatch = status.match(/Task created: ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (taskIdMatch && taskIdMatch[1]) {
      const fullTaskId = taskIdMatch[1];
      console.log(`Setting music task ID to: ${fullTaskId}`);
      setMusicTaskId(fullTaskId);
      
      // Also log the task ID to make sure it's being captured correctly
      console.log(`Task ID parts: ${fullTaskId.split('-').join(', ')}`);
      console.log(`Task ID length: ${fullTaskId.length}`);
      
      // Add a message about the task creation
      setMessages(prev => {
        // Check if we already have a task creation message
        if (prev.some(msg => msg.content.includes(fullTaskId))) {
          return prev;
        }
        
        return [
          ...prev,
          {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: `Task created: ${fullTaskId}`,
            sender: 'ai',
            timestamp: new Date()
          }
        ];
      });
    }
    
    // Update the last message if it's a status message
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.content.includes('Music generation')) {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: status
          }
        ];
      } else {
        // Add a new status message
        return [
          ...prev,
          {
            id: `status-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: status,
            sender: 'ai',
            timestamp: new Date()
          }
        ];
      }
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Format the user's message to guide Eliza toward music generation
    let formattedInput = input;
    
    // If the message is about music but doesn't explicitly ask for generation,
    // add a prompt to guide Eliza
    if (isMusicRelated(input) && !input.toLowerCase().includes('generate') && !input.toLowerCase().includes('create')) {
      formattedInput = `Generate music that is ${input}. Please create a song that sounds like this.`;
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: input, // Show the original input to the user
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      console.log('Sending message to Eliza:', formattedInput);
      
      // Send message to Eliza agent with status update callback
      const response = await elizaApiClient.sendMessage(formattedInput, handleStatusUpdate);
      console.log('Received response from Eliza:', response);
      
      // Process the response from the Eliza agent
      if (response && response.content) {
        // Add the AI's text response
        if (response.content.text) {
          const aiMessage: Message = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: response.content.text,
            sender: 'ai',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, aiMessage]);
        }
        
        // Check if the response contains music generation data
        if (response.content.music && response.content.music.status === 'pending') {
          // Add a message about the pending music generation
          const pendingMessage: Message = {
            id: `pending-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: `Music generation started... This may take a few minutes.`,
            sender: 'ai',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, pendingMessage]);
          
          // Set the music generation status
          setMusicGenerationStatus('pending');
          
          // If there's a task ID, set it
          if (response.content.music.taskId) {
            setMusicTaskId(response.content.music.taskId);
          }
        }
      } else {
        console.error('Unexpected response format:', response);
        
        // Fallback message if the response format is unexpected
        const fallbackMessage: Message = {
          id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
        id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: `Sorry, I encountered an error while trying to generate your music: ${error.message}. Please try again later.`,
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
    "Create a relaxing ambient track with piano",
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
        
        {musicGenerationStatus && musicGenerationStatus !== 'completed' && musicGenerationStatus !== 'failed' && (
          <div className="flex justify-center items-center py-2">
            <div className="flex space-x-2 items-center text-sm text-muted-foreground bg-white/80 px-4 py-2 rounded-full border border-gray-200">
              <div className="h-4 w-4 rounded-full border-2 border-music-primary/30 border-t-music-primary animate-spin"></div>
              <span>Generating your music... This may take a few minutes</span>
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
            disabled={isLoading || (musicGenerationStatus && musicGenerationStatus !== 'completed' && musicGenerationStatus !== 'failed')}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || (musicGenerationStatus && musicGenerationStatus !== 'completed' && musicGenerationStatus !== 'failed')}
            className="p-2 rounded-full bg-music-primary text-white hover:bg-music-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all-250"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {musicGenerationStatus && musicGenerationStatus !== 'completed' && musicGenerationStatus !== 'failed' && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Music generation in progress. Please wait...
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
