import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import VisitanteAutocomplete from "@/components/agendamentos/VisitanteAutocomplete";
import SalaSelect from "@/components/agendamentos/SalaSelect";
import { useVisitantes } from "@/hooks/useVisitantes";
import { useCreateAcesso } from "@/hooks/useAcessos";
import { useAgendamentosByVisitante } from "@/hooks/useAgendamentos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { parseDateTimeFromApi } from "@/lib/date";

// REGISTRO DE ENTRADA

const formSchema = z.object({
  visitante_id: z.number({ required_error: "Selecione um visitante" }),
  sala_id: z.number({ required_error: "Selecione uma sala" }),
  observacao: z.string().optional(),
});

export function RegistroAcessoForm() {
  const [selectedVisitanteId, setSelectedVisitanteId] = useState<number>();
  const createAcesso = useCreateAcesso();
  const { data: visitantes } = useVisitantes();
  const { data: agendamentos } =
    useAgendamentosByVisitante(selectedVisitanteId);

  const selectedVisitante = visitantes?.find(
    (v) => v.id === selectedVisitanteId
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Verificar agendamento vinculado antes de registrar
  const agendamentoAtivo = agendamentos?.find(
    (a) =>
      a.status === 2 &&
      format(parseDateTimeFromApi(a.data_agendada), "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd")
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAcesso.mutate(
      {
        visitante_id: values.visitante_id,
        sala_id: values.sala_id,
        agendamento_id: agendamentoAtivo?.id,
      },
      {
        onSuccess: () => {
          form.reset();
          setSelectedVisitanteId(undefined);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Entrada</CardTitle>
        <CardDescription>
          Registre a entrada de um visitante no prédio
          <span className="block mt-1 text-xs text-muted-foreground">
            💡 Use esta aba apenas para visitantes{" "}
            <strong>sem agendamento prévio</strong>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="visitante_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visitante</FormLabel>
                  <FormControl>
                    <VisitanteAutocomplete
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setSelectedVisitanteId(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedVisitante && (
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedVisitante.foto || ""}
                    alt={selectedVisitante.nome}
                  />
                  <AvatarFallback>
                    {selectedVisitante.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedVisitante.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    CPF: {selectedVisitante.cpf}
                  </p>
                  {selectedVisitante.tipo_prioridade && (
                    <Badge variant="secondary" className="mt-1">
                      {selectedVisitante.tipo_prioridade.descricao}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {agendamentoAtivo && (
              <div className="p-4 rounded-lg border border-primary/50 bg-primary/5">
                <p className="text-sm font-medium text-primary">
                  Agendamento Ativo Encontrado
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(
                    parseDateTimeFromApi(agendamentoAtivo.data_agendada),
                    "HH:mm"
                  )}{" "}
                  -{" "}
                  {format(
                    parseDateTimeFromApi(agendamentoAtivo.hora_fim),
                    "HH:mm"
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Este acesso será vinculado automaticamente ao agendamento
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="sala_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sala</FormLabel>
                  <FormControl>
                    <SalaSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre esta entrada..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createAcesso.isPending}
            >
              {createAcesso.isPending ? "Registrando..." : "Registrar Entrada"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
