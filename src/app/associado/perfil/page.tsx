import React from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { MemberProfileForm } from '@/components/MemberProfileForm';
import { UserCog } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function PerfilPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/login');
  }

  // Busca as informações cadastrais do benfeitor no banco
  const benefactor = await prisma.benefactor.findUnique({
    where: { userId },
  });

  if (!benefactor) {
    return (
      <div className="text-center p-6 text-sm text-red-500 font-bold">
        Perfil do benfeitor não encontrado.
      </div>
    );
  }

  // Formata o CPF para exibição amigável
  const formatCPF = (rawCpf: string) => {
    return rawCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const initialData = {
    cpf: formatCPF(benefactor.cpf),
    phone: benefactor.phone,
    address: benefactor.address,
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
            Atualização Cadastral
          </h1>
          <p className="text-sm text-muted-foreground">
            Mantenha seu telefone e endereço atualizados para receber comunicados físicos e digitais.
          </p>
        </div>
      </div>

      {/* Formulário Cliente */}
      <MemberProfileForm userId={userId} initialData={initialData} />
    </div>
  );
}
