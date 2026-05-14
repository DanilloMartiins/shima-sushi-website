#!/usr/bin/env sh
set -eu

# Injeta as variáveis de ambiente no config do frontend
cat <<EOF >/usr/share/nginx/html/runtime-config.js
window.__SEU_SHIMA_SUSHI_CONFIG__ = {
  apiBaseUrl: "${FRONTEND_API_BASE_URL:-/api/v1}",
  useMockPublicData: ${FRONTEND_USE_MOCK_PUBLIC_DATA:-false}
};
EOF

# Injeta a URL do backend no arquivo de configuração do Nginx
# Usamos uma pasta temporária para não dar erro de leitura/escrita no mesmo arquivo
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

exec "$@"
