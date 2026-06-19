'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getCategoriesForAdmin, createCategory, updateCategory, deleteCategory } from '@/services/actions/admin.actions';
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
import { FolderTree, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

export default function CategoriasAdminPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await getCategoriesForAdmin();
    setCategories(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setBannerUrl('');
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setBannerUrl(cat.bannerUrl || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      let res;
      if (editingId) {
        res = await updateCategory(adminId, editingId, { name, description, bannerUrl });
      } else {
        res = await createCategory(adminId, { name, description, bannerUrl });
      }

      if (res.success) {
        setSuccessMsg(editingId ? 'Categoria atualizada!' : 'Categoria criada com sucesso!');
        clearForm();
        fetchCategories();
      } else {
        setErrorMsg('Erro ao salvar categoria. Verifique os dados ou se o nome já existe.');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!adminId) return;
    if (!confirm('Deseja realmente excluir esta categoria? Isso pode afetar posts e projetos vinculados.')) return;

    const res = await deleteCategory(adminId, id);
    if (res.success) {
      setSuccessMsg('Categoria excluída com sucesso.');
      fetchCategories();
    } else {
      setErrorMsg('Falha ao excluir categoria.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Gerenciar Categorias
            </h1>
            <p className="text-sm text-muted-foreground">
              Crie categorias para projetos sociais. Rotas e links de Navbar são gerados na hora.
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
          <Card className="glass shadow-sm border border-border">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground">
                  {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-name">Nome da Categoria</Label>
                  <Input
                    id="cat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Aula de Música"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-desc">Descrição</Label>
                  <textarea
                    id="cat-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Breve resumo sobre a categoria..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-banner">URL do Banner (Opcional)</Label>
                  <Input
                    id="cat-banner"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="Ex: /images/categories/aula-de-musica.jpg"
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
                    className={`bg-primary text-ouro-bianco hover:bg-secondary hover:text-ouro-bianco transition font-bold cursor-pointer ${
                      editingId ? 'w-2/3' : 'w-full'
                    }`}
                  >
                    {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Categoria'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Listagem em Tabela (Direita) */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Nome</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Slug / Rota</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Descrição</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                      Carregando categorias...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground font-medium">
                      Nenhuma categoria cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-muted/10 transition">
                      <TableCell className="font-serif font-bold text-primary dark:text-primary-foreground">
                        {cat.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-secondary">
                        /projetos/{cat.slug}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground font-medium text-xs">
                        {cat.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)} className="h-8 w-8 cursor-pointer text-blue-500 hover:text-blue-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)} className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-600">
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
