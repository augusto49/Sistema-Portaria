# Sistema de Gestão de Visitantes e Salas

> Sistema completo para gestão de visitantes, salas, agendamentos e controle de acesso em edificações corporativas

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📝 Sobre o Projeto

Sistema desenvolvido para automatizar e facilitar a gestão de visitantes e agendamentos de salas em edificações. Oferece controle completo de entrada e saída, cálculo automático de prioridades, e interface intuitiva para recepcionistas e administradores.

## ✨ Funcionalidades

- 👥 **Gestão de Visitantes**: Cadastro completo com cálculo automático de prioridade (idoso, PCD, etc.)
- 📅 **Sistema de Agendamentos**: Validação de horários disponíveis e conflitos
- 🏢 **Gerenciamento de Salas**: Controle de capacidade, disponibilidade e responsáveis
- 🚪 **Controle de Acesso**: Registro de entrada e saída com histórico completo
- 📊 **Dashboard**: Métricas e visualização de acessos ativos em tempo real
- 🎉 **Cadastro de Feriados**: Bloqueio automático de agendamentos em feriados

## 🏗️ Arquitetura

- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TanStack Query + Tailwind CSS

## 🚀 Como Executar o Projeto

### 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **PostgreSQL** (versão 15 ou superior) - [Download](https://www.postgresql.org/download/)
- **npm** ou **yarn** (vem com o Node.js)
- **Docker** (opcional, para rodar PostgreSQL em container)

### 🗄️ 1. Configurar Banco de Dados

#### PostgreSQL Local 💻

Se você já tem PostgreSQL instalado localmente:

1. Crie um novo database:

```sql
CREATE DATABASE portaria;
```

2. Ajuste a `DATABASE_URL` no arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/portaria"
```

### ⚙️ 2. Configurar e Iniciar Backend

```bash
# 1. Navegue para a pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env

# 4. Execute as migrations do Prisma
# Isso cria todas as tabelas no banco de dados
npx prisma migrate dev

# 5. Popule o banco com dados iniciais (seed)
# Isso cria tipos de prioridade e uma sala de exemplo
npx prisma db seed

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

✅ **Backend rodando em:** `http://localhost:3001`  
✅ **API disponível em:** `http://localhost:3001/api`

#### 🔍 Comandos úteis do Backend

```bash
# Ver o banco de dados no Prisma Studio
npx prisma studio

# Recriar o banco do zero
npx prisma migrate reset

# Apenas gerar o Prisma Client
npx prisma generate

# Build para produção
npm run build

# Rodar em produção
npm start
```

### 🎨 3. Configurar e Iniciar Frontend

Abra um **novo terminal** (deixe o backend rodando) e execute:

```bash
# 1. Volte para a raiz do projeto (se estiver em backend/)
cd ..

# 2. Instale as dependências do frontend
npm install

# 3. Configure a variável de ambiente (se não existir)
echo "VITE_API_URL=http://localhost:3001/api" > .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

✅ **Frontend rodando em:** `http://localhost:8080`  
✅ Acesse no navegador e comece a usar o sistema!

#### 🔍 Comandos úteis do Frontend

```bash
# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Verificar erros de linting
npm run lint
```

## 📚 Documentação da API

A API REST está disponível em `http://localhost:3001/api`

### Principais Endpoints

#### Visitantes

- `GET /api/visitantes` - Listar visitantes
- `POST /api/visitantes` - Criar visitante
- `PUT /api/visitantes/:id` - Atualizar visitante
- `DELETE /api/visitantes/:id` - Deletar visitante
- `GET /api/visitantes/cpf/:cpf` - Buscar por CPF
- `POST /api/visitantes/prioridade` - Calcular prioridade

#### Salas

- `GET /api/salas` - Listar salas
- `POST /api/salas` - Criar sala
- `PUT /api/salas/:id` - Atualizar sala
- `DELETE /api/salas/:id` - Deletar sala
- `GET /api/salas/:id/responsaveis` - Listar responsáveis

#### Agendamentos

- `GET /api/agendamentos` - Listar agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `PUT /api/agendamentos/:id/cancelar` - Cancelar agendamento
- `POST /api/agendamentos/validar` - Validar agendamento
- `POST /api/agendamentos/horarios-disponiveis` - Buscar horários

#### Acessos

- `GET /api/acessos` - Listar acessos
- `POST /api/acessos` - Registrar entrada
- `PUT /api/acessos/:id/saida` - Registrar saída
- `GET /api/acessos/ativos` - Listar acessos ativos

#### Feriados

- `GET /api/feriados` - Listar feriados
- `POST /api/feriados` - Criar feriado
- `PUT /api/feriados/:id` - Atualizar feriado
- `DELETE /api/feriados/:id` - Deletar feriado

## 🧪 Scripts Disponíveis

### Backend

```bash
npm run dev      # Inicia em modo desenvolvimento com hot-reload
npm run build    # Compila TypeScript
npm start        # Inicia em modo produção
```

