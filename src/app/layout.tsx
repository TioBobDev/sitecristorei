import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getCategories, getSiteSettings } from '@/services/actions/site.actions';
import { auth } from '@/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Associação Cristo Rei do Universo',
  description: 'Transformando vidas através da educação, cultura, fé e solidariedade.',
  keywords: 'igreja, cristo rei, projetos sociais, doação, benfeitor, exército de cristo rei',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();
  const siteSettings = await getSiteSettings() || {
    name: 'Associação Cristo Rei do Universo',
    logoUrl: '/images/logo.png',
  };
  const session = await auth();

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navbar categories={categories} siteSettings={siteSettings} session={session} />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer siteSettings={siteSettings} />
        </Providers>
      </body>
    </html>
  );
}
