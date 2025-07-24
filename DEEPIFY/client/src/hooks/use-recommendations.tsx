import { useQuery } from "@tanstack/react-query";
import type { Track } from "@shared/schema";

export function useRecommendations() {
  const { data: recommendations = [] } = useQuery<Track[]>({
    queryKey: ["/api/recommendations"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: recentlyPlayed = [] } = useQuery<Track[]>({
    queryKey: ["/api/recently-played"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    recommendations,
    recentlyPlayed,
  };
}
