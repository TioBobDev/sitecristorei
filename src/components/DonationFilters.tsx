'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function DonationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentYear = searchParams.get('year') || new Date().getFullYear().toString();
  const currentMonth = searchParams.get('month') || 'ALL';
  const currentStatus = searchParams.get('status') || 'ALL';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/associado/doacoes?${params.toString()}`);
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => (new Date().getFullYear() - i).toString()
  );

  const months = [
    { value: '0', label: 'Janeiro' },
    { value: '1', label: 'Fevereiro' },
    { value: '2', label: 'Março' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Maio' },
    { value: '5', label: 'Junho' },
    { value: '6', label: 'Julho' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Setembro' },
    { value: '9', label: 'Outubro' },
    { value: '10', label: 'Novembro' },
    { value: '11', label: 'Dezembro' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-card border border-border">
      {/* Filtro Ano */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Ano</Label>
        <Select
          value={currentYear}
          onValueChange={(val) => updateFilters('year', val)}
        >
          <SelectTrigger className="w-full h-10 border border-input rounded-lg">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent className="glass border border-border">
            {years.map((y) => (
              <SelectItem key={y} value={y} className="cursor-pointer">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro Mês */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Mês</Label>
        <Select
          value={currentMonth}
          onValueChange={(val) => updateFilters('month', val)}
        >
          <SelectTrigger className="w-full h-10 border border-input rounded-lg">
            <SelectValue placeholder="Todos os meses" />
          </SelectTrigger>
          <SelectContent className="glass border border-border">
            <SelectItem value="ALL" className="cursor-pointer">Todos os meses</SelectItem>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value} className="cursor-pointer">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro Status */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Status</Label>
        <Select
          value={currentStatus}
          onValueChange={(val) => updateFilters('status', val)}
        >
          <SelectTrigger className="w-full h-10 border border-input rounded-lg">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent className="glass border border-border">
            <SelectItem value="ALL" className="cursor-pointer">Todos</SelectItem>
            <SelectItem value="PENDING" className="cursor-pointer">Pendente</SelectItem>
            <SelectItem value="CONFIRMED" className="cursor-pointer">Confirmado</SelectItem>
            <SelectItem value="CANCELLED" className="cursor-pointer">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
