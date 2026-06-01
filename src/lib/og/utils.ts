import { getCollection } from "astro:content";
import { SITE, BLOG, PHOTOGRAPHY, NOW, PROJECTS_CONFIG } from "@lib/config";

export interface OgMetadata {
  title: string;
  description: string;
  badge?: string;
}

export interface RouteConfig {
  title: string;
  subtitle: string;
  badge?: string;
}

// Route configuration dictionary for static pages
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  index: { title: SITE.NAME, subtitle: SITE.DESCRIPTION },
  blog: { title: BLOG.TITLE, subtitle: BLOG.DESCRIPTION },
  photography: {
    title: PHOTOGRAPHY.TITLE,
    subtitle: PHOTOGRAPHY.DESCRIPTION,
  },
  projects: {
    title: PROJECTS_CONFIG.TITLE,
    subtitle: PROJECTS_CONFIG.DESCRIPTION,
  },
  now: { title: NOW.TITLE, subtitle: NOW.DESCRIPTION },
};

/**
 * Maps a URL pathname to its OG route key
 */
export function pathnameToRoute(pathname: string): string {
  if (pathname.startsWith("/blog/") && pathname !== "/blog/") {
    return `blog/${pathname.replace("/blog/", "").replace(/\/$/, "")}`;
  }
  if (pathname === "/blog/" || pathname === "/blog") return "blog";
  if (pathname === "/photography/" || pathname === "/photography")
    return "photography";
  if (pathname === "/now/" || pathname === "/now") return "now";
  if (pathname === "/projects/" || pathname === "/projects") return "projects";
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
      badge = "BLOG POST";
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

      try {
        const posts = await getCollection("blog");
        const post = posts.find((p) => p.id === slug);
        if (post && !post.data.draft) {
          title = post.data.title;
          subtitle = post.data.description || SITE.DESCRIPTION;
        }
      } catch (e) {
        console.warn("Error loading blog post for OG route:", e);
      }

      return {
        title,
        subtitle,
        badge: "BLOG POST",
      };
    }
  } catch (error) {
    console.warn("Error determining OG route config:", error);
  }

  // Default fallback
  return ROUTE_CONFIG[""];
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
