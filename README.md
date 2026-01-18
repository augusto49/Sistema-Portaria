# 🏢 Sistema de Gestão de Portaria

> **Gestão inteligente de visitantes, salas e acessos para ambientes corporativos.**  
> Controle total, segurança e agilidade na sua recepção.

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[**Documentação API**](http://localhost:3001/docs) • [**Frontend**](http://localhost:8080) • [**Backend**](http://localhost:3001/api)

</div>

---

## ✨ Funcionalidades

| Módulo                    | Descrição                                                                     |
| :------------------------ | :---------------------------------------------------------------------------- |
| **👥 Visitantes**         | Cadastro completo, foto, e **cálculo automático de prioridade** (Idoso, PCD). |
| **📅 Agendamentos**       | Reserva de salas com validação de conflitos e feriados em tempo real.         |
| **🏢 Salas**              | Gestão de capacidade e histórico de responsáveis.                             |
| **🚪 Controle de Acesso** | Registro de entrada/saída (Check-in/Check-out) vinculado a agendamentos.      |
| **📊 Dashboard**          | Visualização rápida de visitantes ativos no prédio.                           |

---

## 🚀 Quick Start

Rodando o projeto completo em **3 passos**:

### 1. Banco de Dados

Certifique-se de ter o PostgreSQL rodando e crie o banco:

```sql
CREATE DATABASE portaria;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env # Configure DATABASE_URL no .env
npx prisma migrate dev
npx prisma db seed   # Popula dados iniciais (Salas, Prioridades)
npm run dev
```

> O backend rodará em `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

> O frontend rodará em `http://localhost:8080`

---

## 📖 Documentação da API (Interativa)

Acesse **`/docs`** para testar a API em tempo real.

[![Scalar Docs](https://img.shields.io/badge/API_Docs-Scalar-black?style=flat-square&logo=swagger)](http://localhost:3001/docs)

**Principais Rotas:**

- `GET /api/visitantes` - Listagem
- `POST /api/agendamentos/validar` - Validação inteligente
- `GET /api/acessos/ativos` - Quem está no prédio agora?

---

## 🛠️ Tecnologias

<details>
<summary><strong>Ver Stack Completa</strong></summary>

### Backend

- **Core**: Node.js, Express
- **Banco**: PostgreSQL, Prisma ORM
- **Validação**: Zod
- **Utils**: Date-fns

### Frontend

- **Framework**: React, Vite
- **Linguagem**: TypeScript
- **State**: TanStack Query
- **UI**: Tailwind CSS, Shadcn/ui, Lucide Icons
- **HTTP**: Axios
</details>

---

## 📁 Estrutura do Projeto

<details>
<summary><strong>Ver Árvore de Arquivos</strong></summary>

```
/
├── backend/
│   ├── src/
│   │   ├── controllers/  # Lógica de controle
│   │   ├── services/     # Regras de negócio complexas
│   │   ├── routes/       # Definição de rotas
│   │   └── prisma/       # Schemas e Seeds
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/       # Componentes Shadcn (botões, inputs)
│   │   │   ├── visitantes/ # Features específicas
│   │   │   └── ...
│   │   ├── hooks/        # Custom hooks (useVisitantes, etc)
│   │   ├── lib/          # Configurações (api.ts)
│   │   └── pages/        # Telas da aplicação
```

</details>

---

## 🔧 Troubleshooting

<details>
<summary><strong>Problemas Comuns</strong></summary>

### Porta em uso (3001)

```bash
# Windows
taskkill /PID <PID> /F
```

### Erro de Conexão (DB)

Verifique se a `DATABASE_URL` no `.env` do backend está correta:
`postgresql://usuario:senha@localhost:5432/portaria`

</details>

---

<div align="center">
Desenvolvido com ❤️
</div>
