# ⚙️ Sistema de Portaria - Backend

> **Núcleo da aplicação de gestão de visitantes.**  
> API RESTful robusta, segura e documentada.

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

[**Documentação API**](http://localhost:3001/docs) • [**Prisma Studio**](http://localhost:5555)

</div>

---

## ⚡ Quick Start

### 1. Configuração

```bash
# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
# Edite .env com sua DATABASE_URL
```

### 2. Banco de Dados

```bash
# Cria as tabelas
npx prisma migrate dev

# Popula dados iniciais (Prioridades, Salas)
npx prisma db seed
```

### 3. Execução

```bash
# Modo desenvolvimento (Watch mode)
npm run dev

# Modo produção
npm run build
npm start
```

---

## 📖 Documentação (Scalar)

Acesse **`/docs`** para documentação interativa.

| Recurso           | Descrição                            |
| :---------------- | :----------------------------------- |
| **`/docs`**       | Swagger/OpenAPI Iterativo (Scalar)   |
| **`/api`**        | Base URL da API                      |
| **Prisma Studio** | `npx prisma studio` para ver o banco |

---

## 🛠️ Scripts Disponíveis

| Comando                    | Descrição                                   |
| :------------------------- | :------------------------------------------ |
| `npm run dev`              | Inicia servidor de desenvolvimento          |
| `npm run build`            | Compila TypeScript para JS em `/dist`       |
| `npm start`                | Roda o código compilado                     |
| `npx prisma studio`        | Interface visual para o Banco de Dados      |
| `npx prisma migrate reset` | **CUIDADO**: Apaga e recria o banco do zero |

---

## 📂 Estrutura Chave

```
src/
├── controllers/ # Lógica de entrada (Req/Res)
├── services/    # Regras de Negócio (Validações, Cálculos)
├── routes/      # Definição de Endpoints
├── prisma/      # Schema do Banco e Seeds
└── server.ts    # Entry Point
```
