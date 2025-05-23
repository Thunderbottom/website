import { defineCollection, z } from "astro:content";

// Define the blog collection schema
const blogCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.string().or(z.date()),
      draft: z.boolean().optional().default(false),
      tags: z.string().optional(),
      image: z.string().optional(),
      summary: z.string().optional(),
      toc: z.boolean().optional().default(false),
      last_modified_at: z.string().or(z.date()).optional(),
      wordCount: z.number().optional(),
      extra: z.record(z.any()).optional(),
    }),
});

// Export the collections
export const collections = {
  blog: blogCollection,
};
