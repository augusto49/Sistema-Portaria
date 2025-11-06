export interface TipoPrioridade {
  id: number;
  descricao: string;
  nivel_prioridade: number;
  ativo: boolean;
  criado_em: string;
}

export interface Visitante {
  id: number;
  nome: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string;
  tipo_prioridade_id: number;
  tipo_prioridade?: TipoPrioridade;
  foto: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface Sala {
  id: number;
  nome: string;
  disponibilidade: Record<string, { inicio: string; fim: string }[]>;
  capacidade: number;
  variacao_capacidade: number;
  ativo: boolean;
  criado_em: string;
  responsaveis?: SalaResponsavel[];
}

export interface SalaResponsavel {
  id: number;
  sala_id: number;
  nome: string;
  valido_de: string;
  valido_ate: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface Feriado {
  id: number;
  data: string;
  descricao: string;
  tipo: number;
  ativo: boolean;
  criado_em: string;
}

export interface Agendamento {
  id: number;
  visitante_id: number;
  sala_id: number;
  data_agendada: string;
  hora_fim: string;
  status: number;
  ativo: boolean;
  criado_em: string;
  visitante?: Visitante;
  sala?: Sala;
}

export interface Acesso {
  id: number;
  visitante_id: number;
  sala_id: number;
  agendamento_id: number | null;
  entrada_em: string;
  saida_em: string | null;
  ativo: boolean;
  criado_em: string;
  visitante?: Visitante;
  sala?: Sala;
  agendamento?: Agendamento;
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

export interface PrioridadeCalculada {
  tipo_prioridade_id: number;
  tipo_prioridade: {
    id: number;
    descricao: string;
    nivel_prioridade: number;
    ativo: boolean;
    criado_em: string;
  } | null;
  idade: number;
  eh_prioritario: boolean;
}
