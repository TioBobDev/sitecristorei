'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function validateCPF(cpf: string) {
  const clean = cpf.replace(/[^\d]/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;
  return true;
}

export async function registerBenefactor(data: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string;
  militaryRank: string;
  passwordHash: string;
  customAmount?: number;
}) {
  try {
    // 0. Validar CPF por algoritmo matemático
    if (!validateCPF(data.cpf)) {
      return { success: false, error: 'O CPF fornecido é inválido. Por favor, verifique os dígitos.' };
    }

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
        'Marechal': 1500.0,
        'Coronel': 1000.0,
        'Tenente-Coronel': 500.0,
        'Major': 300.0,
        'Capitão': 200.0,
        'Primeiro Tenente': 100.0,
        'Segundo Tenente': 50.0,
      };
      
      let amount = 50.0;
      if (data.militaryRank === 'Oficial Espontâneo') {
        amount = data.customAmount || 10.0;
      } else {
        amount = rankValues[data.militaryRank] || 50.0;
      }

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

export async function createDonationForLoggedInUser(userId: string, militaryRank: string, customAmount?: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { benefactor: true },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const rankValues: Record<string, number> = {
      'Marechal': 1500.0,
      'Coronel': 1000.0,
      'Tenente-Coronel': 500.0,
      'Major': 300.0,
      'Capitão': 200.0,
      'Primeiro Tenente': 100.0,
      'Segundo Tenente': 50.0,
    };
    
    let amount = 50.0;
    if (militaryRank === 'Oficial Espontâneo') {
      amount = customAmount || 10.0;
    } else {
      amount = rankValues[militaryRank] || 50.0;
    }

    let benefactor = user.benefactor;

    // Se o usuário não tiver cadastro de benfeitor (ex: Admin ou Editor fazendo doação de teste),
    // criamos um registro mínimo para possibilitar o fluxo.
    if (!benefactor) {
      benefactor = await prisma.benefactor.create({
        data: {
          userId: user.id,
          cpf: `USER-${user.id.slice(0, 8)}`,
          birthDate: new Date('1990-01-01'),
          phone: '0000000000',
          address: 'Não informado',
          militaryRank: militaryRank,
        },
      });
    } else {
      // Atualiza a patente do benfeitor
      benefactor = await prisma.benefactor.update({
        where: { id: benefactor.id },
        data: { militaryRank },
      });
    }

    // Criar a doação pendente correspondente ao plano mensal
    const donation = await prisma.donation.create({
      data: {
        amount,
        status: 'PENDING',
        benefactorId: benefactor.id,
      },
    });

    // Carregar as configurações de PIX
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    });

    return {
      success: true,
      data: {
        userId: user.id,
        donationId: donation.id,
        amount: donation.amount,
        pixKey: settings?.pixKey || 'financeiro@cristorei.org',
        pixBank: settings?.pixBank || 'Banco do Brasil',
        pixReceiver: settings?.pixReceiver || 'Associação Cristo Rei do Universo',
        pixQrCode: settings?.pixQrCode || '',
        thankYouMsg: settings?.thankYouMsg || 'Muito obrigado por sua doação e por fazer parte do Exército de Cristo Rei!',
      },
    };
  } catch (error: any) {
    console.error('Erro ao gerar doação para usuário logado:', error);
    return { success: false, error: error.message || 'Falha ao processar doação.' };
  }
}

