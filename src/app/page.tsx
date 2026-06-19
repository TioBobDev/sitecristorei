import React from 'react';
import Link from 'next/link';
import { Award, BookOpen, Music, Activity, Calendar, FileText, ArrowRight, Heart } from 'lucide-react';
import { HomeCarousel } from '@/components/HomeCarousel';
import { DonationButton } from '@/components/DonationButton';
import { ClientImage } from '@/components/ClientImage';
import {
  getCarouselImages,
  getLatestNews,
  getCategories,
} from '@/services/actions/site.actions';

export const revalidate = 60; // Revalida a cada 60 segundos (ISR)

export default async function HomePage() {
  const slides = await getCarouselImages();
  const latestNews = await getLatestNews(3);
  const categories = await getCategories();

  // Mapeia ícones para os projetos sociais com base no slug
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'reforco-pedagogico':
        return <BookOpen className="h-8 w-8 text-secondary" />;
      case 'aula-de-musica':
        return <Music className="h-8 w-8 text-secondary" />;
      case 'aula-de-informatica':
        return <Award className="h-8 w-8 text-secondary" />;
      case 'pilates':
        return <Activity className="h-8 w-8 text-secondary" />;
      case 'festa-junina':
        return <Calendar className="h-8 w-8 text-secondary" />;
      case 'noite-cultural':
        return <FileText className="h-8 w-8 text-secondary" />;
      default:
        return <Award className="h-8 w-8 text-secondary" />;
    }
  };

  return (
    <div className="relative w-full min-h-screen pb-12">
      {/* 1. Carrossel de Imagens */}
      <HomeCarousel slides={slides} />

      {/* 2. Hero Principal */}
      <section className="py-20 bg-primary text-primary-foreground border-b border-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-4xl space-y-6">
          <span className="text-ouro font-serif text-lg md:text-xl font-semibold tracking-wider block uppercase">
            Aliste-se nesta Missão
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Associação Cristo Rei do Universo
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto font-medium leading-relaxed">
            Transformando vidas através da educação, cultura, fé e solidariedade.
          </p>
          <div className="pt-4 flex justify-center">
            <DonationButton className="h-14 px-8 text-base font-bold bg-ouro text-carmo hover:bg-ouro-bianco hover:text-carmo transition shadow-lg shadow-ouro/15 cursor-pointer">
              Faça Parte do Exército de Cristo Rei
            </DonationButton>
          </div>
        </div>
      </section>

      {/* 3. Projetos Sociais em Destaque */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-foreground">
              Nossos Projetos Sociais
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto">
              Desenvolvemos oficinas contínuas e ações culturais que promovem a inclusão e o crescimento da nossa comunidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-10 font-medium">
                Nenhum projeto social cadastrado no momento.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-secondary/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/5 dark:bg-primary/20 flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-secondary">
                      {getIcon(cat.slug)}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {cat.description || 'Oficina social dedicada ao aprendizado e integração de membros da comunidade Cristo Rei.'}
                    </p>
                  </div>
                  <div className="pt-6">
                    <Link
                      href={`/projetos/${cat.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:underline cursor-pointer"
                    >
                      Conhecer Projeto <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Últimas Notícias */}
      <section className="py-20 bg-muted/30 border-t border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-primary dark:text-primary-foreground">
                Últimas Notícias
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium max-w-md">
                Acompanhe o impacto de suas doações e as novidades das nossas ações sociais.
              </p>
            </div>
            <div className="text-center md:text-right shrink-0">
              <Link
                href="/noticias"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-sm font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition cursor-pointer"
              >
                Ver Todas as Notícias <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-10 font-medium">
                Nenhuma notícia publicada recentemente.
              </div>
            ) : (
              latestNews.map((news) => (
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
                        fallbackSrc="/images/logo.png"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/30 flex items-center justify-center text-secondary font-serif text-lg font-bold">
                        Cristo Rei
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {new Date(news.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground line-clamp-2 leading-snug group-hover:text-secondary transition">
                        {news.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed">
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
      </section>

      {/* 5. Seção de Chamada para Ação Final (Seja Benfeitor) */}
      <section id="seja-benfeitor" className="py-20 bg-background text-center max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center mx-auto text-secondary">
          <Heart className="h-6 w-6 fill-current animate-pulse" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary dark:text-primary-foreground tracking-tight">
          Aliste-se no Exército de Cristo Rei
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto font-medium">
          Ao escolher uma modalidade de patrocínio militar social, você ajuda diretamente na manutenção de insumos e na contratação de professores voluntários que cuidam das nossas crianças e idosos.
        </p>
        <div className="pt-2">
          <DonationButton className="h-12 px-6 bg-primary text-primary-foreground hover:bg-ouro hover:text-carmo transition font-bold cursor-pointer" />
        </div>
      </section>

      {/* Botão de Doação Fixo (FAB) */}
      <DonationButton isFloating={true} />
    </div>
  );
}
