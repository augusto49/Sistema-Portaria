import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { StatusAgendamento } from "../types/database.types";
import { buscarHorariosDisponiveis } from "../services/horarios.service";
import { validarAgendamento } from "../services/validacao.service";
import {
  parseLocalDate,
  parseLocalDateTimeToUTCDate,
} from "../utils/dateUtils";

// Lista todos agendamentos ativos
export const getAgendamentos = async (req: Request, res: Response) => {
  const agendamentos = await prisma.agendamento.findMany({
    where: { ativo: true },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
    },
    orderBy: { criado_em: "desc" },
  });
  res.json(agendamentos);
};

// Filtra agendamentos por visitante
export const getAgendamentosByVisitante = async (
  req: Request,
  res: Response
) => {
  const { visitanteId } = req.params;
  const agendamentos = await prisma.agendamento.findMany({
    where: { visitante_id: Number(visitanteId), ativo: true },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
    },
    orderBy: { data_agendada: "desc" },
  });
  res.json(agendamentos);
};

// Filtra agendamentos por sala
export const getAgendamentosBySala = async (req: Request, res: Response) => {
  const { salaId } = req.params;
  const agendamentos = await prisma.agendamento.findMany({
    where: { sala_id: Number(salaId), ativo: true },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
    },
    orderBy: { data_agendada: "desc" },
  });
  res.json(agendamentos);
};

// Lista agendamentos em um período
export const getAgendamentosByData = async (req: Request, res: Response) => {
  const { dataInicio, dataFim } = req.query;

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      ativo: true,
      data_agendada: {
        gte: dataInicio ? parseLocalDate(dataInicio as string) : undefined,
        lte: dataFim ? parseLocalDate(dataFim as string) : undefined,
      },
    },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
    },
    orderBy: { data_agendada: "asc" },
  });
  res.json(agendamentos);
};

// Lista agendamentos pendentes
export const getAgendamentosPendentes = async (req: Request, res: Response) => {
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      ativo: true,
      status: StatusAgendamento.PENDENTE,
    },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
    },
    orderBy: { data_agendada: "asc" },
  });
  res.json(agendamentos);
};

// Cria agendamento após validação
export const createAgendamento = async (req: Request, res: Response) => {
  try {
    const { visitante_id, sala_id, data_agendada, hora_fim } = req.body;

    // Validar antes de criar
    const validacao = await validarAgendamento({
      salaId: sala_id,
      visitanteId: visitante_id,
      dataAgendada: data_agendada,
      horaFim: hora_fim,
    });

    if (!validacao.valido) {
      return res.status(400).json({
        error: "Agendamento inválido",
        mensagem: validacao.mensagem,
        validacao,
      });
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        visitante_id,
        sala_id,
        data_agendada: parseLocalDateTimeToUTCDate(data_agendada),
        hora_fim: parseLocalDateTimeToUTCDate(hora_fim),
        status: StatusAgendamento.PENDENTE,
      },
      include: {
        visitante: { include: { tipo_prioridade: true } },
        sala: true,
      },
    });

    res.status(201).json(agendamento);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao criar agendamento",
      mensagem: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

// Atualiza agendamento (revalida)
export const updateAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { visitante_id, sala_id, data_agendada, hora_fim, status } = req.body;

    if (visitante_id && sala_id && data_agendada && hora_fim) {
      const validacao = await validarAgendamento({
        salaId: sala_id,
        visitanteId: visitante_id,
        dataAgendada: data_agendada,
        horaFim: hora_fim,
        agendamentoId: Number(id),
      });

      if (!validacao.valido) {
        return res.status(400).json({
          error: "Agendamento inválido",
          mensagem: validacao.mensagem,
          validacao,
        });
      }
    }

    const agendamento = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: {
        visitante_id,
        sala_id,
        data_agendada: data_agendada
          ? parseLocalDateTimeToUTCDate(data_agendada)
          : undefined,
        hora_fim: hora_fim ? parseLocalDateTimeToUTCDate(hora_fim) : undefined,
        status,
      },
      include: {
        visitante: { include: { tipo_prioridade: true } },
        sala: true,
      },
    });

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao atualizar agendamento",
      mensagem: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

// Cancela agendamento (muda status)
export const cancelAgendamento = async (req: Request, res: Response) => {
  const { id } = req.params;

  const agendamento = await prisma.agendamento.update({
    where: { id: Number(id) },
    data: { status: StatusAgendamento.CANCELADO },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
    },
  });

  res.json(agendamento);
};

// Valida disponibilidade sem criar
export const validarAgendamentoController = async (
  req: Request,
  res: Response
) => {
  try {
    const { sala_id, visitante_id, data_agendada, hora_fim, agendamento_id } =
      req.body;

    if (!visitante_id) {
      return res.status(400).json({
        valido: false,
        mensagem: "visitante_id é obrigatório",
      });
    }

    const resultado = await validarAgendamento({
      salaId: sala_id,
      visitanteId: visitante_id,
      dataAgendada: data_agendada,
      horaFim: hora_fim,
      agendamentoId: agendamento_id,
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      valido: false,
      mensagem: "Erro ao validar agendamento",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

// Busca horários disponíveis
export const buscarHorariosController = async (req: Request, res: Response) => {
  try {
    const { salaId, data } = req.body;

    const resultado = await buscarHorariosDisponiveis({ salaId, data });

    const response = {
      ...resultado,
      disponivel:
        resultado.disponivel ??
        (resultado.horarios && resultado.horarios.length > 0),
      mensagem: resultado.message,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      disponivel: false,
      horarios: [],
      mensagem: "Erro ao buscar horários disponíveis",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};
