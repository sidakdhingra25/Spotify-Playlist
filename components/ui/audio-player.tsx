import { Play } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function AudioPlayer() {
  return (
    <Button
      variant="secondary"
      className="relative h-10 sm:h-12 pl-3 sm:pl-4 pr-10 sm:pr-12 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105 animate-fade-in"
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-[2px] sm:gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] sm:w-0.5 bg-white/80 animate-pulse"
              style={{
                height: `${Math.random() * 16 + 4}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
        <div className="absolute right-1.5 sm:right-2 rounded-full bg-white p-1.5 sm:p-2">
            
          <Play className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
        </div>
      </div>
    </Button>
  )
}

