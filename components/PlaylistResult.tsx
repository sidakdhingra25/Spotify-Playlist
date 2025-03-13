"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Music, Loader2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

interface Song {
  id: string;
  name: string;
  artist: string;
  album?: string;
  year?: string;
  images?: string[];
  genres?: string[];
  explanation?: string;
  spotifyId?: string;
}

interface PlaylistResultProps {
  playlist: Song[];
  playlistName: string;
}

export default function PlaylistResult({ playlist, playlistName }: PlaylistResultProps) {
  const [copiedAll, setCopiedAll] = useState(false)
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)
  const [playlistCreated, setPlaylistCreated] = useState(false)
  const router = useRouter()

  const copyAllSongs = () => {
    const allSongs = playlist
      .map((song, index) => `${index + 1}. ${song.name} - ${song.artist}`)
      .join("\n")

    navigator.clipboard.writeText(allSongs).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "All songs have been copied to your clipboard.",
      })
    })
  }

  const createSpotifyPlaylist = async () => {
    // Prevent multiple clicks while processing
    if (creatingPlaylist || playlistCreated) {
      return;
    }

    setCreatingPlaylist(true);

    try {
      // Create playlist with retry logic
      let playlistId = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries && !playlistId) {
        try {
          const createResponse = await fetch("/api/spotify/create-playlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: playlistName,
              description: `Playlist created by AI: ${playlistName}`,
            }),
          });

          if (!createResponse.ok) {
            throw new Error(`Failed to create playlist: ${createResponse.status}`);
          }

          const data = await createResponse.json();
          playlistId = data.id;
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error("Maximum retries reached for playlist creation");
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }

      if (!playlistId) {
        throw new Error("Failed to obtain playlist ID");
      }

      // Prepare track URIs
      const trackUris = playlist
        .map((song) => song.spotifyId ? `spotify:track:${song.spotifyId}` : null)
        .filter(Boolean);

      if (trackUris.length === 0) {
        throw new Error("No valid tracks found to add to playlist");
      }

      // Add tracks with retry logic
      let tracksAdded = false;
      retryCount = 0;

      while (retryCount < maxRetries && !tracksAdded) {
        try {
          const addTracksResponse = await fetch(`/api/playlists/${playlistId}/add-tracks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: trackUris,
            }),
          });

          if (!addTracksResponse.ok) {
            throw new Error(`Failed to add tracks: ${addTracksResponse.status}`);
          }

          tracksAdded = true;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error("Maximum retries reached for adding tracks");
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }

      // Only mark as success if both operations completed
      if (playlistId && tracksAdded) {
        setPlaylistCreated(true);
        toast({
          title: "Success",
          description: "Playlist created and tracks added successfully!",
        });
        router.push('/dashboard/ai-playlist');
      }
    } catch (error) {
      console.error("Error creating Spotify playlist:", error);
      toast({
        title: "Error",
        description: error instanceof Error
          ? `Failed to create playlist: ${error.message}`
          : "Failed to create Spotify playlist",
        variant: "destructive",
      });
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <div className="min-h-screen mb-24 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-6 p-4 sm:p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center">
            <Music className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-purple-300" />
            <span className="break-words">{playlistName}</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={copyAllSongs}
              className="w-full sm:w-auto bg-white text-purple-900 border-purple-300 hover:bg-purple-100 transition-colors duration-300 px-4 sm:px-6 py-3 rounded-full font-semibold text-sm sm:text-base"
            >
              {copiedAll ? (
                <Check className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 mr-2 text-purple-900" />
              )}
              {copiedAll ? "Copied!" : "Copy All"}
            </Button>
            <Button
              onClick={createSpotifyPlaylist}
              disabled={creatingPlaylist || playlistCreated}
              className={`${
                playlistCreated
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-500 hover:bg-green-600"
              } text-white font-semibold transition-colors duration-300 px-6 py-2 rounded-full shadow-md`}
            >
              {creatingPlaylist ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : playlistCreated ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Playlist Created
                </>
              ) : (
                "Create Spotify Playlist"
              )}
            </Button>
          </div>
        </div>

        {playlistCreated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8 p-4 bg-green-500 text-white rounded-lg shadow-md text-center"
          >
            <p className="text-lg font-semibold">
              Your Spotify playlist "{playlistName}" has been created successfully!
            </p>
            <p className="mt-2">
              You can now find it in your Spotify account. Enjoy your new playlist!
            </p>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {playlist.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`https://open.spotify.com/track/${song.spotifyId}`}>
              <div className="flex flex-col items-center justify-center text-center bg-[rgba(39,39,39,0.705)] p-2.5 rounded-[30px] sm:rounded-[50px] h-min w-full max-w-[300px] mx-auto">
                <div className="w-full rounded-[30px] sm:rounded-[50px] hover:opacity-65 hover:bg-black/60 transition-all duration-300">
                  <div className="relative aspect-square">
                    <Image
                      src={song.images?.[0] || '/placeholder.svg'}
                      alt={`${song.name} album art`}
                      fill
                      className="object-cover rounded-[30px] sm:rounded-[50px] p-2 sm:p-3"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center text-center p-0">
                  <h3 className="text-[1.225rem] font-semibold my-2 mt-2 mb-1.5 text-white">
                    {song.name}
                  </h3>
                  <p className="text-gray-400 text-xs italic">
                    {song.artist}
                  </p>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

