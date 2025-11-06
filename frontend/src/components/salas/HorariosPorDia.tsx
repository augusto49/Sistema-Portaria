import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Horario {
  inicio: string;
  fim: string;
}

interface HorariosPorDiaProps {
  value: Record<string, Horario[]>;
  onChange: (value: Record<string, Horario[]>) => void;
}

const DIAS_SEMANA = [
  { key: "0", label: "Dom", labelFull: "Domingo" },
  { key: "1", label: "Seg", labelFull: "Segunda-feira" },
  { key: "2", label: "Ter", labelFull: "Terça-feira" },
  { key: "3", label: "Qua", labelFull: "Quarta-feira" },
  { key: "4", label: "Qui", labelFull: "Quinta-feira" },
  { key: "5", label: "Sex", labelFull: "Sexta-feira" },
  { key: "6", label: "Sáb", labelFull: "Sábado" },
];

// Componente para Gerenciar Horários por Dia da Semana
export function HorariosPorDia({ value, onChange }: HorariosPorDiaProps) {
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("17:00");

  // Adiciona um novo horário ao dia selecionado
  const addHorario = () => {
    if (!selectedDay) {
      toast.error("Selecione um dia da semana");
      return;
    }

    if (!horaInicio || !horaFim) {
      toast.error("Preencha os horários de início e fim");
      return;
    }

    if (horaInicio >= horaFim) {
      toast.error("Hora de fim deve ser maior que hora de início");
      return;
    }

    const novosHorarios = {
      ...value,
      [selectedDay]: [
        ...(value[selectedDay] || []),
        { inicio: horaInicio, fim: horaFim },
      ],
    };
    onChange(novosHorarios);
    toast.success("Horário adicionado");
  };

  // Remove um horário do dia especificado pelo índice
  const removeHorario = (dia: string, index: number) => {
    const novosHorarios = {
      ...value,
      [dia]: value[dia].filter((_, i) => i !== index),
    };
    onChange(novosHorarios);
    toast.success("Horário removido");
  };

  // Copia os horários do dia selecionado para todos os dias da semana
  const copiarParaTodos = () => {
    if (!selectedDay) {
      toast.error("Selecione um dia da semana");
      return;
    }

    // Obtém os horários do dia selecionado
    const horariosDoDia = value[selectedDay] || [];
    if (horariosDoDia.length === 0) {
      toast.error("Adicione horários antes de copiar");
      return;
    }

    // Copia os horários para todos os dias
    const novosHorarios: Record<string, Horario[]> = {};
    DIAS_SEMANA.forEach((d) => {
      novosHorarios[d.key] = [...horariosDoDia];
    });
    onChange(novosHorarios);
    toast.success("Horários copiados para todos os dias");
  };

  // Obtém os horários do dia atualmente selecionado
  const horariosDoSelecionado = value[selectedDay] || [];
  const diaLabelFull = DIAS_SEMANA.find(
    (d) => d.key === selectedDay
  )?.labelFull;

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div>
        <Label className="text-base font-semibold">
          Horários de Funcionamento *
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Dias da Semana</Label>
        <ToggleGroup
          type="single"
          value={selectedDay}
          onValueChange={(value) => value && setSelectedDay(value)}
          className="flex flex-wrap gap-2 justify-start"
        >
          {DIAS_SEMANA.map((dia) => {
            const count = value[dia.key]?.length || 0;
            return (
              <ToggleGroupItem
                key={dia.key}
                value={dia.key}
                className="min-w-[60px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {dia.label}
                {count > 0 && <span className="ml-1 text-xs">({count})</span>}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      {selectedDay && (
        <div className="space-y-4 border-t pt-4">
          <Label className="text-sm font-medium">{diaLabelFull}</Label>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="hora-inicio" className="text-xs">
                Hora Início
              </Label>
              <Input
                id="hora-inicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="hora-fim" className="text-xs">
                Hora Fim
              </Label>
              <Input
                id="hora-fim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
              />
            </div>

            <Button type="button" onClick={addHorario} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {horariosDoSelecionado.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Horários cadastrados:</Label>
              <div className="space-y-2">
                {horariosDoSelecionado.map((horario, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                  >
                    <span className="text-sm">
                      {horario.inicio} - {horario.fim}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHorario(selectedDay, index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={copiarParaTodos}
                className="mt-2"
              >
                Copiar para todos os dias
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
