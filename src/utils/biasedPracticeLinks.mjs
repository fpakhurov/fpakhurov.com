import { createHash } from 'node:crypto';

const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const notePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const marketingLabel = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const opaqueLabel = /^(?:[a-f0-9]{24,}|[a-z0-9]{40,}|[0-9]{8,}|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/;

/** @typedef {{course: string, topic: string, title: {en: string, ru: string}, sourceNote: string}} PracticeTarget */
/** @typedef {{version: number, source: {site: string, revision: string}, notes: Record<string, PracticeTarget[]>}} PracticeCatalog */

/** The explicit source URL is the only join key; titles and course aliases are never guessed. */
export function sourceNoteId(sourceNote) {
  const url = new URL(sourceNote);
  if (url.protocol !== 'https:' || url.hostname !== 'fpakhurov.com' || url.port || url.username || url.password || url.search) {
    throw new Error('Practice source must be a public fpakhurov.com note URL');
  }
  const id = url.pathname.replace(/^\/ru(?=\/notes\/)/, '').replace(/^\/notes\//, '').replace(/\/$/, '');
  if (!notePattern.test(id) || !/^\/(?:ru\/)?notes\//.test(url.pathname)) throw new Error('Invalid practice source note id');
  return id;
}

/** A public, stable UTM label. The suffix prevents collisions when long ids are shortened. */
export function practiceContentLabel(noteId) {
  if (!notePattern.test(noteId)) throw new Error('Invalid practice note id');
  const label = noteId.replace('/', '--');
  if (label.length <= 64) return label;
  return `${label.slice(0, 55)}-${createHash('sha256').update(noteId).digest('hex').slice(0, 8)}`;
}

/** @param {string} noteId @param {PracticeTarget} target @param {'en'|'ru'} lang */
export function practiceHref(noteId, target, lang) {
  if (typeof target.course !== 'string' || typeof target.topic !== 'string' || !slug.test(target.course) || !slug.test(target.topic) || sourceNoteId(target.sourceNote) !== noteId || !['en', 'ru'].includes(lang)) {
    throw new Error('Practice target does not match its source note');
  }
  const url = new URL(`/learn/${target.course}/${target.topic}`, 'https://biased.school');
  url.searchParams.set('lang', lang);
  url.searchParams.set('mode', 'deep');
  const tags = {
    utm_source: 'fpakhurov_com', utm_medium: 'referral', utm_campaign: 'course_practice',
    utm_content: practiceContentLabel(noteId), utm_term: target.course,
  };
  for (const [key, value] of Object.entries(tags)) {
    if (!marketingLabel.test(value) || opaqueLabel.test(value)) throw new Error(`Invalid public campaign label: ${key}`);
    url.searchParams.set(key, value);
  }
  url.hash = 'check-yourself';
  return url.href;
}

/** Validate a committed public snapshot without needing private catalogue access in CI. */
export function validatePracticeCatalog(catalog, publishedIds) {
  if (!catalog || Object.keys(catalog).sort().join(',') !== 'notes,source,version' || Object.keys(catalog.source ?? {}).sort().join(',') !== 'revision,site') {
    throw new Error('Practice snapshots may contain only public catalogue metadata');
  }
  if (catalog?.version !== 1 || catalog.source?.site !== 'https://biased.school' || !/^[a-f0-9]{40}$/.test(catalog.source?.revision ?? '')) {
    throw new Error('Invalid practice catalogue provenance');
  }
  if (!catalog.notes || typeof catalog.notes !== 'object' || Array.isArray(catalog.notes)) throw new Error('Invalid practice catalogue');
  const targets = new Set();
  const labels = new Map();
  let multiTargetNotes = 0;
  for (const [noteId, entries] of Object.entries(catalog.notes)) {
    if (!publishedIds.has(noteId)) throw new Error(`Practice references an unpublished note: ${noteId}`);
    const label = practiceContentLabel(noteId);
    if (labels.has(label)) throw new Error(`Two notes share a campaign label: ${labels.get(label)}, ${noteId}`);
    labels.set(label, noteId);
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > 2) throw new Error(`Expected one or two named practice actions: ${noteId}`);
    if (entries.length === 2) multiTargetNotes++;
    for (const target of entries) {
      if (!target || Object.keys(target).sort().join(',') !== 'course,sourceNote,title,topic') throw new Error(`Unexpected practice metadata: ${noteId}`);
      if (Object.keys(target.title ?? {}).sort().join(',') !== 'en,ru' || !['en', 'ru'].every((lang) => typeof target.title[lang] === 'string' && target.title[lang].trim())) {
        throw new Error(`Missing bilingual practice title: ${noteId}`);
      }
      const key = `${target.course}/${target.topic}`;
      if (targets.has(key)) throw new Error(`Duplicate practice target: ${key}`);
      targets.add(key);
      practiceHref(noteId, target, 'en');
      practiceHref(noteId, target, 'ru');
    }
  }
  if (targets.size === 0) throw new Error('Practice catalogue is empty');
  return { notes: Object.keys(catalog.notes).length, targets: targets.size, multiTargetNotes, omitted: publishedIds.size - Object.keys(catalog.notes).length };
}
