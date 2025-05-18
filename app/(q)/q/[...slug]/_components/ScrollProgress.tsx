'use client'

import React from 'react'
import { useScrollProgress } from '@/hooks/useScroll'

const ScrollProgress = () => {
  const progress = useScrollProgress()
  return (
    <div className={`sticky w-full h-1 top-16 bg-gray-200 dark:bg-gray-700 z-50`}>
      <div
        className="h-full bg-blue-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ScrollProgress