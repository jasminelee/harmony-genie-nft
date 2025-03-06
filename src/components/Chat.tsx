import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm generating your music based on your description. This will take a moment...",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Simulate music generation (in a real app this would call the Mubert API)
      setTimeout(() => {
        setIsLoading(false);
        
        const completionMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: "Your track is ready! Would you like to mint it as an NFT?",
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, completionMessage]);
        
        // Mock track data
        const mockTrackUrl = "https://example.com/track.mp3";
        const mockMetadata = {
          title: "Ambient Dreamscape",
          genre: "Ambient",
          mood: "Relaxing",
        };
        
        if (onMusicGenerated) {
          onMusicGenerated(mockTrackUrl, mockMetadata);
        }
      }, 3000);
    }, 1000);
  };

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
