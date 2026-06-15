'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 1. Busca dados do Dashboard do Benfeitor
export async function getBenefactorDashboardData(userId: string) {
  try {
    const benefactor = await prisma.benefactor.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        donations: true,
      },
    });

    if (!benefactor) {
      return null;
    }

    // Calcular doações
    const confirmedDonations = benefactor.donations.filter(
      (d) => d.status === 'CONFIRMED'
    );
    const totalDonated = confirmedDonations.reduce((sum, d) => sum + d.amount, 0);

    // Encontrar última doação
    const sortedDonations = [...benefactor.donations].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastDonation = sortedDonations[0] || null;

    // Buscar Comunicados Administrativos (Últimos 10)
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      name: benefactor.user.name,
      email: benefactor.user.email,
      militaryRank: benefactor.militaryRank,
      joinDate: benefactor.joinDate,
      totalDonated,
      lastDonation,
      announcements,
    };
  } catch (error) {
    console.error('Erro ao carregar dashboard do benfeitor:', error);
    return null;
  }
}

// 2. Busca histórico de doações com filtros opcionais
export async function getBenefactorDonations(
  userId: string,
  filters: { year?: string; month?: string; status?: string } = {}
) {
  try {
    const benefactor = await prisma.benefactor.findUnique({
      where: { userId },
    });

    if (!benefactor) return [];

    const whereClause: any = {
      benefactorId: benefactor.id,
    };

    if (filters.status && filters.status !== 'ALL') {
      whereClause.status = filters.status;
    }

    // Filtros de período
    if (filters.year || filters.month) {
      const year = filters.year ? parseInt(filters.year) : new Date().getFullYear();
      let startMonth = 0;
      let endMonth = 11;

      if (filters.month && filters.month !== 'ALL') {
        const m = parseInt(filters.month);
        startMonth = m;
        endMonth = m;
      }

      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59, 999);

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return await prisma.donation.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Erro ao buscar doações do benfeitor:', error);
    return [];
  }
}

// 3. Atualiza dados de endereço, telefone e senha (CPF bloqueado)
export async function updateBenefactorProfile(
  userId: string,
  data: {
    phone?: string;
    address?: string;
    currentPassword?: string;
    newPassword?: string;
  }
) {
  try {
    const benefactor = await prisma.benefactor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!benefactor) {
      return { success: false, error: 'Benfeitor não encontrado.' };
    }

    // Se houver alteração de senha
    let updatedPasswordHash: string | undefined;

    if (data.newPassword) {
      if (!data.currentPassword) {
        return { success: false, error: 'Senha atual é obrigatória para alteração de senha.' };
      }

      const isPasswordCorrect = await bcrypt.compare(
        data.currentPassword,
        benefactor.user.passwordHash
      );

      if (!isPasswordCorrect) {
        return { success: false, error: 'Senha atual incorreta.' };
      }

      updatedPasswordHash = await bcrypt.hash(data.newPassword, 10);
    }

    // Executa atualizações
    await prisma.$transaction(async (tx) => {
      // Atualizar dados do Benfeitor
      await tx.benefactor.update({
        where: { userId },
        data: {
          phone: data.phone || benefactor.phone,
          address: data.address || benefactor.address,
        },
      });

      // Atualizar senha se fornecida
      if (updatedPasswordHash) {
        await tx.user.update({
          where: { id: userId },
          data: { passwordHash: updatedPasswordHash },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar cadastro:', error);
    return { success: false, error: error.message || 'Falha ao atualizar cadastro.' };
  }
}
