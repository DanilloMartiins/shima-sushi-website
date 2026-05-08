type RuntimeConfig = {
  apiBaseUrl?: string;
  useMockPublicData?: boolean;
};

const runtimeConfig = (globalThis as typeof globalThis & { __SEU_SHIMA_SUSHI_CONFIG__?: RuntimeConfig })
  .__SEU_SHIMA_SUSHI_CONFIG__;

export const API_BASE_URL = runtimeConfig?.apiBaseUrl ?? '/api/v1';
export const USE_MOCK_PUBLIC_DATA = runtimeConfig?.useMockPublicData ?? false;
export const AUTH_STORAGE_KEY = 'seu-shima-sushi-angular-auth-v1';
export const CART_STORAGE_KEY = 'seu-shima-sushi-angular-cart-v1';
