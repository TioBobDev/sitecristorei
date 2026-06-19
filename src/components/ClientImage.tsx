'use client';

import React, { useState, useEffect } from 'react';

interface ClientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ClientImage({ src, fallbackSrc = '/images/logo.png', alt, className, ...props }: ClientImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      src={currentSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
}
