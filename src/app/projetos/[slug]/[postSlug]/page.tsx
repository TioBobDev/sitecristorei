import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, User, Image as ImageIcon } from 'lucide-react';
import { getPostBySlug } from '@/services/actions/site.actions';
import { ClientImage } from '@/components/ClientImage';

interface Params {
  params: Promise<{ slug: string; postSlug: string }>;
}

export const revalidate = 60; // Revalida a cada minuto

export default async function ProjectPostDetailPage({ params }: Params) {
  const { slug, postSlug } = await params;
  const post = await getPostBySlug(postSlug);

  if (!post || post.category.slug !== slug) {
    notFound();
  }

  const gallery = (post.gallery as string[]) || [];

  return (
    <article className="w-full min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        {/* Botão de Voltar para a Categoria */}
        <div>
          <Link
            href={`/projetos/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para {post.category.name}
          </Link>
        </div>

        {/* Cabeçalho do Post */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-secondary" />
              {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4 text-secondary" />
              Por {post.author.name}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-primary dark:text-primary-foreground leading-tight">
            {post.title}
          </h1>
          <p className="text-base text-muted-foreground font-medium italic">
            {post.summary}
          </p>
        </div>

        {/* Imagem de Capa */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted border border-border relative">
          {post.coverImage ? (
            <ClientImage
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/30 flex items-center justify-center text-secondary font-serif text-2xl font-bold">
              {post.category.name}
            </div>
          )}
        </div>

        {/* Conteúdo HTML do Post */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 font-medium leading-relaxed space-y-4 text-base md:text-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Galeria de Imagens do Post */}
        {gallery && gallery.length > 0 && (
          <div className="pt-8 border-t border-border space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-secondary" />
              Galeria do Post
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((imgUrl, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden border border-border bg-muted relative hover:opacity-95 transition"
                >
                  <ClientImage
                    src={imgUrl}
                    alt={`Imagem ${index + 1} de ${post.title}`}
                    className="w-full h-full object-cover"
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
