'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Heart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SejaUmBenfeitorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [, setLoadCount] = useState(0);
  const [iframeHeight, setIframeHeight] = useState('1980px');
  const [showFloatingBar, setShowFloatingBar] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const checkoutUrl = 'https://dompay.com.br/d/y186c1sd';

  // Calcula a altura apropriada para o iframe com base na viewport
  // Ajustada com precisão para acomodar o formulário de Cartão de Crédito (e PIX)
  // eliminando sobras excessivas de espaço em branco no mobile e desktop.
  const calculateHeight = useCallback(() => {
    if (typeof window === 'undefined') {
      return isCheckoutStep ? '1980px' : '2100px';
    }
    const width = window.innerWidth;

    // Etapa de Checkout (acomoda dados pessoais, campos do cartão, endereço completo de cobrança e resumo para PIX e Cartão)
    if (isCheckoutStep) {
      if (width < 480) {
        return '2220px'; // Modo mobile pequeno (iPhone/Galaxy padrão)
      } else if (width < 640) {
        return '2150px'; // Modo mobile
      } else if (width < 1024) {
        return '2020px'; // Modo tablet
      } else {
        return '1980px'; // Modo computador (desktop)
      }
    }

    // Etapa 1: Apresentação da campanha (Landing Page completa da campanha)
    if (width < 480) {
      return '2550px';
    } else if (width < 640) {
      return '2500px';
    } else if (width < 768) {
      return '2450px';
    } else if (width < 1024) {
      return '2250px';
    } else {
      return '2100px';
    }
  }, [isCheckoutStep]);

  // Checa se veio com query param para ir direto ao checkout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('step') === 'checkout') {
        setIsCheckoutStep(true);
        setShowFloatingBar(false);
      }
    }
  }, []);

  useEffect(() => {
    // Definir altura inicial ou após mudança de etapa
    setIframeHeight(calculateHeight());

    const handleResize = () => {
      setIframeHeight(calculateHeight());
    };

    const handleMessage = (event: MessageEvent) => {
      // Se o iframe enviar mensagem de redimensionamento de altura
      if (event.data && typeof event.data === 'object' && event.data.height) {
        const received = Number(event.data.height);
        if (!isNaN(received) && received > 400) {
          setIframeHeight(`${received + 20}px`);
        }
      } else if (typeof event.data === 'number' && event.data > 400) {
        setIframeHeight(`${event.data + 20}px`);
      }
    };

    const handleScroll = () => {
      if (isCheckoutStep) {
        setShowFloatingBar(false);
        return;
      }

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
  }, [calculateHeight, isCheckoutStep]);

  // Manipula o evento de load do iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadCount((prev) => {
      const nextCount = prev + 1;
      // Ao carregar pela 2ª vez (ou subsequente), o iframe navegou da landing page para a página de checkout do DomPay
      if (nextCount >= 2) {
        setIsCheckoutStep(true);
        setShowFloatingBar(false);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return nextCount;
    });
  };

  // Permite ao usuário voltar para a visualização da campanha caso deseje
  const handleResetToCampaign = () => {
    setIsLoading(true);
    setIsCheckoutStep(false);
    setLoadCount(1);
    if (iframeRef.current) {
      iframeRef.current.src = checkoutUrl;
    }
  };

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
    <div className="relative w-full flex-1 flex flex-col bg-[hsl(217,33%,8%)] text-white pb-4">

      {/* BARRA SUPERIOR QUANDO EM ETAPA DE CHECKOUT */}
      {isCheckoutStep && (
        <div className="w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 transition-all">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs md:text-sm">
            <button
              type="button"
              onClick={handleResetToCampaign}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition cursor-pointer group py-1 px-2.5 rounded-lg hover:bg-slate-800/60"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform text-orange-400" />
              <span>Voltar para a campanha</span>
            </button>

            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs">Checkout Seguro DomPay</span>
            </div>
          </div>
        </div>
      )}

      {/* LOADER */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[hsl(217,33%,8%)] space-y-4 min-h-[600px]">
          <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300 animate-pulse">
            {isCheckoutStep ? 'Carregando checkout seguro...' : 'Carregando campanha do DomPay...'}
          </p>
        </div>
      )}

      {/* IFRAME PRINCIPAL DO DOMPAY */}
      <iframe
        ref={iframeRef}
        src={checkoutUrl}
        title="Checkout DomPay - Seja um Benfeitor"
        scrolling="auto"
        className="w-full border-0 block transition-[height] duration-300 ease-in-out"
        style={{ height: iframeHeight, minHeight: iframeHeight }}
        onLoad={handleIframeLoad}
        allow="payment; clipboard-write; autoplay; camera; microphone"
      />

      {/* BARRA FIXA FLUTUANTE NO MOBILE (LG:HIDDEN) */}
      {showFloatingBar && !isCheckoutStep && (
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
