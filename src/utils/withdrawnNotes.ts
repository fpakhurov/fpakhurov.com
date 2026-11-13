import ids from '../data/withdrawnNotes.json';

/** Explicit publication holds; removing a hold requires a source review. */
export const withdrawnNotes = new Set<string>(ids);

export function publishedNoteHref(prefix: string, note: string, anchor?: string): string {
  if (withdrawnNotes.has(note)) return `${prefix}/${note.split('/')[0]}`;
  return `${prefix}/${note}${anchor ? `#${anchor}` : ''}`;
}
