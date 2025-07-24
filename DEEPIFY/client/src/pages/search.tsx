import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, ArrowLeft, Wifi, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrackList from "@/components/track-list";
import OnlineTrackList from "@/components/online-track-list";
import { Link } from "wouter";
import type { Track } from "@shared/schema";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("local");

  const { data: localResults = [], isLoading: localLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks/search", searchQuery],
    enabled: searchQuery.length > 0 && activeTab === "local",
  });

  const { data: onlineResults = [], isLoading: onlineLoading } = useQuery<any[]>({
    queryKey: ["/api/online/search", searchQuery],
    enabled: searchQuery.length > 0 && activeTab === "online",
  });

  const { data: trendingTracks = [] } = useQuery<any[]>({
    queryKey: ["/api/online/trending"],
    enabled: activeTab === "online" && searchQuery.length === 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  return (
    <div className="spotify-bg-black text-white min-h-screen">
      {/* Header */}
      <header className="flex items-center space-x-3 p-4 spotify-bg-black sticky top-0 z-50">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="spotify-text-light-gray" size={20} />
          </Button>
        </Link>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Input
            type="text"
            placeholder={activeTab === "local" ? "Search your music..." : "Search online music..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full spotify-bg-gray text-white rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 spotify-text-light-gray" size={16} />
        </form>
      </header>

      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="spotify-bg-gray w-full mb-6">
            <TabsTrigger value="local" className="flex-1 flex items-center space-x-2">
              <Music2 size={16} />
              <span>My Music</span>
            </TabsTrigger>
            <TabsTrigger value="online" className="flex-1 flex items-center space-x-2">
              <Wifi size={16} />
              <span>Online</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local">
            {localLoading && (
              <div className="text-center py-8">
                <p className="spotify-text-light-gray">Searching your library...</p>
              </div>
            )}

            {searchQuery && !localLoading && localResults.length === 0 && (
              <div className="text-center py-8">
                <SearchIcon className="mx-auto mb-4 spotify-text-light-gray" size={48} />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="spotify-text-light-gray">Try searching for something else</p>
              </div>
            )}

            {localResults.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4">Your Music Results</h2>
                <TrackList tracks={localResults} showAlbumArt />
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-12">
                <Music2 className="mx-auto mb-4 spotify-text-light-gray" size={48} />
                <h3 className="text-lg font-medium mb-2">Search your library</h3>
                <p className="spotify-text-light-gray">Find your uploaded tracks and artists</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="online">
            {onlineLoading && (
              <div className="text-center py-8">
                <p className="spotify-text-light-gray">Searching online music...</p>
              </div>
            )}

            {searchQuery && !onlineLoading && onlineResults.length === 0 && (
              <div className="text-center py-8">
                <SearchIcon className="mx-auto mb-4 spotify-text-light-gray" size={48} />
                <h3 className="text-lg font-medium mb-2">No online results found</h3>
                <p className="spotify-text-light-gray">Try a different search term</p>
              </div>
            )}

            {onlineResults.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4">Online Music Results</h2>
                <OnlineTrackList tracks={onlineResults} showAlbumArt />
              </div>
            )}

            {!searchQuery && trendingTracks.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4">Trending Now</h2>
                <OnlineTrackList tracks={trendingTracks} showAlbumArt />
              </div>
            )}

            {!searchQuery && trendingTracks.length === 0 && (
              <div className="text-center py-12">
                <Wifi className="mx-auto mb-4 spotify-text-light-gray" size={48} />
                <h3 className="text-lg font-medium mb-2">Discover online music</h3>
                <p className="spotify-text-light-gray">Search for songs, artists, and albums from around the world</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
