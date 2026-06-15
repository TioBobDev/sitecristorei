import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { getNewsByRealSlug } from '@/services/actions/site.actions';

interface Params {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Revalida a cada minuto

export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params;
  const news = await getNewsByRealSlug(slug);

  if (!news) {
    notFound();
  }

  return (
    <article className="w-full min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        {/* Botão de Voltar */}
        <div>
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Notícias
          </Link>
        </div>

        {/* Cabeçalho do Artigo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Calendar className="h-4 w-4 text-secondary" />
            <span>
              {new Date(news.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-primary dark:text-primary-foreground leading-tight">
            {news.title}
          </h1>
          {news.subtitle && (
            <p className="text-lg md:text-xl text-secondary font-serif font-semibold">
              {news.subtitle}
            </p>
          )}
        </div>

        {/* Imagem de Capa */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted border border-border relative">
          {news.coverImage ? (
            <img
              src={news.coverImage}
              alt={news.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo.png';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/30 flex items-center justify-center text-secondary font-serif text-2xl font-bold">
              Associação Cristo Rei
            </div>
          )}
        </div>

        {/* Conteúdo HTML do Artigo */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 font-medium leading-relaxed space-y-4 text-base md:text-lg"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Galeria de Imagens (se houver) */}
        {news.gallery && news.gallery.length > 0 && (
          <div className="pt-8 border-t border-border space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-secondary" />
              Galeria de Fotos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {news.gallery.map((imgUrl, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden border border-border bg-muted relative hover:opacity-95 transition"
                >
                  <img
                    src={imgUrl}
                    alt={`Imagem ${index + 1} de ${news.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/logo.png';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
