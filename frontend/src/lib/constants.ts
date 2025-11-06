// CONSTANTES DO SISTEMA

// Status de agendamentos
export const STATUS_AGENDAMENTO = {
  1: { label: "PENDENTE", color: "bg-warning text-warning-foreground" },
  3: { label: "EM ANDAMENTO", color: "bg-primary text-primary-foreground" },
  4: { label: "FINALIZADO", color: "bg-success text-success-foreground" },
  5: { label: "CANCELADO", color: "bg-muted text-muted-foreground" },
};

// Tipos de feriados
export const TIPO_FERIADO = {
  1: "Nacional",
  2: "Estadual",
  3: "Municipal",
};

// Variações de capacidade da sala
export const VARIACAO_CAPACIDADE = {
  1: "Hora",
  2: "Dia",
  3: "Semana",
  4: "Mês",
};

// Dias da semana
export const DIAS_SEMANA = [
  { value: "0", label: "Dom" },
  { value: "1", label: "Seg" },
  { value: "2", label: "Ter" },
  { value: "3", label: "Qua" },
  { value: "4", label: "Qui" },
  { value: "5", label: "Sex" },
  { value: "6", label: "Sáb" },
];

// Dias da semana (completos)
export const DIAS_SEMANA_COMPLETO = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
