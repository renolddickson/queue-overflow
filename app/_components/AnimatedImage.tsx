import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  animationClass?: string;
}

const AnimatedImage = ({ src, alt, className, animationClass = "animate-fade-in" }: AnimatedImageProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {loaded ? (
        <img 
          src={src} 
          alt={alt} 
          className={cn("object-cover w-full h-full", animationClass)} 
        />
      ) : (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default AnimatedImage;