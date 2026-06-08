const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let version = '0.0.0';

try {
  version = execSync('git describe --tags --abbrev=0', {
    encoding: 'utf-8',
    cwd: path.resolve(__dirname, '..'),
  }).trim();
} catch {
  version = '0.0.0';
}

const content = `// Este arquivo e gerado automaticamente pelo script prebuild
export const APP_VERSION = '${version}';
`;

const outputPath = path.resolve(__dirname, '..', 'src', 'environments', 'version.ts');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content, 'utf-8');

console.log(`Versão atualizada: ${version}`);
