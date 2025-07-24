import { 
  tracks, 
  playHistory, 
  userPreferences,
  type Track, 
  type InsertTrack,
  type PlayHistory,
  type InsertPlayHistory,
  type UserPreferences,
  type InsertUserPreferences
} from "@shared/schema";

export interface IStorage {
  // Track operations
  getAllTracks(): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  deleteTrack(id: number): Promise<boolean>;
  searchTracks(query: string): Promise<Track[]>;
  
  // Play history operations
  recordPlay(trackId: number): Promise<PlayHistory>;
  getPlayHistory(): Promise<PlayHistory[]>;
  getTrackPlayCount(trackId: number): Promise<number>;
  
  // User preferences operations
  toggleLike(trackId: number): Promise<UserPreferences>;
  getLikedTracks(): Promise<Track[]>;
  getUserPreference(trackId: number): Promise<UserPreferences | undefined>;
  
  // Recommendation operations
  getRecommendations(limit?: number): Promise<Track[]>;
  getRecentlyPlayed(limit?: number): Promise<Track[]>;
}

export class MemStorage implements IStorage {
  private tracks: Map<number, Track>;
  private playHistory: Map<number, PlayHistory>;
  private userPreferences: Map<number, UserPreferences>;
  private currentTrackId: number;
  private currentPlayHistoryId: number;
  private currentPreferenceId: number;

  constructor() {
    this.tracks = new Map();
    this.playHistory = new Map();
    this.userPreferences = new Map();
    this.currentTrackId = 1;
    this.currentPlayHistoryId = 1;
    this.currentPreferenceId = 1;
  }

  async getAllTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }

  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.currentTrackId++;
    const track: Track = { 
      ...insertTrack,
      album: insertTrack.album || null,
      isOnline: insertTrack.isOnline || false,
      onlineId: insertTrack.onlineId || null,
      streamUrl: insertTrack.streamUrl || null,
      thumbnailUrl: insertTrack.thumbnailUrl || null,
      source: insertTrack.source || "local",
      id,
      uploadedAt: new Date()
    };
    this.tracks.set(id, track);
    return track;
  }

  async deleteTrack(id: number): Promise<boolean> {
    return this.tracks.delete(id);
  }

  async searchTracks(query: string): Promise<Track[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tracks.values()).filter(track =>
      track.title.toLowerCase().includes(lowercaseQuery) ||
      track.artist.toLowerCase().includes(lowercaseQuery) ||
      (track.album && track.album.toLowerCase().includes(lowercaseQuery))
    );
  }

  async recordPlay(trackId: number): Promise<PlayHistory> {
    // Check if track was played recently (within last 30 seconds)
    const recentPlay = Array.from(this.playHistory.values()).find(play => 
      play.trackId === trackId && 
      new Date().getTime() - new Date(play.playedAt).getTime() < 30000
    );

    if (recentPlay) {
      recentPlay.playCount++;
      return recentPlay;
    }

    const id = this.currentPlayHistoryId++;
    const playRecord: PlayHistory = {
      id,
      trackId,
      playedAt: new Date(),
      playCount: 1
    };
    this.playHistory.set(id, playRecord);
    return playRecord;
  }

  async getPlayHistory(): Promise<PlayHistory[]> {
    return Array.from(this.playHistory.values())
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  }

  async getTrackPlayCount(trackId: number): Promise<number> {
    return Array.from(this.playHistory.values())
      .filter(play => play.trackId === trackId)
      .reduce((total, play) => total + play.playCount, 0);
  }

  async toggleLike(trackId: number): Promise<UserPreferences> {
    const existing = Array.from(this.userPreferences.values())
      .find(pref => pref.trackId === trackId);

    if (existing) {
      existing.isLiked = !existing.isLiked;
      return existing;
    }

    const id = this.currentPreferenceId++;
    const preference: UserPreferences = {
      id,
      trackId,
      isLiked: true,
      lastPlayed: new Date()
    };
    this.userPreferences.set(id, preference);
    return preference;
  }

  async getLikedTracks(): Promise<Track[]> {
    const likedTrackIds = Array.from(this.userPreferences.values())
      .filter(pref => pref.isLiked)
      .map(pref => pref.trackId);
    
    return Array.from(this.tracks.values())
      .filter(track => likedTrackIds.includes(track.id));
  }

  async getUserPreference(trackId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values())
      .find(pref => pref.trackId === trackId);
  }

  async getRecommendations(limit = 10): Promise<Track[]> {
    const playStats = new Map<number, number>();
    
    // Calculate play frequency for each track
    for (const play of this.playHistory.values()) {
      const current = playStats.get(play.trackId) || 0;
      playStats.set(play.trackId, current + play.playCount);
    }

    // Get tracks sorted by play count
    const sortedTracks = Array.from(this.tracks.values())
      .map(track => ({
        track,
        playCount: playStats.get(track.id) || 0
      }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit)
      .map(item => item.track);

    return sortedTracks;
  }

  async getRecentlyPlayed(limit = 10): Promise<Track[]> {
    const recentPlayHistory = await this.getPlayHistory();
    const recentTrackIds = recentPlayHistory
      .slice(0, limit)
      .map(play => play.trackId);
    
    const trackMap = new Map(Array.from(this.tracks.entries()));
    return recentTrackIds
      .map(id => trackMap.get(id))
      .filter((track): track is Track => track !== undefined);
  }
}

export const storage = new MemStorage();
