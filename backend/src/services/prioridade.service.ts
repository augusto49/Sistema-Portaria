// CÁLCULO DE PRIORIDADE
// Níveis: 6=Idoso80+Def, 5=Idoso60+Def, 4=Def, 3=Idoso80+, 2=Idoso60+, 1=Normal

import { differenceInYears } from "date-fns";

interface CalcularPrioridadeParams {
  dataNascimento: string;
  possuiDeficiencia: boolean;
}

export const calcularPrioridade = (
  params: CalcularPrioridadeParams
): number => {
  const { dataNascimento, possuiDeficiencia } = params;
  const idade = differenceInYears(new Date(), new Date(dataNascimento));

  // Idoso (80+) com deficiência
  if (idade >= 80 && possuiDeficiencia) return 6;

  // Idoso (60+) com deficiência
  if (idade >= 60 && possuiDeficiencia) return 5;

  // Pessoa com deficiência
  if (possuiDeficiencia) return 4;

  // Idoso (80+)
  if (idade >= 80) return 3;

  // Idoso (60+)
  if (idade >= 60) return 2;

  // Normal
  return 1;
};
