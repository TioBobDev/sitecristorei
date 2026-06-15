import React from 'react';
import { getAdminDashboardData } from '@/services/actions/admin.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, FileText, PenTool, ClipboardList } from 'lucide-react';
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

      {/* Logs de Auditoria Administrativa */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-secondary" />
          Logs de Auditoria Recentes
        </h2>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="p-3 font-bold text-primary dark:text-primary-foreground">Data</th>
                <th className="p-3 font-bold text-primary dark:text-primary-foreground">Usuário</th>
                <th className="p-3 font-bold text-primary dark:text-primary-foreground">Ação</th>
                <th className="p-3 font-bold text-primary dark:text-primary-foreground">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {data.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground font-medium">
                    Nenhuma ação registrada nos logs de auditoria.
                  </td>
                </tr>
              ) : (
                data.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/10 transition">
                    <td className="p-3 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 font-bold text-primary dark:text-primary-foreground whitespace-nowrap">
                      {log.user.name}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-secondary/15 text-secondary border border-secondary/20 text-[9px] font-bold rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground font-medium">{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
