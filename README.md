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

- Technical notes: `src/content/notes/`
- Project records: `src/content/projects/`
- Work case studies: `src/content/work/`
- Original handwritten material: `source-material/` (never copied to the built site)
- Contacts and profiles: `src/config/profile.ts` (see `docs/contact-and-email.md`)

Note URLs are permanent and never include dates. Each note declares its course, section, order, review status, tags and prerequisites in frontmatter.

## Deployment

Pushes to `main` build and deploy the static site through GitHub Actions and GitHub Pages. `public/CNAME` configures the custom domain `fpakhurov.com`; enable Pages and enforce HTTPS in the repository settings after DNS is connected.
