import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";

interface Song {
  name: string;
  artist: string;
  album?: string;
  images?: string[];
  spotifyId?: string;
}

const MAX_RETRIES = 4;
const TIMEOUT = 100000; // 100 seconds
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";
const LAST_FM_API_KEY = "75bc7956eaa8786af5c519911f306334";
const LAST_FM_API_ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

// Utility function to normalize artist and track names
function normalizeName(name: string): string {
  return name
    .replace(/\s*\(.*\)/g, '')  // Remove text in parentheses
    .replace(/\s*feat\.?\s*.*/i, '')  // Remove featuring artists
    .replace(/\s*ft\.?\s*.*/i, '')   // Remove featuring artists
    .replace(/[^\w\s]/gi, '')  // Remove special characters
    .trim()
    .toLowerCase();
}

async function getSpotifyAccessToken(): Promise<string> {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
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
    throw new Error(`Failed to get Spotify access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function searchSpotifyTrack(song: Song, accessToken: string): Promise<{ spotifyId?: string; trackImage?: string }> {
  // Search strategies
  const searchQueries = [
    `track:${song.name} artist:${song.artist}`,  // Explicit track and artist search
    `${song.name} ${song.artist}`,               // Full name and artist
    song.name                                    // Just the song name
  ];

  for (const query of searchQueries) {
    const encodedQuery = encodeURIComponent(query);
    const url = `${SPOTIFY_SEARCH_ENDPOINT}?q=${encodedQuery}&type=track&limit=5`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Detailed logging
      console.log(`Search Query: ${query}`);
      console.log(`Search Results: ${JSON.stringify(data.tracks.items.map((track: any) => ({
        name: track.name,
        artists: track.artists.map((a: any) => a.name),
        id: track.id
      })), null, 2)}`);

      // Find the most exact match
      const exactMatch = data.tracks.items.find((track: any) => {
        const normalizedTrackName = normalizeName(track.name);
        const normalizedSearchName = normalizeName(song.name);

        const matchingArtist = track.artists.some((artist: any) =>
          normalizeName(artist.name) === normalizeName(song.artist)
        );

        return normalizedTrackName === normalizedSearchName && matchingArtist;
      });

      if (exactMatch) {
        console.log(`Exact match found for ${song.name} by ${song.artist}`);
        return {
          spotifyId: exactMatch.id,
          trackImage: exactMatch.album.images[0]?.url
        };
      }

      // If no exact match, return the first result with matching artist
      if (data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        console.log(`Approximate match found for ${song.name} by ${song.artist}`);
        return {
          spotifyId: track.id,
          trackImage: track.album.images[0]?.url
        };
      }
    } catch (error) {
      console.error(`Spotify search error for ${song.name} by ${song.artist}:`, {
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  }

  console.warn(`No Spotify match found for ${song.name} by ${song.artist}`);
  return {};
}

async function getSimilarTracks(artist: string, track: string): Promise<Song[]> {
  const url = `${LAST_FM_API_ENDPOINT}?method=track.getsimilar&artist=${encodeURIComponent(track)}&track=${encodeURIComponent(artist)}&api_key=${LAST_FM_API_KEY}&format=json`;

  console.log("Fetching similar tracks from Last.fm:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Last.fm API response:", JSON.stringify(data, null, 2));

    if (!data.similartracks || !data.similartracks.track) {
      throw new Error("Invalid response from Last.fm API");
    }

    const similarTracks = data.similartracks.track;

    return similarTracks.map((track: any) => ({
      name: track.name,
      artist: track.artist.name,
      images: track.image.map((img: any) => img['#text']),
    }));
  } catch (error) {
    console.error("Error fetching similar tracks from Last.fm:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  let retries = 0;
  let requestBody;

  try {
    requestBody = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { song } = requestBody;

  if (!song || typeof song !== "string") {
    console.error("Invalid song input:", song);
    return Response.json({ error: "Invalid song input" }, { status: 400 });
  }

  console.log("Received song:", song);

  const [artist, trackName] = song.split(' - ');

  if (!artist || !trackName) {
    console.error("Invalid song format:", song);
    return Response.json({ error: "Invalid song format. Expected 'Artist - Track'" }, { status: 400 });
  }

  while (retries <= MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1} to generate playlist`);

      const similarTracks = await getSimilarTracks(artist, trackName);
      console.log("Similar tracks:", similarTracks);

      let accessToken: string;
      try {
        accessToken = await getSpotifyAccessToken();
      } catch (error) {
        console.error("Failed to get Spotify access token:", error);
        throw new Error("Failed to authenticate with Spotify");
      }

      const playlistWithSpotifyData = await Promise.all(
        similarTracks.map(async (song) => {
          const { spotifyId, trackImage } = await searchSpotifyTrack(song, accessToken);

          return {
            ...song,
            spotifyId,
            images: trackImage ? [trackImage] : song.images,
          };
        })
      );

      console.log("Final playlist:", JSON.stringify(playlistWithSpotifyData, null, 2));

      return Response.json({ playlist: playlistWithSpotifyData });
    } catch (error: unknown) {
      console.error(
        `Error in generate-playlist route (attempt ${retries + 1}):`,
        error
      );
      retries++;

      if (retries > MAX_RETRIES) {
        return Response.json(
          {
            error: "Failed to generate playlist after multiple attempts",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }
  }

  return Response.json({ error: "Unexpected error occurred" }, { status: 500 });
}