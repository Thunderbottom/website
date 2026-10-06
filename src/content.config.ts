import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().or(z.date()),
    draft: z.boolean().optional().default(false),
    tags: z.string().optional(),
    image: z.string().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    coverCaption: z.string().optional(),
    summary: z.string().optional(),
    toc: z.boolean().optional(),
    last_modified_at: z.string().or(z.date()).optional(),
    wordCount: z.number().optional(),
    extra: z.record(z.any()).optional(),
  }),
});

// Notes: short writing, a brain dump or a thought too small for a post. The
// title is optional; an untitled note is headed by its date.
const notesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string().optional(),
    date: z.string().or(z.date()),
    draft: z.boolean().optional().default(false),
    tags: z.string().optional(),
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

// A project: one markdown file in src/content/projects/ (front matter only).
const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().or(z.date()),
    repoURL: z.string().url().optional(),
    websiteURL: z.string().url().optional(),
    demoURL: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Pages whose text is yours to write. home.mdx is the homepage introduction.
const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    quote: z.string().optional(),
    quoteLang: z.string().optional(),
  }),
});

// The /now page (a single entry).
const nowCollection = defineCollection({
  loader: file("src/content/now.yaml"),
  schema: z.object({
    quip: z.string().optional(),
    sections: z.array(
      z.object({
        title: z.string(),
        items: z.array(z.string()),
      }),
    ),
  }),
});

// The /resume page (a single entry named "resume").
const resumeCollection = defineCollection({
  loader: file("src/content/resume.yaml"),
  schema: z.object({
    headline: z.string(),
    summary: z.string(),
    links: z.array(z.object({ label: z.string(), href: z.string() })),
    experience: z.array(
      z.object({
        company: z.string(),
        title: z.string(),
        location: z.string().optional(),
        start: z.string(),
        end: z.string().optional(),
        points: z.array(z.string()),
      }),
    ),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        location: z.string(),
        start: z.string(),
        end: z.string(),
      }),
    ),
    projects: z.array(z.string()),
    skills: z.array(z.object({ label: z.string(), items: z.string() })),
    languages: z.string().optional(),
  }),
});

export const collections = {
  projects: projectsCollection,
  pages: pagesCollection,
  now: nowCollection,
  resume: resumeCollection,
  blog: blogCollection,
  notes: notesCollection,
  photography: photographyCollection,
};
