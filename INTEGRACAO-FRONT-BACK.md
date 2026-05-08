# Integracao Front + Back (Angular + Spring Boot)

## 1) Como a API foi integrada no frontend

No Angular, a base da API fica em:

- `frontend-angular/src/app/core/constants/api.constants.ts`

Configuracao atual:

- `API_BASE_URL` padrao: `/api/v1`
- `USE_MOCK_PUBLIC_DATA` padrao: `false`

Isso faz o frontend chamar backend real por padrao.

## 2) Runtime config do frontend

Arquivo:

- `frontend-angular/public/runtime-config.js`

Esse arquivo injeta configuracao no browser sem precisar rebuild para mudar a URL da API.

No `index.html`, o script ja foi incluido:

- `frontend-angular/src/index.html`

## 3) Proxy no Angular (dev)

Arquivo:

- `frontend-angular/proxy.conf.json`

Mapeamentos:

- `/api` -> `http://localhost:8080`
- `/images` -> `http://localhost:8080`

Ja configurado no `angular.json` para o `ng serve`.

## 4) CORS no backend (Spring)

O backend ja esta com CORS via `SecurityConfig`:

- `houseburgergrill-backend/src/main/java/br/com/seushimasushi/backend/security/config/SecurityConfig.java`

A lista de origens vem de propriedade:

- `houseburgergrill-backend/src/main/resources/application.yml`
- `app.cors.allowed-origins`

Valor default atualizado para ambiente local:

- `http://localhost:4200,http://localhost:4300,http://localhost:5173`

## 5) Rodar frontend e backend juntos (sem Docker)

Scripts na raiz:

- `npm run dev:angular` -> sobe Angular
- `npm run dev:backend` -> sobe Spring Boot
- `npm run dev:full` -> sobe os dois juntos com `concurrently`

Pre-requisito:

1. Java 21
2. Node/NPM
3. Banco Postgres local (ou Docker do Postgres)

## 6) Rodar tudo com Docker

Arquivo:

- `docker-compose.yml` (na raiz)

Servicos:

1. `postgres`
2. `backend` (Spring Boot)
3. `frontend` (Angular em Nginx)

Comandos:

```bash
docker compose up --build
```

URLs:

1. Frontend: `http://localhost:8088`
2. Backend: `http://localhost:8080`

## 7) Variaveis de ambiente

Arquivo exemplo:

- `.env.example`

Copie para `.env` na raiz e ajuste os valores para seu ambiente.

## 8) Estrutura principal de integracao

1. `frontend-angular/src/app/core/constants/api.constants.ts`
2. `frontend-angular/public/runtime-config.js`
3. `frontend-angular/proxy.conf.json`
4. `frontend-angular/Dockerfile`
5. `frontend-angular/nginx/default.conf`
6. `frontend-angular/docker/entrypoint.sh`
7. `houseburgergrill-backend/src/main/resources/application.yml`
8. `package.json` (raiz)
9. `docker-compose.yml` (raiz)
