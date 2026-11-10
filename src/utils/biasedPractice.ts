import catalog from '../data/biasedPractice.json';
import { practiceHref } from './biasedPracticeLinks.mjs';

type PracticeTarget = { course: string; topic: string; title: { en: string; ru: string }; sourceNote: string };
const notes: Record<string, PracticeTarget[]> = catalog.notes;

/** Missing source notes deliberately get no promotion or approximate course fallback. */
export function practiceForNote(noteId: string, lang: 'en' | 'ru') {
  const targets = Object.hasOwn(notes, noteId) ? notes[noteId] : [];
  return targets.map((target) => ({ title: target.title[lang], href: practiceHref(noteId, target, lang) }));
}
