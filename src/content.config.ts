import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const noteSchema = z.object({
    title: z.string(),
    description: z.string(),
    course: z.enum(['nlp', 'generative-models']),
    section: z.string(),
    order: z.number(),
    status: z.enum(['draft', 'published', 'needs-review']),
    tags: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: noteSchema,
});

// Russian translations: same ids as `notes`, so each translation finds its original.
const notesRu = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes-ru' }),
  schema: noteSchema,
});

// External actions shown on work and research items. Only links that exist publicly belong here.
const link = z.object({
  kind: z.enum(['paper', 'code', 'pdf', 'bibtex', 'article', 'results']),
  href: z.url(),
  lang: z.enum(['en', 'ru']).default('en'),
});

const metric = z.object({ value: z.string(), label: z.string() });

// English is the frontmatter root; `ru` carries the same text fields so both versions stay in step.
const projectText = z.object({
  title: z.string(),
  description: z.string(),
  label: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  outcome: z.string().optional(),
  pathLabel: z.string().optional(),
  tags: z.array(z.string()),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: projectText.extend({
    year: z.number(),
    status: z.enum(['completed', 'active', 'ongoing']),
    category: z.enum(['research', 'engineering', 'notes']),
    github: z.url().optional(),
    demo: z.url().optional(),
    links: z.array(link).default([]),
    path: z.string().startsWith('/').optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    ru: projectText,
  }),
});

const caseText = z.object({
  title: z.string(),
  summary: z.string(),
  problem: z.string(),
  context: z.string(),
  role: z.string(),
  approach: z.string(),
  result: z.string(),
  lessons: z.string(),
  includes: z.array(z.string()).default([]),
  metrics: z.array(metric).default([]),
  tags: z.array(z.string()),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: caseText.extend({
    links: z.array(link).default([]),
    order: z.number(),
    ru: caseText,
  }),
});

export const collections = { notes, notesRu, projects, work };