### Frontend

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
```

## 🌱 Dados Iniciais (Seed)

Ao executar `npx prisma db seed`, o sistema cria automaticamente:

### Tipos de Prioridade

1. **Normal** - Prioridade nível 1
2. **Idoso (60+)** - Prioridade nível 2
3. **Idoso (80+)** - Prioridade nível 3
4. **Pessoa com Deficiência** - Prioridade nível 4
5. **Idoso PCD (60+)** - Prioridade nível 5
6. **Idoso PCD (80+)** - Prioridade nível 6

### Sala de Exemplo

- **Sala 1** - Capacidade: 10 pessoas, disponível de segunda a sexta (08:00-12:00 e 13:00-17:00)

## 🔧 Tecnologias Utilizadas

### Backend

- **Node.js 18+** - Runtime JavaScript do lado servidor
- **Express.js** - Framework web minimalista e flexível
- **Prisma ORM** - ORM moderno para PostgreSQL com type-safety
- **PostgreSQL 15+** - Banco de dados relacional robusto
- **TypeScript** - JavaScript com tipagem estática
- **Zod** - Validação de schemas e tipos em runtime
- **Date-fns** - Biblioteca moderna para manipulação de datas
- **Cors** - Middleware para habilitar CORS
- **Nodemon** - Auto-reload em desenvolvimento

### Frontend

- **React 18** - Biblioteca para construção de interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool extremamente rápida e moderna
- **TanStack Query (React Query)** - Gerenciamento de estado assíncrono e cache
- **Axios** - Cliente HTTP para requisições à API
- **React Router DOM** - Roteamento para Single Page Applications
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes acessíveis e altamente customizáveis
- **Radix UI** - Primitivos de UI acessíveis e não-estilizados
- **Lucide React** - Ícones SVG modernos e limpos
- **React Hook Form** - Gerenciamento de formulários performático
- **Sonner** - Notificações toast elegantes e animadas

## 📝 Variáveis de Ambiente

### Backend (`backend/.env`)

```
DATABASE_URL="postgresql://user:password@localhost:5432/visitantes"
PORT=3001
```

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:3001/api
```

## 🔧 Troubleshooting (Problemas Comuns)

### ❌ Erro: "Port 3001 already in use"

**Solução:** Outra aplicação está usando a porta 3001.

```bash
# Linux/Mac - Encontrar e matar o processo
lsof -ti:3001 | xargs kill -9

# Windows - Encontrar e matar o processo
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### ❌ Erro: "Cannot connect to database"

**Possíveis causas:**

1. PostgreSQL não está rodando
2. Credenciais erradas no `.env`
3. Database não foi criado

**Solução:**

```bash
# Verifique se o PostgreSQL está rodando
# Se usando Docker:
docker ps

# Se usando PostgreSQL local:
# Linux: systemctl status postgresql
# Mac: brew services list
# Windows: Verifique no Services
```

### ❌ Erro: "Prisma Client not generated"

**Solução:**

```bash
cd backend
npx prisma generate
```

### ❌ Frontend não conecta com Backend

**Solução:** Verifique se:

1. Backend está rodando na porta 3001
2. Arquivo `.env` na raiz tem `VITE_API_URL=http://localhost:3001/api`
3. Reinicie o servidor frontend após alterar `.env`

### ❌ Erro: "npm install" falha

**Solução:**

