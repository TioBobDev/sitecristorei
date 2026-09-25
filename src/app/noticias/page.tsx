import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { getNewsList } from '@/services/actions/site.actions';
import { ClientImage } from '@/components/ClientImage';

export const revalidate = 60; // Revalida a cada minuto

export default async function NoticiasPage() {
  const newsList = await getNewsList();

  return (
    <div className="w-full min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 space-y-12">
        {/* Cabeçalho */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-secondary font-serif text-sm uppercase tracking-widest font-semibold">
            Informativos & Novidades
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-primary dark:text-primary-foreground">
            Portal de Notícias
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            Fique por dentro das realizações sociais, eventos culturais e atividades paroquiais da Cristo Rei.
          </p>
        </div>

        {/* Notícia Destacada (Primeira do Feed, se houver) */}
        {newsList.length > 0 && (
          <div className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 lg:h-[350px]">
            <div className="lg:col-span-5 h-full min-h-[250px] lg:min-h-0 overflow-hidden bg-muted relative">
              {newsList[0].coverImage ? (
                <ClientImage
                  src={newsList[0].coverImage}
                  alt={newsList[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-secondary font-serif text-2xl font-bold">
                  Cristo Rei
                </div>
              )}
            </div>
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-secondary" />
                    {new Date(newsList[0].createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-primary dark:text-primary-foreground leading-tight group-hover:text-secondary transition line-clamp-2">
                  {newsList[0].title}
                </h2>
                {newsList[0].subtitle && (
                  <p className="text-xs md:text-sm text-secondary font-semibold line-clamp-1">
                    {newsList[0].subtitle}
                  </p>
                )}
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium line-clamp-3">
                  {newsList[0].summary}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={`/noticias/${newsList[0].id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-ouro-bianco hover:bg-secondary hover:text-ouro-bianco font-bold text-xs md:text-sm transition cursor-pointer"
                >
                  Ler Notícia Completa <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Feed Grid das Demais Notícias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList.length <= 1 ? (
            newsList.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12 font-medium">
                Nenhuma notícia publicada no momento.
              </div>
            )
          ) : (
            newsList.slice(1).map((news) => (
              <article
                key={news.id}
                className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  {news.coverImage ? (
                    <ClientImage
                      src={news.coverImage}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/30 flex items-center justify-center text-secondary font-serif text-lg font-bold">
                      Cristo Rei
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-secondary" />
                      {new Date(news.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground line-clamp-2 leading-snug group-hover:text-secondary transition">
                      {news.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                  <div>
                    <Link
                      href={`/noticias/${news.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline cursor-pointer"
                    >
                      Leia Mais <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
