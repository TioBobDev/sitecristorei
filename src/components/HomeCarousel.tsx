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

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Autoplay do carrossel
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, 6000); // Muda a cada 6 segundos
    return () => clearInterval(interval);
  }, [slides.length, nextSlide]);

  if (slides.length === 0) {
    // Carrossel padrão/fallback caso não haja imagens cadastradas
    return (
      <div className="relative w-full h-[200px] sm:h-[300px] md:h-[500px] bg-gradient-to-r from-primary to-secondary/60 flex items-center justify-center text-center p-6 border-b border-secondary/20">
        <div className="max-w-2xl text-primary-foreground space-y-2 sm:space-y-4">
          <h2 className="font-serif text-xl sm:text-3xl md:text-5xl font-bold text-ouro-bianco">
            Associação Cristo Rei do Universo
          </h2>
          <p className="text-xs sm:text-sm md:text-lg text-primary-foreground/90 font-medium line-clamp-2 sm:line-clamp-none">
            Transformando vidas através da educação, cultura, fé e solidariedade.
          </p>
          <div className="pt-1 sm:pt-2">
            <Button render={<Link href="#seja-benfeitor" />} className="bg-secondary text-primary hover:bg-secondary/90 text-xs sm:text-sm font-bold cursor-pointer h-8 sm:h-10">
              Faça Parte do Exército de Cristo Rei
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[200px] sm:h-[350px] md:h-[500px] lg:h-[550px] overflow-hidden bg-primary group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Imagem de Fundo */}
          <img
            src={slide.imageUrl}
            alt={slide.title || 'Banner'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/carousel/hero-1.jpg';
            }}
          />

          {/* Conteúdo do Slide */}
          <div className="absolute inset-0 z-25 flex items-end justify-center pb-8 sm:pb-12 md:pb-16 p-4 sm:p-6 text-center">
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
