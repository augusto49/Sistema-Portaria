import { useEffect, useState } from "react";
import { useBuscarHorariosDisponiveis } from "@/hooks/useAgendamentos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// GRID DE HORÁRIOS DISPONÍVEIS

interface HorariosDisponiveisProps {
  salaId?: number;
  data?: string;
  onSelectHorario: (inicio: string, fim: string) => void;
  selectedInicio?: string;
  selectedFim?: string;
  onAplicarSugestaoData?: (data: Date) => void;
}

interface Slot {
  horario: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  vagas_disponiveis: number;
  capacidade_total: number;
  disponivel: boolean;
}

export default function HorariosDisponiveis({
  salaId,
  data,
  onSelectHorario,
  selectedInicio,
  selectedFim,
  onAplicarSugestaoData,
}: HorariosDisponiveisProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [selectingStart, setSelectingStart] = useState(true);
  const buscarHorarios = useBuscarHorariosDisponiveis();

  // Busca horários ao carregar
  useEffect(() => {
    if (salaId && data) {
      buscarHorarios.mutate(
        { salaId, data },
        {
          onSuccess: (response) => {
            if (response.disponivel) {
              setSlots(response.horarios || []);
              setPeriodos(response.periodos_funcionamento || []);
            } else {
              setSlots([]);
              setPeriodos([]);
            }
          },
        }
      );
    } else {
      setSlots([]);
      setPeriodos([]);
      setSelectingStart(true);
    }
  }, [salaId, data]);

  // Resetar seleção ao mudar sala/data
  useEffect(() => {
    setSelectingStart(true);
    console.log("🔄 [Horarios] Resetando estado de seleção");
  }, [salaId, data]);

  const handleSlotClick = (slot: Slot) => {
    if (!slot.disponivel) return;

    console.log("🖱️ [Slot] Clique detectado:", {
      horario: slot.horario,
      selectingStart,
      selectedInicio,
      selectedFim,
      timestamp: new Date().toISOString(),
    });

    if (selectingStart) {
      console.log("✅ [Slot] Definindo horário de INÍCIO:", slot.horario);
      const [h, m] = slot.horario.split(":");
      const endH = String(parseInt(h, 10) + 1).padStart(2, "0"); // 1h por slot
      const inicioLocal = `${data}T${slot.horario}:00`;
      const fimLocal = `${data}T${endH}:${m}:00`;

      console.log("📅 [Slot] Horários locais gerados:", {
        inicioLocal,
        fimLocal,
      });

      onSelectHorario(inicioLocal, fimLocal);
      setSelectingStart(false);
    } else {
      if (selectedInicio && slot.horario) {
        console.log("✅ [Slot] Definindo horário de FIM:", slot.horario);
        const [h, m] = slot.horario.split(":");
        // Calcular o FIM do slot (1 hora depois do início)
        const endH = String(parseInt(h, 10) + 1).padStart(2, "0");
        const fimLocal = `${data}T${endH}:${m}:00`;

        console.log("📅 [Slot] Horário de fim local gerado:", fimLocal);

        onSelectHorario(selectedInicio, fimLocal);
        setSelectingStart(true);
      } else {
        console.log("⚠️ [Slot] Seleção inválida");
      }
    }
  };

  const getSlotVariant = (slot: Slot) => {
    if (!slot.disponivel) return "destructive";
    const percentual = (slot.vagas_disponiveis / slot.capacidade_total) * 100;
    if (percentual > 50) return "success";
    if (percentual > 20) return "warning";
    return "destructive";
  };

  const isSlotSelected = (slot: Slot) => {
    if (!selectedInicio || !selectedFim || !data) return false;

    // Construir strings locais a partir do slot para comparação
    const slotInicioLocal = `${data}T${slot.horario}:00`;

    // Calcular o fim do slot (1 hora depois)
    const [h, m] = slot.horario.split(":");
    const endH = String(parseInt(h, 10) + 1).padStart(2, "0");
    const slotFimLocal = `${data}T${endH}:${m}:00`;

    // Verificar se este slot está dentro do intervalo selecionado
    return slotInicioLocal >= selectedInicio && slotFimLocal <= selectedFim;
  };

  if (!salaId || !data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Selecione uma sala e uma data para visualizar os horários disponíveis.
        </AlertDescription>
      </Alert>
    );
  }

  if (buscarHorarios.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (buscarHorarios.data && !buscarHorarios.data.disponivel) {
    const mensagem =
      buscarHorarios.data.motivo === "feriado"
        ? `Esta data é feriado: ${buscarHorarios.data.feriado?.descricao}`
        : buscarHorarios.data.mensagem ||
          "A sala não está disponível nesta data.";

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>{mensagem}</p>
            {buscarHorarios.data.sugestao && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  💡 Sugestão automática:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  {buscarHorarios.data.sugestao.mensagem}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800"
                  onClick={() => {
                    // Criar data no timezone local
                    const [ano, mes, dia] =
                      buscarHorarios.data.sugestao.data.split("-");
                    const novaData = new Date(
                      Number(ano),
                      Number(mes) - 1,
                      Number(dia)
                    );
                    console.log("📅 [Sugestão] Data aplicada:", novaData);
                    onAplicarSugestaoData?.(novaData);
                  }}
                >
                  📅 Aplicar sugestão
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (slots.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum horário disponível para esta data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectingStart ? (
            <>
              <Clock className="h-4 w-4 inline mr-1" />
              Selecione o horário de{" "}
              <span className="font-semibold">início</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 inline mr-1" />
              Selecione o horário de{" "}
              <span className="font-semibold">término</span>
            </>
          )}
        </div>
        {selectedInicio && selectedFim && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelectHorario("", "");
              setSelectingStart(true);
            }}
          >
            Limpar seleção
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Muitas vagas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Poucas vagas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Lotado</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const variant = getSlotVariant(slot);
          const selected = isSlotSelected(slot);

          return (
            <Button
              key={slot.horario}
              variant={selected ? "default" : "outline"}
              className={cn(
                "h-auto flex flex-col items-start p-3 relative",
                !slot.disponivel && "opacity-50 cursor-not-allowed",
                selected && "ring-2 ring-primary"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSlotClick(slot);
              }}
              disabled={!slot.disponivel}
            >
              <div className="font-semibold text-sm">{slot.horario}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <Users className="h-3 w-3" />
                <span>
                  {slot.vagas_disponiveis}/{slot.capacidade_total}
                </span>
              </div>
              {!selected && (
                <div
                  className={cn(
                    "absolute top-1 right-1 w-2 h-2 rounded-full",
                    variant === "success" && "bg-green-500",
                    variant === "warning" && "bg-yellow-500",
                    variant === "destructive" && "bg-red-500"
                  )}
                />
              )}
            </Button>
          );
        })}
      </div>

      {periodos.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold">Períodos de funcionamento:</span>{" "}
          {periodos.map((p) => `${p.inicio} - ${p.fim}`).join(", ")}
        </div>
      )}
    </div>
  );
}
