'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getNewsForAdmin, createNews, updateNews, deleteNews } from '@/services/actions/admin.actions';
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
import { FileText, Plus, Edit2, Trash2, Check, AlertCircle, Eye, Heading, Bold, Italic, Link2 } from 'lucide-react';

export default function NoticiasAdminPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    const res = await getNewsForAdmin();
    setNewsList(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setSummary('');
    setContent('');
    setCoverImage('');
    setIsPreview(false);
  };

  const handleEdit = (news: any) => {
    setEditingId(news.id);
    setTitle(news.title);
    setSubtitle(news.subtitle || '');
    setSummary(news.summary);
    setContent(news.content);
    setCoverImage(news.coverImage || '');
    setIsPreview(false);
  };

  const insertTag = (openTag: string, closeTag: string) => {
    const txtArea = document.getElementById('not-content') as HTMLTextAreaElement;
    if (!txtArea) return;

    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const text = txtArea.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    
    setContent(text.substring(0, start) + replacement + text.substring(end));
    
    // Devolve o foco
    setTimeout(() => {
      txtArea.focus();
      txtArea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      let res;
      if (editingId) {
        res = await updateNews(adminId, editingId, { title, subtitle, summary, content, coverImage });
      } else {
        res = await createNews(adminId, { title, subtitle, summary, content, coverImage });
      }

      if (res.success) {
        setSuccessMsg(editingId ? 'Notícia atualizada!' : 'Notícia criada com sucesso!');
        clearForm();
        fetchNews();
      } else {
        setErrorMsg('Erro ao salvar notícia.');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!adminId) return;
    if (!confirm('Deseja realmente deletar esta notícia?')) return;

    const res = await deleteNews(adminId, id);
    if (res.success) {
      setSuccessMsg('Notícia excluída com sucesso.');
      fetchNews();
    } else {
      setErrorMsg('Falha ao excluir notícia.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Gerenciar Notícias
            </h1>
            <p className="text-sm text-muted-foreground">
              Cadastre informativos gerais para o portal público de notícias.
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
                  {editingId ? 'Editar Notícia' : 'Nova Notícia'}
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="not-title">Título</Label>
                  <Input
                    id="not-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Novo Curso Gratuito de Informática"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="not-subtitle">Subtítulo (Opcional)</Label>
                  <Input
                    id="not-subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: Aulas iniciam na próxima semana..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="not-summary">Resumo / Introdução</Label>
                  <textarea
                    id="not-summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    placeholder="Breve resumo exibido nos cartões de notícias..."
                    required
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="not-cover">URL da Imagem de Capa (Opcional)</Label>
                  <Input
                    id="not-cover"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Ex: /images/news/evento.jpg"
                  />
                </div>

                {/* Editor Rich Text Simplificado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="not-content">Conteúdo Completo</Label>
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
                      id="not-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      placeholder="Utilize as tags HTML ou os botões de formatação acima para formatar o texto do artigo..."
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
                    className={`bg-primary text-secondary hover:bg-secondary hover:text-primary transition font-bold cursor-pointer ${
                      editingId ? 'w-2/3' : 'w-full'
                    }`}
                  >
                    {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Publicar Notícia'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Listagem (Direita) */}
        <div className="xl:col-span-7">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Título</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Autor</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Data</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                      Carregando notícias...
                    </TableCell>
                  </TableRow>
                ) : newsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground font-medium">
                      Nenhuma notícia publicada ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  newsList.map((news) => (
                    <TableRow key={news.id} className="hover:bg-muted/10 transition">
                      <TableCell className="font-serif font-bold text-primary dark:text-primary-foreground">
                        {news.title}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-semibold">
                        {news.author.name}
                      </TableCell>
                      <TableCell className="text-xs font-semibold whitespace-nowrap">
                        {new Date(news.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(news)} className="h-8 w-8 cursor-pointer text-blue-500 hover:text-blue-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(news.id)} className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-600">
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
