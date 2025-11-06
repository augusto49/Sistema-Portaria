// SERVIÇO DE SLOTS DISPONÍVEIS

import prisma from "../utils/prisma";
import { format, parse, addMinutes, isWithinInterval } from "date-fns";
import {
  DisponibilidadeSala,
  StatusAgendamento,
  VariacaoCapacidade,
  HorariosDisponiveisResponse,
  SlotDisponivel,
} from "../types/database.types";

interface BuscarHorariosParams {
  salaId: number;
  data: string;
}

const DURACAO_SLOT = 60;
const DIAS_SEMANA = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

// Busca próximo dia útil (não feriado e sala funciona)
const buscarProximoDiaUtil = async (
  salaId: number,
  dataInicial: Date
): Promise<string | null> => {
  const sala = await prisma.sala.findFirst({
    where: { id: salaId, ativo: true },
  });

  if (!sala) return null;

  const disponibilidade = sala.disponibilidade as any;
  let dataTest = new Date(dataInicial);
  dataTest.setDate(dataTest.getDate() + 1);

  // Até 30 dias à frente
  for (let i = 0; i < 30; i++) {
    // Criar data no formato YYYY-MM-DD
    const ano = dataTest.getFullYear();
    const mes = String(dataTest.getMonth() + 1).padStart(2, "0");
    const dia = String(dataTest.getDate()).padStart(2, "0");
    const dataFormatada = `${ano}-${mes}-${dia}`;

    // Verificar se NÃO é feriado
    const feriado = await prisma.feriado.findFirst({
      where: {
        data: new Date(dataFormatada + "T00:00:00"),
        ativo: true,
      },
    });

    // Verificar se sala funciona neste dia
    const diaSemana = dataTest.getDay();
    const horariosDia = disponibilidade[diaSemana.toString()];
    const salaFunciona = horariosDia && horariosDia.length > 0;

    // Se não é feriado E sala funciona, retorna esta data
    if (!feriado && salaFunciona) {
      return dataFormatada;
    }

    dataTest.setDate(dataTest.getDate() + 1);
  }

  return null;
};

// Gera slots de 1h dentro do horário de funcionamento da sala
export const buscarHorariosDisponiveis = async (
  params: BuscarHorariosParams
): Promise<HorariosDisponiveisResponse> => {
  const { salaId, data } = params;

  const sala = await prisma.sala.findFirst({
    where: {
      id: salaId,
      ativo: true,
    },
  });

  if (!sala) {
    return { horarios: [], message: "Sala não encontrada ou inativa" };
  }

  const dataDate = new Date(data + "T00:00:00");
  const feriado = await prisma.feriado.findFirst({
    where: {
      data: dataDate,
      ativo: true,
    },
  });

  // Verificar feriado e sugerir próxima data disponível
  if (feriado) {
    const proximaData = await buscarProximoDiaUtil(salaId, dataDate);

    if (proximaData) {
      const proximaDataObj = new Date(proximaData + "T00:00:00");
      const nomeDia = [
        "domingo",
        "segunda",
        "terça",
        "quarta",
        "quinta",
        "sexta",
        "sábado",
      ][proximaDataObj.getDay()];
      const [ano, mes, dia] = proximaData.split("-");

      return {
        disponivel: false,
        motivo: "feriado",
        feriado: {
          descricao: feriado.descricao,
        },
        horarios: [],
        message: `Feriado: ${feriado.descricao}`,
        sugestao: {
          data: proximaData,
          mensagem: `Próxima data disponível: ${nomeDia}, ${dia}/${mes}/${ano}`,
        },
      };
    }

    return {
      disponivel: false,
      motivo: "feriado",
      feriado: {
        descricao: feriado.descricao,
      },
      horarios: [],
      message: `Feriado: ${feriado.descricao}. Nenhuma data disponível encontrada nos próximos 30 dias.`,
    };
  }

  const diaNumero = dataDate.getDay();
  const disponibilidade = sala.disponibilidade as any;
  const horariosDia = disponibilidade[diaNumero.toString()];

  if (!horariosDia || horariosDia.length === 0) {
    const nomeDia = [
      "domingo",
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sábado",
    ][diaNumero];
    return { horarios: [], message: `A sala não funciona às ${nomeDia}s` };
  }

  // Buscar agendamentos existentes na sala para o dia
  const agendamentosExistentes = await prisma.agendamento.findMany({
    where: {
      sala_id: salaId,
      ativo: true,
      status: {
        notIn: [StatusAgendamento.CANCELADO, StatusAgendamento.FINALIZADO],
      },
      data_agendada: {
        gte: new Date(`${data}T00:00:00`),
        lt: new Date(`${data}T23:59:59`),
      },
    },
  });

  // Gerar slots de 1h dentro dos períodos de funcionamento
  const horariosDisponiveis: SlotDisponivel[] = [];

  for (const periodo of horariosDia) {
    const baseDate = new Date(`${data}T00:00:00`);
    const inicio = parse(periodo.inicio, "HH:mm", baseDate);
    const fim = parse(periodo.fim, "HH:mm", baseDate);

    let currentSlot = inicio;

    while (currentSlot < fim) {
      const slotFim = addMinutes(currentSlot, DURACAO_SLOT);

      if (slotFim > fim) break;

      // Verificar conflitos com agendamentos existentes (sobreposição)
      const slotsOcupados = agendamentosExistentes.filter((agendamento) => {
        const agendamentoInicio = new Date(agendamento.data_agendada);
        const agendamentoFim = new Date(agendamento.hora_fim);

        return (
          isWithinInterval(currentSlot, {
            start: agendamentoInicio,
            end: agendamentoFim,
          }) ||
          isWithinInterval(slotFim, {
            start: agendamentoInicio,
            end: agendamentoFim,
          }) ||
          (currentSlot <= agendamentoInicio && slotFim >= agendamentoFim)
        );
      });

      // Calcular vagas disponíveis
      const capacidadeDisponivel = getCapacidadeDisponivel(
        sala.capacidade,
        sala.variacao_capacidade,
        data
      );

      const vagasOcupadas = slotsOcupados.length;
      const vagasDisponiveis = capacidadeDisponivel - vagasOcupadas;
      const disponivel = vagasDisponiveis > 0;

      // Montar objeto do slot com todas as informações
      const slot: SlotDisponivel = {
        horario: format(currentSlot, "HH:mm"),
        data_hora_inicio: currentSlot.toISOString(),
        data_hora_fim: slotFim.toISOString(),
        vagas_disponiveis: vagasDisponiveis,
        capacidade_total: capacidadeDisponivel,
        disponivel: disponivel,
      };

      horariosDisponiveis.push(slot);

      currentSlot = slotFim;
    }
  }

  return {
    horarios: horariosDisponiveis,
    periodos_funcionamento: horariosDia,
  };
};

const getCapacidadeDisponivel = (
  capacidadeBase: number,
  variacao: number,
  data: string
): number => {
  return capacidadeBase;
};
