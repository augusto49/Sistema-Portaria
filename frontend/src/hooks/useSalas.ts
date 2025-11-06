import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Sala, SalaResponsavel } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export const useSalas = () => {
  return useQuery({
    queryKey: ["salas"],
    queryFn: async () => {
      const { data } = await api.get<Sala[]>("/salas");
      return data;
    },
  });
};

export const useSalaById = (id: number | undefined) => {
  return useQuery({
    queryKey: ["sala", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Sala>(`/salas/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSala = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sala: {
      nome: string;
      disponibilidade: Record<string, { inicio: string; fim: string }[]>;
      capacidade: number;
      variacao_capacidade: number;
      responsavel_nome?: string;
      responsavel_valido_de?: string;
    }) => {
      const { data } = await api.post<Sala>("/salas", sala);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salas"] });
      toast({
        title: "Sala criada",
        description: "A sala foi cadastrada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar sala",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSala = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      sala,
    }: {
      id: number;
      sala: {
        nome: string;
        disponibilidade: Record<string, { inicio: string; fim: string }[]>;
        capacidade: number;
        variacao_capacidade: number;
      };
    }) => {
      const { data } = await api.put<Sala>(`/salas/${id}`, sala);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salas"] });
      toast({
        title: "Sala atualizada",
        description: "Os dados da sala foram atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar sala",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSala = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/salas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salas"] });
      toast({
        title: "Sala removida",
        description: "A sala foi desativada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover sala",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useResponsaveis = (salaId: number | undefined) => {
  return useQuery({
    queryKey: ["responsaveis", salaId],
    queryFn: async () => {
      if (!salaId) return [];
      const { data } = await api.get<SalaResponsavel[]>(
        `/salas/${salaId}/responsaveis`
      );
      return data;
    },
    enabled: !!salaId,
  });
};

export const useCreateResponsavel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (responsavel: {
      sala_id: number;
      nome: string;
      valido_de: string;
      valido_ate?: string;
    }) => {
      const { data } = await api.post<SalaResponsavel>(
        "/salas/responsaveis",
        responsavel
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["responsaveis", variables.sala_id],
      });
      queryClient.invalidateQueries({ queryKey: ["salas"] });
      toast({
        title: "Responsável adicionado",
        description: "O responsável foi cadastrado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar responsável",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
