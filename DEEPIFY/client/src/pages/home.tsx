import { useQuery } from "@tanstack/react-query";
import { Music, Upload, Heart, Clock } from "lucide-react";
import FileUpload from "@/components/file-upload";
import TrackList from "@/components/track-list";
import DeepifyLogo from "@/components/deepify-logo";
import { useRecommendations } from "@/hooks/use-recommendations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import type { Track } from "@shared/schema";

export default function Home() {
  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { recommendations, recentlyPlayed } = useRecommendations();

  return (
    <div className="spotify-bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 spotify-bg-black sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 spotify-bg-green rounded-full flex items-center justify-center">
            <DeepifyLogo size={16} className="text-black" />
          </div>
          <h1 className="text-xl font-bold">Deepify</h1>
        </div>
        <div className="flex items-center space-x-3">
          <FileUpload />
        </div>
      </header>

      {/* File Upload Section */}
      <div className="px-4 py-3">
        <Card className="spotify-bg-gray p-4 border-0">
          <div className="flex items-center space-x-3">
            <Upload className="spotify-text-green" size={20} />
            <div>
              <p className="text-sm font-medium">Upload Your Music</p>
              <p className="text-xs spotify-text-light-gray">Add MP3, FLAC, or M4A files</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/library">
            <Button 
              variant="ghost" 
              className="spotify-bg-gray rounded-lg p-3 h-auto justify-start space-x-3 hover:bg-opacity-80"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center">
                <Heart className="text-white" size={16} />
              </div>
              <span className="text-sm font-medium">Liked Songs</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="spotify-bg-gray rounded-lg p-3 h-auto justify-start space-x-3 hover:bg-opacity-80"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded flex items-center justify-center">
              <Clock className="text-white" size={16} />
            </div>
            <span className="text-sm font-medium">Recently Played</span>
          </Button>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-4">Made for You</h2>
          <TrackList tracks={recommendations} showAlbumArt />
        </div>
      )}

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-4">Recently Played</h2>
          <TrackList tracks={recentlyPlayed.slice(0, 5)} showAlbumArt />
        </div>
      )}

      {/* All Tracks Section */}
      {tracks.length > 0 && (
        <div className="px-4 mb-20">
          <h2 className="text-lg font-bold mb-4">Your Music</h2>
          <div className="grid grid-cols-2 gap-3">
            {tracks.slice(0, 4).map((track) => (
              <Card key={track.id} className="spotify-bg-gray rounded-lg p-3 border-0 hover:bg-opacity-80 transition-all cursor-pointer">
                <div className="w-full aspect-square bg-gradient-to-br from-indigo-500 to-purple-500 rounded mb-3 flex items-center justify-center">
                  <Music className="text-white" size={24} />
                </div>
                <h3 className="text-sm font-medium truncate">{track.title}</h3>
                <p className="text-xs spotify-text-light-gray truncate">{track.artist}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tracks.length === 0 && (
        <div className="px-4 py-12 text-center">
          <Music className="mx-auto mb-4 spotify-text-light-gray" size={48} />
          <h3 className="text-lg font-medium mb-2">No music yet</h3>
          <p className="spotify-text-light-gray mb-4">Upload your first track to get started</p>
          <FileUpload />
        </div>
      )}
    </div>
  );
}
