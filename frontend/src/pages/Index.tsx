import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, LogIn, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgendamentos, useUpdateAgendamento } from "@/hooks/useAgendamentos";
import {
  useAcessosAtivos,
  useCreateAcesso,
  useRegistrarSaida,
} from "@/hooks/useAcessos";
import api from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseDateTimeFromApi } from "@/lib/date";
import { useNavigate } from "react-router-dom";

const STATUS_AGENDAMENTO: Record<
  number,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  1: { label: "Pendente", variant: "secondary" },
  3: { label: "Em Andamento", variant: "default" },
  4: { label: "Finalizado", variant: "outline" },
  5: { label: "Cancelado", variant: "destructive" },
};

const Index = () => {
  const navigate = useNavigate();
  const { data: agendamentos, isLoading: isLoadingAgendamentos } =
    useAgendamentos();
  const { data: acessosAtivos, isLoading: isLoadingAcessos } =
    useAcessosAtivos();
  const createAcesso = useCreateAcesso();
  const updateAgendamento = useUpdateAgendamento();
  const registrarSaida = useRegistrarSaida();

  const handleRegistrarEntrada = async (agendamento: any) => {
    try {
      // Quando confirma, já cria o acesso e atualiza para status 3
      await createAcesso.mutateAsync({
        visitante_id: agendamento.visitante_id,
        sala_id: agendamento.sala_id,
        agendamento_id: agendamento.id,
        entrada_em: new Date().toISOString(),
      });

      await updateAgendamento.mutateAsync({
        id: agendamento.id,
        status: 3,
      });
    } catch (error) {
      console.error("Erro ao registrar entrada:", error);
    }
  };

  const handleRegistrarSaida = async (agendamento: any) => {
    try {
      const { data: acesso } = await api.get(
        `/acessos/agendamento/${agendamento.id}`
      );

      if (acesso) {
        await registrarSaida.mutateAsync(acesso.id);
        await updateAgendamento.mutateAsync({
          id: agendamento.id,
          status: 4,
        });
      }
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
    }
  };

  const hoje = format(new Date(), "yyyy-MM-dd");
  const agendamentosHoje =
    agendamentos?.filter(
      (a) =>
        format(parseDateTimeFromApi(a.data_agendada), "yyyy-MM-dd") === hoje &&
        a.status !== 4 &&
        a.status !== 5
    ) || [];

  const isLoading = isLoadingAgendamentos || isLoadingAcessos;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Sistema de Portaria - Solasstec</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {agendamentosHoje.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Agendados para hoje
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visitantes no Prédio
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {acessosAtivos?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Visitantes atualmente
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos de Hoje */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
          <CardDescription>
            {agendamentosHoje.length > 0
              ? `${agendamentosHoje.length} agendamento(s) para hoje`
              : "Próximas visitas agendadas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : agendamentosHoje.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento para hoje
            </p>
          ) : (
            <div
              className={`space-y-4 ${
                agendamentosHoje.length > 5
                  ? "max-h-[500px] overflow-y-auto pr-2"
                  : ""
              }`}
            >
              {agendamentosHoje.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                    <Avatar>
                      <AvatarImage src={agendamento.visitante?.foto || ""} />
                      <AvatarFallback>
                        {agendamento.visitante?.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {agendamento.visitante?.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          parseDateTimeFromApi(agendamento.data_agendada),
                          "HH:mm",
                          { locale: ptBR }
                        )}{" "}
                        - {agendamento.sala?.nome}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Badge
                      variant={
                        STATUS_AGENDAMENTO[agendamento.status]?.variant ||
                        "outline"
                      }
                      className="justify-center"
                    >
                      {STATUS_AGENDAMENTO[agendamento.status]?.label ||
                        "Desconhecido"}
                    </Badge>
                    {agendamento.status === 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handleRegistrarEntrada(agendamento)}
                      >
                        <LogIn className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                    {agendamento.status === 3 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handleRegistrarSaida(agendamento)}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Registrar Saída
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
