'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slide {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
}

interface HomeCarouselProps {
  slides: Slide[];
}

export function HomeCarousel({ slides }: HomeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedSlideIds, setFailedSlideIds] = useState<Record<string, boolean>>({});

  const validSlides = (slides || []).filter((s) => s.imageUrl && !failedSlideIds[s.id]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? validSlides.length - 1 : prev - 1));
  }, [validSlides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === validSlides.length - 1 ? 0 : prev + 1));
  }, [validSlides.length]);

  // Autoplay do carrossel
  useEffect(() => {
    if (validSlides.length <= 1) return;
    const interval = setInterval(nextSlide, 6000); // Muda a cada 6 segundos
    return () => clearInterval(interval);
  }, [validSlides.length, nextSlide]);

  // Se não houver banners cadastrados ou válidos, NÃO MOSTRA NADA
  if (!validSlides || validSlides.length === 0) {
    return null;
  }

  // Ajusta currentIndex se ultrapassar o tamanho após falha de imagem
  const safeIndex = currentIndex >= validSlides.length ? 0 : currentIndex;

  return (
    <div 
      className="relative w-full max-h-[555px] overflow-hidden bg-primary group"
      style={{ aspectRatio: '1920/555' }}
    >
      {/* Slides */}
      {validSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Imagem de Fundo (sem banners fakes de fallback) */}
          <img
            src={slide.imageUrl}
            alt={slide.title || 'Banner'}
            className="w-full h-full object-cover"
            onError={() => {
              // Marca o slide com erro para removê-lo em vez de exibir imagem fake
              setFailedSlideIds((prev) => ({ ...prev, [slide.id]: true }));
            }}
          />

          {/* Conteúdo do Slide */}
          <div className="absolute inset-0 z-25 flex items-end justify-center pb-8 sm:pb-12 md:pb-16 p-4 sm:p-6 text-center hidden sm:flex">
            <div className="max-w-3xl text-primary-foreground space-y-2 sm:space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {slide.title && (
                <h2 className="font-serif text-xl sm:text-3xl md:text-5xl font-bold text-ouro-bianco tracking-tight">
                  {slide.title}
                </h2>
              )}
              {slide.description && (
                <p className="text-xs sm:text-sm md:text-lg text-primary-foreground/90 font-medium max-w-2xl mx-auto leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {slide.description}
                </p>
              )}
              {slide.linkUrl && (
                <div className="pt-1 sm:pt-3">
                  <Button render={<Link href={slide.linkUrl || ''} />} className="bg-ouro text-carmo hover:bg-ouro-bianco hover:text-carmo text-xs sm:text-sm font-bold cursor-pointer transition-colors duration-300 shadow-md h-8 sm:h-10 px-3 sm:px-4">
                    Saiba Mais
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Controles do Carrossel (Se houver mais de 1 slide) */}
      {slides.length > 1 && (
        <>
          {/* Botão Esquerdo */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-secondary hover:text-primary transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Botão Direito */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-secondary hover:text-primary transition opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicadores (Pontinhos) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'bg-secondary w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
