type RuntimeConfig = {
  apiBaseUrl?: string;
  useMockPublicData?: boolean;
};

const runtimeConfig = (globalThis as typeof globalThis & { __SEU_SHIMA_SUSHI_CONFIG__?: RuntimeConfig })
  .__SEU_SHIMA_SUSHI_CONFIG__;

/*
 * fallback inteligente: se o runtime-config.js nao carregar,
 * detecta producao pelo dominio e usa a URL do Render
 */
function detectApiBaseUrl(): string {
  if (runtimeConfig?.apiBaseUrl) return runtimeConfig.apiBaseUrl;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal) return 'https://seu-shima-backend.onrender.com/api/v1';
  }

  return '/api/v1';
}

export const API_BASE_URL = detectApiBaseUrl();
export const API_BASE_RAW = runtimeConfig?.apiBaseUrl
  ? runtimeConfig.apiBaseUrl.replace(/\/api\/v1$/, '')
  : API_BASE_URL.replace(/\/api\/v1$/, '');
export const USE_MOCK_PUBLIC_DATA = runtimeConfig?.useMockPublicData ?? false;
export const AUTH_STORAGE_KEY = 'seu-shima-sushi-angular-auth-v1';
export const CART_STORAGE_KEY = 'seu-shima-sushi-angular-cart-v1';
