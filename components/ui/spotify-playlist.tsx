'use client'

import { motion } from "framer-motion"
import { Music } from 'lucide-react'

const playlistItems = [
  "Discover Weekly",
  "Release Radar",
  "Daily Mix 1",
  "Your Top Songs 2023",
  "Chill Vibes",
]

export const SpotifyPlaylist = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-[#121212] rounded-lg p-4 w-full max-w-sm mx-auto mt-8"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
          <Music className="text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-white font-bold">Your AI Playlist</h3>
          <p className="text-gray-400 text-sm">Created by Spotifind</p>
        </div>
      </div>
      <ul className="space-y-2">
        {playlistItems.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <span className="mr-2">{index + 1}.</span>
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
