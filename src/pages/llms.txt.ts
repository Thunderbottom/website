import type { APIRoute } from "astro";
import { FEATURES, PAGES } from "@site";
import { SITE, formatDate } from "@lib/config";
import {
  getNotes,
  getPosts,
  noteHeadline,
  noteHref,
  postHref,
} from "@lib/writing";

// llms.txt: a plain-text map of the site for language models, built from the
// site's own settings and content so it never goes stale.
export const GET: APIRoute = async () => {
  const [posts, notes] = await Promise.all([getPosts(), getNotes()]);
  const abs = (path: string) => new URL(path, SITE.URL).href;
  const line = (label: string, path: string, note: string) =>
    `- [${label}](${abs(path)}): ${note}`;

  const sections = [
    line("Home", "/", "Introduction and recent writing"),
    FEATURES.blog && line(PAGES.blog.TITLE, "/blog/", PAGES.blog.DESCRIPTION),
    FEATURES.notes &&
      line(PAGES.notes.TITLE, "/notes/", PAGES.notes.DESCRIPTION),
    FEATURES.photography &&
      line(
        PAGES.photography.TITLE,
        "/photography/",
        PAGES.photography.DESCRIPTION,
      ),
    FEATURES.projects &&
      line(PAGES.projects.TITLE, "/projects/", PAGES.projects.DESCRIPTION),
    FEATURES.now && line(PAGES.now.TITLE, "/now/", PAGES.now.DESCRIPTION),
    FEATURES.blog && line("RSS feed", "/rss.xml", "Posts"),
    FEATURES.notes && line("Notes feed", "/notes/rss.xml", "Notes"),
    line("Sitemap", "/sitemap-index.xml", "Every page on the site"),
  ].filter(Boolean);

  const body = [
    `# ${SITE.NAME}`,
    "",
    `> ${SITE.DESCRIPTION}`,
    "",
    "## Site",
    "",
    ...sections,
    posts.length > 0 && "\n## Posts\n",
    ...posts.map((post) =>
      line(
        post.data.title,
        postHref(post),
        `${formatDate(post.data.date, "%B %Y")}${post.data.description ? `. ${post.data.description}` : ""}`,
      ),
    ),
    notes.length > 0 && "\n## Notes\n",
    ...notes.map((note) =>
      line(noteHeadline(note), noteHref(note), formatDate(note.data.date)),
    ),
    "",
  ]
    .filter((l) => l !== false)
    .join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
