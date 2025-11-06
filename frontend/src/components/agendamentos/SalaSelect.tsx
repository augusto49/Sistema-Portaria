import { useSalas } from "@/hooks/useSalas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SalaSelectProps {
  value?: number;
  onChange: (salaId: number) => void;
  selectedDate?: string;
}

export default function SalaSelect({
  value,
  onChange,
  selectedDate,
}: SalaSelectProps) {
  const { data: salas = [], isLoading } = useSalas();

  const isSalaDisponivel = (sala: any) => {
    if (!selectedDate) return true;

    const dataObj = new Date(selectedDate + "T00:00:00");
    if (isNaN(dataObj.getTime())) return false;

    const diaSemana = dataObj.getDay();
    const horarios = sala.disponibilidade[diaSemana.toString()];

    return horarios && horarios.length > 0;
  };

  const getHorariosFuncionamento = (sala: any) => {
    if (!selectedDate) return null;

    const dataObj = new Date(selectedDate + "T00:00:00");
    if (isNaN(dataObj.getTime())) return null;

    const diaSemana = dataObj.getDay();
    const horarios = sala.disponibilidade[diaSemana.toString()];

    if (!horarios || horarios.length === 0) return null;

    return horarios.map((h: any) => `${h.inicio} - ${h.fim}`).join(", ");
  };

  const getResponsavelAtual = (sala: any) => {
    if (!sala.sala_responsavel || sala.sala_responsavel.length === 0)
      return null;

    const hoje = new Date().toISOString().split("T")[0];
    const responsavel = sala.sala_responsavel.find(
      (r: any) =>
        r.ativo &&
        r.valido_de <= hoje &&
        (!r.valido_ate || r.valido_ate >= hoje)
    );

    return responsavel?.nome || null;
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando salas..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value?.toString()}
      onValueChange={(v) => onChange(parseInt(v))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma sala" />
      </SelectTrigger>
      <SelectContent>
        {salas.map((sala) => {
          const disponivel = isSalaDisponivel(sala);
          const horarios = getHorariosFuncionamento(sala);
          const responsavel = getResponsavelAtual(sala);

          return (
            <TooltipProvider key={sala.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectItem
                    value={sala.id.toString()}
                    disabled={!disponivel}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium">{sala.nome}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {sala.capacidade}
                        </Badge>
                        {!disponivel && (
                          <Badge variant="destructive" className="text-xs">
                            Fechada
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Capacidade:</span>{" "}
                      {sala.capacidade} pessoas
                    </div>
                    {responsavel && (
                      <div>
                        <span className="font-semibold">Responsável:</span>{" "}
                        {responsavel}
                      </div>
                    )}
                    {horarios ? (
                      <div>
                        <div className="flex items-center gap-1 font-semibold">
                          <Clock className="h-3 w-3" />
                          Horários:
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {horarios}
                        </div>
                      </div>
                    ) : (
                      <div className="text-destructive">
                        Sala não funciona neste dia
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </SelectContent>
    </Select>
  );
}
