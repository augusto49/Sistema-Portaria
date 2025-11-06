import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAcessosAtivos, useRegistrarSaida } from "@/hooks/useAcessos";
import { useUpdateAgendamento } from "@/hooks/useAgendamentos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Clock, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegistroSaidaForm() {
  const [searchTerm, setSearchTerm] = useState("");
  const [salaFilter, setSalaFilter] = useState<string>("all");
  const { data: acessosAtivos, isLoading } = useAcessosAtivos();
  const registrarSaida = useRegistrarSaida();
  const updateAgendamento = useUpdateAgendamento();

  const filteredAcessos = acessosAtivos?.filter((acesso) => {
    const matchSearch =
      acesso.visitante?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acesso.visitante?.cpf.includes(searchTerm);
    const matchSala =
      salaFilter === "all" || acesso.sala_id.toString() === salaFilter;
    return matchSearch && matchSala;
  });

  const salas = [...new Set(acessosAtivos?.map((a) => a.sala))];

  const handleRegistrarSaida = async (
    acessoId: number,
    agendamentoId?: number
  ) => {
    try {
      // 1. Registrar saída
      await registrarSaida.mutateAsync(acessoId);

      // 2. Se tem agendamento vinculado, finalizar ele também
      if (agendamentoId) {
        await updateAgendamento.mutateAsync({
          id: agendamentoId,
          status: 4,
        });
      }
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registrar Saída</CardTitle>
          <CardDescription>Carregando visitantes no prédio...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Saída</CardTitle>
        <CardDescription>
          {acessosAtivos?.length || 0} visitante(s) no prédio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {acessosAtivos && acessosAtivos.length > 0 && (
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={salaFilter} onValueChange={setSalaFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por sala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as salas</SelectItem>
                {salas.map((sala) => (
                  <SelectItem key={sala?.id} value={sala?.id.toString() || ""}>
                    {sala?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!filteredAcessos || filteredAcessos.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {searchTerm || salaFilter !== "all"
                ? "Nenhum visitante encontrado com os filtros aplicados."
                : "Nenhum visitante no prédio no momento."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {filteredAcessos.map((acesso) => (
              <div
                key={acesso.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={acesso.visitante?.foto || ""}
                    alt={acesso.visitante?.nome}
                  />
                  <AvatarFallback>
                    {acesso.visitante?.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {acesso.visitante?.nome}
                    </p>
                    {acesso.visitante?.tipo_prioridade && (
                      <Badge variant="secondary" className="text-xs">
                        {acesso.visitante.tipo_prioridade.descricao}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    CPF: {acesso.visitante?.cpf}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">{acesso.sala?.nome}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Entrada: {format(new Date(acesso.entrada_em), "HH:mm")}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-primary">
                    {formatDistanceToNow(new Date(acesso.entrada_em), {
                      locale: ptBR,
                      addSuffix: false,
                    })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleRegistrarSaida(acesso.id, acesso.agendamento?.id)
                    }
                    disabled={registrarSaida.isPending}
                    className="mt-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Registrar Saída
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
