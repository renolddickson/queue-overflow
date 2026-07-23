"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Github } from "lucide-react"

const LOGO_DATA = [
  {
    name: "Supabase",
    color: "#3ECF8E",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M21.362 9.354H12V.338L2.638 10.646H12V19.662L21.362 9.354Z" />
      </svg>
    ),
    position: { top: "15%", left: "10%" },
    delay: 0,
    duration: 8
  },
  {
    name: "React",
    color: "#61DAFB",
    icon: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" fill="currentColor" className="w-6 h-6">
        <circle cx="0" cy="0" r="2.05" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
    position: { top: "70%", left: "15%" },
    delay: 1,
    duration: 10
  },
  {
    name: "Github",
    color: "#FFFFFF",
    icon: <Github size={24} />,
    position: { top: "25%", left: "75%" },
    delay: 0.5,
    duration: 9
  },
  {
    name: "JavaScript",
    color: "#F7DF1E",
    icon: (
      <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><path d="M0 0h256v256H0V0z" fill="#F7DF1E" /><path d="M67.312 213.932l19.59-11.856c3.78 6.701 7.218 12.371 15.465 12.371 7.905 0 12.89-3.092 12.89-15.12v-81.798h24.057v82.138c0 24.917-14.606 36.259-35.916 36.259-19.245 0-30.416-9.967-36.087-21.996M152.381 211.354l19.588-11.341c5.157 8.421 11.859 14.607 23.715 14.607 9.969 0 16.325-4.984 16.325-11.858 0-8.248-6.53-11.17-17.528-15.98l-6.013-2.58c-17.357-7.387-28.87-16.667-28.87-36.257 0-18.044 13.747-31.792 35.228-31.792 15.294 0 26.292 5.328 34.196 19.247L210.29 147.43c-4.125-7.389-8.591-10.31-15.465-10.31-7.046 0-11.514 4.468-11.514 10.31 0 7.217 4.468 10.14 14.778 14.608l6.014 2.577c20.45 8.765 31.963 17.7 31.963 37.804 0 21.654-17.012 33.51-39.867 33.51-22.339 0-36.774-10.654-43.819-24.574" /></svg>
    ),
    position: { top: "65%", left: "70%" },
    delay: 1.5,
    duration: 11
  }
]

export default function FloatingCharacter() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Decorative Elements (Neon Particles) - Client Only to avoid hydration mismatch */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: 0.2
              }}
              animate={{
                y: ["0%", "100%"],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Character Container */}
      <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
        {/* Neon Glow beneath character */}
        <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />

        {/* Main Character */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotate: [-1, 1, -1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10 w-[90%] h-[90%]"
        >
          <Image
            src="/assets/floating-man-rbg.png"
            alt="3D Floating Character"
            fill
            className="object-contain drop-shadow-[0_0_50px_rgba(30,64,175,0.4)]"
            priority
          />
        </motion.div>

        {/* Spread out Floating Tech Logos */}
        <AnimatePresence>
          {mounted && LOGO_DATA.map((logo) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: [0, 15, -15, 0],
                y: [0, -30, 30, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                opacity: { duration: 0.5, delay: logo.delay },
                scale: { duration: 0.5, delay: logo.delay },
                x: { duration: logo.duration, repeat: Infinity, ease: "easeInOut" },
                y: { duration: logo.duration + 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: logo.duration - 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute pointer-events-none z-20 flex items-center justify-center p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
              style={{
                ...logo.position,
                boxShadow: `0 0 25px ${logo.color}22`,
                color: logo.color
              }}
            >
              <div className="drop-shadow-[0_0_10px_currentColor]">
                {logo.icon}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  )
}
