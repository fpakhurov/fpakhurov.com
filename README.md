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

- Technical notes: `src/content/notes/` (English only; Russian pages link to them as available in English)
- Project records: `src/content/projects/` (research, engineering and notes groups on `/projects`)
- Work case studies: `src/content/work/`
- Homepage impact figures, About principles and Writing & talks: `src/data/profile.ts`

Work and project entries keep English fields at the root of the frontmatter and the Russian text under `ru:`. The schema requires both, so the English and Russian pages stay in step. Home, Work, Projects and About render both languages from the shared views in `src/views/`; the remaining Russian pages come from `src/utils/ru-pages.ts`. External actions (`Paper`, `Code`, `PDF`, `BibTeX`, `Article`) are listed only when the material is public.
- Original handwritten material: `source-material/` (never copied to the built site)

Note URLs are permanent and never include dates. Each note declares its course, section, order, review status, tags and prerequisites in frontmatter.

## Deployment

Pushes to `main` build and deploy the static site through GitHub Actions and GitHub Pages. `public/CNAME` configures the custom domain `fpakhurov.com`; enable Pages and enforce HTTPS in the repository settings after DNS is connected.
