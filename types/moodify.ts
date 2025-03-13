import { DetailedMoodAnalysis, Track } from './spotify';

export interface RecentTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { 
    name: string; 
    release_date: string;
    images?: { url: string }[];
  };
}

export interface PlaylistResponse {
  recommendations: Track[];
  moodAnalysis: DetailedMoodAnalysis;
  originalTrack: RecentTrack;
  isCurrentlyPlaying: boolean;
}
