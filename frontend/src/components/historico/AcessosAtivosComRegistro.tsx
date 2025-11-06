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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useAcessosAtivos,
  useRegistrarSaida,
  useCreateAcesso,
} from "@/hooks/useAcessos";
import { useSalas } from "@/hooks/useSalas";
import { useVisitantes } from "@/hooks/useVisitantes";
import { useUpdateAgendamento } from "@/hooks/useAgendamentos";
import { toast } from "sonner";
import { format } from "date-fns";
import { LogOut, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AcessosAtivosComRegistro() {
  const { data: acessos, isLoading: isLoadingAcessos } = useAcessosAtivos();
  const { data: salas } = useSalas();
  const { data: visitantes } = useVisitantes();
  const registrarSaida = useRegistrarSaida();
  const createAcesso = useCreateAcesso();
  const updateAgendamento = useUpdateAgendamento();

  const [visitanteId, setVisitanteId] = useState<string>("");
  const [salaId, setSalaId] = useState<string>("");

  const handleRegistrarEntradaManual = async () => {
    if (!visitanteId || !salaId) {
      toast.error("Selecione um visitante e uma sala");
      return;
    }

    try {
      await createAcesso.mutateAsync({
        visitante_id: parseInt(visitanteId),
        sala_id: parseInt(salaId),
        agendamento_id: null,
        entrada_em: new Date().toISOString(),
      });
      toast.success("Entrada registrada com sucesso");
      setVisitanteId("");
      setSalaId("");
    } catch (error) {
      toast.error("Erro ao registrar entrada");
    }
  };

  const handleRegistrarSaida = async (
    acessoId: number,
    agendamentoId: number | null
  ) => {
    try {
      await registrarSaida.mutateAsync(acessoId);

      if (agendamentoId) {
        await updateAgendamento.mutateAsync({
          id: agendamentoId,
          status: 4,
        });
      }

      toast.success("Saída registrada com sucesso");
    } catch (error) {
      toast.error("Erro ao registrar saída");
    }
  };

  const calcularDuracao = (entrada: string) => {
    const agora = new Date();
    const entradaDate = new Date(entrada);
    const diffMs = agora.getTime() - entradaDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (isLoadingAcessos) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Registrar Entrada Manual
          </CardTitle>
          <CardDescription>
            Para visitantes sem agendamento prévio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4">
            <Select value={visitanteId} onValueChange={setVisitanteId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o visitante" />
              </SelectTrigger>
              <SelectContent>
                {visitantes?.map((visitante) => (
                  <SelectItem
                    key={visitante.id}
                    value={visitante.id.toString()}
                  >
                    {visitante.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={salaId} onValueChange={setSalaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a sala" />
              </SelectTrigger>
              <SelectContent>
                {salas?.map((sala) => (
                  <SelectItem key={sala.id} value={sala.id.toString()}>
                    {sala.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleRegistrarEntradaManual}
              className="w-full lg:w-auto"
            >
              Registrar Entrada
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitantes no Prédio</CardTitle>
          <CardDescription>
            {acessos?.length || 0} visitante(s) atualmente no prédio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!acessos || acessos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum visitante no prédio no momento
            </p>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {acessos.map((acesso) => (
                  <Card key={acesso.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={acesso.visitante?.foto || ""} />
                          <AvatarFallback>
                            {acesso.visitante?.nome[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {acesso.visitante?.nome}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {acesso.sala?.nome}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Entrada:
                          </span>
                          <span>
                            {format(
                              new Date(acesso.entrada_em),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tempo:</span>
                          <span>{calcularDuracao(acesso.entrada_em)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Origem:</span>
                          <span>
                            {acesso.agendamento_id ? "Agendado" : "Manual"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          handleRegistrarSaida(acesso.id, acesso.agendamento_id)
                        }
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Registrar Saída
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitante</TableHead>
                      <TableHead>Sala</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Tempo no Prédio</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acessos.map((acesso) => (
                      <TableRow key={acesso.id}>
                        <TableCell className="font-medium">
                          {acesso.visitante?.nome}
                        </TableCell>
                        <TableCell>{acesso.sala?.nome}</TableCell>
                        <TableCell>
                          {format(
                            new Date(acesso.entrada_em),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          {calcularDuracao(acesso.entrada_em)}
                        </TableCell>
                        <TableCell>
                          {acesso.agendamento_id ? "Agendado" : "Manual"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleRegistrarSaida(
                                acesso.id,
                                acesso.agendamento_id
                              )
                            }
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Registrar Saída
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
