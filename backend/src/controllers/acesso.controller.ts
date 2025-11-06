import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

// Obtém todos os acessos
export const getAcessos = async (req: Request, res: Response) => {
  const acessos = await prisma.acesso.findMany({
    where: { ativo: true },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
    orderBy: { entrada_em: "desc" },
  });
  res.json(acessos);
};

// Obtém acesso por ID
export const getAcessosByVisitante = async (req: Request, res: Response) => {
  const { visitanteId } = req.params;
  const acessos = await prisma.acesso.findMany({
    where: { visitante_id: Number(visitanteId), ativo: true },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
    orderBy: { entrada_em: "desc" },
  });
  res.json(acessos);
};

// Obtém acessos por sala
export const getAcessosBySala = async (req: Request, res: Response) => {
  const { salaId } = req.params;
  const acessos = await prisma.acesso.findMany({
    where: { sala_id: Number(salaId), ativo: true },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
    orderBy: { entrada_em: "desc" },
  });
  res.json(acessos);
};

// Lista acessos em um período
export const getAcessosByPeriodo = async (req: Request, res: Response) => {
  const { dataInicio, dataFim } = req.query;

  const acessos = await prisma.acesso.findMany({
    where: {
      ativo: true,
      entrada_em: {
        gte: dataInicio ? new Date(dataInicio as string) : undefined,
        lte: dataFim ? new Date(dataFim as string) : undefined,
      },
    },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
    orderBy: { entrada_em: "desc" },
  });
  res.json(acessos);
};

// Lista acessos sem saída (visitantes ainda no prédio)
export const getAcessosAtivos = async (req: Request, res: Response) => {
  const acessos = await prisma.acesso.findMany({
    where: {
      ativo: true,
      saida_em: null,
    },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
    orderBy: { entrada_em: "desc" },
  });
  res.json(acessos);
};

// Obtém acesso por agendamento
export const getAcessoByAgendamento = async (req: Request, res: Response) => {
  const { agendamentoId } = req.params;
  const acesso = await prisma.acesso.findFirst({
    where: { agendamento_id: Number(agendamentoId), ativo: true },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
  });
  res.json(acesso);
};

// Registra entrada de visitante
export const createAcesso = async (req: Request, res: Response) => {
  const { visitante_id, sala_id, agendamento_id, entrada_em } = req.body;

  // Verificar se visitante já tem acesso ativo (sem saída)
  const acessoAtivo = await prisma.acesso.findFirst({
    where: {
      visitante_id,
      ativo: true,
      saida_em: null,
    },
  });

  if (acessoAtivo) {
    throw new AppError("Visitante já está no prédio", 400);
  }

  const acesso = await prisma.acesso.create({
    data: {
      visitante_id,
      sala_id,
      agendamento_id,
      entrada_em: entrada_em ? new Date(entrada_em) : new Date(),
    },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
  });

  res.status(201).json(acesso);
};

// Registra saída
export const registrarSaida = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { saida_em } = req.body;

  const acesso = await prisma.acesso.update({
    where: { id: Number(id) },
    data: {
      saida_em: saida_em ? new Date(saida_em) : new Date(),
    },
    include: {
      visitante: { include: { tipo_prioridade: true } },
      sala: true,
      agendamento: true,
    },
  });

  res.json(acesso);
};
