import { defineMiddleware } from "astro:middleware";
import { getOgMetadataForPath, generateOgImageUrl } from "@lib/og/utils";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  try {
    // Get metadata for this path
    const metadata = await getOgMetadataForPath(pathname);

    // Determine the route for OG image URL
    let route = "index"; // Default to index for homepage
    if (pathname.startsWith("/blog/") && pathname !== "/blog/") {
      const slug = pathname.replace("/blog/", "").replace(/\/$/, "");
      route = `blog/${slug}`;
    } else if (pathname === "/blog/" || pathname === "/blog") {
      route = "blog";
    } else if (pathname === "/photography/" || pathname === "/photography") {
      route = "photography";
    } else if (pathname === "/now/" || pathname === "/now") {
      route = "now";
    } else if (pathname === "/projects/" || pathname === "/projects") {
      route = "projects";
    }

    // Generate OG image URL
    const ogImageUrl = generateOgImageUrl(context.site!, route, metadata);
    context.locals.ogImageUrl = ogImageUrl;
  } catch (error) {
    // Fallback to main site OG image if anything fails
    console.warn("OG middleware error:", error);
    context.locals.ogImageUrl = new URL("/og.png", context.site!).href;
  }

  return next();
});
