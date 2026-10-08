'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SejaUmBenfeitorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState('2600px');
  const [showFloatingBar, setShowFloatingBar] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const checkoutUrl = 'https://dompay.com.br/d/y186c1sd';

  // Calcula a altura apropriada para o iframe com base na largura da viewport
  const calculateHeight = useCallback(() => {
    if (typeof window === 'undefined') return '2150px';
    const width = window.innerWidth;

    if (width < 480) {
      return '3580px';
    } else if (width < 640) {
      return '3550px';
    } else if (width < 768) {
      return '3650px';
    } else if (width < 1024) {
      return '2500px';
    } else {
      return '2150px';
    }
  }, []);

  useEffect(() => {
    // Definir altura inicial
    setIframeHeight(calculateHeight());

    const handleResize = () => {
      setIframeHeight(calculateHeight());
    };

    const handleMessage = (event: MessageEvent) => {
      // Se o iframe enviar mensagem de redimensionamento de altura
      if (event.data && typeof event.data === 'object' && event.data.height) {
        setIframeHeight(`${Math.max(event.data.height, 2100)}px`);
      } else if (typeof event.data === 'number' && event.data > 1000) {
        setIframeHeight(`${Math.max(event.data, 2100)}px`);
      }
    };

    const handleScroll = () => {
      // Oculta a barra flutuante quando o usuário chega bem próximo do final
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      
      if (scrollY + windowHeight >= fullHeight - 200) {
        setShowFloatingBar(false);
      } else {
        setShowFloatingBar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('message', handleMessage);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [calculateHeight]);

  // Função para rolar suavemente até o bloco de doação/checkout no mobile
  const scrollToDonation = () => {
    const width = window.innerWidth;
    let targetY = 2200;

    if (width < 480) {
      targetY = 2250;
    } else if (width < 640) {
      targetY = 2200;
    } else if (width < 768) {
      targetY = 2100;
    } else if (width < 1024) {
      targetY = 1600;
    } else {
      targetY = 400;
    }

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full flex-1 flex flex-col bg-[hsl(217,33%,8%)] text-white">

      {/* LOADER */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[hsl(217,33%,8%)] space-y-4 min-h-[600px]">
          <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300 animate-pulse">
            Carregando campanha do DomPay...
          </p>
        </div>
      )}

      {/* IFRAME PRINCIPAL DO DOMPAY */}
      <iframe
        ref={iframeRef}
        src={checkoutUrl}
        title="Checkout DomPay - Seja um Benfeitor"
        className="w-full border-0 block"
        style={{ height: iframeHeight, minHeight: iframeHeight }}
        onLoad={() => setIsLoading(false)}
        allow="payment; clipboard-write; autoplay; camera; microphone"
      />

      {/* BARRA FIXA FLUTUANTE NO MOBILE (LG:HIDDEN) */}
      {showFloatingBar && (
        <div className="fixed inset-x-3 bottom-4 z-40 lg:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-md mx-auto rounded-2xl border border-slate-700/70 bg-slate-900/90 p-2.5 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-3">
            <div className="pl-2">
              <p className="text-xs font-bold text-white leading-tight">
                Exército de Cristo Rei
              </p>
              <p className="text-[11px] text-slate-400">
                A partir de R$ 50/mês
              </p>
            </div>

            <Button
              onClick={scrollToDonation}
              className="h-11 px-5 text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white rounded-xl shadow-md shadow-orange-500/30 cursor-pointer active:scale-95 transition-all"
            >
              <Heart className="h-4 w-4 mr-1.5 fill-current" />
              Contribuir agora
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
