import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface DonationButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  isFloating?: boolean;
}

export function DonationButton({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  isFloating = false,
}: DonationButtonProps) {
  if (isFloating) {
    return (
      <Link
        href="/seja-um-benfeitor"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full bg-secondary text-ouro-bianco font-bold shadow-2xl hover:scale-105 transition-all duration-300 border border-ouro hover:bg-primary cursor-pointer shadow-secondary/25 animate-bounce ${className}`}
      >
        <Heart className="h-5 w-5 fill-current text-ouro-bianco animate-pulse" />
        <span className="text-sm tracking-wide font-serif">Quero ser um Benfeitor</span>
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      render={<Link href="/seja-um-benfeitor" />}
      className={`cursor-pointer ${className}`}
    >
      {children || (
        <span className="flex items-center gap-2">
          <Heart className="h-4 w-4 fill-current" /> Seja um Benfeitor
        </span>
      )}
    </Button>
  );
}
