# 🎨 Sistema de Portaria - Frontend

> **Interface moderna e responsiva para gestão de portaria.**  
> Construído com React, Vite e Shadcn/ui para máxima performance e estética.

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-Latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

[**Acessar Aplicação**](http://localhost:8080)

</div>

---

## ⚡ Quick Start

### 1. Instalação

```bash
# Instale as dependências
npm install
```

### 2. Configuração

```bash
# Crie o arquivo .env
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

### 3. Execução

```bash
# Inicia servidor de desenvolvimento
npm run dev
```

---

## 🛠️ Scripts Disponíveis

| Comando           | Descrição                             |
| :---------------- | :------------------------------------ |
| `npm run dev`     | Servidor local (porta 8080)           |
| `npm run build`   | Gera build de produção em `/dist`     |
| `npm run preview` | Testa o build de produção localmente  |
| `npm run lint`    | Verifica qualidade do código (ESLint) |

---

## 📂 Estrutura de Componentes

Utilizamos uma estrutura organizada por **funcionalidade** e **componentes visuais**:

```
src/
├── components/
│   ├── ui/           # Componentes Visuais (Shadcn - Botões, Inputs)
│   ├── visitantes/   # Lógica específica de Visitantes
│   ├── agendamentos/ # Lógica específica de Agendamentos
│   └── ...
├── hooks/            # Custom Hooks (React Query, Lógica Reutilizável)
├── pages/            # Rotas/Telas da aplicação
└── lib/              # Utilitários e Configurações (Axios)
```

## 🎨 UI & Design System

- **Tailwind CSS**: Estilização via classes utilitárias.
- **Shadcn/ui**: Componentes acessíveis e customizáveis copiados para o projeto.
- **Lucide React**: Ícones consistentes e leves.
- **Sonner**: Sistema de notificações (Toasts).
