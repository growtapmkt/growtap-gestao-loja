# Boutique Manager ERP - Backend

API REST para o sistema de gestão de loja.

## Tecnologias
- Node.js
- Express
- Prisma ORM
- PostgreSQL (Supabase)
- JWT

## Estrutura de Pastas
- `src/app.js`: Configuração do Express
- `src/server.js`: Ponto de entrada
- `src/routes/`: Definição de rotas da API
- `src/controllers/`: Lógica das rotas
- `src/middlewares/`: Middlewares de autenticação e erro
- `src/prisma/`: Schema do banco de dados

## Como Executar
1. Clone o repositório
2. `cd backend`
3. `npm install`
4. Renomeie `.env.example` para `.env` e configure suas variáveis
5. `npm run dev`

## API Endpoints
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/clients`
- `GET /api/users/me`
