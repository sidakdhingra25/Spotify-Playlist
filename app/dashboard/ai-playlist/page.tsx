"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { motion } from "framer-motion"
import PlaylistResult from "@/components/PlaylistResult"

interface Song {
  id: string
  name: string
  artist: string
  album: string
  image: string
}

export default function ScrollableHeroSection() {
  const [inputSong, setInputSong] = useState("")
  const [debouncedInputSong] = useDebounce(inputSong, 300)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestions, setSuggestions] = useState<Song[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [playlist, setPlaylist] = useState<Song[]>([])
  const [userPlaylistName, setUserPlaylistName] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const allSongs: Song[] = [
    { id: "1", name: "Billie Jean", artist: "Michael Jackson", album: "Thriller", image: "/placeholder.svg?height=64&width=64" },
    { id: "2", name: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind", image: "/placeholder.svg?height=64&width=64" },
    { id: "3", name: "Like a Rolling Stone", artist: "Bob Dylan", album: "Highway 61 Revisited", image: "/placeholder.svg?height=64&width=64" },
  ]

  useEffect(() => {
    setSuggestions(allSongs)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (debouncedInputSong && !selectedSong) {
      searchSongs(debouncedInputSong)
    } else {
      setSongs([])
      setShowDropdown(false)
    }
  }, [debouncedInputSong, selectedSong])

  const searchSongs = async (query: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=5`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      const formattedSongs: Song[] = data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        image: track.album.images[2]?.url || "/placeholder.svg?height=64&width=64"
      }))
      setSongs(formattedSongs)
      setShowDropdown(true)
    } catch (error) {
      console.error("Error searching songs:", error)
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song)
    setInputSong(`${song.name} - ${song.artist}`)
    setShowDropdown(false)

    setLoading(true)
    setError("")
    setPlaylist([])

    try {
      const response = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song: `${song.name} - ${song.artist}` }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      setPlaylist(data.playlist)
      setUserPlaylistName(`Playlist inspired by "${song.name}"`)
    } catch (error) {
      console.error("Error generating playlist:", error)
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen fixed inset-0 backdrop-blur-xl overflow-hidden flex items-center justify-center p-4 lg:mt-24">
      <ScrollArea className="h-full w-full">
        <div className="container mx-auto px-4 py-8">
          <main className="flex flex-col items-center justify-center text-center mt-8 md:mt-32">
            <h1 className="text-4xl md:text-6xl font-bold text-white flex flex-col md:flex-row items-center justify-center gap-2 mt-24 lg:mt-2">
              <span>Generate Playlists</span>
              <span className="text-green-400">in Seconds</span>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-4 md:mt-0"
              >
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Musical%20Notes.png" alt="Musical Notes" className="w-12 h-12 md:w-16 md:h-16"/>
              </motion.span>
            </h1>
            <div className="w-full max-w-2xl mt-8">
              <div className="relative" ref={dropdownRef}>
                <Input
                  type="text"
                  placeholder="Enter a song name"
                  value={inputSong}
                  onChange={(e) => {
                    setInputSong(e.target.value)
                    setSelectedSong(null)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-green-900/20 text-green-100 pl-4 pr-20 py-4 md:py-6 rounded-xl text-base md:text-lg placeholder-green-600 focus-visible:ring-1 focus-visible:ring-green-500 focus:border-green-500"
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-green-400" />
                  </div>
                )}
                {showDropdown && songs.length > 0 && !selectedSong && (
                  <div className="absolute z-10 w-full mt-2 bg-green-900/90 rounded-xl shadow-lg max-h-60 md:max-h-80 overflow-auto">
                    {songs.map((song) => (
                      <button
                        key={song.id}
                        className="w-full text-left px-4 py-3 hover:bg-green-700/50 flex items-center space-x-3"
                        onClick={() => handleSongSelect(song)}
                      >
                        <img src={song.image} alt={song.name} className="w-8 h-8 md:w-10 md:h-10 rounded-md" />
                        <div>
                          <p className="text-green-100 font-semibold text-sm md:text-base">{song.name}</p>
                          <p className="text-green-300 text-xs md:text-sm">{song.artist}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 mt-4 mb-7 text-sm md:text-base">{error}</p>}

            {loading && (
              <div className="mt-4 text-green-400">
                Generating playlist...
              </div>
            )}

            {playlist.length > 0 && (
              <PlaylistResult playlist={playlist} playlistName={userPlaylistName} />
            )}

            {!selectedSong && !loading && songs.length === 0 && (
              <div className="mt-8 w-full max-w-2xl">
                <div className="w-full">
                  <h3 className="text-lg md:text-xl font-semibold mb-4 text-green-100">
                    Try these suggestions:
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                    {suggestions.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => setInputSong(song.name)}
                        className="bg-green-700 hover:bg-green-600 text-green-100 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm transition-colors duration-200"
                      >
                        {song.name} - {song.artist}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </ScrollArea>
    </div>
  )
}

