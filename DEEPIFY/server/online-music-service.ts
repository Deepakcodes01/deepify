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

interface JioSaavnSong {
  id: string;
  name: string;
  type: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  releaseDate: string;
  duration: string;
  label: string;
  primaryArtists: Array<{
    id: string;
    name: string;
    role: string;
    image: Array<{
      quality: string;
      link: string;
    }>;
    type: string;
    url: string;
  }>;
  featuredArtists: Array<any>;
  explicitContent: boolean;
  playCount: string;
  language: string;
  hasLyrics: boolean;
  url: string;
  copyright: string;
  image: Array<{
    quality: string;
    link: string;
  }>;
  downloadUrl: Array<{
    quality: string;
    link: string;
  }>;
}

export class OnlineMusicService {
  private static readonly JIOSAAVN_BASE_URL = "https://saavn.dev/api";

  static async searchTracks(query: string, limit: number = 20): Promise<OnlineTrack[]> {
    try {
      const response = await fetch(
        `${this.JIOSAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data?.results) {
        return [];
      }

      return data.data.results.map((song: JioSaavnSong) => this.transformJioSaavnSong(song));
    } catch (error) {
      console.error("Failed to search online tracks:", error);
      return [];
    }
  }

  static async getTrackDetails(trackId: string): Promise<OnlineTrack | null> {
    try {
      const response = await fetch(`${this.JIOSAAVN_BASE_URL}/songs/${trackId}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data?.[0]) {
        return this.transformJioSaavnSong(data.data[0]);
      }
      
      return null;
    } catch (error) {
      console.error("Failed to get track details:", error);
      return null;
    }
  }

  static async getTrendingTracks(limit: number = 20): Promise<OnlineTrack[]> {
    try {
      // Get trending tracks by searching for popular keywords
      const popularQueries = ['trending', 'top hits', 'bollywood', 'arijit singh', 'punjabi'];
      const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
      
      const response = await fetch(
        `${this.JIOSAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(randomQuery)}&page=1&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data?.results) {
        return [];
      }

      return data.data.results.map((song: JioSaavnSong) => this.transformJioSaavnSong(song));
    } catch (error) {
      console.error("Failed to get trending tracks:", error);
      return [];
    }
  }

  private static transformJioSaavnSong(song: any): OnlineTrack {
    // Duration is already in seconds from the API
    const duration = parseInt(song.duration) || 0;

    // Get the highest quality stream URL
    const streamUrl = song.downloadUrl?.find((url: any) => url.quality === "320kbps")?.url ||
                     song.downloadUrl?.find((url: any) => url.quality === "160kbps")?.url ||
                     song.downloadUrl?.[0]?.url || "";

    // Get the highest quality image
    const thumbnailUrl = song.image?.find((img: any) => img.quality === "500x500")?.url ||
                        song.image?.find((img: any) => img.quality === "150x150")?.url ||
                        song.image?.[0]?.url || "";

    // Format artist names from the new API structure
    const artistNames = song.artists?.primary?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist';

    return {
      id: song.id,
      title: song.name,
      artist: artistNames,
      album: song.album?.name || "Unknown Album",
      duration: duration,
      streamUrl: streamUrl,
      thumbnailUrl: thumbnailUrl,
      source: "jiosaavn"
    };
  }
}