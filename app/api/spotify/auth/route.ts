import { NextResponse } from 'next/server';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';

export async function GET() {
  const scopes = [
    // Playback Scopes
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state',
    'user-read-currently-playing',
  
    // Playlist Scopes
    'playlist-modify-public',
    'playlist-modify-private',

    // Library Scopes
    'user-library-modify',
    'user-library-read',
  
    // User Profile Scopes
    'user-read-private',
  ];
  

  
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: scopes.join(' '),
  });

  return NextResponse.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
}