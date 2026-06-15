import React from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { getSiteSettings } from '@/services/actions/site.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const revalidate = 3600; // Revalida a cada hora

export default async function ContatoPage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 space-y-12">
        {/* Cabeçalho */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-secondary font-serif text-sm uppercase tracking-widest font-semibold">
            Fale Conosco
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-primary dark:text-primary-foreground">
            Canais de Contato
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            Tem dúvidas sobre o Exército de Cristo Rei, doações ou deseja ser voluntário? Mande sua mensagem!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          {/* Informações de Contato (Lado Esquerdo) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground">
                Associação Cristo Rei do Universo
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Nossa secretaria social está aberta de segunda a sexta-feira, das 8h às 17h, para acolhimento de famílias e atendimento a benfeitores.
              </p>

              <div className="space-y-4 pt-2">
                {settings?.address && (
                  <div className="flex items-start gap-3 text-sm font-medium">
                    <div className="h-9 w-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-primary dark:text-primary-foreground">Endereço</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{settings.address}</div>
                    </div>
                  </div>
                )}

                {settings?.phone && (
                  <div className="flex items-start gap-3 text-sm font-medium">
                    <div className="h-9 w-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-primary dark:text-primary-foreground">Telefone / WhatsApp</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{settings.phone}</div>
                    </div>
                  </div>
                )}

                {settings?.email && (
                  <div className="flex items-start gap-3 text-sm font-medium">
                    <div className="h-9 w-9 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-primary dark:text-primary-foreground">E-mail de Contato</div>
                      <div className="text-muted-foreground text-xs mt-0.5 truncate">{settings.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dúvidas Frequentes Box */}
            <div className="p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-secondary/25 space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary dark:text-primary-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-secondary" />
                Como funciona o Exército?
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                O Exército de Cristo Rei do Universo é a denominação espiritual e fraterna dos nossos associados benfeitores. Ao se cadastrar, você contribui mensalmente via PIX para assegurar a continuidade dos nossos projetos sociais estruturais.
              </p>
            </div>
          </div>

          {/* Formulário de Mensagem (Lado Direito) */}
          <div className="lg:col-span-7">
            <form className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-primary dark:text-primary-foreground">
                Envie uma Mensagem
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contato-name">Nome Completo</Label>
                  <Input id="contato-name" placeholder="Ex: João Silva" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contato-email">E-mail</Label>
                  <Input id="contato-email" type="email" placeholder="nome@email.com" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contato-subject">Assunto</Label>
                <Input id="contato-subject" placeholder="Ex: Dúvidas sobre o projeto de música" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contato-message">Mensagem</Label>
                <textarea
                  id="contato-message"
                  rows={5}
                  placeholder="Escreva sua mensagem aqui..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-primary text-secondary hover:bg-secondary hover:text-primary font-bold transition cursor-pointer">
                Enviar Mensagem <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
