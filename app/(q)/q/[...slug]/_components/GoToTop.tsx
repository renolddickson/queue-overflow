'use client'
import { ArrowUp } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const GoToTop = () => {
  const [visible, setVisible] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = () => {
    const currentScrollY = window.scrollY
    
    // Show button when scrolled down at least 300px AND scrolling up
    if (currentScrollY > 300 && currentScrollY < lastScrollY) {
      setVisible(true)
    } else {
      setVisible(false)
    }
    
    setLastScrollY(currentScrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div 
      className={`fixed right-6 bottom-6 transition-all duration-300 ease-in-out ${
        visible 
          ? 'scale-100 visible' 
          : 'scale-0 invisible'
      }`}
    >
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