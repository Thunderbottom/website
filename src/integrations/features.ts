import type { AstroIntegration } from "astro";
import { FEATURES } from "../../site.config";

type Route = [pattern: string, entrypoint: string];

/**
 * Every section's pages live in src/routes/, not src/pages/, and are
 * registered here only when their feature is on (see FEATURES in
 * site.config.ts). src/pages/ holds only what is always there: the home page,
 * the 404 page and the share-image route.
 */
const SECTIONS: { on: boolean; routes: Route[] }[] = [
  {
    on: FEATURES.blog,
    routes: [
      ["/blog", "./src/routes/blog/index.astro"],
      ["/blog/[...slug]", "./src/routes/blog/[...slug].astro"],
      ["/rss.xml", "./src/routes/blog/rss.xml.ts"],
    ],
  },
  {
    on: FEATURES.notes,
    routes: [
      ["/notes", "./src/routes/notes/index.astro"],
      ["/notes/[slug]", "./src/routes/notes/[slug].astro"],
      ["/notes/rss.xml", "./src/routes/notes/rss.xml.ts"],
    ],
  },
  {
    // The combined page needs both kinds of writing to be worth having.
    on: FEATURES.blog && FEATURES.notes,
    routes: [["/writing", "./src/routes/writing/index.astro"]],
  },
  {
    on: FEATURES.blog || FEATURES.notes,
    routes: [
      ["/tags", "./src/routes/tags/index.astro"],
      ["/tags/[tag]", "./src/routes/tags/[tag].astro"],
    ],
  },
  {
    on: FEATURES.photography,
    routes: [
      ["/photography", "./src/routes/photography/index.astro"],
      ["/photography/[slug]", "./src/routes/photography/[slug].astro"],
      [
        "/photography/[facet]/[value]",
        "./src/routes/photography/[facet]/[value].astro",
      ],
    ],
  },
  {
    on: FEATURES.projects,
    routes: [["/projects", "./src/routes/projects/index.astro"]],
  },
  { on: FEATURES.now, routes: [["/now", "./src/routes/now/index.astro"]] },
  { on: FEATURES.resume, routes: [["/resume", "./src/routes/resume.astro"]] },
];

export default function features(): AstroIntegration {
  return {
    name: "site-features",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        for (const { on, routes } of SECTIONS) {
          if (!on) continue;
          for (const [pattern, entrypoint] of routes) {
            injectRoute({ pattern, entrypoint });
          }
        }
      },
    },
  };
}
