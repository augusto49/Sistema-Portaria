import prisma from "../utils/prisma";
import { parseLocalDateTimeToUTCDate } from "../utils/dateUtils";
import { StatusAgendamento } from "../types/database.types";

interface ValidarAgendamentoParams {
  salaId: number;
  visitanteId: number;
  dataAgendada: string;
  horaFim: string;
  agendamentoId?: number;
}

// Valida se um agendamento pode ser criado/atualizado
// Verifica: sala ativa, feriados, conflitos do visitante e capacidade
export const validarAgendamento = async (params: ValidarAgendamentoParams) => {
  const { salaId, visitanteId, dataAgendada, horaFim, agendamentoId } = params;

  // Buscar sala ativa
  const sala = await prisma.sala.findUnique({
    where: { id: salaId, ativo: true },
  });

  if (!sala) {
    return { valido: false, mensagem: "Sala não encontrada" };
  }

  // Verificar feriado na data
  const dataAgendadaDate = parseLocalDateTimeToUTCDate(dataAgendada);
  const horaFimDate = parseLocalDateTimeToUTCDate(horaFim);
  console.log("🔍 [Validação] Datas convertidas:", {
    dataAgendada: dataAgendadaDate.toISOString(),
    horaFim: horaFimDate.toISOString(),
  });
  const feriado = await prisma.feriado.findFirst({
    where: {
      data: dataAgendadaDate,
      ativo: true,
    },
  });

  if (feriado) {
    return { valido: false, mensagem: `Feriado: ${feriado.descricao}` };
  }

  // Verificar conflitos do visitante em QUALQUER sala (OR com sobreposição de horários)
  const agendamentosVisitante = await prisma.agendamento.findMany({
    where: {
      visitante_id: visitanteId,
      ativo: true,
      status: {
        notIn: [StatusAgendamento.CANCELADO, StatusAgendamento.FINALIZADO],
      },
      id: agendamentoId ? { not: agendamentoId } : undefined,
      OR: [
        {
          AND: [
            { data_agendada: { lte: dataAgendadaDate } },
            { hora_fim: { gt: dataAgendadaDate } },
          ],
        },
        {
          AND: [
            { data_agendada: { lt: horaFimDate } },
            { hora_fim: { gte: horaFimDate } },
          ],
        },
        {
          AND: [
            { data_agendada: { gte: dataAgendadaDate } },
            { hora_fim: { lte: horaFimDate } },
          ],
        },
      ],
    },
    include: { sala: true },
  });

  if (agendamentosVisitante.length > 0) {
    console.log(
      "❌ [Validação] Conflitos visitante:",
      agendamentosVisitante.map((a) => ({
        sala: a.sala?.nome,
        inicio: a.data_agendada,
        fim: a.hora_fim,
      }))
    );
    const salaConflito = agendamentosVisitante[0].sala?.nome || "desconhecida";
    return {
      valido: false,
      mensagem: `Visitante já possui agendamento no mesmo horário (${salaConflito})`,
    };
  }

  // Verificar capacidade disponível na sala
  const agendamentosConflitantes = await prisma.agendamento.findMany({
    where: {
      sala_id: salaId,
      ativo: true,
      status: {
        notIn: [StatusAgendamento.CANCELADO, StatusAgendamento.FINALIZADO],
      },
      id: agendamentoId ? { not: agendamentoId } : undefined,
      OR: [
        {
          AND: [
            { data_agendada: { lte: dataAgendadaDate } },
            { hora_fim: { gt: dataAgendadaDate } },
          ],
        },
        {
          AND: [
            { data_agendada: { lt: horaFimDate } },
            { hora_fim: { gte: horaFimDate } },
          ],
        },
        {
          AND: [
            { data_agendada: { gte: dataAgendadaDate } },
            { hora_fim: { lte: horaFimDate } },
          ],
        },
      ],
    },
  });

  if (agendamentosConflitantes.length >= sala.capacidade) {
    return {
      valido: false,
      mensagem: "Sala sem capacidade disponível para este horário",
    };
  }

  return { valido: true, mensagem: "Agendamento válido" };
};
