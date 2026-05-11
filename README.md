# Seu Shima Sushi

Frontend oficial do Seu Shima Sushi em Angular (standalone).

Este repositorio e novo e ja esta organizado com foco no frontend Angular. A migracao de React + Vite foi parte do processo inicial, mas a base de evolucao agora e Angular.

## Estrutura do projeto

- `frontend-angular/`: aplicacao frontend principal (Angular)
- `seuShimaSushi-backend/`: API backend (Spring Boot)
- `docker-compose.yml`: sobe frontend + backend + banco

## Como rodar

### Frontend Angular (local)

```bash
npm run install:angular
npm run dev:angular
```

### Build do frontend

```bash
npm run build:angular
```

### Stack completa com Docker

```bash
docker compose up --build
```

Frontend: `http://localhost:8088`  
Backend: `http://localhost:8080`

## Configuracao de ambiente

Use o arquivo `.env.example` como base para variaveis locais.

Variaveis principais:
- `FRONTEND_API_BASE_URL`
- `FRONTEND_USE_MOCK_PUBLIC_DATA`
- `CORS_ALLOWED_ORIGINS`
- `JWT_SECRET`

## Status da migracao

- Frontend Angular implementado com fluxos publicos, autenticacao, pedidos e area admin.
- React + Vite tratado como legado de transicao e fora da trilha principal de evolucao.
