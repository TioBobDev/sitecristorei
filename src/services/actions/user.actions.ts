'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerBenefactor(data: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string;
  militaryRank: string;
  passwordHash: string;
}) {
  try {
    // 1. Validar e-mail único
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return { success: false, error: 'Este e-mail já está cadastrado em nosso portal.' };
    }

    // 2. Validar CPF único
    const existingCPF = await prisma.benefactor.findUnique({
      where: { cpf: data.cpf.replace(/[^\d]/g, '') },
    });
    if (existingCPF) {
      return { success: false, error: 'Este CPF já está cadastrado em nosso portal.' };
    }

    // 3. Hash da senha
    const hashed = await bcrypt.hash(data.passwordHash, 10);

    // 4. Executar transação no Prisma para garantir atomicidade
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário com perfil BENEFACTOR
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: hashed,
          role: 'BENEFACTOR',
        },
      });

      // Mapear valores por patente militar
      const rankValues: Record<string, number> = {
        'Coronel': 100.0,
        'Tenente-Coronel': 90.0,
        'Major': 80.0,
        'Capitão': 70.0,
        'Primeiro Tenente': 60.0,
        'Segundo Tenente': 50.0,
      };
      const amount = rankValues[data.militaryRank] || 50.0;

      // Criar benfeitor vinculado
      const benefactor = await tx.benefactor.create({
        data: {
          userId: user.id,
          cpf: data.cpf.replace(/[^\d]/g, ''),
          birthDate: new Date(data.birthDate),
          phone: data.phone,
          address: data.address,
          militaryRank: data.militaryRank,
        },
      });

      // Criar a primeira doação pendente correspondente ao plano mensal
      const donation = await tx.donation.create({
        data: {
          amount,
          status: 'PENDING',
          benefactorId: benefactor.id,
        },
      });

      // Carregar as configurações do PIX do site para o modal
      const settings = await tx.siteSettings.findUnique({
        where: { id: 'singleton' },
      });

      return {
        user,
        benefactor,
        donation,
        pixKey: settings?.pixKey || 'financeiro@cristorei.org',
        pixBank: settings?.pixBank || 'Banco do Brasil',
        pixReceiver: settings?.pixReceiver || 'Associação Cristo Rei do Universo',
        pixQrCode: settings?.pixQrCode || '',
        thankYouMsg: settings?.thankYouMsg || 'Muito obrigado!',
      };
    });

    return {
      success: true,
      data: {
        userId: result.user.id,
        donationId: result.donation.id,
        amount: result.donation.amount,
        pixKey: result.pixKey,
        pixBank: result.pixBank,
        pixReceiver: result.pixReceiver,
        pixQrCode: result.pixQrCode,
        thankYouMsg: result.thankYouMsg,
      },
    };
  } catch (error: any) {
    console.error('Erro ao cadastrar benfeitor:', error);
    return { success: false, error: error.message || 'Falha ao processar o cadastro.' };
  }
}
