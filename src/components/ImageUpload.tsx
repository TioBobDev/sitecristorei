'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, placeholder, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho de arquivo (ex: máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro no upload do arquivo');
      }

      const data = await response.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        throw new Error('Retorno inválido do servidor');
      }
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);
      setError(err.message || 'Falha ao realizar upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const removeImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className || ''}`}>
      {/* Input de arquivo invisível */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        // Preview da imagem
        <div className="relative rounded-xl border border-border overflow-hidden bg-muted/20 group/upload flex items-center justify-center h-48 w-full max-w-lg shadow-inner">
          <img
            src={value}
            alt="Upload Preview"
            className="h-full w-full object-cover transition duration-300 group-hover/upload:scale-102"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition duration-300 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 text-primary hover:bg-white border-none font-semibold text-xs shadow-md cursor-pointer"
            >
              Alterar Imagem
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={removeImage}
              className="font-semibold text-xs shadow-md cursor-pointer"
            >
              <X className="h-4 w-4" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        // Drag and drop zone
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-secondary rounded-xl p-6 text-center cursor-pointer transition bg-muted/5 hover:bg-muted/15 flex flex-col items-center justify-center gap-3 h-48 w-full max-w-lg group"
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 text-secondary animate-spin" />
              <span className="text-sm font-semibold text-muted-foreground">Enviando imagem...</span>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-muted/40 group-hover:bg-secondary/10 flex items-center justify-center transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary dark:text-primary-foreground group-hover:text-secondary transition-colors">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {placeholder || 'PNG, JPG ou WEBP de até 5MB'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Input de texto oculto / secundário para permitir visualização / edição manual do link se necessário */}
      <div className="flex gap-2 items-center max-w-lg">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider whitespace-nowrap shrink-0">Caminho da Imagem:</span>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ou insira um link direto..."
          className="text-xs h-7"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive font-semibold flex items-center gap-1.5 animate-pulse">
          <X className="h-3 w-3 border border-destructive rounded-full" /> {error}
        </p>
      )}
    </div>
  );
}
