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
  "": { title: SITE.NAME, subtitle: SITE.DESCRIPTION },
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
 * Determines OG metadata for a given pathname
 */
export async function getOgMetadataForPath(
  pathname: string,
): Promise<OgMetadata> {
  // Default fallbacks
  let title = SITE.NAME;
  let description = SITE.DESCRIPTION;
  let badge: string | undefined;

  try {
    if (pathname.startsWith("/blog/") && pathname !== "/blog/") {
      // Individual blog post
      badge = "BLOG POST";
      const slug = pathname.replace("/blog/", "").replace(/\/$/, "");
      if (slug) {
        try {
          const posts = await getCollection("blog");
          const post = posts.find((p) => p.slug === slug);
          if (post && !post.data.draft) {
            title = post.data.title;
            description = post.data.description || SITE.DESCRIPTION;
          }
        } catch (e) {
          console.warn("Error loading blog post for OG:", e);
        }
      }
    } else if (pathname === "/blog/" || pathname === "/blog") {
      // Blog index
      title = BLOG.TITLE;
      description = BLOG.DESCRIPTION;
    } else if (pathname === "/photography/" || pathname === "/photography") {
      // Photography index
      title = PHOTOGRAPHY.TITLE;
      description = PHOTOGRAPHY.DESCRIPTION;
    } else if (pathname === "/now/" || pathname === "/now") {
      // Now page
      title = NOW.TITLE;
      description = NOW.DESCRIPTION;
    } else if (pathname === "/projects/" || pathname === "/projects") {
      // Projects page
      title = PROJECTS_CONFIG.TITLE;
      description = PROJECTS_CONFIG.DESCRIPTION;
    }
    // Homepage and other pages use defaults
  } catch (error) {
    console.warn("Error determining OG metadata:", error);
    // Already defaulted to site title/description
  }

  return { title, description, badge };
}

/**
 * Determines route config for OG image generation based on route parameter
 */
export async function getRouteConfigForOg(route: string): Promise<RouteConfig> {
  try {
    if (!route || route === "") {
      // Homepage
      return ROUTE_CONFIG[""];
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
        const post = posts.find((p) => p.slug === slug);
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
