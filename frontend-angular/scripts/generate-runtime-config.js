const fs = require('fs');
const path = require('path');

const arquivo = path.join(__dirname, '..', 'public', 'runtime-config.js');

const apiBaseUrl = process.env.API_BASE_URL;
const useMockPublicData = process.env.USE_MOCK_PUBLIC_DATA;
const usarMock = useMockPublicData === 'true';

const config = {
  apiBaseUrl: apiBaseUrl || 'http://localhost:8080/api/v1',
  useMockPublicData: apiBaseUrl ? usarMock : true,
};

const conteudo = `window.__SEU_SHIMA_SUSHI_CONFIG__ = ${JSON.stringify(config, null, 2)};
`;

fs.writeFileSync(arquivo, conteudo, 'utf-8');
console.log(`[generate-runtime-config] ${arquivo} gerado com:
  apiBaseUrl: ${config.apiBaseUrl}
  useMockPublicData: ${config.useMockPublicData}`);
