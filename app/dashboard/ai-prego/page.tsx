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
  const [inputArtist, setInputArtist] = useState("")
  const [debouncedInputSong] = useDebounce(inputSong, 300)
  const [debouncedInputArtist] = useDebounce(inputArtist, 300)
  const [songResults, setSongResults] = useState<Song[]>([])
  const [artistResults, setArtistResults] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestions, setSuggestions] = useState<Song[]>([])
  const [showSongDropdown, setShowSongDropdown] = useState(false)
  const [showArtistDropdown, setShowArtistDropdown] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [playlist, setPlaylist] = useState<Song[]>([])
  const [selectedArtist, setSelectedArtist] = useState<Song | null>(null)
  const [readyToGenerate, setReadyToGenerate] = useState(false)
  const [userPlaylistName, setUserPlaylistName] = useState("")
  const songDropdownRef = useRef<HTMLDivElement>(null)
  const artistDropdownRef = useRef<HTMLDivElement>(null)

  const allSongs: Song[] = [
    { id: "1", name: "Bohemian Rhapsody", artist: "The Beatles", album: "A Night at the Opera", image: "/placeholder.svg?height=64&width=64"},
    { id: "2", name: "Purple Rain", artist: "Madonna", album: "Purple Rain", image: "/placeholder.svg?height=64&width=64"},
    { id: "3", name: "Sweet Child O' Mine", artist: "Led Zeppelin", album: "Appetite for Destruction", image: "/placeholder.svg?height=64&width=64"}
  ]

  useEffect(() => {
    setSuggestions(allSongs)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (songDropdownRef.current && !songDropdownRef.current.contains(event.target as Node)) {
        setShowSongDropdown(false)
      }
      if (artistDropdownRef.current && !artistDropdownRef.current.contains(event.target as Node)) {
        setShowArtistDropdown(false)
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
    } else if (!debouncedInputSong) {
      setSongResults([])
      setShowSongDropdown(false)
    }
  }, [debouncedInputSong, selectedSong])

  useEffect(() => {
    if (debouncedInputArtist && !selectedArtist) {
      searchArtist(debouncedInputArtist)
    } else if (!debouncedInputArtist) {
      setArtistResults([])
      setShowArtistDropdown(false)
    }
  }, [debouncedInputArtist, selectedArtist])

  const searchSongs = async (query: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=5`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const formattedSongs: Song[] = data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        image: track.album.images[2]?.url || "/placeholder.svg?height=64&width=64"
      }))
      setSongResults(formattedSongs)
      setShowSongDropdown(true)
    } catch (error) {
      console.error("Error searching songs:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const searchArtist = async (query: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/spotify/search/artist?q=${encodeURIComponent(query)}&type=artist&limit=5`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const formattedArtists: Song[] = data.artists.items.map((artist: any) => ({
        id: artist.id,
        name: "",
        artist: artist.name,
        album: "",
        image: artist.images[2]?.url || "/placeholder.svg?height=64&width=64"
      }))
      setArtistResults(formattedArtists)
      setShowArtistDropdown(true)
    } catch (error) {
      console.error("Error searching artists:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song)
    setInputSong(song.name)
    setShowSongDropdown(false)

    // Only generate playlist if both selections are made
    if (selectedArtist) {
      setReadyToGenerate(true)
      generatePlaylist(song, selectedArtist)
    }
  }

  const handleArtistSelect = (artist: Song) => {
    setSelectedArtist(artist)
    setInputArtist(artist.artist)
    setShowArtistDropdown(false)

    // Only generate playlist if both selections are made
    if (selectedSong) {
      setReadyToGenerate(true)
      generatePlaylist(selectedSong, artist)
    }
  }

  const generatePlaylist = async (song: Song, artist: Song) => {
    // Both selections are already guaranteed at this point
    setLoading(true)
    setError("")
    setPlaylist([])

    try {
      const response = await fetch("/api/generate-prego", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songName: song.name,
          artistName: artist.artist
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPlaylist(data.playlist)
      setUserPlaylistName(`Playlist inspired by "${song.name}" & "${artist.artist}"`)
    } catch (error) {
      console.error("Error generating playlist:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetSelections = () => {
    setSelectedSong(null)
    setSelectedArtist(null)
    setInputSong("")
    setInputArtist("")
    setReadyToGenerate(false)
    setPlaylist([])
  }

  return (
    <div className="w-full h-screen fixed inset-0 backdrop-blur-xl overflow-hidden flex items-center justify-center p-4 lg:mt-24">
      <ScrollArea className="h-full w-full">
        <div className="container mx-auto px-4 py-8">
          <main className="flex flex-col items-center justify-center text-center mt-8 md:mt-32">
            <h1 className="text-4xl md:text-6xl font-bold text-white flex flex-col md:flex-row items-center justify-center gap-2 mt-24 lg:mt-2">
              <span>Generate Playlists</span>
              <span className="text-green-400">from your favourites</span>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-4 md:mt-0"
              >
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Musical%20Notes.png" alt="Musical Notes" className="w-12 h-12 md:w-16 md:h-16"/>
              </motion.span>
            </h1>
            <div className="w-full max-w-2xl mt-8">
              <div className="flex gap-4">
                {/* Song Input and Dropdown */}
                <div className="relative flex-1" ref={songDropdownRef}>
                  <Input
                    type="text"
                    placeholder="Enter a song name"
                    value={inputSong}
                    onChange={(e) => {
                      setInputSong(e.target.value)
                      if (selectedSong) {
                        setSelectedSong(null)
                      }
                    }}
                    onFocus={() => setShowSongDropdown(true)}
                    className="w-full bg-green-900/20 text-green-100 pl-4 pr-20 py-4 md:py-6 rounded-xl text-base md:text-lg placeholder-green-600 focus-visible:ring-1 focus-visible:ring-green-500 focus:border-green-500"
                  />
                  {showSongDropdown && songResults.length > 0 && !selectedSong && (
                    <ScrollArea className="absolute z-20 w-full mt-2 bg-green-900/90 rounded-xl shadow-lg" style={{ maxHeight: '300px' }}>
                      {songResults.map((song) => (
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
                    </ScrollArea>
                  )}
                </div>

                {/* Artist Input and Dropdown */}
                <div className="relative flex-1" ref={artistDropdownRef}>
                  <Input
                    type="text"
                    placeholder="Enter an artist name"
                    value={inputArtist}
                    onChange={(e) => {
                      setInputArtist(e.target.value)
                      if (selectedArtist) {
                        setSelectedArtist(null)
                      }
                    }}
                    onFocus={() => setShowArtistDropdown(true)}
                    className="w-full bg-green-900/20 text-green-100 pl-4 pr-20 py-4 md:py-6 rounded-xl text-base md:text-lg placeholder-green-600 focus-visible:ring-1 focus-visible:ring-green-500 focus:border-green-500"
                  />
                  {showArtistDropdown && artistResults.length > 0 && !selectedArtist && (
                    <ScrollArea className="absolute z-20 w-full mt-2 bg-green-900/90 rounded-xl shadow-lg" style={{ maxHeight: '300px' }}>
                      {artistResults.map((artist) => (
                        <button
                          key={artist.id}
                          className="w-full text-left px-4 py-3 hover:bg-green-700/50 flex items-center space-x-3"
                          onClick={() => handleArtistSelect(artist)}
                        >
                          <img src={artist.image} alt={artist.artist} className="w-8 h-8 md:w-10 md:h-10 rounded-md" />
                          <div>
                            <p className="text-green-100 font-semibold text-sm md:text-base">{artist.artist}</p>
                          </div>
                        </button>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 mt-4 mb-7 text-sm md:text-base">{error}</p>}

            {loading && readyToGenerate && (
              <div className="mt-4 text-green-400">
                Generating playlist...
              </div>
            )}

            {/* Status message when only one selection is made */}
            {(selectedSong || selectedArtist) && !readyToGenerate && !loading && (
              <div className="mt-4 text-green-300">
                {selectedSong && !selectedArtist ? "Now select an artist" : !selectedSong && selectedArtist ? "Now select a song" : ""}
              </div>
            )}

            {playlist.length > 0 && (
              <PlaylistResult playlist={playlist} playlistName={userPlaylistName} />
            )}

            {!selectedSong && !loading && songResults.length === 0 && artistResults.length === 0 && (
              <div className="mt-8 w-full max-w-2xl">
                <div className="w-full">
                  <h3 className="text-lg md:text-xl font-semibold mb-4 text-green-100">
                    Try these suggestions:
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                    {suggestions.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleSongSelect(song)}
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