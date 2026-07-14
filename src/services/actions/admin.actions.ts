'use server';

import { prisma } from '@/lib/prisma';
import { DonationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Função auxiliar de log administrativo
async function logAction(userId: string, action: string, details?: string) {
  try {
    await prisma.adminLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (err) {
    console.error('Erro ao salvar log administrativo:', err);
  }
}

// 1. Visão Geral (Dashboard)
export async function getAdminDashboardData() {
  try {
    const totalAssociados = await prisma.benefactor.count();
    const totalNoticias = await prisma.news.count();
    const totalCategorias = await prisma.category.count();
    const totalPostagens = await prisma.post.count();

    const sumDonations = await prisma.donation.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true },
    });

    const totalArrecadado = sumDonations._sum.amount || 0.0;

    // Buscar logs recentes (últimos 5)
    const recentLogs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } },
    });

    return {
      totalAssociados,
      totalNoticias,
      totalCategorias,
      totalPostagens,
      totalArrecadado,
      recentLogs,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard administrativo:', error);
    return {
      totalAssociados: 0,
      totalNoticias: 0,
      totalCategorias: 0,
      totalPostagens: 0,
      totalArrecadado: 0,
      recentLogs: [],
    };
  }
}

// --- CRUD NOTÍCIAS ---
export async function getNewsForAdmin() {
  return await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });
}

export async function createNews(
  adminId: string,
  data: { title: string; subtitle?: string; summary: string; content: string; coverImage?: string }
) {
  const news = await prisma.news.create({
    data: {
      ...data,
      authorId: adminId,
      status: 'Published',
    },
  });
  await logAction(adminId, 'CRIAR_NOTICIA', `Criou notícia: ${news.title} (${news.id})`);
  return { success: true, data: news };
}

export async function updateNews(
  adminId: string,
  newsId: string,
  data: { title: string; subtitle?: string; summary: string; content: string; coverImage?: string }
) {
  const news = await prisma.news.update({
    where: { id: newsId },
    data,
  });
  await logAction(adminId, 'EDITAR_NOTICIA', `Editou notícia ID: ${newsId}`);
  return { success: true, data: news };
}

export async function deleteNews(adminId: string, newsId: string) {
  await prisma.news.delete({ where: { id: newsId } });
  await logAction(adminId, 'DELETAR_NOTICIA', `Deletou notícia ID: ${newsId}`);
  return { success: true };
}

// --- CRUD CATEGORIAS ---
export async function getCategoriesForAdmin() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(
  adminId: string,
  data: { name: string; description?: string; bannerUrl?: string }
) {
  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-'); // Troca espaços por hífen

  const category = await prisma.category.create({
    data: {
      ...data,
      slug,
    },
  });
  await logAction(adminId, 'CRIAR_CATEGORIA', `Criou categoria: ${category.name} (${category.slug})`);
  return { success: true, data: category };
}

export async function updateCategory(
  adminId: string,
  catId: string,
  data: { name: string; description?: string; bannerUrl?: string }
) {
  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  const category = await prisma.category.update({
    where: { id: catId },
    data: {
      ...data,
      slug,
    },
  });
  await logAction(adminId, 'EDITAR_CATEGORIA', `Editou categoria ID: ${catId}`);
  return { success: true, data: category };
}

export async function deleteCategory(adminId: string, catId: string) {
  await prisma.category.delete({ where: { id: catId } });
  await logAction(adminId, 'DELETAR_CATEGORIA', `Deletou categoria ID: ${catId}`);
  return { success: true };
}

// --- CRUD POSTS DE PROJETOS ---
export async function getPostsForAdmin() {
  return await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });
}

export async function createPost(
  adminId: string,
  data: { title: string; summary: string; content: string; coverImage?: string; categoryId: string }
) {
  try {
    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const post = await prisma.post.create({
      data: {
        ...data,
        slug,
        authorId: adminId,
        status: 'Published',
      },
    });
    await logAction(adminId, 'CRIAR_POST_PROJETO', `Criou post: ${post.title} (${post.slug})`);
    return { success: true, data: post };
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return { success: false, error: 'Falha ao criar postagem no banco de dados.' };
  }
}

export async function updatePost(
  adminId: string,
  postId: string,
  data: { title: string; summary: string; content: string; coverImage?: string; categoryId: string }
) {
  try {
    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        ...data,
        slug,
      },
    });
    await logAction(adminId, 'EDITAR_POST_PROJETO', `Editou post ID: ${postId}`);
    return { success: true, data: post };
  } catch (error) {
    console.error('Erro ao editar post:', error);
    return { success: false, error: 'Falha ao atualizar postagem no banco de dados.' };
  }
}

