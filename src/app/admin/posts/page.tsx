'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getPostsForAdmin, getCategoriesForAdmin, createPost, updatePost, deletePost } from '@/services/actions/admin.actions';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
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
import { PenTool, Plus, Edit2, Trash2, Check, AlertCircle, Eye, Heading, Bold, Italic } from 'lucide-react';

export default function PostsAdminPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [postsRes, catsRes] = await Promise.all([
      getPostsForAdmin(),
      getCategoriesForAdmin(),
    ]);
    setPosts(postsRes);
    setCategories(catsRes);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setCoverImage('');
    setCategoryId('');
    setIsPreview(false);
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSummary(post.summary);
    setContent(post.content);
    setCoverImage(post.coverImage || '');
    setCategoryId(post.categoryId);
    setIsPreview(false);
  };

  const insertTag = (openTag: string, closeTag: string) => {
    const txtArea = document.getElementById('post-content') as HTMLTextAreaElement;
    if (!txtArea) return;

    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const text = txtArea.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    
    setContent(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      txtArea.focus();
      txtArea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    if (!categoryId) {
      setErrorMsg('Por favor, selecione uma categoria para a postagem.');
      return;
    }

    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      let res;
      if (editingId) {
        res = await updatePost(adminId, editingId, { title, summary, content, coverImage, categoryId });
      } else {
        res = await createPost(adminId, { title, summary, content, coverImage, categoryId });
      }

      if (res.success) {
        setSuccessMsg(editingId ? 'Post atualizado!' : 'Post publicado com sucesso!');
        clearForm();
        fetchData();
      } else {
        setErrorMsg('Erro ao salvar postagem.');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!adminId) return;
    if (!confirm('Deseja realmente excluir este post?')) return;

    const res = await deletePost(adminId, id);
    if (res.success) {
      setSuccessMsg('Post excluído com sucesso.');
      fetchData();
    } else {
      setErrorMsg('Falha ao excluir post.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <PenTool className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Gerenciar Posts de Projetos
            </h1>
            <p className="text-sm text-muted-foreground">
              Publique artigos, atualizações e prestações de contas dentro de cada projeto social.
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
        {/* Formulário (Esquerda) */}
        <div className="xl:col-span-5">
          <Card className="glass shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground">
                  {editingId ? 'Editar Postagem' : 'Novo Post'}
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="post-category">Categoria do Projeto</Label>
                  <Select
                    value={categoryId}
                    onValueChange={(val) => setCategoryId(val || '')}
                  >
                    <SelectTrigger className="w-full border border-input rounded-lg">
                      <SelectValue placeholder="Selecione o projeto social">
                        {selectedCategory ? selectedCategory.name : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="glass border border-border">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="post-title">Título do Post</Label>
                  <Input
                    id="post-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Primeira aula de violão do ano"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="post-summary">Resumo Comercial</Label>
                  <textarea
                    id="post-summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    placeholder="Resumo exibido no feed do projeto..."
                    required
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Imagem de Capa / Ilustrativa</Label>
                  <ImageUpload
                    value={coverImage}
                    onChange={(url) => setCoverImage(url)}
                    placeholder="Selecione ou arraste a imagem de capa"
                  />
                </div>

                {/* Editor Rich Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-content">Artigo / Conteúdo completo</Label>
                    <div className="flex gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
                      <button
                        type="button"
                        onClick={() => insertTag('<p>', '</p>')}
                        className="p-1 hover:bg-secondary/20 rounded text-xs font-semibold cursor-pointer"
                        title="Parágrafo"
                      >
                        P
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<h3>', '</h3>')}
                        className="p-1 hover:bg-secondary/20 rounded cursor-pointer"
                        title="Título"
                      >
                        <Heading className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<strong>', '</strong>')}
                        className="p-1 hover:bg-secondary/20 rounded cursor-pointer"
                        title="Negrito"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<em>', '</em>')}
                        className="p-1 hover:bg-secondary/20 rounded cursor-pointer"
                        title="Itálico"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className={`p-1 rounded cursor-pointer ${isPreview ? 'bg-secondary text-primary' : 'hover:bg-secondary/20'}`}
                        title="Ver Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {isPreview ? (
                    <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-3 rounded-md border border-secondary/20 bg-primary/5 dark:bg-primary/10 prose prose-slate dark:prose-invert text-xs leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: content || '<i>Sem conteúdo digitado</i>' }} />
                    </div>
                  ) : (
                    <textarea
                      id="post-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      placeholder="Formate o artigo completo do post utilizando HTML..."
                      required
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono"
                    />
                  )}
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
                    {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Publicar no Projeto'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Listagem (Direita) */}
        <div className="xl:col-span-7">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold text-primary dark:text-primary-foreground min-w-[200px]">Título</TableHead>
                    <TableHead className="font-bold text-primary dark:text-primary-foreground whitespace-nowrap">Projeto / Categoria</TableHead>
                    <TableHead className="font-bold text-primary dark:text-primary-foreground whitespace-nowrap">Autor</TableHead>
                    <TableHead className="font-bold text-primary dark:text-primary-foreground text-center whitespace-nowrap w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                        Carregando posts...
                      </TableCell>
                    </TableRow>
                  ) : posts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground font-medium">
                        Nenhuma postagem realizada ainda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-muted/10 transition">
                        <TableCell className="font-serif font-bold text-primary dark:text-primary-foreground whitespace-normal break-words min-w-[200px]">
                          {post.title}
                        </TableCell>
                        <TableCell className="text-xs text-secondary font-bold uppercase tracking-wider whitespace-nowrap">
                          {post.category.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                          {post.author.name}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(post)} className="h-8 w-8 cursor-pointer text-blue-500 hover:text-blue-600" title="Editar post">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(post.id)} className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-600" title="Excluir post">
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
    </div>
  );
}
