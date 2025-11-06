import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  useCreateAgendamento,
  useValidarAgendamento,
} from "@/hooks/useAgendamentos";
import VisitanteAutocomplete from "./VisitanteAutocomplete";
import SalaSelect from "./SalaSelect";
import HorariosDisponiveis from "./HorariosDisponiveis";

// FORMULÁRIO DE AGENDAMENTO (4 PASSOS)

const formSchema = z.object({
  visitante_id: z.number({ required_error: "Selecione um visitante" }),
  sala_id: z.number({ required_error: "Selecione uma sala" }),
  data: z.date({ required_error: "Selecione uma data" }),
  hora_inicio: z.string().min(1, "Selecione o horário de início"),
  hora_fim: z.string().min(1, "Selecione o horário de término"),
});

interface AgendamentoFormProps {
  open: boolean;
  onClose: () => void;
}

export default function AgendamentoForm({
  open,
  onClose,
}: AgendamentoFormProps) {
  const [validacao, setValidacao] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createAgendamento = useCreateAgendamento();
  const validarAgendamento = useValidarAgendamento();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitante_id: undefined,
      sala_id: undefined,
      data: undefined,
      hora_inicio: "",
      hora_fim: "",
    },
  });

  const watchedValues = form.watch();

  // Validação em tempo real quando todos campos preenchidos
  useEffect(() => {
    const { visitante_id, sala_id, data, hora_inicio, hora_fim } =
      watchedValues;

    if (visitante_id && sala_id && data && hora_inicio && hora_fim) {
      setIsValidating(true);

      validarAgendamento.mutate(
        {
          visitante_id,
          sala_id,
          data_agendada: hora_inicio,
          hora_fim,
        },
        {
          onSuccess: (response) => {
            setValidacao(response);
            setIsValidating(false);
          },
          onError: () => {
            setIsValidating(false);
          },
        }
      );
    } else {
      setValidacao(null);
    }
  }, [
    watchedValues.visitante_id,
    watchedValues.sala_id,
    watchedValues.data,
    watchedValues.hora_inicio,
    watchedValues.hora_fim,
  ]);

  // Limpar form ao fechar
  useEffect(() => {
    if (!open) {
      form.reset();
      setValidacao(null);
      setIsValidating(false);
      setIsSubmitting(false);
    }
  }, [open]);

  // Aplicar sugestão de data/horário
  const handleAplicarSugestao = (sugestao: any) => {
    if (sugestao.data) {
      const [ano, mes, dia] = sugestao.data.split("-");
      form.setValue(
        "data",
        new Date(Number(ano), Number(mes) - 1, Number(dia))
      );
    }
    if (sugestao.horario) {
      const [hora, min] = sugestao.horario.split(":");
      const dataBase = format(
        form.getValues("data") || new Date(),
        "yyyy-MM-dd"
      );
      form.setValue("hora_inicio", `${dataBase}T${sugestao.horario}:00`);
      // Adicionar 1 hora no fim
      const horaFim = String(parseInt(hora) + 1).padStart(2, "0");
      form.setValue("hora_fim", `${dataBase}T${horaFim}:${min}:00`);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!validacao?.valido || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createAgendamento.mutateAsync({
        visitante_id: values.visitante_id,
        sala_id: values.sala_id,
        data_agendada: values.hora_inicio,
        hora_fim: values.hora_fim,
        status: 1,
      });

      form.reset();
      setValidacao(null);
      onClose();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seleção de horário no grid
  const handleSelectHorario = (inicio: string, fim: string) => {
    form.setValue("hora_inicio", inicio);
    form.setValue("hora_fim", fim);
  };

  const getAlertVariant = () => {
    if (isValidating) return "default";
    if (!validacao) return "default";
    return validacao.valido ? "default" : "destructive";
  };

  const renderValidacao = () => {
    if (isValidating) {
      return (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Validando agendamento...</AlertDescription>
        </Alert>
      );
    }

    if (!validacao) return null;

    if (validacao.valido) {
      return (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✓ Agendamento válido! Você pode confirmar.
          </AlertDescription>
        </Alert>
      );
    }

    const getMotivoTexto = () => {
      switch (validacao.motivo) {
        case "feriado":
          return `❌ Data indisponível (feriado: ${validacao.feriado?.descricao})`;
        case "dia_inativo":
          return "⚠️ Sala não funciona neste dia da semana";
        case "horario_fora_funcionamento":
          return "⚠️ Horário fora do período de funcionamento";
        case "conflito_visitante":
          return "❌ Visitante já possui agendamento neste horário";
        case "capacidade_excedida":
          return "⚠️ Sala lotada neste horário";
        default:
          return validacao.mensagem;
      }
    };

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>{getMotivoTexto()}</p>
            {validacao.sugestao && (
              <div className="mt-2">
                <p className="text-sm font-semibold">Sugestão:</p>
                <p className="text-sm">{validacao.sugestao.mensagem}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAplicarSugestao(validacao.sugestao)}
                >
                  Aplicar sugestão
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            onKeyDown={(e) => {
              // Prevenir submit com Enter
              if (
                e.key === "Enter" &&
                e.target instanceof HTMLElement &&
                e.target.tagName !== "TEXTAREA"
              ) {
                e.preventDefault();
              }
            }}
          >
            {/* Passo 1: Visitante */}
            <FormField
              control={form.control}
              name="visitante_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1. Visitante *</FormLabel>
                  <FormControl>
                    <VisitanteAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passo 2: Sala */}
            <FormField
              control={form.control}
              name="sala_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2. Sala *</FormLabel>
                  <FormControl>
                    <SalaSelect
                      value={field.value}
                      onChange={field.onChange}
                      selectedDate={
                        form.getValues("data")
                          ? format(form.getValues("data"), "yyyy-MM-dd")
                          : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passo 3: Data */}
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>3. Data *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        locale={ptBR}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passo 4: Horários */}
            {form.watch("sala_id") && form.watch("data") && (
              <div className="space-y-2">
                <FormLabel>4. Horários *</FormLabel>
                <HorariosDisponiveis
                  salaId={form.watch("sala_id")}
                  data={
                    form.watch("data")
                      ? format(form.watch("data"), "yyyy-MM-dd")
                      : undefined
                  }
                  onSelectHorario={handleSelectHorario}
                  selectedInicio={form.watch("hora_inicio")}
                  selectedFim={form.watch("hora_fim")}
                  onAplicarSugestaoData={(novaData) => {
                    form.setValue("data", novaData);
                  }}
                />
              </div>
            )}

            {/* Validação */}
            {renderValidacao()}

            {/* Botões */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  !validacao?.valido ||
                  isValidating ||
                  isSubmitting ||
                  createAgendamento.isPending
                }
              >
                {isSubmitting || createAgendamento.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