export async function deletePost(adminId: string, postId: string) {
  try {
    await prisma.post.delete({ where: { id: postId } });
    await logAction(adminId, 'DELETAR_POST_PROJETO', `Deletou post ID: ${postId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    return { success: false, error: 'Falha ao deletar postagem no banco de dados.' };
  }
}

// --- CRUD CARROSSEL ---
export async function getCarouselImagesForAdmin() {
  return await prisma.carouselImage.findMany({
    orderBy: { order: 'asc' },
  });
}

export async function createCarouselImage(
  adminId: string,
  data: { title?: string; description?: string; imageUrl: string; linkUrl?: string; order: number }
) {
  const slide = await prisma.carouselImage.create({ data });
  await logAction(adminId, 'CRIAR_CARROSSEL', `Criou slide ID: ${slide.id}`);
  return { success: true, data: slide };
}

export async function updateCarouselImage(
  adminId: string,
  slideId: string,
  data: { title?: string; description?: string; imageUrl: string; linkUrl?: string; order: number; active: boolean }
) {
  const slide = await prisma.carouselImage.update({
    where: { id: slideId },
    data,
  });
  await logAction(adminId, 'EDITAR_CARROSSEL', `Editou slide ID: ${slideId}`);
  return { success: true, data: slide };
}

export async function deleteCarouselImage(adminId: string, slideId: string) {
  await prisma.carouselImage.delete({ where: { id: slideId } });
  await logAction(adminId, 'DELETAR_CARROSSEL', `Deletou slide ID: ${slideId}`);
  return { success: true };
}

// --- CRUD COMUNICADOS ---
export async function getAnnouncementsForAdmin() {
  return await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });
}

export async function createAnnouncement(
  adminId: string,
  data: { title: string; content: string }
) {
  const ann = await prisma.announcement.create({
    data: {
      ...data,
      authorId: adminId,
    },
  });
  await logAction(adminId, 'CRIAR_COMUNICADO', `Criou comunicado: ${ann.title}`);
  return { success: true, data: ann };
}

export async function updateAnnouncement(
  adminId: string,
  annId: string,
  data: { title: string; content: string }
) {
  const ann = await prisma.announcement.update({
    where: { id: annId },
    data,
  });
  await logAction(adminId, 'EDITAR_COMUNICADO', `Editou comunicado ID: ${annId}`);
  return { success: true, data: ann };
}

export async function deleteAnnouncement(adminId: string, annId: string) {
  await prisma.announcement.delete({ where: { id: annId } });
  await logAction(adminId, 'DELETAR_COMUNICADO', `Deletou comunicado ID: ${annId}`);
  return { success: true };
}

// --- READ BENFEITORES ---
export async function getBenefactorsForAdmin() {
  return await prisma.benefactor.findMany({
    orderBy: { joinDate: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      donations: {
        where: { status: 'CONFIRMED' },
        select: { amount: true },
      },
    },
  });
}

// --- CRUD DOAÇÕES ---
export async function getDonationsForAdmin() {
  return await prisma.donation.findMany({
    orderBy: { date: 'desc' },
    include: {
      benefactor: {
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function createDonation(
  adminId: string,
  data: { benefactorId: string; amount: number; status: DonationStatus; date: string }
) {
  const donation = await prisma.donation.create({
    data: {
      benefactorId: data.benefactorId,
      amount: data.amount,
      status: data.status,
      date: new Date(data.date),
    },
  });
  await logAction(adminId, 'CRIAR_DOACAO_MANUAL', `Lançou doação manual de R$${data.amount} para benfeitor ID: ${data.benefactorId}`);
  return { success: true, data: donation };
}

export async function updateDonationStatus(
  adminId: string,
  donationId: string,
  status: DonationStatus
) {
  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: { status },
  });
  await logAction(adminId, 'EDITAR_STATUS_DOACAO', `Alterou status da doação ${donationId} para ${status}`);
  return { success: true, data: donation };
}

export async function deleteDonation(adminId: string, donationId: string) {
  await prisma.donation.delete({ where: { id: donationId } });
  await logAction(adminId, 'DELETAR_DOACAO', `Deletou doação ID: ${donationId}`);
  return { success: true };
}

// --- CONFIGURAÇÕES ---
export async function updateSiteSettings(
  adminId: string,
  data: {
    name: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    pixKey?: string;
    pixQrCode?: string;
    pixBank?: string;
    pixReceiver?: string;
    thankYouMsg?: string;
  }
) {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: {
      id: 'singleton',
      ...data,
    },
  });
  await logAction(adminId, 'ATUALIZAR_CONFIGURACOES', `Atualizou configurações institucionais`);
  return { success: true, data: settings };
}

// 6. Logs de Auditoria
export async function getAdminLogs() {
  try {
    return await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limitar aos últimos 100 logs para fins de performance
      include: { user: { select: { name: true } } },
    });
  } catch (error) {
    console.error('Erro ao buscar logs administrativos:', error);
    return [];
  }
}

// --- GERENCIAMENTO DE ADMINISTRADORES ---

export async function getAdminUsers(adminId: string) {
  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || (requester.role !== 'ADMIN' && requester.role !== 'EDITOR')) {
      throw new Error('Não autorizado.');
    }

    return await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'EDITOR'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuários administrativos:', error);
    return [];
  }
}

export async function createAdminUser(
  adminId: string,
  data: { name: string; email: string; role: 'ADMIN' | 'EDITOR'; passwordRaw: string }
) {
  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role !== 'ADMIN') {
      return { success: false, error: 'Acesso negado. Apenas administradores podem criar novos usuários.' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

    const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash: hashedPassword,
      },
    });

    await logAction(adminId, 'CRIAR_ADMINISTRADOR', `Criou usuário administrativo: ${user.name} (${user.email}) - Papel: ${user.role}`);
    
    return { success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role } };
  } catch (error: any) {
    console.error('Erro ao criar usuário administrativo:', error);
    return { success: false, error: error.message || 'Falha ao processar o cadastro.' };
  }
}

export async function deleteAdminUser(adminId: string, targetUserId: string) {
  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role !== 'ADMIN') {
      return { success: false, error: 'Acesso negado. Apenas administradores podem excluir usuários.' };
    }

    if (adminId === targetUserId) {
      return { success: false, error: 'Você não pode excluir a sua própria conta ativa.' };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    await logAction(adminId, 'DELETAR_ADMINISTRADOR', `Excluiu usuário administrativo: ${targetUser.name} (${targetUser.email})`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir usuário administrativo:', error);
    return { success: false, error: error.message || 'Falha ao processar exclusão.' };
  }
}

