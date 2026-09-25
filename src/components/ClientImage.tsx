'use client';

import React, { useState, useEffect } from 'react';

interface ClientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ClientImage({
  src,
  fallbackSrc,
  alt,
  className = '',
  ...props
}: ClientImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(!src);
  }, [src]);

  if (hasError || !currentSrc) {
    if (fallbackSrc && fallbackSrc !== '/images/logo.png') {
      return (
        <img
          src={fallbackSrc}
          alt={alt || 'Imagem'}
          className={className}
          onError={() => setHasError(true)}
          {...props}
        />
      );
    }

    // Placeholder elegante, centralizado e proporcional (evita cortes e distorção da logo)
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-muted/40 p-6 select-none ${className}`}
        style={{ minHeight: '160px' }}
      >
        <img
          src="/images/logo.png"
          alt="Associação Cristo Rei do Universo"
          className="max-h-12 w-auto max-w-[70%] object-contain opacity-35 filter grayscale contrast-125 pointer-events-none"
        />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || 'Imagem'}
      className={className}
      onError={() => {
        setHasError(true);
      }}
      {...props}
    />
  );
}
