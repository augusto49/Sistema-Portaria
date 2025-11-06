import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Visitante, PrioridadeCalculada } from "@/types/database";
import { toast } from "@/hooks/use-toast";

// Lista todos visitantes ativos
export function useVisitantes() {
  return useQuery({
    queryKey: ["visitantes"],
    queryFn: async () => {
      const { data } = await api.get<Visitante[]>("/visitantes");
      return data;
    },
  });
}

// Busca visitante por CPF (mínimo 11 dígitos)
export function useVisitanteByCpf(cpf: string) {
  return useQuery({
    queryKey: ["visitante", "cpf", cpf],
    queryFn: async () => {
      if (!cpf || cpf.length < 11) return null;
      const { data } = await api.get<Visitante>(`/visitantes/cpf/${cpf}`);
      return data;
    },
    enabled: cpf.length >= 11,
  });
}

// Calcula prioridade em tempo real
export function useCalcularPrioridade() {
  return useMutation({
    mutationFn: async (params: {
      data_nascimento: string;
      possui_deficiencia: boolean;
    }) => {
      const { data } = await api.post<PrioridadeCalculada>(
        "/visitantes/calcular-prioridade",
        {
          data_nascimento: params.data_nascimento,
          possui_deficiencia: params.possui_deficiencia,
        }
      );
      return data;
    },
  });
}

// Cria novo visitante (invalida cache ao sucesso)
export function useCreateVisitante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      visitante: Omit<
        Visitante,
        "id" | "criado_em" | "ativo" | "tipo_prioridade"
      > & { possuiDeficiencia?: boolean }
    ) => {
      const { data } = await api.post<Visitante>("/visitantes", {
        nome: visitante.nome,
        cpf: visitante.cpf,
        rg: visitante.rg,
        data_nascimento: visitante.data_nascimento,
        foto: visitante.foto,
        possui_deficiencia: visitante.possuiDeficiencia || false,
      });
      return data;
    },
    onSuccess: () => {
      // Atualiza lista automaticamente
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast({
        title: "Sucesso",
        description: "Visitante cadastrado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Atualiza visitante
export function useUpdateVisitante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      possuiDeficiencia,
      ...visitante
    }: Partial<Visitante> & { id: number; possuiDeficiencia?: boolean }) => {
      const { data } = await api.put<Visitante>(`/visitantes/${id}`, {
        nome: visitante.nome,
        cpf: visitante.cpf,
        rg: visitante.rg,
        data_nascimento: visitante.data_nascimento,
        foto: visitante.foto,
        possui_deficiencia: possuiDeficiencia,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast({
        title: "Sucesso",
        description: "Visitante atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Deleta visitante
export function useDeleteVisitante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/visitantes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitantes"] });
      toast({
        title: "Sucesso",
        description: "Visitante removido com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
