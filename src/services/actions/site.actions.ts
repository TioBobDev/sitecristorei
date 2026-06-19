'use server';

import { prisma } from '@/lib/prisma';

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    });
    if (!settings) {
      // Retorna fallback padrão se o seed ainda não tiver sido executado
      return {
        id: 'singleton',
        name: 'Associação Cristo Rei do Universo',
        logoUrl: '/images/logo.png',
        address: 'Praça Cristo Rei, 100 - Centro',
        phone: '(11) 3456-7890',
        email: 'contato@cristorei.org',
        facebook: '',
        instagram: '',
        youtube: '',
        pixKey: 'contato@cristorei.org',
        pixBank: 'Banco do Brasil',
        pixReceiver: 'Associação Cristo Rei do Universo',
        pixQrCode: '',
        thankYouMsg: 'Muito obrigado por sua doação e por fazer parte do Exército de Cristo Rei!',
      };
    }
    return settings;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return null;
  }
}

export async function getCarouselImages() {
  try {
    return await prisma.carouselImage.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  } catch (error) {
    console.error('Erro ao buscar carrossel:', error);
    return [];
  }
}

export async function getLatestNews(limit = 3) {
  try {
    return await prisma.news.findMany({
      where: { status: 'Published' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return [];
  }
}

export async function getNewsList() {
  try {
    return await prisma.news.findMany({
      where: { status: 'Published' },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Erro ao buscar lista de notícias:', error);
    return [];
  }
}

export async function getNewsBySlug(slug: string) {
  try {
    return await prisma.news.findUnique({
      where: { id: slug }, // ou por slug se adicionarmos
      // Como na modelagem padrão usamos slug, mas no prisma mapeamos slug, vamos buscar por slug se houver ou id
    });
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    return null;
  }
}

export async function getNewsByRealSlug(slug: string) {
  // Busca específica pelo slug no schema
  try {
    // Para simplificar, buscamos pelo campo title normalizado se o slug não existir,
    // mas nosso schema News tem title. Mapearemos busca por slug se criarmos a busca.
    // Como no schema News não temos explicitamente um campo 'slug' (no schema que criamos,
    // apenas Posts e Categories têm 'slug', enquanto News tem id/title/subtitle/content/coverImage.
    // Vamos buscar pelo ID ou faremos correspondência por slug).
    return await prisma.news.findFirst({
      where: {
        OR: [
          { id: slug },
          { title: { equals: slug.replace(/-/g, ' ') } }
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    return null;
  }
}

export async function getProjects() {
  try {
    return await prisma.project.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        projects: true,
        posts: {
          where: { status: 'Published' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return null;
  }
}

export async function getPostBySlug(slug: string) {
  try {
    return await prisma.post.findUnique({
      where: { slug },
      include: { author: true, category: true },
    });
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}
