'use client';

import React, { useState, useEffect } from 'react';
import { getBenefactorsForAdmin } from '@/services/actions/admin.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Award, Calendar, DollarSign } from 'lucide-react';

export default function BenfeitoresAdminPage() {
  const [benefactors, setBenefactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBenefactorsForAdmin();
      setBenefactors(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCPF = (rawCpf: string) => {
    return rawCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Coronel':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200';
      case 'Tenente-Coronel':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200';
      case 'Major':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200';
      case 'Capitão':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400 border border-gray-200';
    }
  };

  // Calcula soma total
  const totalRanks = benefactors.reduce((acc, curr) => {
    const sum = curr.donations.reduce((s: number, d: any) => s + d.amount, 0);
    return acc + sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Quadro de Benfeitores
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe a lista de soldados do Exército de Cristo Rei e o volume total doado por cada um.
            </p>
          </div>
        </div>
      </div>

      {/* Cartões rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{benefactors.length} benfeitores</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Média Arrecadada / Membro</CardTitle>
            <DollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              R$ {benefactors.length > 0 ? (totalRanks / benefactors.length).toFixed(2) : '0,00'}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contribuição Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">R$ {totalRanks.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Membros */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Nome do Benfeitor</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">E-mail / CPF</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Patente Social</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Adesão</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground text-right">Total Acumulado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                  Carregando lista de benfeitores...
                </TableCell>
              </TableRow>
            ) : benefactors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground font-medium">
                  Nenhum benfeitor cadastrado até o momento.
                </TableCell>
              </TableRow>
            ) : (
              benefactors.map((ben) => {
                const totalDonated = ben.donations.reduce((sum: number, d: any) => sum + d.amount, 0);

                return (
                  <TableRow key={ben.id} className="hover:bg-muted/10 transition">
                    <TableCell className="font-serif font-bold text-primary dark:text-primary-foreground">
                      {ben.user.name}
                    </TableCell>
                    <TableCell className="text-xs font-medium space-y-0.5">
                      <div className="text-foreground/80">{ben.user.email}</div>
                      <div className="text-muted-foreground">{formatCPF(ben.cpf)}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRankBadgeColor(ben.militaryRank)}`}>
                        {ben.militaryRank}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold whitespace-nowrap">
                      {new Date(ben.joinDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-semibold text-primary dark:text-primary-foreground text-right">
                      R$ {totalDonated.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
