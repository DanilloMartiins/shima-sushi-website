# Frontend Angular - Seu Shima Sushi

Aplicacao Angular standalone do Seu Shima Sushi, integrada com backend REST em `/api/v1`.

## Rodar local

```bash
npm install
npm start
```

Build:

```bash
npm run build
```

## Configuracao de API em runtime

A URL da API e as flags de fallback sao lidas de `window.__SEU_SHIMA_SUSHI_CONFIG__`.

Arquivos relevantes:
- `public/runtime-config.js`
- `src/app/core/constants/api.constants.ts`

Exemplo:

```js
window.__SEU_SHIMA_SUSHI_CONFIG__ = {
  apiBaseUrl: '/api/v1',
  useMockPublicData: false,
};
```

Quando `useMockPublicData` estiver em `true`, o frontend usa fallback local para dados publicos (cardapio e status da loja).

## Endpoints esperados do backend

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Publico
- `GET /public/menu`
- `GET /public/store-settings`

### Cliente autenticado
- `POST /orders`
- `GET /orders/me`

### Admin
- `GET /admin/products`
- `POST /admin/products`
- `PUT /admin/products/{id}`
- `DELETE /admin/products/{id}`
- `POST /admin/products/image` (multipart)
- `GET /admin/store-settings`
- `PUT /admin/store-settings`
- `GET /admin/orders`
- `PATCH /admin/orders/{id}/status`

## Funcionalidades implementadas

- Home publica com cardapio e status da loja.
- Carrinho persistente em `localStorage`.
- Login e cadastro de usuario.
- Guard de autenticacao e guard de admin.
- Interceptor para `Authorization: Bearer`.
- Interceptor de refresh token em `401`.
- Checkout com criacao de pedido no backend.
- Link opcional para WhatsApp apos confirmar pedido.
- Historico de pedidos do cliente.
- Painel admin para produtos, pedidos e configuracoes da loja.
