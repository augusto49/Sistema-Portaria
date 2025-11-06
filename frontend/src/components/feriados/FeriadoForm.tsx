import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCreateFeriado, useUpdateFeriado } from "@/hooks/useFeriados";
import { Feriado, TipoFeriado } from "@/types/database";
import { parseDateOnlyFromApi } from "@/lib/date";

const feriadoSchema = z.object({
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  descricao: z
    .string()
    .min(3, "Descrição deve ter no mínimo 3 caracteres")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  tipo: z.number().min(1).max(3),
});

type FeriadoFormData = z.infer<typeof feriadoSchema>;

interface FeriadoFormProps {
  feriado?: Feriado;
  onSuccess?: () => void;
}

export default function FeriadoForm({ feriado, onSuccess }: FeriadoFormProps) {
  const createFeriado = useCreateFeriado();
  const updateFeriado = useUpdateFeriado();

  const form = useForm<FeriadoFormData>({
    resolver: zodResolver(feriadoSchema),
    defaultValues: {
      data: feriado?.data ? parseDateOnlyFromApi(feriado.data) : undefined,
      descricao: feriado?.descricao ?? "",
      tipo: feriado?.tipo ?? TipoFeriado.NACIONAL,
    },
  });

  const onSubmit = async (data: FeriadoFormData) => {
    const feriadoData = {
      data: `${data.data.getFullYear()}-${String(
        data.data.getMonth() + 1
      ).padStart(2, "0")}-${String(data.data.getDate()).padStart(2, "0")}`,
      descricao: data.descricao,
      tipo: data.tipo,
    };

    console.log("📅 [FeriadoForm] Data enviada:", feriadoData.data);

    if (feriado) {
      await updateFeriado.mutateAsync({ id: feriado.id, ...feriadoData });
    } else {
      await createFeriado.mutateAsync(feriadoData);
    }

    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
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
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione a data</span>
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
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Natal, Ano Novo..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={TipoFeriado.NACIONAL.toString()}>
                    Nacional
                  </SelectItem>
                  <SelectItem value={TipoFeriado.ESTADUAL.toString()}>
                    Estadual
                  </SelectItem>
                  <SelectItem value={TipoFeriado.MUNICIPAL.toString()}>
                    Municipal
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button
            type="submit"
            disabled={createFeriado.isPending || updateFeriado.isPending}
          >
            {feriado ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
