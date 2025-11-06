import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Agendamento } from '@/types/database';

// Lista todos os agendamentos ativos
export function useAgendamentos() {
  return useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      const { data } = await api.get<Agendamento[]>('/agendamentos');
      return data;
    },
  });
}

// Agendamentos por visitante
export function useAgendamentosByVisitante(visitanteId: number | undefined) {
  return useQuery({
    queryKey: ['agendamentos', 'visitante', visitanteId],
    queryFn: async () => {
      if (!visitanteId) return [];
      const { data } = await api.get<Agendamento[]>(`/agendamentos/visitante/${visitanteId}`);
      return data;
    },
    enabled: !!visitanteId,
  });
}

// Agendamentos por sala
export function useAgendamentosBySala(salaId: number | undefined) {
  return useQuery({
    queryKey: ['agendamentos', 'sala', salaId],
    queryFn: async () => {
      if (!salaId) return [];
      const { data } = await api.get<Agendamento[]>(`/agendamentos/sala/${salaId}`);
      return data;
    },
    enabled: !!salaId,
  });
}

// Agendamentos por data
export function useAgendamentosByData(data: string | undefined) {
  return useQuery({
    queryKey: ['agendamentos', 'data', data],
    queryFn: async () => {
      if (!data) return [];
      
      const inicioData = `${data}T00:00:00`;
      const fimData = `${data}T23:59:59`;
      
      const { data: agendamentos } = await api.get<Agendamento[]>(
        `/agendamentos/data?dataInicio=${inicioData}&dataFim=${fimData}`
      );
      return agendamentos;
    },
    enabled: !!data,
  });
}

// Agendamentos pendentes
export function useAgendamentosPendentes() {
  return useQuery({
    queryKey: ['agendamentos', 'pendentes'],
    queryFn: async () => {
      const { data } = await api.get<Agendamento[]>('/agendamentos/pendentes');
      return data;
    },
  });
}

// Valida disponibilidade antes de criar
export function useValidarAgendamento() {
  return useMutation({
    mutationFn: async (params: {
      visitante_id: number;
      sala_id: number;
      data_agendada: string;
      hora_fim: string;
    }) => {
      const { data } = await api.post('/agendamentos/validar', params);
      return data;
    },
  });
}

// Busca horários livres na sala
export function useBuscarHorariosDisponiveis() {
  return useMutation({
    mutationFn: async (params: { salaId: number; data: string }) => {
      const { data } = await api.post('/agendamentos/horarios-disponiveis', params);
      return data;
    },
  });
}

// Criar agendamento
export function useCreateAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendamento: {
      visitante_id: number;
      sala_id: number;
      data_agendada: string;
      hora_fim: string;
      status?: number;
    }) => {
      const { data } = await api.post<Agendamento>('/agendamentos', agendamento);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast({
        title: 'Agendamento criado',
        description: 'O agendamento foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Atualizar agendamento
export function useUpdateAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agendamento> & { id: number }) => {
      const { data } = await api.put<Agendamento>(`/agendamentos/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast({
        title: 'Agendamento atualizado',
        description: 'O agendamento foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

