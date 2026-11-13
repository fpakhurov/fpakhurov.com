# fpakhurov.com

Personal technical website for Fedor Pakhurov, built with Astro, TypeScript, MDX and Astro Content Collections.

## Local development

```sh
npm install
npm run dev
```

The production build is generated into `dist/` with:

```sh
npm run build
```

## Content

- Technical notes: `src/content/notes/` (English) and `src/content/notes-ru/` (Russian)
- Project records: `src/content/projects/` (research, engineering and notes groups on `/projects`)
- Work case studies: `src/content/work/`
- Homepage impact figures, About principles and Writing & talks: `src/data/profile.ts`

Work and project entries keep English fields at the root of the frontmatter and the Russian text under `ru:`. The schema requires both, so the English and Russian pages stay in step. Home, Work, Projects and About render both languages from the shared views in `src/views/`; the remaining Russian pages come from `src/utils/ru-pages.ts`. External actions (`Paper`, `Code`, `PDF`, `BibTeX`, `Article`) are listed only when the material is public.
- Original handwritten material: `source-material/` (never copied to the built site)
- Contacts and profiles: `src/config/profile.ts` (see `docs/contact-and-email.md`)

Note URLs are permanent and never include dates. Each note declares its course, section, order, review status, tags and prerequisites in frontmatter. The course pages (`/notes/nlp`, `/notes/generative-models`) are generated from the section maps in `src/utils/courses.ts` and the published notes; counts, progress and previous/next links are computed, not hard-coded. Writing standards are in [docs/course-writing.md](docs/course-writing.md).

## Sources and rights

All courses follow [the source policy](docs/content/source-policy.md). Review and publish these notes before deriving BIASED lessons. New or changed teaching files require current per-file provenance, license decisions, notices and bilingual review; `npm run rights:check` enforces the recorded scope. The legacy baseline is an inventory, not clearance. [The renewal review](docs/reports/2026-11-13-licensed-source-renewal/README.md) tracks all courses and proposed sources.

## Deployment

Pushes to `main` build and deploy the static site through GitHub Actions and GitHub Pages. `public/CNAME` configures the custom domain `fpakhurov.com`; enable Pages and enforce HTTPS in the repository settings after DNS is connected.
