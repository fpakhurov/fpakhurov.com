/*
 * Single source of truth for public profiles and contact channels.
 * Header, footer, homepages, CV, contact pages and the Person JSON-LD read from here.
 * A null field is not configured: it is hidden everywhere and left out of structured data.
 */
export interface EmailAddress {
  user: string;
  domain: string;
}

export interface Profile {
  github: string | null;
  linkedin: string | null;
  orcid: string | null;
  habr: string | null;
  /** University staff page. */
  hse: string | null;
  /**
   * Public email, kept as separate parts so the address never appears whole in the
   * repository or the built HTML. The contact page assembles it only when a visitor asks.
   */
  email: EmailAddress | null;
  /** Telegram username without the leading @. */
  telegram: string | null;
}

export const profile: Profile = {
  github: 'https://github.com/fpakhurov',
  linkedin: 'https://www.linkedin.com/in/fpakhurov/',
  orcid: 'https://orcid.org/0009-0006-6977-7573',
  habr: 'https://habr.com/ru/users/fpakhurov/',
  hse: 'https://www.hse.ru/staff/f',
  email: { user: 'fedor', domain: 'fpakhurov.com' },
  telegram: 'fpakhurov',
};

// Fail the build rather than publish a malformed or placeholder value.
const profileRules: Record<Exclude<keyof Profile, 'email'>, RegExp> = {
  github: /^https:\/\/github\.com\/[A-Za-z0-9-]+$/,
  linkedin: /^https:\/\/www\.linkedin\.com\/in\/[A-Za-z0-9-]+\/$/,
  orcid: /^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
  habr: /^https:\/\/habr\.com\/ru\/users\/[A-Za-z0-9_-]+\/$/,
  hse: /^https:\/\/www\.hse\.ru\/staff\/[A-Za-z0-9_-]+$/,
  telegram: /^[A-Za-z][A-Za-z0-9_]{4,31}$/,
};
const placeholder = /example|placeholder|your|todo|xxx|changeme/i;
const invalid = (key: string, value: string) => new Error(`src/config/profile.ts: "${key}" is not a valid ${key} value: ${value}`);
for (const [key, rule] of Object.entries(profileRules) as [keyof typeof profileRules, RegExp][]) {
  const value = profile[key];
  if (value !== null && (!rule.test(value) || placeholder.test(value))) throw invalid(key, value);
}
if (profile.email) {
  const { user, domain } = profile.email;
  if (!/^[a-z0-9._+-]+$/i.test(user) || !/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(domain) || placeholder.test(`${user} ${domain}`)) {
    throw invalid('email', `${user} at ${domain}`);
  }
}

export type Lang = 'en' | 'ru';

/** Attributes for links to external profiles. */
export const externalLink = { target: '_blank', rel: 'me noopener noreferrer' } as const;
const newTab: Record<Lang, string> = { en: 'opens in a new tab', ru: 'откроется в новой вкладке' };

export interface LinkChannel {
  kind: 'link';
  id: Exclude<keyof Profile, 'email'>;
  name: string;
  /** Short handle or value shown next to the name. */
  value: string;
  href: string;
}

export interface EmailChannel extends EmailAddress {
  kind: 'email';
  id: 'email';
  name: string;
}

export type ContactChannel = LinkChannel | EmailChannel;

const linkDefinitions: Record<LinkChannel['id'], { name: string; value: (field: string) => string; href: (field: string) => string }> = {
  linkedin: { name: 'LinkedIn', value: (url) => url.replace('https://www.', '').replace(/\/$/, ''), href: (url) => url },
  github: { name: 'GitHub', value: (url) => url.replace('https://', ''), href: (url) => url },
  orcid: { name: 'ORCID', value: (url) => url.replace('https://orcid.org/', ''), href: (url) => url },
  habr: { name: 'Habr', value: (url) => `@${url.split('/').filter(Boolean).pop()}`, href: (url) => url },
  hse: { name: 'HSE', value: (url) => url.replace('https://www.', ''), href: (url) => url },
  telegram: { name: 'Telegram', value: (username) => `@${username}`, href: (username) => `https://t.me/${username}` },
};

const link = (id: LinkChannel['id']): LinkChannel | null => {
  const field = profile[id];
  if (field === null) return null;
  const definition = linkDefinitions[id];
  return { kind: 'link', id, name: definition.name, value: definition.value(field), href: definition.href(field) };
};
const links = (ids: LinkChannel['id'][]) => ids.map(link).filter((item): item is LinkChannel => item !== null);

const email: EmailChannel | null = profile.email && { kind: 'email', id: 'email', name: 'Email', ...profile.email };

/** Every configured channel, in contact-page order. */
export const contactChannels: ContactChannel[] = [
  ...(email ? [email] : []),
  ...links(['linkedin', 'github', 'orcid', 'habr', 'telegram']),
];

/** The compact profile row in the footer. */
export const footerProfiles = links(['github', 'linkedin', 'orcid']);

/** Profiles shown on the CV. */
export const cvProfiles = links(['github', 'linkedin', 'orcid', 'habr', 'hse']);

export const github = link('github');
export const hse = link('hse');

/** Accessible name for an external profile link: name, optionally the value, and the new-tab note. */
export const channelLabel = (item: LinkChannel, lang: Lang, withValue = true) =>
  `${withValue ? `${item.name}: ${item.value}` : item.name} (${newTab[lang]})`;

/** Linked profiles for Person.sameAs. The email stays out of structured data, which harvesters read first. */
export const sameAs = links(['github', 'linkedin', 'orcid', 'habr', 'hse']).map((item) => item.href);
