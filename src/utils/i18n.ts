// Pages that exist in both languages. Everything else maps to the nearest translated page.
const translated = ['work', 'projects', 'notes', 'about', 'cv', 'contact'];

/** The equivalent path in the other language, with the trailing slash used by canonical URLs. */
export function counterpart(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'ru') return parts[1] ? `/${parts[1]}/` : '/';
  return parts[0] && translated.includes(parts[0]) ? `/ru/${parts[0]}/` : '/ru/';
}

/** True when the page has an exact translation, so hreflang alternates are meaningful. */
export function hasTranslation(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  const page = parts[0] === 'ru' ? parts.slice(1) : parts;
  return page.length === 0 || (page.length === 1 && translated.includes(page[0]));
}
