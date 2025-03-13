import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { uris } = await request.json();

    if (!uris || !Array.isArray(uris) || uris.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty track URIs' }, { status: 400 });
    }

    // Validate each URI
    const validUris = uris.filter(uri => typeof uri === 'string' && uri.startsWith('spotify:track:'));
    if (validUris.length !== uris.length) {
      return NextResponse.json({ error: 'Invalid track URIs provided' }, { status: 400 });
    }

    console.log('Playlist ID:', params.playlistId);
    console.log('Track URIs:', validUris);

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${params.playlistId}/tracks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: validUris })
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        cookies().delete('spotify_access_token');
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      const errorData = await response.json();
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    return NextResponse.json({ error: 'Failed to add tracks to playlist', details: error }, { status: 500 });
  }
}

