import { Button } from "@/components/ui/button";
import { Play, Music, Plus, Heart } from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/audio-utils";
import { useToast } from "@/hooks/use-toast";

interface OnlineTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  streamUrl: string;
  thumbnailUrl?: string;
  source: string;
}

interface OnlineTrackListProps {
  tracks: OnlineTrack[];
  showAlbumArt?: boolean;
}

export default function OnlineTrackList({ tracks, showAlbumArt = false }: OnlineTrackListProps) {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addToLibraryMutation = useMutation({
    mutationFn: async (track: OnlineTrack) => {
      const response = await apiRequest("POST", "/api/online/add", track);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      toast({
        title: "Added to Library",
        description: "Track added to your library successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Add",
        description: "Could not add track to library",
        variant: "destructive",
      });
    },
  });

  const handlePlay = (track: OnlineTrack) => {
    // Convert OnlineTrack to Track format for the audio player
    const trackForPlayer = {
      id: parseInt(track.id) || Date.now(), // Use timestamp as fallback ID
      title: track.title,
      artist: track.artist,
      album: track.album || null,
      duration: track.duration,
      filePath: track.streamUrl,
      fileSize: 0,
      mimeType: "audio/mpeg",
      uploadedAt: new Date(),
      isOnline: true,
      onlineId: track.id,
      streamUrl: track.streamUrl,
      thumbnailUrl: track.thumbnailUrl || null,
      source: track.source,
    };
    
    playTrack(trackForPlayer);
  };

  const handleAddToLibrary = (e: React.MouseEvent, track: OnlineTrack) => {
    e.stopPropagation();
    addToLibraryMutation.mutate(track);
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="mx-auto mb-4 spotify-text-light-gray" size={48} />
        <p className="spotify-text-light-gray">No online tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.onlineId === track.id;
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
              <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                {track.thumbnailUrl ? (
                  <img 
                    src={track.thumbnailUrl} 
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Music className="text-white" size={16} />
                  </div>
                )}
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
                onClick={(e) => handleAddToLibrary(e, track)}
                disabled={addToLibraryMutation.isPending}
              >
                <Plus className="spotify-text-light-gray hover:spotify-text-green" size={14} />
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