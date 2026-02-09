'use client'

import React from 'react'
import { ArrowUp } from 'lucide-react'
import { useScroll } from '@/hooks/useScroll'

const GoToTop = () => {
  const { scrollDir, isBeyondThreshold } = useScroll(300)

  const visible = isBeyondThreshold && scrollDir === 'up'

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`fixed right-6 bottom-6 transition-all duration-300 ease-in-out ${
      visible ? 'scale-100 visible' : 'scale-0 invisible'
    }`}>
      <button
        onClick={scrollToTop}
        className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform"
        aria-label="Go to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  )
}

export default GoToTop