import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { NextResponse } from 'next/server';

interface Song {
  name: string;
  artist: string;
  album?: string;
  images?: string[];
  spotifyId?: string;
}

interface RequestBody {
  songName: string;
  artistName: string;
}

const MAX_RETRIES = 4;
const TIMEOUT = 120000; // 120 seconds

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

async function searchSpotifyTrack(song: Song): Promise<{ spotifyId?: string; trackImage?: string }> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    console.error("Failed to get Spotify access token");
    return {};
  }

  const query = `${song.name} ${song.artist}`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1`;

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

    if (data.tracks.items.length > 0) {
      const track = data.tracks.items[0];
      const trackId = track.id;
      const trackImage = track.album.images[0]?.url;
      return { spotifyId: trackId, trackImage };
    }
  } catch (error) {
    console.error("Error searching Spotify:", error);
  }

  return {};
}

function sanitizeJSONString(jsonString: string): string {
  const jsonStart = jsonString.indexOf('[');
  const jsonEnd = jsonString.lastIndexOf(']') + 1;
  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error("Invalid JSON structure");
  }
  return jsonString.slice(jsonStart, jsonEnd);
}

export async function POST(request: Request) {
  let retries = 0;
  let requestBody: RequestBody;

  try {
    requestBody = await request.json();
  } catch (error) {
    console.error("Invalid JSON in request body:", error);
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  while (retries <= MAX_RETRIES) {
    try {
      const { songName, artistName } = requestBody;

      if (!songName || !artistName) {
        return NextResponse.json(
          { error: "Please provide both song name and artist name" },
          { status: 400 }
        );
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `You are an advanced music recommendation engine utilizing AI to generate personalized playlists. The user has provided the following inputs:

- ${songName}
- ${artistName}

Your task is to create a playlist that reflects the user's musical tastes while considering the context of the provided song and artist. The playlist should include a variety of genres, ensuring that the tracks are not directly correlated with the given inputs.

Please follow these guidelines:
1. Generate a playlist containing 10 songs.
2. Ensure the songs are diverse in genre and style, exploring lesser-known tracks as well as popular ones.
3. Each track should be real and available on major streaming platforms like Spotify.
4. Format the response as a JSON array with objects containing: name, artist. Return only valid JSON without any additional text or formatting.
For each song, provide:
        - Song title
        - Artist name
Important Instructions:
- Avoid including tracks from mainstream charts unless they fit perfectly within the context.
- Make sure to provide unique entries for each track.`;

      const result = (await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), TIMEOUT)
        ),
      ])) as GenerateContentResult;

      const responseText = result.response.text();
      const cleanedResponse = sanitizeJSONString(responseText.trim());

      let playlist: Song[];
      try {
        playlist = JSON.parse(cleanedResponse);
        if (!Array.isArray(playlist)) {
          throw new Error("Parsed result is not an array");
        }
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError);
        console.error("Problematic JSON string:", cleanedResponse);
        throw new Error("Failed to parse AI-generated playlist");
      }

      if (playlist.length === 0) {
        throw new Error("Generated playlist is empty");
      }

      playlist = playlist
        .filter((song): song is Song => song && typeof song === "object")
        .map((song) => ({
          name: song.name || "Unknown",
          artist: song.artist || "Unknown",
          album: song.album,
        }));

      if (playlist.length === 0) {
        throw new Error("Failed to generate a valid playlist after filtering");
      }

      const playlistWithSpotifyIds = await Promise.all(
        playlist.map(async (song) => {
          const { spotifyId, trackImage } = await searchSpotifyTrack(song);
          return {
            ...song,
            spotifyId,
            images: trackImage ? [...(song.images || []), trackImage] : song.images,
          };
        })
      );

      return NextResponse.json({ playlist: playlistWithSpotifyIds });
    } catch (error: unknown) {
      console.error(
        `Error in generate-playlist route (attempt ${retries + 1}):`,
        error
      );
      retries++;

      if (retries > MAX_RETRIES) {
        return NextResponse.json(
          {
            error: "Failed to generate playlist after multiple attempts",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
}