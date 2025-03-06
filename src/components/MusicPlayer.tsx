
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  trackUrl?: string;
  metadata?: {
    title: string;
    genre: string;
    mood?: string;
  };
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  trackUrl, 
  metadata = { title: "No track loaded", genre: "—" },
  className 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (trackUrl) {
      setIsLoaded(false);
      if (audioRef.current) {
        audioRef.current.src = trackUrl;
        audioRef.current.load();
      }
    }
  }, [trackUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    setDuration(audioRef.current.duration);
    setIsLoaded(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={cn("bg-white rounded-xl p-4 border shadow-sm", className)}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={trackUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="mb-3 flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg leading-tight">{metadata.title}</h3>
          <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
            <span>{metadata.genre}</span>
            {metadata.mood && (
              <>
                <span>•</span>
                <span>{metadata.mood}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex">
          <div className="audio-visualizer">
            <div className={`audio-bar h-4 ${isPlaying ? 'animate-wave-1' : ''}`}></div>
            <div className={`audio-bar h-6 ${isPlaying ? 'animate-wave-2' : ''}`}></div>
            <div className={`audio-bar h-8 ${isPlaying ? 'animate-wave-3' : ''}`}></div>
            <div className={`audio-bar h-5 ${isPlaying ? 'animate-wave-4' : ''}`}></div>
            <div className={`audio-bar h-3 ${isPlaying ? 'animate-wave-5' : ''}`}></div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-3">
        <button 
          onClick={togglePlay}
          disabled={!isLoaded}
          className="p-2.5 rounded-full bg-music-primary text-white hover:bg-music-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all-250"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 flex items-center space-x-2">
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={!isLoaded}
            className="w-full h-2 rounded-full appearance-none bg-secondary focus:outline-none disabled:opacity-50"
            style={{
              backgroundImage: `linear-gradient(to right, hsl(var(--music-primary)) 0%, hsl(var(--music-primary)) ${(currentTime / (duration || 1)) * 100}%, hsl(var(--secondary)) ${(currentTime / (duration || 1)) * 100}%, hsl(var(--secondary)) 100%)`,
            }}
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration || 0)}
          </span>
        </div>

        <button
          onClick={toggleMute}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-all-250"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      </div>

      {!isLoaded && trackUrl && (
        <div className="flex justify-center items-center py-2">
          <div className="flex space-x-2 items-center text-sm text-muted-foreground">
            <div className="h-4 w-4 rounded-full border-2 border-music-primary/30 border-t-music-primary animate-spin"></div>
            <span>Loading audio...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
