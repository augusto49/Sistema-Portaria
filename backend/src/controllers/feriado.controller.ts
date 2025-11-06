// CONTROLE DE FERIADOS

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";
import { parseLocalDate } from "../utils/dateUtils";

export const getFeriados = async (req: Request, res: Response) => {
  const feriados = await prisma.feriado.findMany({
    where: { ativo: true },
    orderBy: { data: "asc" },
  });
  res.json(feriados);
};

export const getFeriadosByPeriodo = async (req: Request, res: Response) => {
  const { inicio, fim } = req.query;

  const feriados = await prisma.feriado.findMany({
    where: {
      ativo: true,
      data: {
        gte: inicio ? new Date(inicio as string) : undefined,
        lte: fim ? new Date(fim as string) : undefined,
      },
    },
    orderBy: { data: "asc" },
  });
  res.json(feriados);
};

export const createFeriado = async (req: Request, res: Response) => {
  const { data, descricao, tipo } = req.body;

  const feriadoExistente = await prisma.feriado.findFirst({
    where: {
      data: parseLocalDate(data),
      ativo: true,
    },
  });

  if (feriadoExistente) {
    throw new AppError("Já existe um feriado cadastrado para esta data", 400);
  }

  const feriado = await prisma.feriado.create({
    data: {
      data: parseLocalDate(data),
      descricao,
      tipo,
    },
  });

  res.status(201).json(feriado);
};

export const updateFeriado = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, descricao, tipo } = req.body;

  if (data) {
    const feriadoExistente = await prisma.feriado.findFirst({
      where: {
        data: parseLocalDate(data),
        ativo: true,
        id: { not: Number(id) },
      },
    });

    if (feriadoExistente) {
      throw new AppError("Já existe um feriado cadastrado para esta data", 400);
    }
  }

  const feriado = await prisma.feriado.update({
    where: { id: Number(id) },
    data: {
      data: data ? parseLocalDate(data) : undefined,
      descricao,
      tipo,
    },
  });

  res.json(feriado);
};

export const deleteFeriado = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.feriado.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });
  res.status(204).send();
};
