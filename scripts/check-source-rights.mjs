import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASELINE_REVISIONS = {"fpakhurov": "07232f858bd91d7d6a45900d681f336a97ac5c6e", "biased": "a7db7aa9032e9d67c38ceb1d6812c885541f275e"};
const DEFAULT_LICENSES = new Set(['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Apache-2.0', 'CC-BY-4.0', 'CC0-1.0', 'Unlicense']);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const fail = (condition, message) => { if (!condition) throw new Error(message); };
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const sha = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safePath = (value) => nonempty(value) && !path.isAbsolute(value) && !value.split('/').some((part) => part === '..' || part === '.') && !value.includes('\\');
const readJson = (root, name) => JSON.parse(readFileSync(path.join(root, name), 'utf8'));
function filesBelow(root, name) {
  if (!existsSync(path.join(root, name))) return [];
  const walk = (relative) => readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    const child = `${relative}/${entry.name}`;
    fail(!entry.isSymbolicLink(), `Teaching material cannot be a symlink: ${child}`);
    return entry.isDirectory() ? walk(child) : [child];
  });
  return walk(name);
}
function verifyBaseline(root, config, baseline, expectedRevision) {
  fail(baseline.revision === expectedRevision, 'The legacy inventory anchor cannot move to approve newer content');
  const names = execFileSync('git', ['ls-tree', '-r', '--name-only', baseline.revision, '--', ...config.protectedDirectories, ...(config.protectedFiles ?? [])], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim().split('\n').filter(Boolean);
  const output = execFileSync('git', ['cat-file', '--batch'], { cwd: root, input: names.map((name) => `${baseline.revision}:${name}`).join('\n') + '\n', maxBuffer: 192 * 1024 * 1024 });
  let offset = 0;
  const statuses = {};
  fail(names.length === Object.keys(baseline.files).length, 'Baseline file set differs from the pinned Git revision');
  for (const name of names) {
    const end = output.indexOf(10, offset);
    const header = output.subarray(offset, end).toString('utf8');
    const match = header.match(/^[a-f0-9]+ blob (\d+)$/);
    fail(match, `Cannot read baseline blob ${name}`);
    const size = Number(match[1]);
    const bytes = output.subarray(end + 1, end + 1 + size);
    fail(hash(bytes) === baseline.files[name], `Baseline hash differs from pinned Git revision: ${name}`);
    if (name.endsWith('.mdx')) statuses[name] = bytes.toString('utf8').match(/^status: (.+)$/m)?.[1]?.trim();
    offset = end + 1 + size + 1;
  }
  return statuses;
}
function localDependencies(name, text, exists, project) {
  if (!/\.(mdx?|astro|[cm]?[jt]sx?|css|html)$/.test(name)) return [];
  const refs = [];
  for (const match of text.matchAll(/\b(?:import|export)\s+(?:[^;\n]{0,300}?\s+from\s+)?["'](\.[^"']+)["']/g)) refs.push({ value: match[1], public: false });
  for (const match of text.matchAll(/(?:\]\(|(?:href|src)=['"])(\/[^\s'"<>\)]+)/g)) {
    const value = match[1].split(/[?#]/)[0];
    if (/^\/(?:ru\/)?notes(?:\/|$)/.test(value)) continue;
    if (/^\/(?:data|assets|figures|images|notebooks)\//.test(value) || /\.[a-z0-9]{2,6}$/i.test(value)) refs.push({ value, public: true });
  }
  return [...new Set(refs.map((ref) => {
    const value = ref.value.split(/[?#]/)[0];
    const target = ref.public ? `${project === 'biased' ? 'apps/web/public' : 'public'}${value}` : path.posix.normalize(path.posix.join(path.posix.dirname(name), value));
    fail(safePath(target), `Invalid local asset reference in ${name}`);
    const candidates = [target, ...['.ts','.tsx','.js','.mjs','.json','.astro','.css','/index.ts','/index.js'].map((suffix) => target + suffix)];
    const resolved = candidates.find(exists);
    fail(resolved, `Cannot resolve reviewed local dependency ${value} in ${name}`);
    return resolved;
  }))];
}
function required(value, fields, context) {
  for (const field of fields) fail(nonempty(value[field]), `${context}: missing ${field}`);
}
function validateSource(source, context) {
  required(source, ['id', 'title', 'creator', 'use', 'material', 'verification'], context);
  fail(['reference', 'reuse', 'original'].includes(source.use), `${context}: invalid source use`);
  if (source.use === 'original') {
    required(source, ['authorship', 'method'], context);
    return;
  }
  required(source, ['url', 'revision', 'locator'], context);
  fail(/^https:\/\//.test(source.url), `${context}: use a stable HTTPS source URL`);
  if (source.use === 'reference') {
    fail(source.material !== 'all', `${context}: describe the checked claim, not blanket reference use`);
    return;
  }
  required(source, ['license', 'licenseUrl', 'scope', 'changes'], context);
  fail(/^https:\/\//.test(source.licenseUrl), `${context}: missing license evidence URL`);
  if (!DEFAULT_LICENSES.has(source.license)) {
    fail(source.exception && source.exception.status === 'reviewed', `${context}: ${source.license} requires a recorded specific compatibility/permission review`);
    required(source.exception, ['reviewer', 'evidence', 'scope', 'conditions'], `${context} exception`);
  }
  fail(Array.isArray(source.notices) && source.notices.length > 0, `${context}: reuse requires delivered notices`);
}
function validateUpstream(upstream, context) {
  fail(upstream && upstream.repository === 'fpakhurov/fpakhurov.com', `${context}: requires the reviewed fpakhurov.com source`);
  fail(/^[a-f0-9]{40}$/.test(upstream.revision ?? ''), `${context}: upstream commit must be pinned`);
  fail(/^content-rights\/reviews\/[a-z0-9_/-]+\.json$/.test(upstream.reviewPath ?? ''), `${context}: upstream review path is required`);
  fail(sha(upstream.reviewSha256), `${context}: upstream review hash is required`);
  fail(Array.isArray(upstream.notes) && upstream.notes.length >= 2, `${context}: requires both upstream note languages`);
  const locales = new Set();
  for (const note of upstream.notes) {
    fail(/^src\/content\/notes(?:-ru)?\/[a-z0-9-]+\/[a-z0-9-]+\.mdx$/.test(note.path ?? ''), `${context}: invalid upstream note path`);
    fail(sha(note.sha256), `${context}: invalid upstream note hash`);
    locales.add(note.path.startsWith('src/content/notes-ru/') ? 'ru' : 'en');
  }
  fail(locales.size === 2, `${context}: both upstream note languages are required`);
  for (const note of upstream.notes) {
    const peer = note.path.includes('/notes-ru/') ? note.path.replace('/notes-ru/', '/notes/') : note.path.replace('/notes/', '/notes-ru/');
    fail(upstream.notes.some((other) => other.path === peer), `${context}: upstream note is missing its translated counterpart`);
  }
}
async function verifyUpstream(upstream, fetcher) {
  const base = `https://raw.githubusercontent.com/${upstream.repository}/${upstream.revision}/`;
  const get = async (name, expected) => {
    const response = await fetcher(`${base}${name}`, { signal: AbortSignal.timeout(20000) });
    fail(response.ok, `Cannot verify pinned upstream ${name}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    fail(hash(bytes) === expected, `Pinned upstream hash mismatch: ${name}`);
    return bytes.toString('utf8');
  };
  const review = JSON.parse(await get(upstream.reviewPath, upstream.reviewSha256));
  fail(review.status === 'reviewed' && review.scope === 'complete', 'Pinned upstream review is not a complete reviewed source');
  fail(review.schemaVersion === 1, 'Unsupported pinned upstream review schema');
  required(review, ['id', 'reviewer', 'reviewedAt', 'summary'], 'Pinned upstream review');
  required(review.checks ?? {}, ['technical', 'bilingual', 'independence', 'assets'], 'Pinned upstream checks');
  fail(Array.isArray(review.sources) && review.sources.length > 0, 'Pinned upstream review has no source decisions');
  const texts = new Map();
  fail(review.files && Object.keys(review.files).length > 0, 'Pinned upstream review has no files');
  for (const [name, expected] of Object.entries(review.files)) {
    fail(safePath(name) && sha(expected), 'Invalid pinned upstream dependency');
    texts.set(name, await get(name, expected));
  }
  for (const [name, text] of texts) {
    for (const dependency of localDependencies(name, text, (candidate) => texts.has(candidate), 'fpakhurov')) {
      fail(texts.has(dependency), `Pinned upstream review omits ${dependency}`);
    }
  }
  for (const source of review.sources) {
    validateSource(source, 'Pinned upstream source');
    for (const notice of source.notices ?? []) {
      fail(safePath(notice.path) && nonempty(notice.text), 'Invalid pinned upstream notice');
      fail(texts.get(notice.path)?.includes(notice.text), 'Pinned upstream notice missing or not covered by review');
    }
  }
  for (const note of upstream.notes) {
    fail(review.files?.[note.path] === note.sha256, `Upstream review does not cover ${note.path}`);
    const text = texts.get(note.path);
    fail(/^status: published\s*$/m.test(text), `Upstream note is not published: ${note.path}`);
  }
}

export async function checkRights(root, { verifyRemote = false, verifyGitBaseline = false, baselineAnchor, fetcher = fetch } = {}) {
  const config = readJson(root, 'content-rights/config.json');
  fail(config.schemaVersion === 1 && ['fpakhurov', 'biased'].includes(config.project), 'Unsupported source-rights configuration');
  const baseline = readJson(root, 'content-rights/baseline.json');
  fail(baseline.schemaVersion === 1 && /^[a-f0-9]{40}$/.test(baseline.revision), 'Invalid baseline revision');
  fail(baseline.status === 'inventory-not-clearance', 'Baseline must not be presented as clearance');
  const baselineStatuses = verifyGitBaseline ? verifyBaseline(root, config, baseline, baselineAnchor ?? BASELINE_REVISIONS[config.project]) : {};
  if (config.publicationHolds) {
    const holds = readJson(root, config.publicationHolds);
    for (const name of [...holds.topics.flatMap((topic) => topic.files), ...holds.resources]) {
      fail(safePath(name) && !existsSync(path.join(root, name)), `Withdrawn material has returned: ${name}`);
    }
  }
  const current = [...new Set([...config.protectedDirectories.flatMap((name) => {
    fail(safePath(name), 'Invalid protected directory');
    return filesBelow(root, name);
  }), ...(config.protectedFiles ?? []).filter((name) => { fail(safePath(name), 'Invalid protected file'); return existsSync(path.join(root, name)); })])].filter((name) => !(config.generatedDirectories ?? []).some((directory) => name.startsWith(`${directory}/`))).sort();
  const currentHashes = Object.fromEntries(current.map((name) => [name, hash(readFileSync(path.join(root, name)))]));
  const reviews = filesBelow(root, 'content-rights/reviews').filter((name) => name.endsWith('.json'));
  const covered = new Map();
  let reviewed = 0;
  let maintenance = 0;
  for (const reviewPath of reviews) {
    const review = readJson(root, reviewPath);
    fail(['draft', 'reviewed', 'withheld'].includes(review.status), `${reviewPath}: invalid status`);
    if (review.status !== 'reviewed') continue;
    fail(['complete', 'maintenance'].includes(review.scope), `${reviewPath}: review scope must be complete or maintenance`);
    if (review.scope === 'maintenance') {
      required(review, ['remainingReview'], reviewPath);
      fail(review.baselineRevision === baseline.revision, `${reviewPath}: maintenance must identify the original baseline`);
    }
    fail(review.schemaVersion === 1, `${reviewPath}: unsupported review schema`);
    required(review, ['id', 'reviewer', 'reviewedAt', 'summary'], reviewPath);
    fail(/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt), `${reviewPath}: invalid review date`);
    fail(review.files && Object.keys(review.files).length > 0, `${reviewPath}: no reviewed files`);
    fail(Array.isArray(review.sources) && review.sources.length > 0, `${reviewPath}: no source decisions`);
    const ids = new Set();
    for (const source of review.sources) {
      validateSource(source, `${reviewPath}/${source.id}`);
      fail(!ids.has(source.id), `${reviewPath}: duplicate source ID`);
      ids.add(source.id);
      for (const notice of source.notices ?? []) {
        fail(safePath(notice.path) && nonempty(notice.text), `${reviewPath}: invalid notice`);
        fail(existsSync(path.join(root, notice.path)), `${reviewPath}: missing notice ${notice.path}`);
        fail(readFileSync(path.join(root, notice.path), 'utf8').includes(notice.text), `${reviewPath}: notice text missing from ${notice.path}`);
        fail(review.files[notice.path] === hash(readFileSync(path.join(root, notice.path))), `${reviewPath}: notice is not hash-pinned`);
      }
    }
    required(review.checks ?? {}, ['technical', 'bilingual', 'independence', 'assets'], `${reviewPath} checks`);
    for (const [name, expected] of Object.entries(review.files)) {
      fail(safePath(name) && sha(expected), `${reviewPath}: invalid reviewed path/hash`);
      fail(existsSync(path.join(root, name)), `${reviewPath}: reviewed file missing: ${name}`);
      fail(hash(readFileSync(path.join(root, name))) === expected, `${reviewPath}: stale review: ${name}`);
      if (review.scope === 'complete') {
        for (const dependency of localDependencies(name, readFileSync(path.join(root, name), 'utf8'), (candidate) => existsSync(path.join(root, candidate)), config.project)) {
          fail(Object.hasOwn(review.files, dependency), `${reviewPath}: complete review omits local dependency ${dependency}`);
        }
        if (config.project === 'biased' && /^content\/courses\/[^/]+\/topics\/[^/]+\//.test(name)) {
          const base = name.split('/').slice(0, 5).join('/');
          for (const peer of ['topic.yaml','body.en.md','body.ru.md']) fail(Object.hasOwn(review.files, `${base}/${peer}`), `${reviewPath}: complete topic review omits ${base}/${peer}`);
        }
      }
      if (review.scope === 'maintenance') {
        fail(Object.hasOwn(baseline.files, name), `${reviewPath}: new files require a complete review`);
        if (name.endsWith('.mdx') && verifyGitBaseline && baselineStatuses[name] !== 'published') {
          fail(!/^status: published\s*$/m.test(readFileSync(path.join(root, name), 'utf8')), `${reviewPath}: maintenance cannot publish a withheld note`);
        }
      }
      if (config.project === 'fpakhurov' && /^src\/content\/notes(?:-ru)?\//.test(name)) {
        const peer = name.includes('/notes-ru/') ? name.replace('/notes-ru/', '/notes/') : name.replace('/notes/', '/notes-ru/');
        fail(Object.hasOwn(review.files, peer), `${reviewPath}: missing bilingual review for ${peer}`);
      }
      // Shared rendering/assets may be covered by several complete reviews at the same current hash.
      covered.set(name, reviewPath);
    }
    if (config.project === 'biased' && review.scope === 'complete') {
      validateUpstream(review.upstream, reviewPath);
      if (verifyRemote) await verifyUpstream(review.upstream, fetcher);
    }
    if (review.scope === 'complete') reviewed++; else maintenance++;
  }
  const missing = current.filter((name) => baseline.files[name] !== currentHashes[name] && !covered.has(name));
  fail(!missing.length, `New or changed teaching files need a current source review:\n${missing.join('\n')}`);
  return { project: config.project, teachingFiles: current.length, reviewedRecords: reviewed, maintenanceRecords: maintenance, baselineFilesWithoutNewReview: current.filter((name) => baseline.files[name] === currentHashes[name] && !covered.has(name)).length, upstreamVerified: verifyRemote };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const args = process.argv.slice(2);
  fail(args.every((arg) => arg === '--verify-upstream'), 'Supported option: --verify-upstream');
  try {
    console.log(JSON.stringify(await checkRights(root, { verifyRemote: args.includes('--verify-upstream'), verifyGitBaseline: true }), null, 2));
    console.log('Source-rights records validated. Baseline inventory and automated checks are not rights clearance.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
