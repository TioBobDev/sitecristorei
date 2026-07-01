'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getDonationsForAdmin, getBenefactorsForAdmin, createDonation, updateDonationStatus, deleteDonation } from '@/services/actions/admin.actions';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Check, X, Trash2, Plus, AlertCircle, Calendar } from 'lucide-react';
import { DonationStatus } from '@prisma/client';

export default function DoacoesAdminPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [donations, setDonations] = useState<any[]>([]);
  const [benefactors, setBenefactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Formulário de lançamento manual
  const [benefactorId, setBenefactorId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<DonationStatus>('CONFIRMED');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const selectedBenefactor = benefactors.find((ben) => ben.id === benefactorId);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [donRes, benRes] = await Promise.all([
      getDonationsForAdmin(),
      getBenefactorsForAdmin(),
    ]);
    setDonations(donRes);
    setBenefactors(benRes);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setBenefactorId('');
    setAmount('');
    setStatus('CONFIRMED');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    if (!benefactorId) {
      setErrorMsg('Selecione um benfeitor.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Valor da doação deve ser maior que zero.');
      return;
    }

    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createDonation(adminId, {
        benefactorId,
        amount: parseFloat(amount),
        status,
        date,
      });

      if (res.success) {
        setSuccessMsg('Doação lançada com sucesso!');
        clearForm();
        fetchData();
      } else {
        setErrorMsg('Erro ao registrar doação.');
      }
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: DonationStatus) => {
    if (!adminId) return;

    const res = await updateDonationStatus(adminId, id, newStatus);
    if (res.success) {
      setSuccessMsg(`Status atualizado para ${newStatus === 'CONFIRMED' ? 'Confirmado' : newStatus === 'PENDING' ? 'Pendente' : 'Cancelado'}.`);
      fetchData();
    } else {
      setErrorMsg('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminId) return;
    if (!confirm('Deseja realmente excluir este registro de doação?')) return;

    const res = await deleteDonation(adminId, id);
    if (res.success) {
      setSuccessMsg('Registro de doação deletado.');
      fetchData();
    } else {
      setErrorMsg('Falha ao excluir registro.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Conciliação de Doações
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitore os PIX declarados e confirme os pagamentos ou faça registros manuais.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2 font-medium">
          <Check className="h-4 w-4" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4" /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Lançamento Manual (Esquerda) */}
        <div className="xl:col-span-4">
          <Card className="glass shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground">
                  Lançar Contribuição Manual
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="don-ben">Benfeitor</Label>
                  <Select
                    value={benefactorId}
                    onValueChange={(val) => setBenefactorId(val || '')}
                  >
                    <SelectTrigger className="w-full border border-input rounded-lg">
                      <SelectValue placeholder="Escolha o benfeitor...">
                        {selectedBenefactor ? `${selectedBenefactor.user.name} (${selectedBenefactor.militaryRank})` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="glass border border-border">
                      {benefactors.map((ben) => (
                        <SelectItem key={ben.id} value={ben.id} className="cursor-pointer">
                          {ben.user.name} ({ben.militaryRank})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="don-amount">Valor (R$)</Label>
                  <Input
                    id="don-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 100.00"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="don-date">Data da Doação</Label>
                  <Input
                    id="don-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="don-status">Status Inicial</Label>
                  <Select
                    value={status}
                    onValueChange={(val) => setStatus(val as DonationStatus)}
                  >
                    <SelectTrigger className="w-full border border-input rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border border-border">
                      <SelectItem value="CONFIRMED" className="cursor-pointer">Confirmado / Conciliado</SelectItem>
                      <SelectItem value="PENDING" className="cursor-pointer">Pendente de Confirmação</SelectItem>
                      <SelectItem value="CANCELLED" className="cursor-pointer">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isPending} className="w-full bg-primary text-ouro-bianco hover:bg-secondary hover:text-ouro-bianco transition font-bold cursor-pointer">
                  {isPending ? 'Lançando...' : 'Lançar Doação'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Listagem de Doações (Direita) */}
        <div className="xl:col-span-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Benfeitor</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Data</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Valor</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Status</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Conciliação / Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                      Carregando doações...
                    </TableCell>
                  </TableRow>
                ) : donations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground font-medium">
                      Nenhuma doação registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  donations.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/10 transition text-xs md:text-sm">
                      <TableCell className="font-serif font-bold text-primary dark:text-primary-foreground">
                        {d.benefactor.user.name}
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {d.benefactor.militaryRank}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(d.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {d.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : d.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {d.status === 'CONFIRMED' ? 'Confirmado' : d.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {d.status === 'PENDING' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(d.id, 'CONFIRMED')}
                              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full cursor-pointer"
                              title="Confirmar Pagamento"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {d.status === 'PENDING' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(d.id, 'CANCELLED')}
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full cursor-pointer"
                              title="Cancelar Pagamento"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(d.id)}
                            className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer"
                            title="Deletar Doação"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
