import { defineMiddleware } from "astro:middleware";
import { getOgMetadataForPath, generateOgImageUrl, pathnameToRoute } from "@lib/og/utils";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  try {
    const route = pathnameToRoute(pathname);
    const metadata = await getOgMetadataForPath(pathname);
    const ogImageUrl = generateOgImageUrl(context.site!, route, metadata);
    context.locals.ogImageUrl = ogImageUrl;
  } catch (error) {
    console.warn("OG middleware error:", error);
    context.locals.ogImageUrl = new URL("/og.png", context.site!).href;
  }

  return next();
});
