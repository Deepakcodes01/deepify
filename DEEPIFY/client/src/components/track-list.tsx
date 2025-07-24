import { Button } from "@/components/ui/button";
import { Play, Music, Heart } from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/audio-utils";
import type { Track } from "@shared/schema";

interface TrackListProps {
  tracks: Track[];
  showAlbumArt?: boolean;
}

export default function TrackList({ tracks, showAlbumArt = false }: TrackListProps) {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (trackId: number) => {
      const response = await apiRequest("POST", `/api/tracks/${trackId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks/liked"] });
    },
  });

  const handlePlay = (track: Track) => {
    playTrack(track);
  };

  const handleLike = (e: React.MouseEvent, trackId: number) => {
    e.stopPropagation();
    likeMutation.mutate(trackId);
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="mx-auto mb-4 spotify-text-light-gray" size={48} />
        <p className="spotify-text-light-gray">No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentPlaying = isCurrentTrack && isPlaying;

        return (
          <div
            key={track.id}
            className={`flex items-center space-x-3 p-2 rounded-lg hover:spotify-bg-gray transition-all cursor-pointer ${
              isCurrentTrack ? 'spotify-bg-gray' : ''
            }`}
            onClick={() => handlePlay(track)}
          >
            {showAlbumArt && (
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                <Music className="text-white" size={16} />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isCurrentTrack ? 'spotify-text-green' : 'text-white'
              }`}>
                {track.title}
              </p>
              <p className="text-xs spotify-text-light-gray truncate">
                {track.artist}
                {track.album && ` • ${track.album}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-xs spotify-text-light-gray">
                {formatTime(track.duration)}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={(e) => handleLike(e, track.id)}
                disabled={likeMutation.isPending}
              >
                <Heart className="spotify-text-light-gray hover:text-red-500" size={14} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(track);
                }}
              >
                <Play 
                  className={`${
                    isCurrentPlaying ? 'spotify-text-green' : 'spotify-text-light-gray hover:text-white'
                  }`} 
                  size={14} 
                />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
