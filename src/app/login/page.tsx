'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn, useSession } from 'next-auth/react';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowLeft, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const reasonParam = searchParams.get('reason');
  const isInactive = reasonParam === 'inactive';

  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<'benfeitor' | 'admin'>('benfeitor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redireciona automaticamente se já estiver autenticado
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const dest = (session.user.role === 'ADMIN' || session.user.role === 'EDITOR')
        ? '/admin/dashboard'
        : '/associado/dashboard';
      window.location.href = dest;
    }
  }, [status, session]);

  useEffect(() => {
    if (typeParam === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('benfeitor');
    }
  }, [typeParam]);

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
      const destination = activeTab === 'admin' ? '/admin/dashboard' : '/associado/dashboard';
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        callbackUrl: destination,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      window.location.href = destination;
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

        {/* Logo da Instituição */}
        <div className="flex flex-col items-center pt-4">
          <Link href="/" className="transition hover:opacity-90">
            <img
              src="/images/logo.png"
              alt="Logo Cristo Rei"
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Abas de Diferenciação */}
        <div className="flex rounded-lg bg-muted/40 p-1 border border-border/40 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('benfeitor')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition duration-200 cursor-pointer text-center ${
              activeTab === 'benfeitor'
                ? 'bg-card text-secondary shadow-xs border border-border/30 font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sou Benfeitor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition duration-200 cursor-pointer text-center ${
              activeTab === 'admin'
                ? 'bg-card text-primary shadow-xs border border-border/30 font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sou Administrador
          </button>
        </div>

        <div className="text-center pt-2">
          {activeTab === 'benfeitor' ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15 text-secondary mb-3">
                <Heart className="h-6 w-6 text-secondary fill-current" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-secondary">
                Área do Benfeitor
              </h1>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
                Painel Administrativo
              </h1>
            </>
          )}
          <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">
            Igreja Cristo Rei do Universo
          </p>
        </div>

        {isInactive && !errorMsg && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs rounded-lg border border-amber-200 dark:border-amber-900/40 font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            Sua sessão expirou devido à inatividade. Por favor, faça login novamente.
          </div>
        )}

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

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-11 font-bold cursor-pointer transition ${
              activeTab === 'benfeitor'
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {loading ? 'Entrando...' : activeTab === 'benfeitor' ? 'Entrar como Benfeitor' : 'Entrar como Administrador'}
          </Button>
        </form>

        {activeTab === 'benfeitor' ? (
          <div className="text-center text-xs text-muted-foreground font-medium pt-2">
            Não é um benfeitor cadastrado?{' '}
            <Link href="/#seja-benfeitor" className="text-secondary hover:underline font-bold cursor-pointer">
              Seja um Benfeitor
            </Link>
          </div>
        ) : (
          <div className="text-center text-xs text-muted-foreground font-semibold italic pt-2">
            Área de acesso restrito a administradores e editores.
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
