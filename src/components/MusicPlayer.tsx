import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  trackUrl?: string;
  metadata?: {
    title: string;
    genre: string;
    mood?: string;
    lyrics?: string;
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
  const [loadError, setLoadError] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (trackUrl) {
      console.log('Loading audio from URL:', trackUrl);
      setIsLoaded(false);
      setLoadError(false);
      
      // Directly set the audio source
      if (audioRef.current) {
        try {
          audioRef.current.src = trackUrl;
          audioRef.current.load();
          console.log('Audio source set successfully');
        } catch (error) {
          console.error('Error setting audio source:', error);
          setLoadError(true);
        }
      }
    }
  }, [trackUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setLoadError(true);
      });
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
    
    console.log('Audio metadata loaded, duration:', audioRef.current.duration);
    setDuration(audioRef.current.duration);
    setIsLoaded(true);
    setLoadError(false);
  };

  const handleError = () => {
    if (trackUrl) {
      console.error('Error loading audio from URL:', trackUrl);
      setIsLoaded(false);
      setLoadError(true);
    }
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

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  return (
    <div className={cn("bg-white rounded-xl p-4 border shadow-sm", className)}>
      {trackUrl && (
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
        >
          <source src={trackUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      <div className="mb-3 flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg leading-tight">{metadata.title}</h3>
          <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
            <span>{metadata.genre}</span>
            {metadata.mood && (
              <>
                <span>•</span>
                <span>{metadata.mood}</span>
              </>
            )}
            {metadata.lyrics && (
              <>
                <span>•</span>
                <button 
                  onClick={toggleLyrics}
                  className="flex items-center text-music-primary hover:underline"
                  disabled={!trackUrl}
                >
                  <span>Lyrics</span>
                  {showLyrics ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className={cn("flex ml-4", !trackUrl && "opacity-50")}>
          <div className="audio-visualizer">
            <div className={`audio-bar h-4 ${isPlaying ? 'animate-wave-1' : ''}`}></div>
            <div className={`audio-bar h-6 ${isPlaying ? 'animate-wave-2' : ''}`}></div>
            <div className={`audio-bar h-8 ${isPlaying ? 'animate-wave-3' : ''}`}></div>
            <div className={`audio-bar h-5 ${isPlaying ? 'animate-wave-4' : ''}`}></div>
            <div className={`audio-bar h-3 ${isPlaying ? 'animate-wave-5' : ''}`}></div>
          </div>
        </div>
      </div>

      {/* Lyrics section */}
      {showLyrics && metadata.lyrics && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm max-h-40 overflow-y-auto whitespace-pre-line">
          {metadata.lyrics}
        </div>
      )}

      {/* Always show the player controls, but disable them when no track is loaded */}
      <div className="flex items-center space-x-3 mb-3">
        <button 
          onClick={togglePlay}
          disabled={!isLoaded || loadError || !trackUrl}
          className={cn(
            "p-2.5 rounded-full bg-music-primary text-white hover:bg-music-primary/90 transition-all-250",
            (!trackUrl || !isLoaded || loadError) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 flex items-center space-x-2">
          <span className={cn("text-xs text-muted-foreground w-10", !trackUrl && "opacity-50")}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={!isLoaded || loadError || !trackUrl}
            className={cn(
              "w-full h-2 rounded-full appearance-none bg-secondary focus:outline-none",
              (!trackUrl || !isLoaded || loadError) && "opacity-50 cursor-not-allowed"
            )}
            style={{
              backgroundImage: `linear-gradient(to right, hsl(var(--music-primary)) 0%, hsl(var(--music-primary)) ${(currentTime / (duration || 1)) * 100}%, hsl(var(--secondary)) ${(currentTime / (duration || 1)) * 100}%, hsl(var(--secondary)) 100%)`,
            }}
          />
          <span className={cn("text-xs text-muted-foreground w-10", !trackUrl && "opacity-50")}>
            {formatTime(duration || 0)}
          </span>
        </div>

        <button
          onClick={toggleMute}
          disabled={!isLoaded || loadError || !trackUrl}
          className={cn(
            "p-2 rounded-full text-muted-foreground hover:text-foreground transition-all-250",
            (!trackUrl || !isLoaded || loadError) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      </div>

      {!isLoaded && trackUrl && !loadError && (
        <div className="flex justify-center items-center py-2">
          <div className="flex space-x-2 items-center text-sm text-muted-foreground">
            <div className="h-4 w-4 rounded-full border-2 border-music-primary/30 border-t-music-primary animate-spin"></div>
            <span>Loading audio...</span>
          </div>
        </div>
      )}

      {loadError && trackUrl && (
        <div className="flex justify-center items-center py-2 text-red-500 text-sm">
          <span>Error loading audio. Please try again later.</span>
        </div>
      )}

      {!trackUrl && (
        <div className="flex justify-center items-center py-2 text-muted-foreground text-sm">
          <span>No track loaded. Ask the AI to create music for you!</span>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
