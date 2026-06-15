import React from 'react';
import { auth } from '@/auth';
import { getBenefactorDashboardData } from '@/services/actions/benefactor.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Award, Calendar, DollarSign, Clock, Megaphone } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-center p-6 text-sm text-red-500 font-bold">Não autorizado.</div>;
  }

  const data = await getBenefactorDashboardData(userId);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-dashed border-border text-center space-y-4">
        <ShieldAlert className="h-10 w-10 text-secondary" />
        <h3 className="font-serif text-lg font-bold">Cadastro em Processamento</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Seu cadastro de benfeitor ainda está sendo associado à sua conta. Se o erro persistir, fale com o suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary dark:text-primary-foreground">
          Olá, Soldado {data.name}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo à sua área de benfeitor do Exército de Cristo Rei.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categoria Militar */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Patente</CardTitle>
            <Award className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary dark:text-primary-foreground">{data.militaryRank}</div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Sua modalidade de apoio</p>
          </CardContent>
        </Card>

        {/* Adesão */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adesão</CardTitle>
            <Calendar className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary dark:text-primary-foreground">
              {new Date(data.joinDate).toLocaleDateString('pt-BR')}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Data em que se alistou</p>
          </CardContent>
        </Card>

        {/* Total Contribuído */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Doado</CardTitle>
            <DollarSign className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary dark:text-primary-foreground">
              R$ {data.totalDonated.toFixed(2)}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Contribuições confirmadas</p>
          </CardContent>
        </Card>

        {/* Última Doação */}
        <Card className="glass shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Último PIX</CardTitle>
            <Clock className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary dark:text-primary-foreground">
              {data.lastDonation ? `R$ ${data.lastDonation.amount.toFixed(2)}` : 'R$ 0,00'}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              {data.lastDonation
                ? `Em ${new Date(data.lastDonation.date).toLocaleDateString('pt-BR')} (${
                    data.lastDonation.status === 'CONFIRMED'
                      ? 'Confirmado'
                      : data.lastDonation.status === 'PENDING'
                      ? 'Pendente'
                      : 'Cancelado'
                  })`
                : 'Nenhuma doação registrada'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comunicados Gerais da Administração */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-primary dark:text-primary-foreground flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-secondary" />
          Comunicados Importantes
        </h2>

        {data.announcements.length === 0 ? (
          <div className="p-6 text-sm text-center text-muted-foreground bg-card border border-border rounded-xl">
            Nenhum comunicado oficial registrado no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.announcements.map((ann) => (
              <Card key={ann.id} className="border-border hover:border-secondary/25 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-serif font-bold text-primary dark:text-primary-foreground">
                    {ann.title}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-semibold text-muted-foreground">
                    Publicado em {new Date(ann.createdAt).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    {ann.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
