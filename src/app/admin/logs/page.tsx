import React from 'react';
import { getAdminLogs } from '@/services/actions/admin.actions';
import { ClipboardList, Calendar } from 'lucide-react';

export const revalidate = 0; // Garantir dados sempre em tempo real

const getActionBadgeClass = (action: string) => {
  const upperAction = action.toUpperCase();
  if (upperAction.startsWith('CRIAR') || upperAction.startsWith('LANÇAR')) {
    return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
  }
  if (upperAction.startsWith('EDITAR') || upperAction.startsWith('ATUALIZAR') || upperAction.startsWith('ALTERAR')) {
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  }
  if (upperAction.startsWith('DELETAR') || upperAction.startsWith('EXCLUIR')) {
    return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  }
  return 'bg-secondary/15 text-secondary border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground';
};

export default async function LogsAdminPage() {
  const logs = await getAdminLogs();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Logs de Auditoria
            </h1>
            <p className="text-sm text-muted-foreground">
              Histórico detalhado de ações administrativas realizadas no portal.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="p-3 font-bold text-primary dark:text-primary-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-secondary" /> Data / Hora
                </th>
                <th className="p-3 font-bold text-primary dark:text-primary-foreground">Usuário</th>
                <th className="p-3 font-bold text-primary dark:text-primary-foreground">Ação</th>
                <th className="p-3 font-bold text-primary dark:text-primary-foreground">Detalhes da Ação</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground font-medium">
                    Nenhum registro de log encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/5 transition duration-150">
                    <td className="p-3 font-medium whitespace-nowrap text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 font-bold text-primary dark:text-primary-foreground whitespace-nowrap">
                      {log.user.name}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded border uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground font-medium leading-relaxed">
                      {log.details || '-'}
                    </td>
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
