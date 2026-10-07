/** Russian helpers for the tokenization figures. */

/** Noun form after a number: plural(23, 'слово', 'слова', 'слов') → 'слова'. */
export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/** Integer in the page's number style: 50,257 in English, 50 257 in Russian (four digits unsplit). */
export function fmtInt(v: number, ru: boolean): string {
  if (!ru) return v.toLocaleString('en-US');
  return v >= 10000 ? v.toLocaleString('en-US').replace(/,/g, ' ') : String(v);
}
