export interface AudioFeatures {
    acousticness: number;
    analysis_url: string;
    danceability: number;
    energy: number;
    instrumentalness: number;
    key: number;
    liveness: number;
    loudness: number;
    mode: number;
    speechiness: number;
    tempo: number;
    time_signature: number;
    valence: number;
  }
  
  export interface Track {
    id: string;
    name: string;
    artist: string;
    album?: string;
    audioFeatures?: AudioFeatures;
  }
  
  export interface DetailedMoodAnalysis {
    energy: number;
    valence: number;
    danceability: number;
    acousticness: number;
    instrumentalness: number;
    tempo: number;
    primaryMood: string;
    secondaryMoods: string[];
    intensity: string;
    description: string;
  }