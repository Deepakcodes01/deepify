import type { Track, PlayHistory } from "@shared/schema";

export interface RecommendationScore {
  track: Track;
  score: number;
  reasons: string[];
}

export class RecommendationEngine {
  static generateRecommendations(
    tracks: Track[],
    playHistory: PlayHistory[],
    limit: number = 10
  ): Track[] {
    if (tracks.length === 0) return [];

    const playStats = this.calculatePlayStats(playHistory);
    const genrePreferences = this.analyzeGenrePreferences(tracks, playStats);
    const artistPreferences = this.analyzeArtistPreferences(tracks, playStats);

    const scoredTracks = tracks.map(track => ({
      track,
      score: this.calculateTrackScore(track, playStats, genrePreferences, artistPreferences),
      reasons: this.generateReasons(track, playStats, genrePreferences, artistPreferences)
    }));

    return scoredTracks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.track);
  }

  private static calculatePlayStats(playHistory: PlayHistory[]): Map<number, number> {
    const stats = new Map<number, number>();
    
    for (const play of playHistory) {
      const current = stats.get(play.trackId) || 0;
      stats.set(play.trackId, current + play.playCount);
    }
    
    return stats;
  }

  private static analyzeGenrePreferences(tracks: Track[], playStats: Map<number, number>): Map<string, number> {
    const genreScores = new Map<string, number>();
    
    for (const track of tracks) {
      const playCount = playStats.get(track.id) || 0;
      if (playCount === 0) continue;
      
      // Simple genre inference from artist name (in a real app, you'd use music metadata)
      const inferredGenre = this.inferGenreFromArtist(track.artist);
      const current = genreScores.get(inferredGenre) || 0;
      genreScores.set(inferredGenre, current + playCount);
    }
    
    return genreScores;
  }

  private static analyzeArtistPreferences(tracks: Track[], playStats: Map<number, number>): Map<string, number> {
    const artistScores = new Map<string, number>();
    
    for (const track of tracks) {
      const playCount = playStats.get(track.id) || 0;
      if (playCount === 0) continue;
      
      const current = artistScores.get(track.artist) || 0;
      artistScores.set(track.artist, current + playCount);
    }
    
    return artistScores;
  }

  private static calculateTrackScore(
    track: Track,
    playStats: Map<number, number>,
    genrePreferences: Map<string, number>,
    artistPreferences: Map<string, number>
  ): number {
    let score = 0;
    
    // Base popularity score
    const playCount = playStats.get(track.id) || 0;
    score += playCount * 10;
    
    // Genre preference boost
    const genre = this.inferGenreFromArtist(track.artist);
    const genreScore = genrePreferences.get(genre) || 0;
    score += genreScore * 2;
    
    // Artist preference boost
    const artistScore = artistPreferences.get(track.artist) || 0;
    score += artistScore * 5;
    
    // Recency boost (newer uploads get slight preference)
    const daysSinceUpload = (Date.now() - new Date(track.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpload < 7) {
      score += 10 - daysSinceUpload;
    }
    
    // Randomization factor to avoid always showing the same recommendations
    score += Math.random() * 5;
    
    return score;
  }

  private static generateReasons(
    track: Track,
    playStats: Map<number, number>,
    genrePreferences: Map<string, number>,
    artistPreferences: Map<string, number>
  ): string[] {
    const reasons: string[] = [];
    
    const playCount = playStats.get(track.id) || 0;
    if (playCount > 0) {
      reasons.push(`You've played this ${playCount} times`);
    }
    
    const artistScore = artistPreferences.get(track.artist) || 0;
    if (artistScore > 0) {
      reasons.push(`You listen to ${track.artist} frequently`);
    }
    
    const genre = this.inferGenreFromArtist(track.artist);
    const genreScore = genrePreferences.get(genre) || 0;
    if (genreScore > 0) {
      reasons.push(`Based on your ${genre} listening history`);
    }
    
    if (reasons.length === 0) {
      reasons.push("New discovery for you");
    }
    
    return reasons;
  }

  private static inferGenreFromArtist(artist: string): string {
    // Simple genre inference - in a real app, you'd use a music database API
    const artistLower = artist.toLowerCase();
    
    if (artistLower.includes('jazz') || artistLower.includes('blues')) return 'Jazz';
    if (artistLower.includes('rock') || artistLower.includes('metal')) return 'Rock';
    if (artistLower.includes('pop') || artistLower.includes('taylor')) return 'Pop';
    if (artistLower.includes('hip') || artistLower.includes('rap')) return 'Hip Hop';
    if (artistLower.includes('electronic') || artistLower.includes('edm')) return 'Electronic';
    if (artistLower.includes('country') || artistLower.includes('folk')) return 'Country';
    if (artistLower.includes('classical') || artistLower.includes('orchestra')) return 'Classical';
    
    return 'Unknown';
  }
}
