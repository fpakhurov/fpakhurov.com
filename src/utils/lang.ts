export type Lang = 'en' | 'ru';

/** Language of the page being rendered, read from its URL. */
export function pageLang(url: URL): Lang {
  return url.pathname === '/ru' || url.pathname.startsWith('/ru/') ? 'ru' : 'en';
}
