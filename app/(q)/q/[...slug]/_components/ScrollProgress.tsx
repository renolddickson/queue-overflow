"use client";

import React, { useEffect, useState } from 'react';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;

      if (totalScrollable === 0) {
        setScrollProgress(100);
        return;
      }

      const progressPercent = (scrollTop / totalScrollable) * 100;
      setScrollProgress(progressPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Progress bar container using Tailwind CSS
    <div className="sticky top-16 w-full h-2 bg-gray-200 z-50">
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ScrollProgress;
