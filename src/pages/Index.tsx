import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Chat from '@/components/Chat';
import MusicPlayer from '@/components/MusicPlayer';
import NFTMint from '@/components/NFTMint';
import { mintNFTWithAgent } from '@/utils/mxAgent';
import { Music, MessageSquare, Sparkles } from 'lucide-react';

interface TrackData {
  url: string;
  metadata: {
    title: string;
    genre: string;
    mood?: string;
    lyrics?: string;
  };
}

const Index = () => {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const handleMusicGenerated = (trackUrl: string, metadata: any) => {
    console.log('Music generated with URL:', trackUrl);
    console.log('Music metadata:', metadata);
    
    if (!trackUrl) {
      console.error('No track URL provided');
      return;
    }
    
    setTrack({
      url: trackUrl,
      metadata: {
        title: metadata.title || 'Generated Song',
        genre: metadata.genre || 'AI Music',
        mood: metadata.mood || 'Custom',
        lyrics: metadata.lyrics
      }
    });
  };

  const handleMintNFT = async () => {
    if (!track) return Promise.reject(new Error("No track to mint"));
    
    // In a real app, this would use the actual MultiversX wallet address
    return mintNFTWithAgent({
      title: track.metadata.title,
      description: `A unique AI-generated ${track.metadata.genre} track with ${track.metadata.mood || 'unique'} mood.`,
      mediaUrl: track.url,
      genre: track.metadata.genre,
      address: "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
    });
  };

  const startChatting = () => {
    setShowWelcome(false);
    setShowChat(true);
  };

  const featuresData = [
    {
      icon: <MessageSquare className="h-10 w-10 text-music-primary" />,
      title: "AI-Powered Chat",
      description: "Describe the music you want to create using natural language. Our AI understands your creative vision."
    },
    {
      icon: <Music className="h-10 w-10 text-music-primary" />,
      title: "Music Generation",
      description: "Advanced AI algorithms create unique tracks based on your description in seconds."
    },
    {
      icon: <Sparkles className="h-10 w-10 text-music-primary" />,
      title: "NFT Minting",
      description: "Turn your AI-generated music into valuable NFTs on the MultiversX blockchain with one click."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 pt-16">
        {showWelcome && (
          <div className="animate-fade-in">
            <div className="relative bg-gradient-to-b from-music-primary/5 to-transparent">
              <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-music-primary/10 text-music-primary text-sm font-medium mb-4">
                    AI-Powered Music Creation
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Create Unique Music with AI and Mint as NFTs
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mb-8">
                    Describe the music you want, let our AI create it, and mint your unique track as an NFT on the MultiversX blockchain.
                  </p>
                  <button 
                    onClick={startChatting}
                    className="px-6 py-3 rounded-lg bg-music-primary text-white font-medium hover:bg-music-primary/90 transition-all-250 shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[0px]"
                  >
                    Chat with AI to Generate Music
                  </button>
                </div>
              </div>
            </div>
            
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                  How It Works
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuresData.map((feature, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-all-250 flex flex-col items-center text-center"
                    >
                      <div className="mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showChat && (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 xl:col-span-8">
                <Chat 
                  onMusicGenerated={handleMusicGenerated} 
                  className="h-[500px] md:h-[600px]"
                />
              </div>
              
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <MusicPlayer 
                  trackUrl={track?.url} 
                  metadata={track?.metadata}
                />
                
                {track && (
                  <NFTMint onMint={handleMintNFT} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
