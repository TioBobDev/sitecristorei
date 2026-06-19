'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { DonationModal } from './DonationModal';

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
  const [open, setOpen] = useState(false);

  if (isFloating) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full bg-secondary text-ouro-bianco font-bold shadow-2xl hover:scale-105 transition-all duration-300 border border-ouro hover:bg-primary cursor-pointer shadow-secondary/25 animate-bounce ${className}`}
        >
          <Heart className="h-5 w-5 fill-current text-ouro-bianco animate-pulse" />
          <span className="text-sm tracking-wide font-serif">Quero ser um Benfeitor</span>
        </button>
        <DonationModal open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={`cursor-pointer ${className}`}
      >
        {children || (
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-current" /> Seja um Benfeitor
          </span>
        )}
      </Button>
      <DonationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
