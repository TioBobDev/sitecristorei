'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getCarouselImagesForAdmin, createCarouselImage, updateCarouselImage, deleteCarouselImage } from '@/services/actions/admin.actions';
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
import { ImageIcon, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

export default function CarrosselAdminPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estados do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [order, setOrder] = useState('0');
  const [active, setActive] = useState(true);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSlides = async () => {
    setLoading(true);
    const res = await getCarouselImagesForAdmin();
    setSlides(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLinkUrl('');
    setOrder('0');
    setActive(true);
  };

  const handleEdit = (slide: any) => {
    setEditingId(slide.id);
    setTitle(slide.title || '');
    setDescription(slide.description || '');
    setImageUrl(slide.imageUrl);
    setLinkUrl(slide.linkUrl || '');
    setOrder(slide.order.toString());
    setActive(slide.active);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    if (!imageUrl) {
      setErrorMsg('A URL da imagem é obrigatória.');
      return;
    }

    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      let res;
      if (editingId) {
        res = await updateCarouselImage(adminId, editingId, {
          title: title || undefined,
          description: description || undefined,
          imageUrl,
          linkUrl: linkUrl || undefined,
          order: parseInt(order) || 0,
          active,
        });
      } else {
        res = await createCarouselImage(adminId, {
          title: title || undefined,
          description: description || undefined,
          imageUrl,
          linkUrl: linkUrl || undefined,
          order: parseInt(order) || 0,
        });
      }

      if (res.success) {
        setSuccessMsg(editingId ? 'Slide atualizado!' : 'Slide do carrossel cadastrado!');
        clearForm();
        fetchSlides();
      } else {
        setErrorMsg('Erro ao salvar slide.');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!adminId) return;
    if (!confirm('Deseja realmente excluir este slide?')) return;

    const res = await deleteCarouselImage(adminId, id);
    if (res.success) {
      setSuccessMsg('Slide excluído com sucesso.');
      fetchSlides();
    } else {
      setErrorMsg('Falha ao excluir slide.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Gerenciar Carrossel
            </h1>
            <p className="text-sm text-muted-foreground">
              Cadastre e ordene os banners de destaque exibidos no topo da página inicial.
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
                  {editingId ? 'Editar Slide' : 'Novo Slide'}
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="car-title">Título (Opcional)</Label>
                  <Input
                    id="car-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Aulas de Música gratuitas"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="car-desc">Descrição / Subtítulo (Opcional)</Label>
                  <Input
                    id="car-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Aprenda violão e teclado conosco"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="car-img">Caminho / URL da Imagem</Label>
                  <Input
                    id="car-img"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Ex: /images/carousel/hero-1.jpg"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="car-link">Link de Redirecionamento (Opcional)</Label>
                  <Input
                    id="car-link"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Ex: /projetos/aula-de-musica"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="car-order">Ordem</Label>
                    <Input
                      id="car-order"
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                    />
                  </div>
                  {editingId && (
                    <div className="flex flex-col justify-end pb-1.5">
                      <Label htmlFor="car-active" className="mb-2">Status</Label>
                      <Select
                        value={active ? 'true' : 'false'}
                        onValueChange={(val) => setActive(val === 'true')}
                      >
                        <SelectTrigger id="car-active" className="w-full h-10 border border-input rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass border border-border">
                          <SelectItem value="true" className="cursor-pointer">Ativo</SelectItem>
                          <SelectItem value="false" className="cursor-pointer">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Slide'}
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
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Miniatura</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground">Título / Info</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Ordem</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Status</TableHead>
                  <TableHead className="font-bold text-primary dark:text-primary-foreground text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground animate-pulse font-medium">
                      Carregando slides...
                    </TableCell>
                  </TableRow>
                ) : slides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground font-medium">
                      Nenhum slide cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  slides.map((slide) => (
                    <TableRow key={slide.id} className="hover:bg-muted/10 transition">
                      <TableCell className="p-3">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title || 'Slide'}
                          className="h-10 w-20 object-cover rounded border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/logo.png';
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-xs md:text-sm">
                        <div className="font-bold text-primary dark:text-primary-foreground">{slide.title || 'Sem título'}</div>
                        <div className="text-muted-foreground text-xs truncate max-w-[180px]">{slide.description}</div>
                      </TableCell>
                      <TableCell className="text-center font-bold">{slide.order}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          slide.active
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {slide.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(slide)} className="h-8 w-8 cursor-pointer text-blue-500 hover:text-blue-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(slide.id)} className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-600">
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
