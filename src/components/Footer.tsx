'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { ClientImage } from './ClientImage';

interface FooterProps {
  siteSettings: any;
}

export function Footer({ siteSettings }: FooterProps) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const isPanelPath = pathname.startsWith('/admin') || pathname.startsWith('/associado');

  if (isPanelPath) {
    return null;
  }

  return (
    <footer className="w-full bg-primary text-primary-foreground border-t border-ouro/20 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Coluna 1: Institucional */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center hover:opacity-90">
            <img
              src="/images/logo_rodape.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-primary-foreground/75 font-medium leading-relaxed">
            A Associação Cristo Rei do Universo busca transformar vidas através da educação, da cultura, da fé e da solidariedade. Aliste-se nessa missão!
          </p>
          {/* Redes Sociais */}
          <div className="flex gap-4 mt-2">
            {siteSettings?.facebook && (
              <a
                href={siteSettings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-ouro/10 flex items-center justify-center text-ouro hover:bg-ouro hover:text-primary transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {siteSettings?.instagram && (
              <a
                href={siteSettings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-ouro/10 flex items-center justify-center text-ouro hover:bg-ouro hover:text-primary transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {siteSettings?.youtube && (
              <a
                href={siteSettings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-ouro/10 flex items-center justify-center text-ouro hover:bg-ouro hover:text-primary transition"
              >
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold uppercase tracking-wider text-ouro">Links Rápidos</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-primary-foreground/85 font-medium">
            <li>
              <Link href="/" className="hover:text-ouro transition">Início</Link>
            </li>
            <li>
              <Link href="/noticias" className="hover:text-ouro transition">Notícias</Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-ouro transition">Contato</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-ouro transition">Área do Associado</Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Seja um Benfeitor */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold uppercase tracking-wider text-ouro">Seja um Benfeitor</h4>
          <p className="text-sm text-primary-foreground/75 leading-relaxed font-medium">
            Faça parte do Exército de Cristo Rei ajudando nossos projetos sociais recorrentes como informática, música e pilates.
          </p>
          <div>
            <Link
              href="/#seja-benfeitor"
              className="inline-flex items-center gap-2 text-sm font-bold text-ouro hover:underline"
            >
              <Heart className="h-4 w-4 fill-current" />
              Quero me alistar agora
            </Link>
          </div>
        </div>

        {/* Coluna 4: Contatos */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold uppercase tracking-wider text-ouro">Contato</h4>
          <ul className="flex flex-col gap-3 text-sm text-primary-foreground/80 font-medium">
            {siteSettings?.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-ouro shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </li>
            )}
            {siteSettings?.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 text-ouro shrink-0" />
                <span>{siteSettings.phone}</span>
              </li>
            )}
            {siteSettings?.email && (
              <li className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-ouro shrink-0" />
                <span className="truncate">{siteSettings.email}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-8 border-t border-ouro/10 text-center text-xs text-primary-foreground/60 font-medium">
        <p>© 2026 Associação Cristo Rei do Universo. Todos os direitos reservados.</p>
        <p className="mt-1">Desenvolvido com fé e dedicação social.</p>
      </div>
    </footer>
  );
}
