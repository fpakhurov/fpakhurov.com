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

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number(),
    status: z.enum(['completed', 'active', 'ongoing']),
    tags: z.array(z.string()),
    github: z.url().optional(),
    demo: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    problem: z.string(),
    context: z.string(),
    role: z.string(),
    approach: z.string(),
    result: z.string(),
    lessons: z.string(),
    tags: z.array(z.string()),
    order: z.number(),
  }),
});

export const collections = { notes, notesRu, projects, work };
