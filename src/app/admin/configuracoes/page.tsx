'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getSiteSettings } from '@/services/actions/site.actions';
import { updateSiteSettings } from '@/services/actions/admin.actions';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function ConfiguracoesAdminPage() {
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estados dos campos
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');

  const [pixKey, setPixKey] = useState('');
  const [pixBank, setPixBank] = useState('');
  const [pixReceiver, setPixReceiver] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [thankYouMsg, setThankYouMsg] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSiteSettings();
      if (res) {
        setName(res.name);
        setLogoUrl(res.logoUrl || '');
        setAddress(res.address || '');
        setPhone(res.phone || '');
        setEmail(res.email || '');
        setFacebook(res.facebook || '');
        setInstagram(res.instagram || '');
        setYoutube(res.youtube || '');
        setPixKey(res.pixKey || '');
        setPixBank(res.pixBank || '');
        setPixReceiver(res.pixReceiver || '');
        setPixQrCode(res.pixQrCode || '');
        setThankYouMsg(res.thankYouMsg || '');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateSiteSettings(adminId, {
        name,
        logoUrl,
        address,
        phone,
        email,
        facebook,
        instagram,
        youtube,
        pixKey,
        pixBank,
        pixReceiver,
        pixQrCode,
        thankYouMsg,
      });

      if (res.success) {
        setSuccessMsg('Configurações atualizadas com sucesso!');
      } else {
        setErrorMsg('Falha ao salvar configurações.');
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground animate-pulse font-medium">
        Carregando configurações institucionais...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-secondary flex items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
              Configurações Gerais
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualize as informações de contato, links sociais e dados bancários de doação PIX da igreja.
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

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Bloco 1: Dados da Instituição */}
        <Card className="glass shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-secondary" /> Dados Institucionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cfg-name">Nome da Instituição</Label>
                <Input id="cfg-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-logo">URL do Logotipo</Label>
                <Input id="cfg-logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/images/logo.png" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-phone">Telefone / WhatsApp</Label>
                <Input id="cfg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-email">E-mail de Contato</Label>
                <Input id="cfg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <Label htmlFor="cfg-address">Endereço Completo</Label>
                <Input id="cfg-address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco 2: Contas e Recebimento PIX */}
        <Card className="glass shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground flex items-center gap-1.5">
              <DollarSign className="h-5 w-5 text-secondary" /> Configuração do PIX e Doações
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cfg-pix">Chave PIX</Label>
                <Input id="cfg-pix" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CNPJ, E-mail ou Celular" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-receiver">Titular / Recebedor</Label>
                <Input id="cfg-receiver" value={pixReceiver} onChange={(e) => setPixReceiver(e.target.value)} placeholder="Nome da Associação na conta bancária" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-bank">Banco do Destinatário</Label>
                <Input id="cfg-bank" value={pixBank} onChange={(e) => setPixBank(e.target.value)} placeholder="Ex: Banco do Brasil" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-qrcode">QR Code PIX (URL ou Base64 Imagem)</Label>
                <Input id="cfg-qrcode" value={pixQrCode} onChange={(e) => setPixQrCode(e.target.value)} placeholder="data:image/png;base64,..." />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <Label htmlFor="cfg-thank">Mensagem de Agradecimento (Pós-doação)</Label>
                <textarea
                  id="cfg-thank"
                  value={thankYouMsg}
                  onChange={(e) => setThankYouMsg(e.target.value)}
                  rows={3}
                  placeholder="Mensagem exibida após o benfeitor se cadastrar..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco 3: Links de Redes Sociais */}
        <Card className="glass shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-secondary" /> Redes Sociais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cfg-fb">Link Facebook</Label>
                <Input id="cfg-fb" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-ig">Link Instagram</Label>
                <Input id="cfg-ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-yt">Link YouTube</Label>
                <Input id="cfg-yt" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isPending} className="w-full h-12 bg-primary text-secondary hover:bg-secondary hover:text-primary font-bold transition cursor-pointer">
          {isPending ? 'Salvando Configurações...' : 'Salvar Todas as Configurações'}
        </Button>
      </form>
    </div>
  );
}
