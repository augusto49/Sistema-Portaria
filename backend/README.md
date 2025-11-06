# Backend - Sistema de Agendamento

Backend Node.js + Express + Prisma + PostgreSQL para sistema de agendamento de visitantes.

## 🚀 Tecnologias

- Node.js 18+
- Express 4
- Prisma ORM 5
- PostgreSQL 15
- TypeScript 5

## 📦 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. **PostgreSQL com Docker**

```bash
# Na raiz do projeto
docker-compose up -d
```

2. **Variáveis de Ambiente**

Configure `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portaria"
PORT=3001
NODE_ENV=development
```

3. **Executar Migrations**

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 🏃 Execução

**Desenvolvimento:**

```bash
npm run dev
```

**Produção:**

```bash
npm run build
npm start
```

**Prisma Studio (GUI para banco):**

```bash
npm run prisma:studio
```

## 📡 Endpoints da API

### Visitantes

- `GET /api/visitantes` - Listar todos
- `GET /api/visitantes/cpf/:cpf` - Buscar por CPF
- `POST /api/visitantes` - Criar visitante
- `PUT /api/visitantes/:id` - Atualizar visitante
- `DELETE /api/visitantes/:id` - Excluir visitante
- `POST /api/visitantes/calcular-prioridade` - Calcular prioridade

### Salas

- `GET /api/salas` - Listar todas
- `GET /api/salas/:id` - Buscar por ID
- `POST /api/salas` - Criar sala
- `PUT /api/salas/:id` - Atualizar sala
- `DELETE /api/salas/:id` - Excluir sala
- `GET /api/salas/:salaId/responsaveis` - Listar responsáveis
- `POST /api/salas/responsaveis` - Criar responsável

### Agendamentos

- `GET /api/agendamentos` - Listar todos
- `GET /api/agendamentos/visitante/:visitanteId` - Por visitante
- `GET /api/agendamentos/sala/:salaId` - Por sala
- `GET /api/agendamentos/data?dataInicio=&dataFim=` - Por período
- `GET /api/agendamentos/pendentes` - Listar pendentes
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `PUT /api/agendamentos/:id/cancelar` - Cancelar agendamento
- `POST /api/agendamentos/validar` - Validar agendamento
- `POST /api/agendamentos/horarios-disponiveis` - Buscar horários

### Acessos

- `GET /api/acessos` - Listar todos
- `GET /api/acessos/visitante/:visitanteId` - Por visitante
- `GET /api/acessos/sala/:salaId` - Por sala
- `GET /api/acessos/periodo?dataInicio=&dataFim=` - Por período
- `GET /api/acessos/ativos` - Acessos ativos
- `GET /api/acessos/agendamento/:agendamentoId` - Por agendamento
- `POST /api/acessos` - Registrar entrada
- `PUT /api/acessos/:id/saida` - Registrar saída

### Feriados

- `GET /api/feriados` - Listar todos
- `GET /api/feriados/periodo?inicio=&fim=` - Por período
- `POST /api/feriados` - Criar feriado
- `PUT /api/feriados/:id` - Atualizar feriado
- `DELETE /api/feriados/:id` - Excluir feriado

## 🗄️ Estrutura do Banco

### Tabelas

- `tipo_prioridade` - Tipos de prioridade (Normal, Idoso, PCD, etc.)
- `visitante` - Dados dos visitantes
- `sala` - Salas disponíveis para agendamento
- `sala_responsavel` - Histórico de responsáveis por sala
- `feriado` - Feriados cadastrados
- `agendamento` - Agendamentos realizados
- `acesso` - Registro de entrada/saída

### Relacionamentos

- Visitante → TipoPrioridade (N:1)
- Sala → SalaResponsavel (1:N)
- Agendamento → Visitante (N:1)
- Agendamento → Sala (N:1)
- Acesso → Visitante (N:1)
- Acesso → Sala (N:1)
- Acesso → Agendamento (N:1)

## 🔧 Scripts Úteis

```bash
# Resetar banco de dados
npx prisma migrate reset

# Ver SQL das migrations
npx prisma migrate diff

# Formatar schema
npx prisma format

# Validar schema
npx prisma validate
```

## 📝 Notas

- Soft delete: Registros marcados como `ativo: false` ao invés de excluídos
- JSONB: Campo `disponibilidade` em `sala` armazena horários por dia da semana
- Timestamps: Todos os registros possuem `criado_em`
- Validações: Implementadas em services e controllers
