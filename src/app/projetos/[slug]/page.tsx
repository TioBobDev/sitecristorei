import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowRight } from 'lucide-react';
import { getCategoryBySlug } from '@/services/actions/site.actions';
import { ClientImage } from '@/components/ClientImage';
import { ProjectGallery } from '@/components/ProjectGallery';

interface Params {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Revalida a cada minuto

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Coleta todas as imagens de capa dos posts para criar uma galeria de fotos dinâmica da categoria
  const galleryImages = category.posts
    .map((post) => post.coverImage)
    .filter((img): img is string => !!img);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Banner Superior da Categoria */}
      <div className="relative w-full h-[250px] md:h-[380px] bg-primary">
        <div className="absolute inset-0 bg-black/60 z-10" />
        {category.bannerUrl ? (
          <ClientImage
            src={category.bannerUrl}
            alt={category.name}
            className="w-full h-full object-cover"
            fallbackSrc="/images/carousel/hero-1.jpg"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary" />
        )}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center">
          <div className="max-w-3xl text-primary-foreground space-y-3">
            <span className="text-secondary font-serif text-xs md:text-sm uppercase tracking-widest font-bold">
              Projeto Social
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo e Posts */}
      <div className="container mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Lado Esquerdo: Feed de Postagens/Posts */}
        <div className="lg:col-span-8 space-y-8">
          <h3 className="font-serif text-2xl font-bold text-primary dark:text-primary-foreground pb-2 border-b border-border">
            Posts
          </h3>

          {category.posts.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 font-medium text-center bg-muted/20 rounded-xl border border-dashed border-border">
              Nenhuma postagem realizada neste projeto ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {category.posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition duration-200 group"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    {post.coverImage ? (
                      <ClientImage
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        fallbackSrc="/images/logo.png"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center text-secondary font-bold text-xs">
                        Cristo Rei
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-secondary" />
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-primary dark:text-primary-foreground group-hover:text-secondary transition line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                        {post.summary}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/projetos/${category.slug}/${post.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary hover:underline cursor-pointer"
                      >
                        Ver Detalhes <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito: Descrição e Galeria */}
        <div className="lg:col-span-4 space-y-12">
          {/* Sobre o Projeto */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Sobre o Projeto
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
              {category.description || 'Este projeto é mantido através de doações e do esforço voluntário de membros da comunidade, fornecendo apoio e inserção comunitária.'}
            </p>
          </div>

          {/* Projetos/Subações Associados */}
          {category.projects && category.projects.length > 0 && (
            <div className="space-y-6 pt-4">
              <h3 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground">
                Iniciativas de {category.name}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {category.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3"
                  >
                    <h4 className="font-serif text-lg font-bold text-secondary">{proj.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Galeria de Fotos Interativa */}
          {galleryImages.length > 0 && (
            <ProjectGallery images={galleryImages} projectName={category.name} />
          )}
        </div>
      </div>
    </div>
  );
}
