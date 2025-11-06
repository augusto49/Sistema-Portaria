import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  useCalcularPrioridade,
  useCreateVisitante,
  useUpdateVisitante,
  useVisitanteByCpf,
} from "@/hooks/useVisitantes";
import { Visitante, PrioridadeCalculada } from "@/types/database";
import PriorityBadge from "@/components/common/PriorityBadge";
import ImageUpload from "@/components/ui/image-upload";

// FORMULÁRIO DE VISITANTE

const visitanteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(200),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14),
  rg: z.string().max(20).optional().nullable(),
  data_nascimento: z.string().min(10, "Data inválida"),
  possui_deficiencia: z.boolean().default(false),
  foto: z.string().optional().nullable(),
});

type VisitanteFormData = z.infer<typeof visitanteSchema>;

interface VisitanteFormProps {
  visitante?: Visitante;
  onSuccess?: () => void;
}

export default function VisitanteForm({
  visitante,
  onSuccess,
}: VisitanteFormProps) {
  const [cpfBusca, setCpfBusca] = useState("");
  const [prioridadeCalculada, setPrioridadeCalculada] =
    useState<PrioridadeCalculada | null>(null);
  const [visitanteExistente, setVisitanteExistente] =
    useState<Visitante | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateInputValue, setDateInputValue] = useState("");

  // Helper para converter data do backend (yyyy-MM-dd) para formato BR (dd/MM/yyyy)
  const toBRDate = (value: string | null | undefined) => {
    if (!value) return "";
    const datePart = value.slice(0, 10); // yyyy-MM-dd
    const [y, m, d] = datePart.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
  };

  const { data: visitanteByCpf, isLoading: loadingCpf } =
    useVisitanteByCpf(cpfBusca);
  const calcularPrioridade = useCalcularPrioridade();
  const createVisitante = useCreateVisitante();
  const updateVisitante = useUpdateVisitante();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VisitanteFormData>({
    resolver: zodResolver(visitanteSchema),
    defaultValues: visitante
      ? {
          nome: visitante.nome,
          cpf: visitante.cpf,
          rg: visitante.rg,
          data_nascimento: toBRDate(visitante.data_nascimento),
          possui_deficiencia: false,
          foto: visitante.foto,
        }
      : undefined,
  });

  const dataNascimentoStr = watch("data_nascimento");
  const possuiDeficiencia = watch("possui_deficiencia");
  const cpf = watch("cpf");

  // Debounce do CPF para buscar visitante existente
  useEffect(() => {
    if (cpf && cpf.length >= 11 && !visitante) {
      const timer = setTimeout(() => {
        setCpfBusca(cpf.replace(/\D/g, ""));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cpf, visitante]);

  useEffect(() => {
    if (visitanteByCpf && !visitante) {
      setVisitanteExistente(visitanteByCpf);
      setValue("nome", visitanteByCpf.nome);
      setValue("rg", visitanteByCpf.rg);
      setValue("data_nascimento", toBRDate(visitanteByCpf.data_nascimento));
      if (visitanteByCpf.foto) setValue("foto", visitanteByCpf.foto);
    } else if (!visitanteByCpf) {
      setVisitanteExistente(null);
    }
  }, [visitanteByCpf, setValue, visitante]);

  // Calcular prioridade automaticamente ao mudar idade/deficiência
  useEffect(() => {
    console.log("🔍 [Priority] Trigger:", {
      dataNascimentoStr,
      possuiDeficiencia,
    });

    if (dataNascimentoStr && dataNascimentoStr.length === 10) {
      try {
        const parsedDate = parse(dataNascimentoStr, "dd/MM/yyyy", new Date());
        console.log("📅 [Priority] Parsed date:", parsedDate);

        if (!isNaN(parsedDate.getTime())) {
          const formattedDate = format(parsedDate, "yyyy-MM-dd");
          console.log("🚀 [Priority] Calling API with:", {
            data_nascimento: formattedDate,
            possui_deficiencia: possuiDeficiencia || false,
          });

          calcularPrioridade.mutate(
            {
              data_nascimento: formattedDate,
              possui_deficiencia: possuiDeficiencia || false,
            },
            {
              onSuccess: (data) => {
                console.log(
                  "✅ [Priority] Success - Full Data:",
                  JSON.stringify(data, null, 2)
                );
                console.log(
                  "✅ [Priority] tipo_prioridade:",
                  data.tipo_prioridade
                );
                console.log(
                  "✅ [Priority] tipo_prioridade_id:",
                  data.tipo_prioridade_id
                );
                console.log("✅ [Priority] idade (type):", typeof data.idade);
                console.log("✅ [Priority] idade (value):", data.idade);
                setPrioridadeCalculada(data);
              },
              onError: (error) => {
                console.error("❌ [Priority] Error:", error);
                setPrioridadeCalculada(null);
              },
            }
          );
        } else {
          console.warn("⚠️ [Priority] Invalid date parsed");
        }
      } catch (e) {
        console.error("❌ [Priority] Parse error:", e);
      }
    } else {
      console.log("⚠️ [Priority] No valid date string, clearing priority");
      setPrioridadeCalculada(null);
    }
  }, [dataNascimentoStr, possuiDeficiencia]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + "/" + value.slice(5, 9);
    }
    setDateInputValue(value);
    setValue("data_nascimento", value);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "dd/MM/yyyy");
      setDateInputValue(formatted);
      setValue("data_nascimento", formatted);
      setShowCalendar(false);
    }
  };

  const getDateFromString = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr || dateStr.length !== 10) {
      return undefined;
    }
    try {
      const parsed = parse(dateStr, "dd/MM/yyyy", new Date());
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  };

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cleaned
      .slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const onSubmit = async (data: VisitanteFormData) => {
    if (!prioridadeCalculada?.tipo_prioridade_id) {
      return;
    }

    try {
      const parsedDate = parse(data.data_nascimento, "dd/MM/yyyy", new Date());
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Data de nascimento inválida");
      }

      const visitanteData = {
        nome: data.nome,
        cpf: data.cpf.replace(/\D/g, ""),
        rg: data.rg || null,
        data_nascimento: format(parsedDate, "yyyy-MM-dd"),
        tipo_prioridade_id: prioridadeCalculada.tipo_prioridade_id,
        foto: data.foto || null,
        possuiDeficiencia: data.possui_deficiencia,
      };

      // Se está editando um visitante específico (prop visitante existe)
      if (visitante) {
        await updateVisitante.mutateAsync({
          id: visitante.id,
          ...visitanteData,
        });
      }
      // Caso contrário, sempre chama createVisitante
      // (seja visitante novo ou reativação de inativo)
      else {
        await createVisitante.mutateAsync(visitanteData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar visitante:", error);
    }
  };

  const isLoading =
    createVisitante.isPending ||
    updateVisitante.isPending ||
    calcularPrioridade.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {visitanteExistente && (
        <Alert>
          <AlertDescription>
            Visitante já cadastrado! Os dados foram preenchidos automaticamente.
            Você pode atualizar as informações se necessário.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF *</Label>
        <Input
          id="cpf"
          {...register("cpf")}
          placeholder="000.000.000-00"
          disabled={!!visitante}
          onChange={(e) => {
            const formatted = formatCpf(e.target.value);
            setValue("cpf", formatted);
          }}
          maxLength={14}
        />
        {loadingCpf && (
          <p className="text-sm text-muted-foreground">Buscando visitante...</p>
        )}
        {errors.cpf && (
          <p className="text-sm text-destructive">{errors.cpf.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rg">RG (opcional)</Label>
        <Input
          id="rg"
          {...register("rg")}
          placeholder="Digite o RG"
          maxLength={20}
        />
        {errors.rg && (
          <p className="text-sm text-destructive">{errors.rg.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo *</Label>
        <Input
          id="nome"
          {...register("nome")}
          placeholder="Digite o nome completo"
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Data de Nascimento *</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="DD/MM/AAAA"
            value={dateInputValue || dataNascimentoStr || ""}
            onChange={handleDateInputChange}
            maxLength={10}
            className="flex-1"
          />
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-full sm:w-auto"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={getDateFromString(dataNascimentoStr)}
                onSelect={handleCalendarSelect}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        {errors.data_nascimento && (
          <p className="text-sm text-destructive">
            {errors.data_nascimento.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="possui_deficiencia"
          checked={possuiDeficiencia}
          onCheckedChange={(checked) =>
            setValue("possui_deficiencia", checked as boolean)
          }
        />
        <Label htmlFor="possui_deficiencia" className="cursor-pointer">
          Pessoa com Deficiência (PcD)
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Foto do Visitante (opcional)</Label>
        <ImageUpload
          value={watch("foto")}
          onChange={(value) => setValue("foto", value)}
          disabled={isLoading}
        />
      </div>

      {prioridadeCalculada && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Prioridade Calculada:</p>
          {prioridadeCalculada.tipo_prioridade ? (
            <div className="flex items-center gap-2">
              <PriorityBadge prioridade={prioridadeCalculada.tipo_prioridade} />
              {typeof prioridadeCalculada.idade === "number" && (
                <span className="text-sm text-muted-foreground">
                  • {prioridadeCalculada.idade} anos
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-destructive">
              Erro ao calcular prioridade (ID:{" "}
              {prioridadeCalculada.tipo_prioridade_id})
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !prioridadeCalculada}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {visitante ? "Salvar Alterações" : "Cadastrar Visitante"}
      </Button>
    </form>
  );
}
