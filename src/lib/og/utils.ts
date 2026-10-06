import { getCollection } from "astro:content";
import {
  SITE,
  BLOG,
  WRITING,
  NOTES,
  PHOTOGRAPHY,
  NOW,
  PROJECTS_CONFIG,
} from "@lib/config";
import {
  getNotes,
  getPosts,
  itemTags,
  getWriting,
  noteExcerpt,
  noteHeadline,
} from "@lib/writing";
import { formatDate } from "@lib/config";
import { getBodyReadingTime } from "@lib/utils";
import { tagToSlug } from "@lib/utils";

export interface OgMetadata {
  title: string;
  description: string;
  badge?: string;
}

export interface RouteConfig {
  title: string;
  subtitle: string;
  badge?: string;
  /** Dates and the like, shown in mono above the title. */
  meta?: string[];
}

// Route configuration dictionary for static pages
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  index: { title: SITE.NAME, subtitle: SITE.DESCRIPTION },
  blog: { title: BLOG.TITLE, subtitle: BLOG.DESCRIPTION },
  writing: { title: WRITING.TITLE, subtitle: WRITING.DESCRIPTION },
  notes: { title: NOTES.TITLE, subtitle: NOTES.DESCRIPTION },
  photography: {
    title: PHOTOGRAPHY.TITLE,
    subtitle: PHOTOGRAPHY.DESCRIPTION,
  },
  projects: {
    title: PROJECTS_CONFIG.TITLE,
    subtitle: PROJECTS_CONFIG.DESCRIPTION,
  },
  now: { title: NOW.TITLE, subtitle: NOW.DESCRIPTION },
  tags: { title: "Tags", subtitle: "Browse writing by tag" },
};

/**
 * Resolves a tag slug back to its original display casing by scanning
 * published writing, since the slug alone (e.g. "nix") can't recover it.
 */
async function getTagDisplayName(slug: string): Promise<string | undefined> {
  for (const item of await getWriting()) {
    for (const tag of itemTags(item)) {
      if (tagToSlug(tag) === slug) return tag;
    }
  }
  return undefined;
}

/**
 * Maps a URL pathname to its OG route key
 */
export function pathnameToRoute(pathname: string): string {
  if (pathname.startsWith("/blog/") && pathname !== "/blog/") {
    return `blog/${pathname.replace("/blog/", "").replace(/\/$/, "")}`;
  }
  if (pathname.startsWith("/notes/") && pathname !== "/notes/") {
    return `notes/${pathname.replace("/notes/", "").replace(/\/$/, "")}`;
  }
  if (pathname === "/notes/" || pathname === "/notes") return "notes";
  if (pathname === "/writing/" || pathname === "/writing") return "writing";
  if (pathname === "/blog/" || pathname === "/blog") return "blog";
  if (pathname === "/photography/" || pathname === "/photography")
    return "photography";
  if (pathname === "/now/" || pathname === "/now") return "now";
  if (pathname === "/projects/" || pathname === "/projects") return "projects";
  if (pathname.startsWith("/tags/") && pathname !== "/tags/") {
    return `tags/${pathname.replace("/tags/", "").replace(/\/$/, "")}`;
  }
  if (pathname === "/tags/" || pathname === "/tags") return "tags";
  return "index";
}

/**
 * Determines OG metadata for a given pathname
 */
export async function getOgMetadataForPath(
  pathname: string,
): Promise<OgMetadata> {
  let title = SITE.NAME;
  let description = SITE.DESCRIPTION;
  let badge: string | undefined;

  try {
    const route = pathnameToRoute(pathname);

    if (route.startsWith("blog/")) {
      badge = "blog post";
      const slug = route.replace("blog/", "");
      try {
        const posts = await getCollection("blog");
        const post = posts.find((p) => p.id === slug);
        if (post && !post.data.draft) {
          title = post.data.title;
          description = post.data.description || SITE.DESCRIPTION;
        }
      } catch (e) {
        console.warn("Error loading blog post for OG:", e);
      }
    } else if (route.startsWith("notes/")) {
      badge = "note";
      const note = (await getNotes()).find(
        (n) => n.id === route.replace("notes/", ""),
      );
      if (note) {
        title = noteHeadline(note);
      }
    } else if (route.startsWith("tags/")) {
      const slug = route.replace("tags/", "");
      const displayTag = await getTagDisplayName(slug);
      if (displayTag) {
        title = `Writing tagged "${displayTag}"`;
        description = `All writing tagged with ${displayTag}`;
      }
    } else if (ROUTE_CONFIG[route]) {
      title = ROUTE_CONFIG[route].title;
      description = ROUTE_CONFIG[route].subtitle;
    }
  } catch (error) {
    console.warn("Error determining OG metadata:", error);
  }

  return { title, description, badge };
}

/**
 * Determines route config for OG image generation based on route parameter
 */
export async function getRouteConfigForOg(route: string): Promise<RouteConfig> {
  try {
    if (!route || route === "") {
      return ROUTE_CONFIG["index"];
    } else if (ROUTE_CONFIG[route]) {
      // Static pages
      return ROUTE_CONFIG[route];
    } else if (route.startsWith("blog/")) {
      // Individual blog post
      const slug = route.replace("blog/", "");
      let title = SITE.NAME;
      let subtitle = SITE.DESCRIPTION;

      let meta: string[] | undefined;

      try {
        const post = (await getPosts()).find((p) => p.id === slug);
        if (post) {
          title = post.data.title;
          subtitle = post.data.description || SITE.DESCRIPTION;
          meta = [
            formatDate(post.data.date, "%Y-%m-%d"),
            getBodyReadingTime(post.body),
          ];
        }
      } catch (e) {
        console.warn("Error loading blog post for OG route:", e);
      }

      return { title, subtitle, badge: "blog post", meta };
    } else if (route.startsWith("notes/")) {
      const note = (await getNotes()).find(
        (n) => n.id === route.replace("notes/", ""),
      );
      return {
        title: note ? noteHeadline(note) : SITE.NAME,
        // A titled note shows the start of its text; an untitled note's
        // headline already is the start of its text.
        subtitle: note?.data.title ? noteExcerpt(note.body, 160) : "",
        badge: "note",
        meta: note ? [formatDate(note.data.date, "%Y-%m-%d")] : undefined,
      };
    } else if (route.startsWith("tags/")) {
      const slug = route.replace("tags/", "");
      const displayTag = await getTagDisplayName(slug);
      if (displayTag) {
        return {
          title: `Writing tagged "${displayTag}"`,
          subtitle: `All writing tagged with ${displayTag}`,
        };
      }
    }
  } catch (error) {
    console.warn("Error determining OG route config:", error);
  }

  // Default fallback
  return ROUTE_CONFIG["index"];
}

/**
 * Generates OG image URL with proper metadata
 */
export function generateOgImageUrl(
  baseUrl: string | URL,
  route: string,
  metadata: OgMetadata,
): string {
  const ogUrl = new URL(`/og/${route || ""}.png`, baseUrl);
  ogUrl.searchParams.set("title", metadata.title);
  ogUrl.searchParams.set("description", metadata.description);
  return ogUrl.href;
}
