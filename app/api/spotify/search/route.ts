import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_API_URL = 'https://api.spotify.com/v1/search'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'track'
  const market = searchParams.get('market') || 'ES'
  const limit = searchParams.get('limit') || '10'
  const offset = searchParams.get('offset') || '0'

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const url = new URL(SPOTIFY_API_URL)
  url.searchParams.append('q', query)
  url.searchParams.append('type', type)
  url.searchParams.append('market', market)
  url.searchParams.append('limit', limit)
  url.searchParams.append('offset', offset)

  try {
    const accessToken = await getSpotifyAccessToken() // Implement this function to get the access token
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from Spotify API')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching Spotify:', error)
    return NextResponse.json({ error: 'Failed to search Spotify' }, { status: 500 })
  }
}

async function getSpotifyAccessToken(): Promise<string | null> {
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });
  
    if (!response.ok) {
      console.error("Failed to get Spotify access token");
      return null;
    }
  
    const data = await response.json();
    return data.access_token;
  }

