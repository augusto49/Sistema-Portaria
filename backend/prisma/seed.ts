import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed tipo_prioridade
  const prioridades = [
    { descricao: 'Normal', nivelPrioridade: 1 },
    { descricao: 'Idoso (60+)', nivelPrioridade: 2 },
    { descricao: 'Idoso (80+)', nivelPrioridade: 3 },
    { descricao: 'Pessoa com Deficiência', nivelPrioridade: 4 },
    { descricao: 'Idoso PCD (60+)', nivelPrioridade: 5 },
    { descricao: 'Idoso PCD (80+)', nivelPrioridade: 6 },
  ];

  for (const prioridade of prioridades) {
    await prisma.tipoPrioridade.upsert({
      where: { id: prioridades.indexOf(prioridade) + 1 },
      update: {},
      create: {
        descricao: prioridade.descricao,
        nivel_prioridade: prioridade.nivelPrioridade,
      },
    });
  }

  console.log('✅ Seed de tipo_prioridade concluído');

  // Seed sala de exemplo
  await prisma.sala.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'Sala 1',
      capacidade: 10,
      variacao_capacidade: 2,
      disponibilidade: {
        "1": [{ "inicio": "08:00", "fim": "12:00" }, { "inicio": "13:00", "fim": "17:00" }], // Segunda
        "2": [{ "inicio": "08:00", "fim": "12:00" }, { "inicio": "13:00", "fim": "17:00" }], // Terça
        "3": [{ "inicio": "08:00", "fim": "12:00" }, { "inicio": "13:00", "fim": "17:00" }], // Quarta
        "4": [{ "inicio": "08:00", "fim": "12:00" }, { "inicio": "13:00", "fim": "17:00" }], // Quinta
        "5": [{ "inicio": "08:00", "fim": "12:00" }, { "inicio": "13:00", "fim": "17:00" }], // Sexta
      },
    },
  });

  console.log('✅ Seed de salas concluído');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
