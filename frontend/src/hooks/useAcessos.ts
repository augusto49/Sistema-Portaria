import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Acesso } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useAcessos() {
  return useQuery({
    queryKey: ['acessos'],
    queryFn: async () => {
      const { data } = await api.get<Acesso[]>('/acessos');
      return data;
    },
  });
}

export function useAcessosByVisitante(visitanteId: number | undefined) {
  return useQuery({
    queryKey: ['acessos', 'visitante', visitanteId],
    queryFn: async () => {
      if (!visitanteId) return [];
      const { data } = await api.get<Acesso[]>(`/acessos/visitante/${visitanteId}`);
      return data;
    },
    enabled: !!visitanteId,
  });
}

export function useAcessosBySala(salaId: number | undefined) {
  return useQuery({
    queryKey: ['acessos', 'sala', salaId],
    queryFn: async () => {
      if (!salaId) return [];
      const { data } = await api.get<Acesso[]>(`/acessos/sala/${salaId}`);
      return data;
    },
    enabled: !!salaId,
  });
}

export function useAcessosByPeriodo(dataInicio?: string, dataFim?: string) {
  return useQuery({
    queryKey: ['acessos', 'periodo', dataInicio, dataFim],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);
      
      const { data } = await api.get<Acesso[]>(`/acessos/periodo?${params}`);
      return data;
    },
    enabled: !!dataInicio || !!dataFim,
  });
}

export function useAcessosAtivos() {
  return useQuery({
    queryKey: ['acessos', 'ativos'],
    queryFn: async () => {
      const { data } = await api.get<Acesso[]>('/acessos/ativos');
      return data;
    },
  });
}

export function useAcessoByAgendamento(agendamentoId: number | undefined) {
  return useQuery({
    queryKey: ['acesso', 'agendamento', agendamentoId],
    queryFn: async () => {
      if (!agendamentoId) return null;
      const { data } = await api.get(`/acessos/agendamento/${agendamentoId}`);
      return data;
    },
    enabled: !!agendamentoId,
  });
}

export function useCreateAcesso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (acesso: {
      visitante_id: number;
      sala_id: number;
      agendamento_id?: number;
      entrada_em?: string;
    }) => {
      const { data } = await api.post<Acesso>('/acessos', acesso);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acessos'] });
      toast({
        title: 'Sucesso',
        description: 'Entrada registrada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRegistrarSaida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (acessoId: number) => {
      const { data } = await api.put<Acesso>(`/acessos/${acessoId}/saida`, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acessos'] });
      toast({
        title: 'Sucesso',
        description: 'Saída registrada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
