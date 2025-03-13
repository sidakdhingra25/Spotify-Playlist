'use client'

import { motion } from "framer-motion"

export const WaveAnimation = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-0 right-0 h-24 opacity-20"
          style={{
            background: "linear-gradient(transparent, #22c55e)",
            transform: "translateY(50%)",
          }}
          animate={{
            y: ["0%", "100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  )
}

