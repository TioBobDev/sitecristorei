'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ChevronRight, Copy, Check, Heart, Award, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerBenefactor, createDonationForLoggedInUser } from '@/services/actions/user.actions';

// Validador de CPF brasileiro
function validateCPF(cpf: string) {
  const clean = cpf.replace(/[^\d]/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;
  return true;
}

const ranks = [
  {
    name: 'Coronel',
    value: 1000,
    desc: 'O mais alto grau de apadrinhamento e dedicação social.',
    benefits: ['Acesso a comunicados privados', 'Certificado físico de Honra Ouro', 'Nome em placa de benfeitores na paróquia', 'Participação em fóruns'],
  },
  {
    name: 'Tenente-Coronel',
    value: 500,
    desc: 'Contribuição vital para manter a qualidade das oficinas.',
    benefits: ['Acesso a comunicados privados', 'Certificado digital de Benfeitor Prata', 'Boletim impresso bimestral'],
  },
  {
    name: 'Major',
    value: 300,
    desc: 'Ajuda crucial no lanche e nos materiais dos alunos.',
    benefits: ['Acesso a comunicados privados', 'Certificado digital de Benfeitor Bronze', 'Boletim digital mensal'],
  },
  {
    name: 'Capitão',
    value: 200,
    desc: 'Apoio na compra de suprimentos esportivos e musicais.',
    benefits: ['Acesso a comunicados privados', 'Boletim digital bimestral'],
  },
  {
    name: 'Primeiro Tenente',
    value: 100,
    desc: 'Custeio das oficinas de apoio escolar e lazer.',
    benefits: ['Acesso a comunicados privados', 'Informativo digital trimestral'],
  },
  {
    name: 'Segundo Tenente',
    value: 50,
    desc: 'Adesão padrão ao Exército de Cristo Rei.',
    benefits: ['Acesso a comunicados privados', 'Recebimento de e-mails de impacto'],
  },
  {
    name: 'Oficial Espontâneo',
    value: 0,
    desc: 'Doação de valor espontâneo para apoiar as atividades sociais.',
    benefits: ['Acesso a comunicados privados', 'Recebimento de e-mails de impacto'],
  },
];

// Schema de validação Zod
const formSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    cpf: z.string().refine((val) => validateCPF(val), {
      message: 'CPF inválido',
    }),
    birthDate: z.string().min(10, 'Data de nascimento inválida'),
    phone: z.string().min(10, 'Telefone inválido'),
    address: z.string().min(10, 'Endereço completo é obrigatório'),
    password: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRank, setSelectedRank] = useState(ranks[5]); // Segundo Tenente padrão
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pixData, setPixData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleSelectRank = (rankName: string) => {
    const rank = ranks.find((r) => r.name === rankName);
    if (rank) {
      setSelectedRank(rank);
    }
  };

  const handleDonateLoggedIn = async () => {
    if (!session?.user?.id) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const parsedAmount = parseFloat(customAmount);
      if (selectedRank.name === 'Oficial Espontâneo' && (isNaN(parsedAmount) || parsedAmount <= 0)) {
        setErrorMsg('Por favor, informe um valor válido maior que zero para a doação espontânea.');
        setSubmitting(false);
        return;
      }

      const res = await createDonationForLoggedInUser(
        session.user.id,
        selectedRank.name,
        selectedRank.name === 'Oficial Espontâneo' ? parsedAmount : undefined
      );
      if (res.success && res.data) {
        setPixData(res.data);
        setStep(3);
      } else {
        setErrorMsg(res.error || 'Falha ao processar doação.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro no servidor. Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    const parsedAmount = parseFloat(customAmount);
    if (selectedRank.name === 'Oficial Espontâneo' && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      setErrorMsg('Por favor, informe um valor válido maior que zero para a doação espontânea.');
      return;
    }
    setErrorMsg(null);
    handleClose();
    router.push('/seja-um-benfeitor');
  };

  const handleFormSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setErrorMsg(null);

    const parsedAmount = parseFloat(customAmount);
    if (selectedRank.name === 'Oficial Espontâneo' && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      setErrorMsg('Por favor, informe um valor válido maior que zero para a doação espontânea.');
      setSubmitting(false);
      return;
    }

    const res = await registerBenefactor({
      name: values.name,
      email: values.email,
      cpf: values.cpf,
      birthDate: values.birthDate,
      phone: values.phone,
      address: values.address,
      militaryRank: selectedRank.name,
      passwordHash: values.password,
      customAmount: selectedRank.name === 'Oficial Espontâneo' ? parsedAmount : undefined,
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setPixData(res.data);
      setStep(3);
      reset();
    } else {
      setErrorMsg(res.error || 'Falha ao processar cadastro.');
    }
  };

  const copyPixKey = () => {
    if (pixData?.pixKey) {
      navigator.clipboard.writeText(pixData.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Pequeno delay para resetar o modal após a animação de fechamento
    setTimeout(() => {
      setStep(1);
      setErrorMsg(null);
      setPixData(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else onOpenChange(true); }}>
      <DialogContent className="max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass p-6 md:p-8 scrollbar-thin">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-secondary mb-3">
            <Heart className="h-6 w-6 fill-current animate-pulse text-secondary" />
          </div>
          <DialogTitle className="font-serif text-2xl md:text-3xl text-primary dark:text-primary-foreground font-bold">
            {step === 1 && 'Escolha sua Patente Social'}
            {step === 2 && 'Preencha o seu Alistamento'}
            {step === 3 && 'Alistamento Concluído com Sucesso!'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {step === 1 && 'Aliste-se no Exército de Cristo Rei do Universo e ajude a transformar vidas.'}
            {step === 2 && 'Cadastre-se para criar sua Área do Benfeitor e emitir seu PIX de doação.'}
            {step === 3 && 'Agora basta realizar a transferência PIX correspondente ao seu plano.'}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 mt-2 font-medium">
            {errorMsg}
          </div>
        )}

        {/* ETAPA 1: Patentes Militares / Planos */}
        {step === 1 && (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ranks.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => handleSelectRank(r.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition text-center cursor-pointer ${
                    selectedRank.name === r.name
                      ? 'border-secondary bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary-foreground shadow-md'
                      : 'border-border bg-card hover:border-secondary/50 text-foreground/80'
                  }`}
                >
                  <Award className={`h-6 w-6 mb-1 ${selectedRank.name === r.name ? 'text-secondary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">{r.name}</span>
                  <span className="text-sm font-semibold text-secondary mt-1">
                    {r.name === 'Oficial Espontâneo' ? 'Valor Livre' : `R$ ${r.value.toFixed(2)}/mês`}
                  </span>
                </button>
              ))}
            </div>

            {selectedRank.name === 'Oficial Espontâneo' && (
              <div className="mt-2 p-4 bg-muted/40 rounded-xl border border-border space-y-2">
                <Label htmlFor="customAmount" className="text-sm font-bold text-primary dark:text-primary-foreground">
                  Valor da Doação Espontânea (R$)
                </Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="Digite o valor desejado (ex: 75)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-xs text-muted-foreground">
                  Contribua mensalmente com qualquer valor a partir de R$ 1,00.
                </p>
              </div>
            )}

            <Button
              onClick={handleNextStep}
              disabled={submitting}
              className="w-full h-12 text-base font-bold bg-primary text-ouro-bianco hover:bg-secondary hover:text-ouro-bianco cursor-pointer transition"
            >
              {submitting ? (
                'Redirecionando...'
              ) : (
                <>
                  Avançar para o Cadastro <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* ETAPA 2: Formulário de Inscrição */}
        {step === 2 && (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-4 space-y-4">
            <div className="p-3 bg-secondary/15 rounded-xl border border-secondary/35 text-xs text-primary dark:text-primary-foreground font-semibold flex items-center justify-between">
              <span>
                Plano Selecionado:{' '}
                <strong>
                  {selectedRank.name} ({selectedRank.name === 'Oficial Espontâneo'
                    ? `R$ ${parseFloat(customAmount || '0').toFixed(2)}`
                    : `R$ ${selectedRank.value.toFixed(2)}`}/mês)
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-secondary hover:underline cursor-pointer"
              >
                Alterar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Ex: João da Silva" {...register('name')} />
                {errors.name && <span className="text-xs text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="nome@email.com" {...register('email')} />
                {errors.email && <span className="text-xs text-red-500 font-semibold">{errors.email.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  {...register('cpf', {
                    onChange: (e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 11);
                      let formatted = clean;
                      if (clean.length > 3) {
                        formatted = `${clean.slice(0, 3)}.${clean.slice(3)}`;
                      }
                      if (clean.length > 6) {
                        formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
                      }
                      if (clean.length > 9) {
                        formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
                      }
                      e.target.value = formatted;
                    }
                  })}
                />
                {errors.cpf && <span className="text-xs text-red-500 font-semibold">{errors.cpf.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input id="birthDate" type="date" {...register('birthDate')} />
                {errors.birthDate && <span className="text-xs text-red-500 font-semibold">{errors.birthDate.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="(00) 90000-0000"
                  {...register('phone', {
                    onChange: (e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 11);
                      let formatted = clean;
                      if (clean.length > 0) {
                        const ddd = clean.slice(0, 2);
                        if (clean.length <= 2) {
                          formatted = `(${ddd}`;
                        } else if (clean.length <= 6) {
                          formatted = `(${ddd}) ${clean.slice(2)}`;
                        } else if (clean.length <= 10) {
                          formatted = `(${ddd}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
                        } else {
                          formatted = `(${ddd}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
                        }
                      }
                      e.target.value = formatted;
                    }
                  })}
                />
                {errors.phone && <span className="text-xs text-red-500 font-semibold">{errors.phone.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input id="address" placeholder="Ex: Rua, nº, Bairro, Cidade - UF" {...register('address')} />
                {errors.address && <span className="text-xs text-red-500 font-semibold">{errors.address.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha de Acesso</Label>
                <Input id="password" type="password" placeholder="******" {...register('password')} />
                {errors.password && <span className="text-xs text-red-500 font-semibold">{errors.password.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input id="confirmPassword" type="password" placeholder="******" {...register('confirmPassword')} />
                {errors.confirmPassword && <span className="text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 cursor-pointer">
                Voltar
              </Button>
              <Button type="submit" disabled={submitting} className="w-2/3 bg-primary text-ouro-bianco hover:bg-secondary hover:text-ouro-bianco cursor-pointer transition font-bold">
                {submitting ? 'Alistando...' : 'Finalizar Alistamento'}
              </Button>
            </div>
          </form>
        )}

        {/* ETAPA 3: Sucesso e PIX */}
        {step === 3 && (
          <div className="mt-4 space-y-6 text-center">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/40 text-sm font-semibold">
              {pixData?.thankYouMsg}
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              {pixData?.pixQrCode ? (
                <div className="p-3 bg-white rounded-2xl border border-secondary shadow-md">
                  <img
                    src={pixData.pixQrCode}
                    alt="QR Code PIX"
                    className="h-44 w-44 object-contain"
                  />
                </div>
              ) : (
                <div className="p-8 border border-dashed border-secondary rounded-2xl bg-card max-w-[200px] text-xs text-muted-foreground flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 text-secondary mb-2" />
                  QR Code PIX indisponível
                </div>
              )}

              <div className="w-full max-w-md p-4 bg-muted/60 rounded-2xl text-left border border-border space-y-2">
                <div className="text-xs text-muted-foreground uppercase font-bold">Instruções de Pagamento:</div>
                <div className="text-sm"><strong>Banco:</strong> {pixData?.pixBank}</div>
                <div className="text-sm"><strong>Beneficiário:</strong> {pixData?.pixReceiver}</div>
                <div className="text-sm font-semibold text-secondary"><strong>Valor:</strong> R$ {pixData?.amount?.toFixed(2)}</div>
                
                <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                  <div className="flex-1 text-xs truncate bg-background p-2 rounded-lg border border-border select-all font-mono">
                    {pixData?.pixKey}
                  </div>
                  <Button size="icon" variant="outline" onClick={copyPixKey} className="shrink-0 h-9 w-9 cursor-pointer">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-2 font-medium">
              Utilize o e-mail cadastrado e sua senha para fazer login e conferir o andamento de suas doações.
            </div>

            <Button onClick={handleClose} className="w-full h-12 text-base font-bold bg-primary text-ouro-bianco hover:bg-secondary hover:text-ouro-bianco cursor-pointer transition">
              Fechar e Acessar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
