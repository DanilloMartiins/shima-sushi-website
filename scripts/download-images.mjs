import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join, extname } from 'path';
import sharp from 'sharp';

const V15_PATH = join(import.meta.dirname, '..', 'seuShimaSushi-backend', 'src', 'main', 'resources', 'db', 'migration', 'V15__restore_full_menu.sql');
const OUTPUT_DIR = join(import.meta.dirname, '..', 'frontend-angular', 'public', 'assets', 'images', 'yooga');
const MAPPING_PATH = join(import.meta.dirname, '..', 'scripts', 'image-mapping.json');

async function main() {
  const sql = readFileSync(V15_PATH, 'utf-8');

  const urlRegex = /'([^']+\.(?:jpeg|png|webp))'/g;
  const urls = [...new Set([...sql.matchAll(urlRegex)].map(m => m[1]))];

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const mapping = [];
  let sucesso = 0;
  let falha = 0;

  for (const url of urls) {
    const ext = extname(new URL(url).pathname).toLowerCase();
    const hash = createHash('md5').update(url).digest('hex').slice(0, 12);
    const webpFilename = `${hash}.webp`;
    const webpPath = join(OUTPUT_DIR, webpFilename);

    if (existsSync(webpPath)) {
      mapping.push({ original: url, local: `/assets/images/yooga/${webpFilename}` });
      sucesso++;
      continue;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://delivery.yooga.app/',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        console.log(`[FALHA] ${url} - HTTP ${response.status}`);
        falha++;
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      await sharp(buffer)
        .webp({ quality: 80 })
        .toFile(webpPath);

      mapping.push({ original: url, local: `/assets/images/yooga/${webpFilename}` });
      sucesso++;
      console.log(`[OK] ${hash}.webp (${url.slice(0, 60)}...)`);
    } catch (err) {
      console.log(`[ERRO] ${url} - ${err.message}`);
      falha++;
    }
  }

  writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  console.log(`\nConcluido! ${sucesso} baixadas, ${falha} falhas`);
  console.log(`Mapping salvo em: ${MAPPING_PATH}`);
}

main().catch(console.error);
