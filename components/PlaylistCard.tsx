import { motion } from "framer-motion"

interface PlaylistCardProps {
  image: string
  name: string
  singer: string
  genre: string
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ image, name, singer, genre }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-gray-700"
  >
    <div className="w-full h-48 overflow-hidden">
      <img className="w-full h-full object-cover" src={image} alt={name} />
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <p className="text-sm text-gray-300">{singer}</p>
      <p className="text-xs text-gray-400 mt-1">{genre}</p>
    </div>
  </motion.div>
)

