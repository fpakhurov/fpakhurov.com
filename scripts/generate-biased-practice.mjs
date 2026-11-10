import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { publishedNoteIds, readBiasedCatalog } from './lib/biased-practice-source.mjs';
import { validatePracticeCatalog } from '../src/utils/biasedPracticeLinks.mjs';

const args = process.argv.slice(2);
const repoIndex = args.indexOf('--biased-repo');
if (repoIndex < 0 || !args[repoIndex + 1] || args.some((arg, index) => index !== repoIndex + 1 && !['--biased-repo', '--check'].includes(arg))) {
  throw new Error('Usage: npm run practice:generate -- --biased-repo /path/to/biased-school [--check]');
}
const root = fileURLToPath(new URL('../', import.meta.url));
const file = path.join(root, 'src/data/biasedPractice.json');
const published = publishedNoteIds(root);
const catalog = readBiasedCatalog(path.resolve(args[repoIndex + 1]), published);
if (args.includes('--check')) {
  const saved = JSON.parse(readFileSync(file, 'utf8'));
  validatePracticeCatalog(saved, published);
  if (JSON.stringify(saved.notes) !== JSON.stringify(catalog.notes)) throw new Error('Public practice snapshot differs from the source catalogue; regenerate and review it');
} else writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
console.log(`${args.includes('--check') ? 'Verified' : 'Generated'} public BIASED practice mapping: ${JSON.stringify(validatePracticeCatalog(catalog, published))}`);
