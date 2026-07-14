'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Trash2, ShieldAlert, Award, Calendar, Check, AlertCircle } from 'lucide-react';
import { getAdminUsers, createAdminUser, deleteAdminUser } from '@/services/actions/admin.actions';

const adminSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    role: z.enum(['ADMIN', 'EDITOR']),
    password: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type AdminFormValues = z.infer<typeof adminSchema>;

export default function UsuariosAdminPage() {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id;
  const isUserAdmin = session?.user?.role === 'ADMIN';

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      role: 'EDITOR',
    },
  });

  const selectedRole = watch('role');

  const fetchUsers = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const res = await getAdminUsers(currentUserId);
    setUsers(res);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status, currentUserId]);

  const onSubmit = (values: AdminFormValues) => {
    if (!currentUserId) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createAdminUser(currentUserId, {
        name: values.name,
        email: values.email,
        role: values.role,
        passwordRaw: values.password,
      });

      if (res.success) {
        setSuccessMsg(`Usuário ${values.name} cadastrado com sucesso!`);
        setModalOpen(false);
        reset();
        fetchUsers();
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(res.error || 'Falha ao cadastrar usuário.');
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!currentUserId) return;
    if (id === currentUserId) {
      setErrorMsg('Erro: Você não pode excluir sua própria conta.');
      return;
    }
    if (!confirm(`Deseja realmente excluir o usuário administrador "${name}"?`)) {
      return;
    }

    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await deleteAdminUser(currentUserId, id);
    if (res.success) {
      setSuccessMsg(`Usuário ${name} excluído com sucesso.`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setErrorMsg(res.error || 'Falha ao excluir usuário.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-medium text-muted-foreground animate-pulse">
          Carregando informações...
        </div>
      </div>
    );
  }

  // Se estiver autenticado mas não for ADMIN, nega o acesso
  if (status === 'authenticated' && !isUserAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-dashed border-border text-center space-y-4 max-w-lg mx-auto mt-12">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="font-serif text-xl font-bold text-primary">Acesso Restrito</h3>
        <p className="text-sm text-muted-foreground">
          Esta tela de gerenciamento de administradores é exclusiva para usuários com papel de <strong>Administrador</strong>. 
          Seu perfil atual (Editor) não possui permissões para gerenciar ou visualizar as credenciais do painel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Administradores do Painel
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as contas com acesso ao gerenciamento do site (Administradores e Editores).
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setErrorMsg(null);
            setModalOpen(true);
          }}
          className="bg-secondary text-primary hover:bg-secondary/90 hover:text-primary font-bold cursor-pointer transition shadow-sm self-start sm:self-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Administrador
        </Button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm rounded-lg border border-green-200 dark:border-green-900/40 flex items-center gap-2 font-medium">
          <Check className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900/40 flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Nome</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">E-mail</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Função / Nível</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground">Criado em</TableHead>
              <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                  Carregando lista de usuários...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground font-medium">
                  Nenhum usuário administrativo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/10 transition">
                  <TableCell className="font-serif font-bold text-primary dark:text-primary-foreground">
                    {user.name} {user.id === currentUserId && <span className="text-[10px] text-muted-foreground font-normal italic">(Você)</span>}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/80">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'Administrador' : 'Editor'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={user.id === currentUserId}
                      onClick={() => handleDelete(user.id, user.name)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={user.id === currentUserId ? 'Não é possível excluir você mesmo' : 'Excluir Administrador'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal / Dialog de Cadastro */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl glass p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl text-primary dark:text-primary-foreground font-bold">
              Cadastrar Novo Administrador
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Crie credenciais de acesso para um novo administrador ou editor do painel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Nome Completo</Label>
              <Input id="admin-name" placeholder="Ex: Maria Souza" {...register('name')} />
              {errors.name && <span className="text-xs text-red-500 font-semibold">{errors.name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-email">E-mail</Label>
              <Input id="admin-email" type="email" placeholder="nome@email.com" {...register('email')} />
              {errors.email && <span className="text-xs text-red-500 font-semibold">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-role">Função / Nível de Acesso</Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setValue('role', val as 'ADMIN' | 'EDITOR')}
              >
                <SelectTrigger id="admin-role" className="w-full border border-input rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border border-border">
                  <SelectItem value="ADMIN" className="cursor-pointer">Administrador (Permissão Total)</SelectItem>
                  <SelectItem value="EDITOR" className="cursor-pointer">Editor (Gerenciar Conteúdo)</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <span className="text-xs text-red-500 font-semibold">{errors.role.message}</span>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Senha</Label>
              <Input id="admin-password" type="password" placeholder="******" {...register('password')} />
              {errors.password && <span className="text-xs text-red-500 font-semibold">{errors.password.message}</span>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-confirm-password">Confirmar Senha</Label>
              <Input id="admin-confirm-password" type="password" placeholder="******" {...register('confirmPassword')} />
              {errors.confirmPassword && <span className="text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</span>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="w-1/3 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-2/3 bg-primary text-ouro-bianco hover:bg-secondary hover:text-ouro-bianco cursor-pointer transition font-bold"
              >
                {isPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
