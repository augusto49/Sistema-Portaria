import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";
import { calcularPrioridade } from "../services/prioridade.service";
import { parseAndValidateDate } from "../utils/dateUtils";

// Lista todos visitantes ativos
export const getVisitantes = async (req: Request, res: Response) => {
  const visitantes = await prisma.visitante.findMany({
    where: { ativo: true },
    include: { tipo_prioridade: true },
    orderBy: { criado_em: "desc" },
  });
  res.json(visitantes);
};

// Busca visitante por CPF
export const getVisitanteByCpf = async (req: Request, res: Response) => {
  const { cpf } = req.params;
  const visitante = await prisma.visitante.findFirst({
    where: { cpf },
    include: { tipo_prioridade: true },
  });
  res.json(visitante);
};

// Cria novo visitante ou reativa se CPF já existe
export const createVisitante = async (req: Request, res: Response) => {
  const { nome, cpf, rg, data_nascimento, foto, possui_deficiencia } = req.body;

  // Calcular prioridade baseada em idade e deficiência
  const tipo_prioridade_id = calcularPrioridade({
    dataNascimento: data_nascimento,
    possuiDeficiencia: possui_deficiencia,
  });

  // Verificar se visitante já existe (ativo ou inativo)
  const visitanteExistente = await prisma.visitante.findFirst({
    where: { cpf },
    include: { tipo_prioridade: true },
  });

  // Se já existe e está ativo → retornar erro
  if (visitanteExistente && visitanteExistente.ativo) {
    throw new AppError("Visitante com este CPF já está cadastrado", 409);
  }

  // Se já existe mas está inativo → reativar visitante
  if (visitanteExistente && !visitanteExistente.ativo) {
    const visitanteReativado = await prisma.visitante.update({
      where: { id: visitanteExistente.id },
      data: {
        nome,
        rg,
        data_nascimento: parseAndValidateDate(data_nascimento),
        tipo_prioridade_id,
        foto,
        ativo: true,
      },
      include: { tipo_prioridade: true },
    });

    return res.status(200).json(visitanteReativado);
  }

  // Se não existe → criar novo
  const visitante = await prisma.visitante.create({
    data: {
      nome,
      cpf,
      rg,
      data_nascimento: parseAndValidateDate(data_nascimento),
      tipo_prioridade_id,
      foto,
    },
    include: { tipo_prioridade: true },
  });

  res.status(201).json(visitante);
};

// Atualiza visitante (recalcula prioridade se necessário)
export const updateVisitante = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, cpf, rg, data_nascimento, foto, possui_deficiencia } = req.body;

  let tipo_prioridade_id;
  if (data_nascimento || possui_deficiencia !== undefined) {
    const visitante = await prisma.visitante.findUnique({
      where: { id: Number(id) },
    });
    if (!visitante) throw new AppError("Visitante não encontrado", 404);

    tipo_prioridade_id = calcularPrioridade({
      dataNascimento:
        data_nascimento || visitante.data_nascimento.toISOString(),
      possuiDeficiencia: possui_deficiencia ?? false,
    });
  }

  const visitante = await prisma.visitante.update({
    where: { id: Number(id) },
    data: {
      nome,
      cpf,
      rg,
      data_nascimento: data_nascimento
        ? parseAndValidateDate(data_nascimento)
        : undefined,
      tipo_prioridade_id,
      foto,
    },
    include: { tipo_prioridade: true },
  });

  res.json(visitante);
};

// Soft delete (marca como inativo)
export const deleteVisitante = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.visitante.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });
  res.status(204).send();
};

// Calcula prioridade sem criar visitante
export const calcularPrioridadeVisitante = async (
  req: Request,
  res: Response
) => {
  const { data_nascimento, possui_deficiencia } = req.body;

  // Calcular idade
  const dataNasc = new Date(data_nascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNasc = dataNasc.getMonth();

  if (
    mesAtual < mesNasc ||
    (mesAtual === mesNasc && hoje.getDate() < dataNasc.getDate())
  ) {
    idade--;
  }

  const tipo_prioridade_id = calcularPrioridade({
    dataNascimento: data_nascimento,
    possuiDeficiencia: possui_deficiencia,
  });

  const tipo_prioridade = await prisma.tipoPrioridade.findUnique({
    where: { id: tipo_prioridade_id },
  });

  if (!tipo_prioridade) {
    return res.status(404).json({
      error: "Tipo de prioridade não encontrado",
      tipo_prioridade_id,
    });
  }

  res.json({
    tipo_prioridade_id,
    tipo_prioridade,
    idade,
    eh_prioritario: idade >= 60 || possui_deficiencia,
  });
};
