'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateBenefactorProfile } from '@/services/actions/benefactor.actions';
import { Check, ShieldAlert } from 'lucide-react';

const profileSchema = z
  .object({
    phone: z.string().min(10, 'Telefone inválido'),
    address: z.string().min(10, 'Endereço completo é obrigatório'),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Senha atual é necessária para alterar a senha',
      path: ['currentPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword !== data.confirmNewPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'As novas senhas não coincidem',
      path: ['confirmNewPassword'],
    }
  );

type ProfileValues = z.infer<typeof profileSchema>;

interface MemberProfileFormProps {
  userId: string;
  initialData: {
    cpf: string;
    phone: string;
    address: string;
  };
}

export function MemberProfileForm({ userId, initialData }: MemberProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: initialData.phone,
      address: initialData.address,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await updateBenefactorProfile(userId, {
      phone: values.phone,
      address: values.address,
      currentPassword: values.currentPassword || undefined,
      newPassword: values.newPassword || undefined,
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg('Cadastro atualizado com sucesso!');
      // Limpa os campos de senha
      reset({
        phone: values.phone,
        address: values.address,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } else {
      setErrorMsg(res.error || 'Falha ao atualizar dados cadastrais.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
      {successMsg && (
        <div className="p-3 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2 font-medium">
          <Check className="h-4 w-4" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2 font-medium">
          <ShieldAlert className="h-4 w-4" /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPF (Somente Leitura) */}
        <div className="space-y-1.5">
          <Label htmlFor="perf-cpf" className="text-muted-foreground">CPF (Não pode ser alterado)</Label>
          <Input id="perf-cpf" value={initialData.cpf} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
        </div>

        {/* Telefone */}
        <div className="space-y-1.5">
          <Label htmlFor="perf-phone">Telefone / WhatsApp</Label>
          <Input id="perf-phone" {...register('phone')} />
          {errors.phone && <span className="text-xs text-red-500 font-semibold">{errors.phone.message}</span>}
        </div>

        {/* Endereço Completo */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <Label htmlFor="perf-address">Endereço Completo</Label>
          <Input id="perf-address" {...register('address')} />
          {errors.address && <span className="text-xs text-red-500 font-semibold">{errors.address.message}</span>}
        </div>
      </div>

      <hr className="border-border my-6" />

      <div>
        <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground mb-1">
          Alteração de Senha
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Preencha apenas se desejar trocar sua senha de acesso ao portal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Senha Atual */}
        <div className="space-y-1.5">
          <Label htmlFor="perf-currpass">Senha Atual</Label>
          <Input id="perf-currpass" type="password" placeholder="******" {...register('currentPassword')} />
          {errors.currentPassword && <span className="text-xs text-red-500 font-semibold">{errors.currentPassword.message}</span>}
        </div>

        {/* Nova Senha */}
        <div className="space-y-1.5">
          <Label htmlFor="perf-newpass">Nova Senha</Label>
          <Input id="perf-newpass" type="password" placeholder="******" {...register('newPassword')} />
          {errors.newPassword && <span className="text-xs text-red-500 font-semibold">{errors.newPassword.message}</span>}
        </div>

        {/* Confirmar Nova Senha */}
        <div className="space-y-1.5">
          <Label htmlFor="perf-confpass">Confirmar Nova Senha</Label>
          <Input id="perf-confpass" type="password" placeholder="******" {...register('confirmNewPassword')} />
          {errors.confirmNewPassword && <span className="text-xs text-red-500 font-semibold">{errors.confirmNewPassword.message}</span>}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full bg-primary text-secondary hover:bg-secondary hover:text-primary font-bold cursor-pointer transition">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}
