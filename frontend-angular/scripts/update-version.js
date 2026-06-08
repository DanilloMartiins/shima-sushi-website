const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputPath = path.resolve(__dirname, '..', 'src', 'environments', 'version.ts');

let version = null;

try {
  version = execSync('git describe --tags --abbrev=0', {
    encoding: 'utf-8',
    cwd: path.resolve(__dirname, '..'),
  }).trim();
} catch {
  // Se git falhar (clone sem tag), tenta manter a versão do arquivo existente
  try {
    const existing = fs.readFileSync(outputPath, 'utf-8');
    const match = existing.match(/APP_VERSION\s*=\s*'([^']+)'/);
    version = match ? match[1] : '0.0.0';
  } catch {
    version = '0.0.0';
  }
}

const content = `// Este arquivo e gerado automaticamente pelo script prebuild
export const APP_VERSION = '${version}';
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content, 'utf-8');

console.log(`Versão atualizada: ${version}`);
