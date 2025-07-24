import { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";
import type { Track } from "@shared/schema";

interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Track[];
  currentIndex: number;
}

interface AudioPlayerActions {
  playTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  setPlaylist: (tracks: Track[]) => void;
}

type AudioPlayerContextType = AudioPlayerState & AudioPlayerActions;

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playlist: [],
    currentIndex: -1,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    const updateTime = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleEnded = () => {
      next();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Use streamUrl for online tracks, otherwise use local streaming endpoint
    const audioSrc = track.isOnline && track.streamUrl 
      ? track.streamUrl 
      : `/api/tracks/${track.id}/stream`;
    
    audio.src = audioSrc;
    setState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
    }));
    
    audio.play().catch(console.error);
  };

  const play = () => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    audio.play().then(() => {
      setState(prev => ({ ...prev, isPlaying: true }));
    }).catch(console.error);
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  const seek = (percentage: number) => {
    const audio = audioRef.current;
    if (!audio || !state.duration) return;

    const time = (percentage / 100) * state.duration;
    audio.currentTime = time;
  };

  const setVolume = (volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    audio.volume = clampedVolume;
    setState(prev => ({ ...prev, volume: clampedVolume }));
  };

  const next = () => {
    if (state.playlist.length === 0) return;
    
    const nextIndex = (state.currentIndex + 1) % state.playlist.length;
    const nextTrack = state.playlist[nextIndex];
    
    if (nextTrack) {
      playTrack(nextTrack);
      setState(prev => ({ ...prev, currentIndex: nextIndex }));
    }
  };

  const previous = () => {
    if (state.playlist.length === 0) return;
    
    const prevIndex = state.currentIndex <= 0 ? state.playlist.length - 1 : state.currentIndex - 1;
    const prevTrack = state.playlist[prevIndex];
    
    if (prevTrack) {
      playTrack(prevTrack);
      setState(prev => ({ ...prev, currentIndex: prevIndex }));
    }
  };

  const setPlaylist = (tracks: Track[]) => {
    setState(prev => ({ ...prev, playlist: tracks }));
  };

  // Update playing state based on audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const contextValue: AudioPlayerContextType = {
    ...state,
    playTrack,
    play,
    pause,
    seek,
    setVolume,
    next,
    previous,
    setPlaylist,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}
