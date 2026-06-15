'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      // Consulta a sessão recém-criada para verificar a role e fazer o redirecionamento adequado
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === 'ADMIN' || role === 'EDITOR') {
        router.push('/admin/dashboard');
      } else if (role === 'BENEFACTOR') {
        router.push('/associado/dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro no servidor. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-muted/20">
      <div className="w-full max-w-md space-y-6 bg-card border border-border p-6 md:p-8 rounded-2xl shadow-xl glass relative">
        {/* Voltar para Home */}
        <Link
          href="/"
          className="absolute top-6 left-6 text-xs font-bold text-secondary hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Início
        </Link>

        <div className="text-center pt-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-secondary mb-3">
            <Shield className="h-6 w-6 text-secondary" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
            Área Restrita
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
            Igreja Cristo Rei do Universo
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">E-mail</Label>
            <div className="relative">
              <Input
                id="login-email"
                type="email"
                placeholder="Ex: joao@email.com"
                className="pl-10"
                {...register('email')}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.email && <span className="text-xs text-red-500 font-semibold">{errors.email.message}</span>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Senha</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="******"
                className="pl-10 pr-10"
                {...register('password')}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-500 font-semibold">{errors.password.message}</span>}
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-secondary hover:bg-secondary hover:text-primary font-bold cursor-pointer transition">
            {loading ? 'Entrando...' : 'Acessar Painel'}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground font-medium pt-2">
          Não é um benfeitor cadastrado?{' '}
          <Link href="/#seja-benfeitor" className="text-secondary hover:underline font-bold cursor-pointer">
            Seja um Benfeitor
          </Link>
        </div>
      </div>
    </div>
  );
}
