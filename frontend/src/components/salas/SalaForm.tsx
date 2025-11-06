import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HorariosPorDia } from "./HorariosPorDia";
import { useCreateSala, useUpdateSala, useSalaById } from "@/hooks/useSalas";
import { VariacaoCapacidade } from "@/types/database";
import { format } from "date-fns";

const salaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  capacidade: z.number().min(1, "Capacidade deve ser maior que 0"),
  variacao_capacidade: z.number(),
  disponibilidade: z.record(
    z.array(z.object({ inicio: z.string().min(1), fim: z.string().min(1) }))
  ),
  responsavel_nome: z.string().optional(),
  responsavel_valido_de: z.string().optional(),
});

type SalaFormData = z.infer<typeof salaSchema>;

interface SalaFormProps {
  open: boolean;
  onClose: () => void;
  salaId?: number;
}

// Componente de Formulário para Criação/Edição de Sala
export function SalaForm({ open, onClose, salaId }: SalaFormProps) {
  const isEditing = !!salaId;
  const { data: sala } = useSalaById(salaId);
  const createSala = useCreateSala();
  const updateSala = useUpdateSala();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SalaFormData>({
    resolver: zodResolver(salaSchema),
    defaultValues: {
      nome: "",
      capacidade: 1,
      variacao_capacidade: VariacaoCapacidade.DIA,
      disponibilidade: {},
      responsavel_nome: "",
      responsavel_valido_de: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const disponibilidade = watch("disponibilidade");

  useEffect(() => {
    if (sala && isEditing) {
      reset({
        nome: sala.nome,
        capacidade: sala.capacidade,
        variacao_capacidade: sala.variacao_capacidade,
        disponibilidade: sala.disponibilidade,
        responsavel_nome: "",
        responsavel_valido_de: format(new Date(), "yyyy-MM-dd"),
      });
    } else if (!isEditing) {
      reset({
        nome: "",
        capacidade: 1,
        variacao_capacidade: VariacaoCapacidade.DIA,
        disponibilidade: {},
        responsavel_nome: "",
        responsavel_valido_de: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [sala, isEditing, reset]);

  const onSubmit = async (data: SalaFormData) => {
    try {
      if (isEditing && salaId) {
        await updateSala.mutateAsync({
          id: salaId,
          sala: {
            nome: data.nome,
            capacidade: data.capacidade,
            variacao_capacidade: data.variacao_capacidade,
            disponibilidade: data.disponibilidade as Record<
              string,
              { inicio: string; fim: string }[]
            >,
          },
        });
      } else {
        await createSala.mutateAsync(data as any);
      }
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar sala:", error);
    }
  };

  const handleClose = () => {
    reset({
      nome: "",
      capacidade: 1,
      variacao_capacidade: VariacaoCapacidade.DIA,
      disponibilidade: {},
      responsavel_nome: "",
      responsavel_valido_de: format(new Date(), "yyyy-MM-dd"),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Sala" : "Nova Sala"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da sala"
              : "Preencha os dados para cadastrar uma nova sala"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Sala *</Label>
              <Input
                id="nome"
                {...register("nome")}
                placeholder="Ex: Sala de Reunião A"
              />
              {errors.nome && (
                <p className="text-sm text-destructive">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade *</Label>
              <Input
                id="capacidade"
                type="number"
                min="1"
                {...register("capacidade", { valueAsNumber: true })}
              />
              {errors.capacidade && (
                <p className="text-sm text-destructive">
                  {errors.capacidade.message}
                </p>
              )}
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="responsavel_nome">Responsável Atual</Label>
                <Input
                  id="responsavel_nome"
                  {...register("responsavel_nome")}
                  placeholder="Ex: João Silva"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="variacao_capacidade">Variação de Capacidade</Label>
            <Select
              value={watch("variacao_capacidade")?.toString()}
              onValueChange={(value) =>
                setValue("variacao_capacidade", parseInt(value), {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VariacaoCapacidade.HORA.toString()}>
                  Por Hora
                </SelectItem>
                <SelectItem value={VariacaoCapacidade.DIA.toString()}>
                  Por Dia
                </SelectItem>
                <SelectItem value={VariacaoCapacidade.SEMANA.toString()}>
                  Por Semana
                </SelectItem>
                <SelectItem value={VariacaoCapacidade.MES.toString()}>
                  Por Mês
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <HorariosPorDia
            value={
              disponibilidade as Record<
                string,
                { inicio: string; fim: string }[]
              >
            }
            onChange={(value) =>
              setValue("disponibilidade", value, { shouldValidate: true })
            }
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createSala.isPending || updateSala.isPending}
            >
              {createSala.isPending || updateSala.isPending
                ? "Salvando..."
                : isEditing
                ? "Atualizar"
                : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
