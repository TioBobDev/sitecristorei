import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sitecristorei.org';

  // Rotas estáticas básicas
  const staticRoutes = ['', '/noticias', '/contato', '/login'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    // Busca categorias
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });
    
    // Busca posts
    const posts = await prisma.post.findMany({
      select: { slug: true, category: { select: { slug: true } }, updatedAt: true },
    });

    // Busca notícias
    const news = await prisma.news.findMany({
      select: { id: true, updatedAt: true },
    });

    const categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/projetos/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const postRoutes = posts.map((post) => ({
      url: `${baseUrl}/projetos/${post.category.slug}/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const newsRoutes = news.map((item) => ({
      url: `${baseUrl}/noticias/${item.id}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...postRoutes, ...newsRoutes];
  } catch (error) {
    console.warn('Banco offline ao gerar sitemap; gerando apenas rotas estáticas.', error);
    return staticRoutes;
  }
}
