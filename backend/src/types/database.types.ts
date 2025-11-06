export interface DisponibilidadeSala {
  [dia: string]: { inicio: string; fim: string }[];
}

export enum StatusAgendamento {
  PENDENTE = 1,
  EM_ANDAMENTO = 3,
  FINALIZADO = 4,
  CANCELADO = 5,
}

export enum TipoFeriado {
  NACIONAL = 1,
  ESTADUAL = 2,
  MUNICIPAL = 3,
}

export enum VariacaoCapacidade {
  HORA = 1,
  DIA = 2,
  SEMANA = 3,
  MES = 4,
}

export interface SlotDisponivel {
  horario: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  vagas_disponiveis: number;
  capacidade_total: number;
  disponivel: boolean;
}

export interface HorariosDisponiveisResponse {
  horarios: SlotDisponivel[];
  periodos_funcionamento?: Array<{ inicio: string; fim: string }>;
  message?: string;
  disponivel?: boolean;
  motivo?: string;
  feriado?: {
    descricao: string;
  };
  sugestao?: {
    data: string;
    mensagem: string;
  };
}
