import { defineMiddleware } from "astro:middleware";
import { getOgMetadataForPath, generateOgImageUrl } from "@lib/og/utils";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  try {
    const metadata = await getOgMetadataForPath(pathname);

    let route = "index";
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

    const ogImageUrl = generateOgImageUrl(context.site!, route, metadata);
    context.locals.ogImageUrl = ogImageUrl;
  } catch (error) {
    console.warn("OG middleware error:", error);
    context.locals.ogImageUrl = new URL("/og.png", context.site!).href;
  }

  return next();
});
