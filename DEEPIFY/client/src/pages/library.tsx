import { useQuery } from "@tanstack/react-query";
import { Music, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrackList from "@/components/track-list";
import { Link } from "wouter";
import type { Track } from "@shared/schema";

export default function Library() {
  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: likedTracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/tracks/liked"],
  });

  const { data: recentlyPlayed = [] } = useQuery<Track[]>({
    queryKey: ["/api/recently-played"],
  });

  return (
    <div className="spotify-bg-black text-white min-h-screen">
      {/* Header */}
      <header className="flex items-center space-x-3 p-4 spotify-bg-black sticky top-0 z-50">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="spotify-text-light-gray" size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Your Library</h1>
      </header>

      <div className="px-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="spotify-bg-gray w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {tracks.length > 0 ? (
              <div>
                <h2 className="text-lg font-bold mb-4">All Songs ({tracks.length})</h2>
                <TrackList tracks={tracks} showAlbumArt />
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="mx-auto mb-4 spotify-text-light-gray" size={48} />
                <h3 className="text-lg font-medium mb-2">No music in your library</h3>
                <p className="spotify-text-light-gray">Upload some tracks to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            {likedTracks.length > 0 ? (
              <div>
                <h2 className="text-lg font-bold mb-4">Liked Songs ({likedTracks.length})</h2>
                <TrackList tracks={likedTracks} showAlbumArt />
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="mx-auto mb-4 spotify-text-light-gray" size={48} />
                <h3 className="text-lg font-medium mb-2">No liked songs</h3>
                <p className="spotify-text-light-gray">Like some tracks to see them here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            {recentlyPlayed.length > 0 ? (
              <div>
                <h2 className="text-lg font-bold mb-4">Recently Played ({recentlyPlayed.length})</h2>
                <TrackList tracks={recentlyPlayed} showAlbumArt />
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="mx-auto mb-4 spotify-text-light-gray" size={48} />
                <h3 className="text-lg font-medium mb-2">No recently played tracks</h3>
                <p className="spotify-text-light-gray">Start listening to see your history</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
