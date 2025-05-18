'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Tracks vertical scroll position and direction.
 * @param threshold - Y-position threshold to flag beyond threshold
 */
export function useScroll(threshold: number = 0) {
  const [scrollY, setScrollY] = useState(0)
  const [scrollDir, setScrollDir] = useState<'up' | 'down'>('up')
  const lastYRef = useRef(0)

  useEffect(() => {
    lastYRef.current = window.scrollY

    const handle = () => {
      const currY = window.scrollY
      setScrollY(currY)

      if (Math.abs(currY - lastYRef.current) > 10) {
        setScrollDir(currY > lastYRef.current ? 'down' : 'up')
        lastYRef.current = Math.max(currY, 0)
      }
    }

    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return {
    scrollY,
    scrollDir,
    isBeyondThreshold: scrollY > threshold,
  }
}

/**
 * Tracks scroll progress as a percentage of total scrollable height.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const tickingRef = useRef(false)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (scrollTop / total) * 100 : 100)
      tickingRef.current = false
    }

    const handle = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(updateProgress)
        tickingRef.current = true
      }
    }

    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return progress
}
