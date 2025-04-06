"use client";
import React, { CSSProperties, useState } from 'react';

interface CustomImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
}

const Image: React.FC<CustomImageProps> = ({
  fill = false,
  style,
  src,
  alt = '',
  onError,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  const computedStyle: CSSProperties = fill
    ? { ...style, width: '100%', height: '100%', objectFit: 'cover' }
    : style || {};

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('onError triggered');

    if (onError) {
      onError(event);
    } else {
      setCurrentSrc('/assets/no-image.jpg');
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      style={computedStyle}
      onError={handleError}
      {...rest}
    />
  );
};

export default Image;
