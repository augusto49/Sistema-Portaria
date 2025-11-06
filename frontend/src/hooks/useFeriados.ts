import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Feriado } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export const useFeriados = () => {
  return useQuery({
    queryKey: ["feriados"],
    queryFn: async () => {
      const { data } = await api.get<Feriado[]>("/feriados");
      return data;
    },
  });
};

export const useFeriadosByPeriodo = (inicio?: string, fim?: string) => {
  return useQuery({
    queryKey: ["feriados", "periodo", inicio, fim],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (inicio) params.append("inicio", inicio);
      if (fim) params.append("fim", fim);
      const { data } = await api.get<Feriado[]>(`/feriados/periodo?${params}`);
      return data;
    },
    enabled: !!inicio || !!fim,
  });
};

export const useCreateFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      feriado: Omit<Feriado, "id" | "criado_em" | "ativo">
    ) => {
      const { data } = await api.post<Feriado>("/feriados", feriado);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({
        title: "Sucesso",
        description: "Feriado cadastrado com sucesso",
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
};

export const useUpdateFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...feriado
    }: Partial<Feriado> & { id: number }) => {
      const { data } = await api.put<Feriado>(`/feriados/${id}`, feriado);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({
        title: "Sucesso",
        description: "Feriado atualizado com sucesso",
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
};

export const useDeleteFeriado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/feriados/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({
        title: "Sucesso",
        description: "Feriado excluído com sucesso",
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
};
