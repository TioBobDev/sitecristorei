'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SejaUmBenfeitorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState('2400px');
  const checkoutUrl = 'https://dompay.com.br/d/y186c1sd';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Se o iframe enviar mensagem de redimensionamento de altura
      if (event.data && typeof event.data === 'object' && event.data.height) {
        setIframeHeight(`${Math.max(event.data.height, 2200)}px`);
      } else if (typeof event.data === 'number') {
        setIframeHeight(`${Math.max(event.data, 2200)}px`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="relative w-full flex-1 flex flex-col bg-background pt-2 pb-6 scroll-mt-20">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm space-y-4 min-h-[800px]">
          <Loader2 className="h-10 w-10 text-secondary animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">
            Carregando formulário DomPay...
          </p>
        </div>
      )}

      <iframe
        src={checkoutUrl}
        title="Checkout DomPay - Seja um Benfeitor"
        className="w-full border-0 transition-all duration-300"
        style={{ height: iframeHeight, minHeight: '2400px' }}
        onLoad={() => setIsLoading(false)}
        allow="payment; clipboard-write; autoplay; camera; microphone"
      />
    </div>
  );
}
