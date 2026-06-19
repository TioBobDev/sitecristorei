'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, Shield, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DonationModal } from './DonationModal';
import { signOut } from 'next-auth/react';

interface NavbarProps {
  categories: { id: string; name: string; slug: string }[];
  siteSettings: { name: string; logoUrl: string | null };
  session: any;
}

export function Navbar({ categories, siteSettings, session }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);

  const isPanelPath = pathname.startsWith('/admin') || pathname.startsWith('/associado');
  if (isPanelPath) return null;

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;
  const userName = session?.user?.name || 'Associado';

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
          {/* Logo & Nome da Instituição */}
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt="Logo"
                className="h-12 w-12 rounded-full border border-secondary object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo.png';
                }}
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary font-bold border border-secondary text-lg">
                CR
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-primary dark:text-primary-foreground md:text-xl">
                Cristo Rei
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Exército de Cristo
              </span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition hover:text-secondary ${
                isActive('/') ? 'text-secondary font-semibold' : 'text-foreground/85'
              }`}
            >
              Início
            </Link>
            <Link
              href="/noticias"
              className={`text-sm font-medium transition hover:text-secondary ${
                isActive('/noticias') ? 'text-secondary font-semibold' : 'text-foreground/85'
              }`}
            >
              Notícias
            </Link>

            {/* Dropdown de Projetos Sociais */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition hover:text-secondary text-foreground/85 focus:outline-none cursor-pointer">
                Projetos Sociais <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 glass rounded-xl shadow-lg border border-border">
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">Nenhum projeto registrado</div>
                ) : (
                  categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      render={
                        <Link
                          href={`/projetos/${cat.slug}`}
                          className={`w-full block px-3 py-2 text-sm rounded-md transition ${
                            pathname === `/projetos/${cat.slug}`
                              ? 'text-secondary font-bold'
                              : 'text-foreground/80'
                          }`}
                        />
                      }
                      className="hover:bg-primary/5 cursor-pointer"
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setDonationOpen(true)}
              className={`text-sm font-medium transition hover:text-secondary text-foreground/85 cursor-pointer`}
            >
              Seja um Benfeitor
            </button>
            <Link
              href="/contato"
              className={`text-sm font-medium transition hover:text-secondary ${
                isActive('/contato') ? 'text-secondary font-semibold' : 'text-foreground/85'
              }`}
            >
              Contato
            </Link>
          </nav>

          {/* Botões do Lado Direito Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDonationOpen(true)}
              className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-ouro-bianco transition font-semibold cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-current" />
              Quero ser um Benfeitor
            </Button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" className="flex items-center gap-2 font-medium border border-border/50 rounded-full cursor-pointer" />
                }>
                  <User className="h-4 w-4 text-secondary" />
                  <span className="max-w-[100px] truncate">{userName}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 glass rounded-xl border border-border">
                  {(userRole === 'ADMIN' || userRole === 'EDITOR') && (
                    <DropdownMenuItem render={
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm" />
                    } className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" /> Painel Admin
                    </DropdownMenuItem>
                  )}
                  {userRole === 'BENEFACTOR' && (
                    <DropdownMenuItem render={
                      <Link href="/associado/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm" />
                    } className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" /> Área do Benfeitor
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600 focus:text-red-500 cursor-pointer">
                    <span className="flex items-center gap-2 px-3 py-2 text-sm">
                      <LogOut className="h-4 w-4" /> Sair
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button render={<Link href="/login" />} variant="ghost" size="sm" className="gap-2 text-primary dark:text-primary-foreground hover:text-secondary cursor-pointer">
                <Shield className="h-4 w-4" /> Área do Associado
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDonationOpen(true)}
              className="border-secondary text-secondary hover:bg-secondary hover:text-ouro-bianco cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-current" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-primary dark:text-primary-foreground cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background px-4 py-6 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-semibold ${isActive('/') ? 'text-secondary' : 'text-foreground'}`}
              >
                Início
              </Link>
              <Link
                href="/noticias"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-semibold ${isActive('/noticias') ? 'text-secondary' : 'text-foreground'}`}
              >
                Notícias
              </Link>

              {/* Sublinks de Projetos no Mobile */}
              <div className="flex flex-col gap-2 pl-3 border-l-2 border-border">
                <span className="text-sm font-semibold text-muted-foreground">Projetos Sociais:</span>
                {categories.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Nenhum projeto registrado</span>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/projetos/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm py-1 ${
                        pathname === `/projetos/${cat.slug}` ? 'text-secondary font-bold' : 'text-foreground/80'
                      }`}
                    >
                      • {cat.name}
                    </Link>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDonationOpen(true);
                }}
                className="text-left text-base font-semibold text-foreground cursor-pointer"
              >
                Seja um Benfeitor
              </button>

              <Link
                href="/contato"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-semibold ${isActive('/contato') ? 'text-secondary' : 'text-foreground'}`}
              >
                Contato
              </Link>

              <hr className="border-border my-2" />

              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-1">
                    <User className="h-5 w-5 text-secondary" />
                    <span className="font-semibold truncate">{userName} ({userRole})</span>
                  </div>
                  {(userRole === 'ADMIN' || userRole === 'EDITOR') && (
                    <Button render={<Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} />} size="sm" variant="outline" className="w-full justify-start cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Painel Admin
                    </Button>
                  )}
                  {userRole === 'BENEFACTOR' && (
                    <Button render={<Link href="/associado/dashboard" onClick={() => setMobileMenuOpen(false)} />} size="sm" variant="outline" className="w-full justify-start cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Área do Benfeitor
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </Button>
                </div>
              ) : (
                <Button render={<Link href="/login" onClick={() => setMobileMenuOpen(false)} />} variant="outline" className="w-full justify-center border-primary text-primary dark:text-primary-foreground dark:border-border cursor-pointer">
                  <Shield className="h-4 w-4 mr-2" /> Área do Associado
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal de Doação PIX */}
      <DonationModal open={donationOpen} onOpenChange={setDonationOpen} />
    </>
  );
}
