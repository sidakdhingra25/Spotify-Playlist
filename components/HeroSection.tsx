'use client'

import { motion } from "framer-motion"
import { Music2, ArrowRight, Sparkles, Music, Play } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GradientSpinner } from "@/components/ui/gradient-spinner"
import { useEffect, useState } from "react"

interface PlaylistCardProps {
  image: string;
  name: string;
  singer: string;
  genre: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ image, name, singer, genre }) => (
  <div className="flex flex-col rounded-lg shadow-lg overflow-hidden border-4">
    <div className="w-full h-86 overflow-hidden">
      <img className="w-full h-full object-cover" src={image} alt={name} />
    </div>
    <div className="p-4 border-t-4">
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <p className="text-sm text-gray-300">{singer}</p>
      <p className="text-xs text-gray-400 mt-1">{genre}</p>
    </div>
  </div>
);
const DisplaySection = () => (
  <section className="py-16 mt-[-260px]">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <p className="text-sm font-semibold text-green-500 uppercase tracking-wide">Personalized Playlist Preview</p>
      <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
        Discover Your Perfect Musical Journey
      </h2>
      <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
        Ready to explore a world of music tailored just for you? 🎵✨ Input your favorite songs and artists, and watch as AI crafts the perfect playlist that resonates with your unique taste. It's like having a personal DJ who knows exactly what you love! 🎧🤖
      </p>
    </div>
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <PlaylistCard
        image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Biting%20Lip.png"
        name="Your Vibe"
        singer="A mix of your favorite artists and similar sounds"
        genre="Personalized Mix"
      />
      <PlaylistCard
        image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Eyes.png"
        name="New Discoveries"
        singer="Fresh tracks based on your music preferences"
        genre="Discovery"
      />
      <PlaylistCard
        image="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Star.png"
        name="Genre Fusion"
        singer="Blending your favorite genres for a unique experience"
        genre="Mixed"
      />
    </div>
  </div>
</section>

);

export default function HeroSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/spotify/user")
      if (response.ok) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    window.location.href = "/api/spotify/auth"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GradientSpinner />
      </div>
    )
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard/ai-playlist"
    return null
  }

  return (
    <main className="hero-section">
      {/* <div className="absolute inset-0 overflow-hidden w-full h-full hidden sm:block ">
        {[
          {
            src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Rain.png",
            alt: "Cloud with Rain",
            className: "absolute w-28 h-28 left-[30%] top-[20%] animate-bounce",
          },
          {
            src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Lightning%20and%20Rain.png",
            alt: "Cloud with Lightning and Rain",
            className: "absolute w-28 h-28 right-[5%] top-[30%] animate-bounce delay-100",
          },
          {
            src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Snow.png",
            alt: "Cloud with Snow",
            className: "absolute w-28 h-28 left-[10%] bottom-[30%] animate-bounce delay-200",
          },
          {
            src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Sun%20Behind%20Rain%20Cloud.png",
            alt: "Sun Behind Rain Cloud",
            className: "absolute w-28 h-28 right-[20%] bottom-[20%] animate-bounce delay-300",
          },
        ].map((emoji, index) => (
          <img
            key={index}
            className={emoji.className}
            src={emoji.src}
            alt={emoji.alt}
          />
        ))}
      </div> */}

      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2" />
        </div>

        <div className="relative container mx-auto px-4 py-16 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white flex items-center justify-center">
              Spoti<span className="text-green-500">find</span>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block ml-2"
              >
                <img
                  className="w-20 h-20 ml-3"
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fire.png"
                  alt="Sun Behind Small Cloud"
                />
              </motion.span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-300">
            Create your perfect playlist by simply sharing your favorite songs and artists. Let our AI craft a personalized musical journey just for you.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-row justify-center gap-4 mt-6 sm:mt-8"
            >
              <Button
                onClick={handleLogin}
                size="lg"
                variant="outline"
                className="border-white bg-black hover:bg-white hover:text-black text-white font-semibold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full transition-colors duration-200"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-black hover:bg-white hover:text-black text-white font-semibold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full transition-colors duration-200"
                asChild
              >
                <Link href="#how-it-works">
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Learn more
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <DisplaySection />
    </main>
  )
}

