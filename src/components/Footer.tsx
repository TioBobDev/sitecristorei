import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { getSiteSettings } from '@/services/actions/site.actions';

export async function Footer() {
  const settings = await getSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-primary text-primary-foreground border-t border-secondary/20 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Coluna 1: Institucional */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-10 w-10 rounded-full border border-secondary object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo.png';
                }}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary font-bold">
                CR
              </div>
            )}
            <span className="font-serif text-lg font-bold tracking-tight text-secondary">
              Cristo Rei
            </span>
          </Link>
          <p className="text-sm text-primary-foreground/75 font-medium leading-relaxed">
            A Associação Cristo Rei do Universo busca transformar vidas através da educação, da cultura, da fé e da solidariedade. Aliste-se nessa missão!
          </p>
          {/* Redes Sociais */}
          <div className="flex gap-4 mt-2">
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {settings?.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition"
              >
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold uppercase tracking-wider text-secondary">Links Rápidos</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-primary-foreground/85 font-medium">
            <li>
              <Link href="/" className="hover:text-secondary transition">Início</Link>
            </li>
            <li>
              <Link href="/noticias" className="hover:text-secondary transition">Notícias</Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-secondary transition">Contato</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-secondary transition">Área do Associado</Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Seja um Benfeitor */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold uppercase tracking-wider text-secondary">Seja um Benfeitor</h4>
          <p className="text-sm text-primary-foreground/75 leading-relaxed font-medium">
            Faça parte do Exército de Cristo Rei ajudando nossos projetos sociais recorrentes como informática, música e pilates.
          </p>
          <div>
            <Link
              href="/#seja-benfeitor"
              className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
            >
              <Heart className="h-4 w-4 fill-current" />
              Quero me alistar agora
            </Link>
          </div>
        </div>

        {/* Coluna 4: Contatos */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold uppercase tracking-wider text-secondary">Contato</h4>
          <ul className="flex flex-col gap-3 text-sm text-primary-foreground/80 font-medium">
            {settings?.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span>{settings.phone}</span>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-secondary shrink-0" />
                <span className="truncate">{settings.email}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-8 border-t border-secondary/10 text-center text-xs text-primary-foreground/60 font-medium">
        <p>© {currentYear} {settings?.name || 'Associação Cristo Rei do Universo'}. Todos os direitos reservados.</p>
        <p className="mt-1">Desenvolvido com fé e dedicação social.</p>
      </div>
    </footer>
  );
}
