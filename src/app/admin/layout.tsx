import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  PenTool,
  Image as ImageIcon,
  Users,
  DollarSign,
  Megaphone,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Garante que apenas administradores ou editores entrem
  if (
    !session ||
    (session.user?.role !== 'ADMIN' && session.user?.role !== 'EDITOR')
  ) {
    redirect('/login');
  }

  const roleName = session.user?.role === 'ADMIN' ? 'Administrador' : 'Editor';

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-muted/15">
      {/* Sidebar de Administração */}
      <aside className="w-full lg:w-64 border-r border-border bg-primary text-primary-foreground p-6 shrink-0 lg:min-h-screen">
        <div className="flex flex-col gap-6">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-90">
              <span className="font-serif text-lg font-bold text-secondary">
                Cristo Rei Admin
              </span>
            </Link>
            <div className="text-[10px] text-primary-foreground/60 uppercase font-bold tracking-wider">Perfil ativo</div>
            <div className="text-sm font-bold text-secondary truncate mt-0.5">{session.user?.name}</div>
            <span className="inline-block px-2 py-0.5 bg-secondary/20 text-secondary text-[9px] font-bold rounded uppercase tracking-wider mt-1.5 border border-secondary/35">
              {roleName}
            </span>
          </div>

          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[70vh] scrollbar-thin">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <LayoutDashboard className="h-4 w-4 text-secondary shrink-0" /> Dashboard
            </Link>

            <div className="my-2 border-t border-white/10" />
            <div className="text-[10px] text-primary-foreground/45 uppercase font-bold tracking-widest px-3 mb-1">CONTEÚDO</div>

            <Link
              href="/admin/noticias"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <FileText className="h-4 w-4 text-secondary shrink-0" /> Notícias
            </Link>
            <Link
              href="/admin/categorias"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <FolderTree className="h-4 w-4 text-secondary shrink-0" /> Categorias
            </Link>
            <Link
              href="/admin/posts"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <PenTool className="h-4 w-4 text-secondary shrink-0" /> Posts de Projetos
            </Link>
            <Link
              href="/admin/carrossel"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <ImageIcon className="h-4 w-4 text-secondary shrink-0" /> Carrossel Inicial
            </Link>
            <Link
              href="/admin/comunicados"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <Megaphone className="h-4 w-4 text-secondary shrink-0" /> Comunicados
            </Link>

            <div className="my-2 border-t border-white/10" />
            <div className="text-[10px] text-primary-foreground/45 uppercase font-bold tracking-widest px-3 mb-1">CADASTROS</div>

            <Link
              href="/admin/benfeitores"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <Users className="h-4 w-4 text-secondary shrink-0" /> Benfeitores
            </Link>
            <Link
              href="/admin/doacoes"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <DollarSign className="h-4 w-4 text-secondary shrink-0" /> Doações
            </Link>

            <div className="my-2 border-t border-white/10" />
            <div className="text-[10px] text-primary-foreground/45 uppercase font-bold tracking-widest px-3 mb-1">CONFIGS</div>

            <Link
              href="/admin/configuracoes"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition"
            >
              <Settings className="h-4 w-4 text-secondary shrink-0" /> Configurações
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-primary-foreground/80 hover:text-secondary hover:bg-white/5 transition mt-6"
            >
              <Home className="h-4 w-4 text-secondary shrink-0" /> Voltar ao Site
            </Link>
          </nav>
        </div>
      </aside>

      {/* Área do Painel */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto flex flex-col justify-between">
        <div className="container mx-auto space-y-8 flex-1">
          {children}
        </div>
        <footer className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground/75 shrink-0">
          <p>© 2026 Associação Cristo Rei do Universo. Todos os direitos reservados.</p>
          <p className="mt-1">Desenvolvido com fé e dedicação social.</p>
        </footer>
      </main>
    </div>
  );
}
