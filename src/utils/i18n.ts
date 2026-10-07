// Pages that exist in both languages. Everything else maps to the nearest translated page.
const translated = ['work', 'projects', 'notes', 'about', 'cv', 'contact'];

/** The equivalent path in the other language, with the trailing slash used by canonical URLs. */
export function counterpart(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  // Every note and course page exists under both prefixes (untranslated notes show the English text).
  if (parts[0] === 'notes') return `/ru/${parts.join('/')}/`;
  if (parts[0] === 'ru' && parts[1] === 'notes') return `/${parts.slice(1).join('/')}/`;
  if (parts[0] === 'ru') return parts[1] ? `/${parts[1]}/` : '/';
  return parts[0] && translated.includes(parts[0]) ? `/ru/${parts[0]}/` : '/ru/';
}

/** True when the page has an exact translation, so hreflang alternates are meaningful. */
export function hasTranslation(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  const page = parts[0] === 'ru' ? parts.slice(1) : parts;
  if (page[0] === 'notes') return page.length <= 2 || page[1] === 'generative-models';
  return page.length === 0 || (page.length === 1 && translated.includes(page[0]));
}
