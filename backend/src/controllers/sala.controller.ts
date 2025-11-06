// CONTROLER DE SALAS

import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getSalas = async (req: Request, res: Response) => {
  const salas = await prisma.sala.findMany({
    where: { ativo: true },
    orderBy: { criado_em: "asc" },
    include: {
      responsaveis: {
        where: {
          ativo: true,
          OR: [{ valido_ate: null }, { valido_ate: { gte: new Date() } }],
        },
        orderBy: { valido_de: "desc" },
        take: 1,
      },
    },
  });

  res.json(salas);
};

export const getSalaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const sala = await prisma.sala.findUnique({
    where: { id: Number(id), ativo: true },
    include: {
      responsaveis: {
        where: { ativo: true },
        orderBy: { valido_de: "desc" },
      },
    },
  });
  res.json(sala);
};

export const createSala = async (req: Request, res: Response) => {
  const {
    nome,
    disponibilidade,
    capacidade,
    variacao_capacidade,
    responsavel_nome,
    responsavel_valido_de,
  } = req.body;

  const sala = await prisma.sala.create({
    data: {
      nome,
      disponibilidade,
      capacidade,
      variacao_capacidade,
      responsaveis: responsavel_nome
        ? {
            create: {
              nome: responsavel_nome,
              valido_de: new Date(responsavel_valido_de || new Date()),
            },
          }
        : undefined,
    },
    include: {
      responsaveis: {
        where: { ativo: true },
      },
    },
  });

  res.status(201).json(sala);
};

export const updateSala = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, disponibilidade, capacidade, variacao_capacidade } = req.body;

  const sala = await prisma.sala.update({
    where: { id: Number(id) },
    data: {
      nome,
      disponibilidade,
      capacidade,
      variacao_capacidade,
    },
    include: {
      responsaveis: {
        where: { ativo: true },
      },
    },
  });

  res.json(sala);
};

export const deleteSala = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.sala.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });
  res.status(204).send();
};

// Lista responsáveis de uma sala
export const getResponsaveis = async (req: Request, res: Response) => {
  const { salaId } = req.params;
  const responsaveis = await prisma.salaResponsavel.findMany({
    where: { sala_id: Number(salaId), ativo: true },
    orderBy: { valido_de: "desc" },
  });
  res.json(responsaveis);
};

// Adiciona responsável (inativa o anterior automaticamente)
export const createResponsavel = async (req: Request, res: Response) => {
  const { sala_id, nome, valido_de, valido_ate } = req.body;

  const responsavelAtual = await prisma.salaResponsavel.findFirst({
    where: {
      sala_id: Number(sala_id),
      ativo: true,
      valido_ate: null,
    },
  });

  if (responsavelAtual) {
    await prisma.salaResponsavel.update({
      where: { id: responsavelAtual.id },
      data: { valido_ate: new Date(valido_de) },
    });
  }

  const responsavel = await prisma.salaResponsavel.create({
    data: {
      sala_id: Number(sala_id),
      nome,
      valido_de: new Date(valido_de),
      valido_ate: valido_ate ? new Date(valido_ate) : null,
    },
  });

  res.status(201).json(responsavel);
};
