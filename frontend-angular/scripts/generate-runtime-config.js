const fs = require('fs');
const path = require('path');

const arquivo = path.join(__dirname, '..', 'public', 'runtime-config.js');

const apiBaseUrl = process.env.API_BASE_URL;
const useMockPublicData = process.env.USE_MOCK_PUBLIC_DATA;

const config = {};

if (apiBaseUrl) {
  config.apiBaseUrl = apiBaseUrl;
}
// Mock só ativa com env var explicita (USE_MOCK_PUBLIC_DATA=true)
config.useMockPublicData = useMockPublicData === 'true';

const conteudo = `window.__SEU_SHIMA_SUSHI_CONFIG__ = ${JSON.stringify(config, null, 2)};
`;

fs.writeFileSync(arquivo, conteudo, 'utf-8');
console.log(`[generate-runtime-config] ${arquivo} gerado com:
  apiBaseUrl: ${config.apiBaseUrl ?? '(delegado ao api.constants.ts)'}
  useMockPublicData: ${config.useMockPublicData}`);
