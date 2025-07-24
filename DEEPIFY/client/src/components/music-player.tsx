import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Shuffle, 
  Repeat, 
  Music 
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/audio-utils";

export default function MusicPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    play, 
    pause, 
    seek, 
    setVolume,
    next,
    previous 
  } = useAudioPlayer();

  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (trackId: number) => {
      const response = await apiRequest("POST", `/api/tracks/${trackId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks/liked"] });
      setIsLiked(!isLiked);
    },
  });

  const recordPlayMutation = useMutation({
    mutationFn: async (trackId: number) => {
      await apiRequest("POST", `/api/tracks/${trackId}/play`);
    },
  });

  useEffect(() => {
    if (currentTrack && isPlaying) {
      recordPlayMutation.mutate(currentTrack.id);
    }
  }, [currentTrack?.id, isPlaying]);

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleLike = () => {
    if (currentTrack) {
      likeMutation.mutate(currentTrack.id);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 spotify-bg-gray mx-2 rounded-lg shadow-lg z-40">
      <div className="p-3">
        <div className="flex items-center space-x-3 mb-3">
          {/* Album Art */}
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
            <Music className="text-white" size={20} />
          </div>
          
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">{currentTrack.title}</p>
            <p className="text-xs spotify-text-light-gray truncate">{currentTrack.artist}</p>
          </div>
          
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <Heart 
              className={`${isLiked ? 'text-red-500 fill-red-500' : 'spotify-text-light-gray'}`} 
              size={16} 
            />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center space-x-2 text-xs spotify-text-light-gray mb-1">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1">
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          <Button variant="ghost" size="sm" className="p-2">
            <Shuffle className="spotify-text-light-gray" size={16} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={previous}
          >
            <SkipBack className="text-white" size={18} />
          </Button>
          
          <Button
            className="spotify-bg-green text-black rounded-full w-10 h-10 p-0 hover:scale-110 transition-transform"
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={next}
          >
            <SkipForward className="text-white" size={18} />
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2">
            <Repeat className="spotify-text-light-gray" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
