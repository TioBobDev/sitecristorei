'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ClientImage } from '@/components/ClientImage';

interface ProjectGalleryProps {
  images: string[];
  projectName: string;
}

export function ProjectGallery({ images, projectName }: ProjectGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Fecha o modal ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowRight' && activeIdx !== null) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && activeIdx !== null) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx]);

  // Impede scroll do body quando o modal está aberto
  useEffect(() => {
    if (activeIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeIdx]);

  const handlePrev = () => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : (prev as number) - 1));
  };

  const handleNext = () => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : (prev as number) + 1));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-secondary" />
        Galeria do Projeto
      </h3>

      {/* Grid de Miniaturas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            onClick={() => setActiveIdx(index)}
            className="aspect-square rounded-xl overflow-hidden border border-border bg-muted relative cursor-pointer group shadow-sm hover:shadow-md transition duration-300"
          >
            <ClientImage
              src={imgUrl}
              alt={`Imagem ${index + 1} de ${projectName}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              fallbackSrc="/images/logo.png"
            />
            {/* Hover overlay com efeito visual */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-white/90 text-primary dark:bg-primary/90 dark:text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                Ampliar
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
          {/* Botão de Fechar */}
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            aria-label="Fechar Galeria"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Botão Anterior */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 z-40 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer select-none"
              aria-label="Imagem Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Imagem Ampliada */}
          <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center">
            <img
              src={images[activeIdx]}
              alt={`Imagem ${activeIdx + 1} ampliada de ${projectName}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
            />
            {/* Paginação textual */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {activeIdx + 1} de {images.length}
            </div>
          </div>

          {/* Botão Próximo */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 z-40 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer select-none"
              aria-label="Próxima Imagem"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
