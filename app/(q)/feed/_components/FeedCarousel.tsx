"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { FeedData } from "@/types/api"

interface FeedCarouselProps {
  featuredDocs: FeedData[]
}

export default function FeedCarousel({ featuredDocs }: FeedCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (featuredDocs.length === 0) return

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredDocs.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [featuredDocs.length])

  if (featuredDocs.length === 0) return null

  return (
    <div className="group relative w-full h-[260px] sm:h-[320px] md:h-[380px] rounded-[32px] overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl bg-black mt-12">
      <div 
        className="flex h-full transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {featuredDocs.map((doc, index) => (
          <div 
            key={doc.id}
            className="min-w-full h-full flex flex-col justify-center px-5 sm:px-12 lg:px-16 relative overflow-hidden"
            style={{
              background: index === 0 ? "linear-gradient(135deg, #0e7490 0%, #155e75 100%)" : 
                          index === 1 ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" :
                          index === 2 ? "linear-gradient(135deg, #7c2d12 0%, #44403c 100%)" :
                          index === 3 ? "linear-gradient(135deg, #164e63 0%, #083344 100%)" :
                          "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
            }}
          >
            {/* Simple static background pattern for performance */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-6">
              {index === 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} className="text-yellow-400" /> Featured Collection
                </div>
              )}
              
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-white leading-tight">
                {doc.title}
              </h2>
              <p className="text-white/80 text-xs sm:text-base md:text-lg line-clamp-2 max-w-lg leading-relaxed">
                {doc.description || "In-depth explorations and comprehensive guides for the modern tech stack."}
              </p>
              
              <div className="flex items-center gap-2 sm:gap-4 pt-4 sm:pt-6">
                <Link href={`/${doc.type}/${doc.id}`}>
                  <button className="bg-white text-slate-900 hover:bg-slate-50 rounded-xl px-4 sm:px-8 h-9 sm:h-12 text-[10px] sm:text-sm font-black shadow-lg transition-all active:scale-95 whitespace-nowrap">
                    See details
                  </button>
                </Link>
                <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 sm:px-6 h-9 sm:h-12 text-[10px] sm:text-sm font-black transition-all whitespace-nowrap">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Visual Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {featuredDocs.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === activeSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Side Controls */}
      <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setActiveSlide((prev) => (prev - 1 + featuredDocs.length) % featuredDocs.length)}
          className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 flex items-center justify-center text-white pointer-events-auto transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => setActiveSlide((prev) => (prev + 1) % featuredDocs.length)}
          className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 flex items-center justify-center text-white pointer-events-auto transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}
