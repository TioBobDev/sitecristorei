import React, { Suspense } from 'react';
import { auth } from '@/auth';
import { getBenefactorDonations } from '@/services/actions/benefactor.actions';
import { DonationFilters } from '@/components/DonationFilters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, CalendarCheck, HelpCircle } from 'lucide-react';

interface Params {
  searchParams: Promise<{
    year?: string;
    month?: string;
    status?: string;
  }>;
}

export default async function DonationsPage({ searchParams }: Params) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-sm text-red-500 font-bold p-6 text-center">Não autorizado.</div>;
  }

  const filters = await searchParams;
  const donations = await getBenefactorDonations(userId, filters);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900/30">
            Confirmada
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30 animate-pulse">
            Pendente
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/30">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
            Histórico de Contribuições
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize e filtre todos os seus repasses para a Associação.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded-xl" />}>
        <DonationFilters />
      </Suspense>

      {/* Tabela de Doações */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Data</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Referência / Patente</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Valor</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-sm text-muted-foreground font-medium">
                  Nenhuma contribuição encontrada para o período filtrado.
                </TableCell>
              </TableRow>
            ) : (
              donations.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/10 transition">
                  <TableCell className="font-medium">
                    {new Date(d.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="font-serif font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Contribuição Mensal
                  </TableCell>
                  <TableCell className="font-semibold text-primary dark:text-primary-foreground">
                    R$ {d.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(d.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Informativo sobre Confirmações */}
      <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-secondary/25 flex gap-3 text-xs md:text-sm">
        <CalendarCheck className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
        <div className="text-muted-foreground leading-relaxed font-medium">
          <strong>Como funciona a conciliação:</strong> Ao realizar a transferência para a chave PIX informada no momento do cadastro, os administradores da igreja farão a conciliação bancária manual e atualizarão o status para <strong>Confirmado</strong> em até 24 horas úteis.
        </div>
      </div>
    </div>
  );
}
