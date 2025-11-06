-- CreateTable
CREATE TABLE "tipo_prioridade" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "nivel_prioridade" SMALLINT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_prioridade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitante" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "rg" VARCHAR(20),
    "data_nascimento" DATE NOT NULL,
    "tipo_prioridade_id" INTEGER NOT NULL,
    "foto" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sala" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "disponibilidade" JSONB NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "variacao_capacidade" SMALLINT NOT NULL DEFAULT 2,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sala_responsavel" (
    "id" SERIAL NOT NULL,
    "sala_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "valido_de" DATE NOT NULL,
    "valido_ate" DATE,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sala_responsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feriado" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" SMALLINT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feriado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamento" (
    "id" SERIAL NOT NULL,
    "visitante_id" INTEGER NOT NULL,
    "sala_id" INTEGER NOT NULL,
    "data_agendada" TIMESTAMP(6) NOT NULL,
    "hora_fim" TIMESTAMP(6) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acesso" (
    "id" SERIAL NOT NULL,
    "visitante_id" INTEGER NOT NULL,
    "sala_id" INTEGER NOT NULL,
    "agendamento_id" INTEGER,
    "entrada_em" TIMESTAMP(6) NOT NULL,
    "saida_em" TIMESTAMP(6),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitante_cpf_key" ON "visitante"("cpf");

-- AddForeignKey
ALTER TABLE "visitante" ADD CONSTRAINT "visitante_tipo_prioridade_id_fkey" FOREIGN KEY ("tipo_prioridade_id") REFERENCES "tipo_prioridade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sala_responsavel" ADD CONSTRAINT "sala_responsavel_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "visitante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesso" ADD CONSTRAINT "acesso_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "visitante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesso" ADD CONSTRAINT "acesso_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesso" ADD CONSTRAINT "acesso_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