```bash
# Limpe o cache e tente novamente
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🗃️ Estrutura do Banco de Dados

### Tabelas Principais

#### `tipo_prioridade`

Define os tipos de prioridade dos visitantes

- `id` - Identificador único
- `descricao` - Descrição do tipo (ex: "Idoso 60+")
- `nivel_prioridade` - Nível numérico (1-6, quanto maior, mais prioritário)
- `ativo` - Status ativo/inativo
- `criado_em` - Data de criação

#### `visitante`

Cadastro completo de visitantes

- `id` - Identificador único
- `nome` - Nome completo
- `cpf` - CPF (único)
- `rg` - RG
- `data_nascimento` - Data de nascimento
- `tipo_prioridade_id` - Referência ao tipo de prioridade
- `foto_url` - URL da foto (opcional)
- `ativo` - Status ativo/inativo
- `criado_em` - Data de criação

#### `sala`

Cadastro de salas disponíveis para agendamento

- `id` - Identificador único
- `nome` - Nome da sala
- `disponibilidade` - Horários disponíveis por dia da semana (JSONB)
- `capacidade` - Capacidade máxima de pessoas
- `variacao_capacidade` - Variação permitida na capacidade
- `ativa` - Status ativo/inativo
- `criado_em` - Data de criação

#### `sala_responsavel`

Histórico de responsáveis das salas

- `id` - Identificador único
- `sala_id` - Referência à sala
- `responsavel` - Nome do responsável
- `data_inicio` - Data de início da responsabilidade
- `data_fim` - Data de fim da responsabilidade (opcional)
- `ativo` - Status ativo/inativo
- `criado_em` - Data de criação

#### `agendamento`

Agendamentos realizados

- `id` - Identificador único
- `visitante_id` - Referência ao visitante
- `sala_id` - Referência à sala
- `data_agendamento` - Data do agendamento
- `hora_inicio` - Hora de início
- `hora_fim` - Hora de término
- `status` - Status (agendado, cancelado, concluído)
- `ativo` - Status ativo/inativo
- `criado_em` - Data de criação

#### `acesso`

Controle de entrada e saída

- `id` - Identificador único
- `visitante_id` - Referência ao visitante
- `sala_id` - Referência à sala
- `agendamento_id` - Referência ao agendamento (opcional)
- `data_hora_entrada` - Data e hora da entrada
- `data_hora_saida` - Data e hora da saída (opcional)
- `ativo` - Status ativo/inativo
- `criado_em` - Data de criação

#### `feriado`

Cadastro de feriados

- `id` - Identificador único
- `data` - Data do feriado
- `descricao` - Descrição do feriado
- `tipo` - Tipo (nacional, estadual, municipal)
- `ativo` - Status ativo/inativo
- `criado_em` - Data de criação

### Relacionamentos

- `Visitante` → `TipoPrioridade` (N:1)
- `Agendamento` → `Visitante` (N:1)
- `Agendamento` → `Sala` (N:1)
- `Acesso` → `Visitante` (N:1)
- `Acesso` → `Sala` (N:1)
- `Acesso` → `Agendamento` (N:1, opcional)
- `SalaResponsavel` → `Sala` (N:1)

## 📁 Estrutura do Projeto

```
├── backend
│   ├── prisma
│   │   ├── migrations
│   │   │   ├── 20251105230807_
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── controllers
│   │   │   ├── acesso.controller.ts
│   │   │   ├── agendamento.controller.ts
│   │   │   ├── feriado.controller.ts
│   │   │   ├── sala.controller.ts
│   │   │   └── visitante.controller.ts
│   │   ├── middleware
│   │   │   └── errorHandler.ts
│   │   ├── routes
│   │   │   ├── acesso.routes.ts
│   │   │   ├── agendamento.routes.ts
│   │   │   ├── feriado.routes.ts
│   │   │   ├── index.ts
│   │   │   ├── sala.routes.ts
│   │   │   └── visitante.routes.ts
│   │   ├── services
│   │   │   ├── horarios.service.ts
│   │   │   ├── prioridade.service.ts
│   │   │   └── validacao.service.ts
│   │   ├── types
│   │   │   └── database.types.ts
│   │   ├── utils
│   │   │   ├── dateUtils.ts
│   │   │   └── prisma.ts
│   │   └── server.ts
│   ├── README.md
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── frontend
│   ├── public
│   │   ├── placeholder.svg
│   │   ├── robots.txt
│   │   └── vite.svg
│   ├── src
│   │   ├── components
│   │   │   ├── agendamentos
│   │   │   │   ├── AgendamentoForm.tsx
│   │   │   │   ├── AgendamentosList.tsx
│   │   │   │   ├── HorariosDisponiveis.tsx
│   │   │   │   ├── SalaSelect.tsx
│   │   │   │   └── VisitanteAutocomplete.tsx
│   │   │   ├── common
│   │   │   │   ├── PriorityBadge.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── feriados
│   │   │   │   ├── FeriadoForm.tsx
│   │   │   │   └── FeriadosList.tsx
│   │   │   ├── historico
│   │   │   │   ├── AcessosAtivosComRegistro.tsx
│   │   │   │   ├── HistoricoCompleto.tsx
│   │   │   │   ├── RegistroAcessoForm.tsx
│   │   │   │   └── RegistroSaidaForm.tsx
│   │   │   ├── layout
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── salas
│   │   │   │   ├── HistoricoSala.tsx
│   │   │   │   ├── HorariosPorDia.tsx
│   │   │   │   ├── ResponsavelHistorico.tsx
│   │   │   │   ├── SalaForm.tsx
│   │   │   │   └── SalasList.tsx
│   │   │   ├── ui
│   │   │   └── visitantes
│   │   │       ├── HistoricoVisitante.tsx
│   │   │       ├── VisitanteForm.tsx
│   │   │       └── VisitantesList.tsx
│   │   ├── hooks
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   ├── useAcessos.ts
│   │   │   ├── useAgendamentos.ts
│   │   │   ├── useFeriados.ts
│   │   │   ├── useSalas.ts
│   │   │   └── useVisitantes.ts
│   │   ├── lib
│   │   │   ├── api.ts
│   │   │   ├── constants.ts
│   │   │   ├── date.ts
│   │   │   └── utils.ts
│   │   ├── pages
│   │   │   ├── Agendamentos.tsx
│   │   │   ├── Feriados.tsx
│   │   │   ├── Historico.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── Salas.tsx
│   │   │   └── Visitantes.tsx
│   │   ├── types
│   │   │   └── database.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .gitignore
│   ├── README.md
│   ├── bun.lockb
│   ├── components.json
│   ├── docker-compose.yml
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## 📄 Licença

Este projeto está sob a licença MIT.
