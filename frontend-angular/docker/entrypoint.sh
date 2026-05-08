#!/usr/bin/env sh
set -eu

cat <<EOF >/usr/share/nginx/html/runtime-config.js
window.__SEU_SHIMA_SUSHI_CONFIG__ = {
  apiBaseUrl: "${FRONTEND_API_BASE_URL:-/api/v1}",
  useMockPublicData: ${FRONTEND_USE_MOCK_PUBLIC_DATA:-false}
};
EOF

exec "$@"
