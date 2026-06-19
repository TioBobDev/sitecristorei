import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { LayoutDashboard, History, UserCog, LogOut, Home } from 'lucide-react';

export default async function AssociadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Proteção redundante além do middleware
  if (!session || (session.user?.role !== 'BENEFACTOR' && session.user?.role !== 'ADMIN')) {
    redirect('/login');
  }

  const userName = session.user?.name || 'Benfeitor';

  return (
    <div className="flex min-h-[80vh] flex-col lg:flex-row bg-muted/20">
      {/* Sidebar de Navegação */}
      <aside className="w-full lg:w-64 border-r border-border bg-card p-6 lg:min-h-[80vh] shrink-0">
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Painel do Benfeitor</div>
            <div className="text-sm font-bold text-primary dark:text-primary-foreground mt-0.5 truncate">{userName}</div>
            <div className="text-[10px] text-secondary font-semibold uppercase tracking-widest mt-1">Exército de Cristo</div>
          </div>
          
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none border-b border-border lg:border-b-0">
            <Link
              href="/associado/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-foreground/80 hover:text-secondary hover:bg-primary/5 transition shrink-0"
            >
              <LayoutDashboard className="h-4 w-4 text-secondary" /> Dashboard
            </Link>
            <Link
              href="/associado/doacoes"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-foreground/80 hover:text-secondary hover:bg-primary/5 transition shrink-0"
            >
              <History className="h-4 w-4 text-secondary" /> Doações
            </Link>
            <Link
              href="/associado/perfil"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-foreground/80 hover:text-secondary hover:bg-primary/5 transition shrink-0"
            >
              <UserCog className="h-4 w-4 text-secondary" /> Atualizar Cadastro
            </Link>
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div className="container mx-auto max-w-4xl space-y-6 flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-end items-center gap-3 pb-4 border-b border-border shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" /> Portal Público
            </Link>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive hover:text-white transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </form>
          </div>

          <div className="flex-1 pt-4">
            {children}
          </div>
        </div>
        <footer className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground/75 shrink-0">
          <p>© 2026 Associação Cristo Rei do Universo. Todos os direitos reservados.</p>
          <p className="mt-1">Desenvolvido com fé e dedicação social.</p>
        </footer>
      </main>
    </div>
  );
}
