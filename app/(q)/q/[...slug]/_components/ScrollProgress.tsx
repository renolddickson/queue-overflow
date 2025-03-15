"use client";

import React, { useEffect, useState } from 'react';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Use querySelector to find the scrollable section in the DOM.
    const section = document.querySelector('#content-container');
    
    if (!section) return; // If the element isn't found, exit early.

    const handleScroll = () => {
      // Calculate total scrollable height.
      const totalScrollable = section.scrollHeight - section.clientHeight;
      if (totalScrollable === 0) {
        setScrollProgress(100);
        return;
      }
      const progressPercent = (section.scrollTop / totalScrollable) * 100;
      setScrollProgress(progressPercent);
    };

    // Add the scroll event listener.
    section.addEventListener('scroll', handleScroll);

    // Clean up the event listener on unmount.
    return () => section.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Progress bar container using Tailwind CSS
    <div className="w-full h-2 bg-gray-200 z-50">
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ScrollProgress;
