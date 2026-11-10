import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { sourceNoteId, validatePracticeCatalog } from '../../src/utils/biasedPracticeLinks.mjs';

export function publishedNoteIds(root) {
  const base = path.join(root, 'src/content/notes');
  const ids = new Set();
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.mdx?$/.test(entry.name)) {
        const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
        if (/^status:\s*["']?published["']?\s*(?:#.*)?$/m.test(frontmatter)) ids.add(path.relative(base, file).replace(/\\/g, '/').replace(/\.mdx?$/, ''));
      }
    }
  }
  walk(base);
  return ids;
}

/** Run the catalogue's own schema loader; only its public routing metadata leaves the child process. */
export function readBiasedCatalog(biasedRepo, publishedIds) {
  const git = (...args) => execFileSync('git', ['-C', biasedRepo, ...args], { encoding: 'utf8' }).trim();
  if (git('status', '--porcelain', '--', 'content', 'packages/content-schema')) throw new Error('Commit catalogue source changes before generating public practice links');
  const revision = git('rev-parse', 'HEAD');
  const extractor = `
    import path from 'node:path';
    import { loadContent } from '@biased/content-schema/loader';
    const tree = loadContent(path.resolve('content'));
    const topics = new Map(tree.topics.map(topic => [topic.id, topic]));
    const output = [];
    for (const course of tree.courses) {
      if (course.status !== 'available') continue;
      for (const module of course.modules) for (const ref of module.topics) {
        if (ref.status !== 'available') continue;
        const topic = topics.get(course.slug + '.' + ref.slug);
        if (!topic || !topic.sourceNote || !topic.blocks.some(block => block.checks.length > 0)) throw new Error('Available practice is missing source metadata or questions');
        output.push({ course: topic.course, topic: topic.slug, title: { en: topic.title.en, ru: topic.title.ru }, sourceNote: topic.sourceNote });
      }
    }
    process.stdout.write(JSON.stringify(output));
  `;
  const entries = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', extractor], {
    cwd: biasedRepo, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024,
  }));
  const grouped = new Map();
  for (const entry of entries) {
    const id = sourceNoteId(entry.sourceNote);
    const targets = grouped.get(id) ?? [];
    targets.push(entry);
    grouped.set(id, targets);
  }
  const catalog = { version: 1, source: { site: 'https://biased.school', revision }, notes: Object.fromEntries([...grouped].sort(([a], [b]) => a.localeCompare(b))) };
  validatePracticeCatalog(catalog, publishedIds);
  return catalog;
}
