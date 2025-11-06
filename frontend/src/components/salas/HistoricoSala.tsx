import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAgendamentosBySala } from "@/hooks/useAgendamentos";
import { useAcessos } from "@/hooks/useAcessos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, TrendingUp, User } from "lucide-react";
import {
  format,
  differenceInMinutes,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { Separator } from "@/components/ui/separator";
import { parseDateTimeFromApi } from "@/lib/date";

interface HistoricoSalaProps {
  salaId: number;
  salaNome: string;
  open: boolean;
  onClose: () => void;
}

export default function HistoricoSala({
  salaId,
  salaNome,
  open,
  onClose,
}: HistoricoSalaProps) {
  const { data: agendamentos = [] } = useAgendamentosBySala(salaId);
  const { data: todosAcessos = [] } = useAcessos();

  // Filtrar acessos da sala
  const acessos = todosAcessos.filter((a) => a.sala_id === salaId);

  // Calcular estatísticas
  const totalAcessos = acessos.length;
  const acessosAtivos = acessos.filter((a) => !a.saida_em).length;

  // Visitantes únicos
  const visitantesUnicos = new Set(acessos.map((a) => a.visitante_id)).size;

  // Visitante mais frequente
  const visitanteCount = acessos.reduce((acc, acesso) => {
    const visitanteNome = acesso.visitante?.nome || "Desconhecido";
    acc[visitanteNome] = (acc[visitanteNome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const visitanteMaisFrequente = Object.entries(visitanteCount).sort(
    ([, a], [, b]) => b - a
  )[0];

  // Calcular tempo médio de ocupação
  const temposOcupacao = acessos
    .filter((a) => a.saida_em)
    .map((a) =>
      differenceInMinutes(new Date(a.saida_em!), new Date(a.entrada_em))
    );
  const tempoMedio =
    temposOcupacao.length > 0
      ? Math.round(
          temposOcupacao.reduce((a, b) => a + b, 0) / temposOcupacao.length
        )
      : 0;

  // Taxa de ocupação do mês atual
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  const acessosMesAtual = acessos.filter((a) => {
    const data = new Date(a.entrada_em);
    return data >= inicioMes && data <= fimMes;
  });
  const diasOcupados = new Set(
    acessosMesAtual.map((a) => format(new Date(a.entrada_em), "yyyy-MM-dd"))
  ).size;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Histórico da Sala {salaNome}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Acessos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{totalAcessos}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Acessos Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{acessosAtivos}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Visitantes Únicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">
                      {visitantesUnicos}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tempo Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{tempoMedio}min</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visitanteMaisFrequente && (
                <Card className="bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Visitante Mais Frequente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {visitanteMaisFrequente[0]}
                      </span>
                      <Badge variant="secondary">
                        {visitanteMaisFrequente[1]} visitas
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ocupação no Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {diasOcupados} dias ocupados
                    </span>
                    <Badge variant="secondary">
                      {acessosMesAtual.length} acessos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Agendamentos */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendamentos ({agendamentos.length})
              </h3>
              {agendamentos.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  Nenhum agendamento encontrado
                </p>
              ) : (
                <div className="space-y-2">
                  {agendamentos.map((agendamento) => (
                    <Card key={agendamento.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {agendamento.visitante?.nome}
                              </span>
                              {agendamento.visitante?.tipo_prioridade && (
                                <PriorityBadge
                                  prioridade={
                                    agendamento.visitante.tipo_prioridade
                                  }
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(
                                parseDateTimeFromApi(agendamento.data_agendada),
                                "PPP 'às' HH:mm",
                                {
                                  locale: ptBR,
                                }
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Até{" "}
                              {format(
                                parseDateTimeFromApi(agendamento.hora_fim),
                                "HH:mm"
                              )}
                            </div>
                          </div>
                          <StatusBadge status={agendamento.status} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Histórico de Acessos */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Histórico de Acessos ({acessos.length})
              </h3>
              {acessos.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  Nenhum acesso registrado
                </p>
              ) : (
                <div className="space-y-2">
                  {acessos
                    .sort(
                      (a, b) =>
                        new Date(b.entrada_em).getTime() -
                        new Date(a.entrada_em).getTime()
                    )
                    .map((acesso) => {
                      const duracao = acesso.saida_em
                        ? differenceInMinutes(
                            new Date(acesso.saida_em),
                            new Date(acesso.entrada_em)
                          )
                        : null;

                      return (
                        <Card key={acesso.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {acesso.visitante?.nome}
                                  </span>
                                  {acesso.visitante?.tipo_prioridade && (
                                    <PriorityBadge
                                      prioridade={
                                        acesso.visitante.tipo_prioridade
                                      }
                                    />
                                  )}
                                </div>
                                {!acesso.saida_em && (
                                  <Badge variant="default">Na sala</Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Entrada:{" "}
                                  {format(
                                    new Date(acesso.entrada_em),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </div>
                                {acesso.saida_em && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    Saída:{" "}
                                    {format(
                                      new Date(acesso.saida_em),
                                      "dd/MM/yyyy HH:mm"
                                    )}
                                  </div>
                                )}
                              </div>
                              {duracao !== null && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Duração: {duracao} minutos
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
