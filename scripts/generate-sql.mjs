import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

const MAPPING_PATH = join(import.meta.dirname, 'image-mapping.json');
const OUTPUT_PATH = join(import.meta.dirname, '..', 'seuShimaSushi-backend', 'src', 'main', 'resources', 'db', 'migration', 'V16__update_product_images_to_local_webp.sql');

const mapping = JSON.parse(readFileSync(MAPPING_PATH, 'utf-8'));

const lines = [
  '-- Atualiza as URLs das imagens dos produtos raspados para os assets locais .webp',
  'UPDATE scraped_products SET url_imagem = CASE',
];

for (const item of mapping) {
  const orig = item.original.replace(/'/g, "''");
  lines.push(`    WHEN url_imagem = '${orig}' THEN '${item.local}'`);
}

lines.push('    ELSE url_imagem');
lines.push('  END;');
lines.push('');
lines.push('-- Produtos que tinham URL nula permanecem nulos');
lines.push('');

writeFileSync(OUTPUT_PATH, lines.join('\n') + '\n');
console.log(`Migration gerada em: ${OUTPUT_PATH}`);
