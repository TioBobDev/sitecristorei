import React from 'react';
import { getAdminDashboardData } from '@/services/actions/admin.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, FileText, PenTool } from 'lucide-react';
import { auth } from '@/auth';

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  const session = await auth();

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
          Painel de Controle
        </h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo, {session?.user?.name}. Aqui estão os indicadores gerais da Associação.
        </p>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Benfeitores */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Benfeitores</CardTitle>
            <Users className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary dark:text-primary-foreground">{data.totalAssociados}</div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Alistados no Exército de Cristo</p>
          </CardContent>
        </Card>

        {/* Total Arrecadado */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Arrecadado</CardTitle>
            <DollarSign className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary dark:text-primary-foreground">
              R$ {data.totalArrecadado.toFixed(2)}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Soma de doações confirmadas</p>
          </CardContent>
        </Card>

        {/* Total Notícias */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notícias</CardTitle>
            <FileText className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary dark:text-primary-foreground">{data.totalNoticias}</div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Informativos publicados</p>
          </CardContent>
        </Card>

        {/* Total Postagens */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Posts / Projetos</CardTitle>
            <PenTool className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary dark:text-primary-foreground">{data.totalPostagens}</div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              Posts em {data.totalCategorias} categorias
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
