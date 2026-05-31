import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().or(z.date()),
    draft: z.boolean().optional().default(false),
    tags: z.string().optional(),
    image: z.string().optional(),
    summary: z.string().optional(),
    toc: z.boolean().optional(),
    last_modified_at: z.string().or(z.date()).optional(),
    wordCount: z.number().optional(),
    extra: z.record(z.any()).optional(),
  }),
});

const photographyCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/photography" }),
  schema: z.object({
    title: z.string(),
    date: z.string().or(z.date()),
    draft: z.boolean().optional().default(false),
    image: z.string(),
    alt: z.string().optional(),
    tags: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  photography: photographyCollection,
};
