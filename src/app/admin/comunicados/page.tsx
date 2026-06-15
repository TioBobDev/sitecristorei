'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAnnouncementsForAdmin, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/services/actions/admin.actions';
import { useSession } from 'next-auth/react';
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
import { Megaphone, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

export default function ComunicadosAdminPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const res = await getAnnouncementsForAdmin();
    setAnnouncements(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleEdit = (ann: any) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      let res;
      if (editingId) {
        res = await updateAnnouncement(adminId, editingId, { title, content });
      } else {
        res = await createAnnouncement(adminId, { title, content });
      }

      if (res.success) {
        setSuccessMsg(editingId ? 'Comunicado atualizado!' : 'Comunicado disparado com sucesso!');
        clearForm();
        fetchAnnouncements();
      } else {
        setErrorMsg('Erro ao salvar comunicado.');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!adminId) return;
    if (!confirm('Deseja realmente excluir este comunicado? Ele sumirá da área de todos os benfeitores.')) return;

    const res = await deleteAnnouncement(adminId, id);
    if (res.success) {
      setSuccessMsg('Comunicado excluído com sucesso.');
      fetchAnnouncements();
    } else {
      setErrorMsg('Falha ao excluir comunicado.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Gerenciar Comunicados
            </h1>
            <p className="text-sm text-muted-foreground">
              Publique comunicados oficiais para visualização restrita na Área do Benfeitor.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulário (Esquerda) */}
        <div className="lg:col-span-4">
          <Card className="glass shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground">
                  {editingId ? 'Editar Comunicado' : 'Novo Comunicado'}
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="ann-title">Título do Comunicado</Label>
                  <Input
                    id="ann-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Assembleia Virtual dia 25/08"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ann-content">Conteúdo / Mensagem</Label>
                  <textarea
                    id="ann-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="Digite a mensagem que deseja transmitir aos benfeitores..."
                    required
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <Button type="button" variant="outline" onClick={clearForm} className="w-1/3 cursor-pointer">
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isPending}
                    className={`bg-primary text-secondary hover:bg-secondary hover:text-primary transition font-bold cursor-pointer ${
                      editingId ? 'w-2/3' : 'w-full'
                    }`}
                  >
                    {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Enviar Comunicado'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Listagem (Direita) */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Título</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Data de Envio</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Autor</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                      Carregando comunicados...
                    </TableCell>
                  </TableRow>
                ) : announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground font-medium">
                      Nenhum comunicado enviado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((ann) => (
                    <TableRow key={ann.id} className="hover:bg-muted/10 transition">
                      <TableCell className="font-serif font-bold text-primary dark:text-primary-foreground">
                        {ann.title}
                      </TableCell>
                      <TableCell className="text-xs font-semibold whitespace-nowrap">
                        {new Date(ann.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-semibold">
                        {ann.author.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(ann)} className="h-8 w-8 cursor-pointer text-blue-500 hover:text-blue-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(ann.id)} className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
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
