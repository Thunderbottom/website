import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import { loadSiteFonts } from "@lib/fonts";
import { generateOgTemplate } from "@lib/og/template";
import { getRouteConfigForOg } from "@lib/og/utils";
import { FEATURES } from "@site";

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const route = params.route as string;

    const fonts = await loadSiteFonts();

    const config = await getRouteConfigForOg(route || "");

    const templateProps = {
      title: config.title,
      subtitle: config.subtitle,
      badge: config.badge,
      meta: config.meta,
    };

    const svg = await generateOgTemplate(templateProps, fonts);

    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 1200,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);

    return new Response("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
};

export async function getStaticPaths() {
  const { getPosts, getNotes } = await import("@lib/writing");
  const { parseTags, tagToSlug } = await import("@lib/utils");
  const paths = [];

  paths.push({ params: { route: "index" } });
  if (FEATURES.blog) paths.push({ params: { route: "blog" } });
  if (FEATURES.blog && FEATURES.notes) {
    paths.push({ params: { route: "writing" } });
  }
  if (FEATURES.notes) paths.push({ params: { route: "notes" } });
  if (FEATURES.photography) paths.push({ params: { route: "photography" } });
  if (FEATURES.projects) paths.push({ params: { route: "projects" } });
  if (FEATURES.now) paths.push({ params: { route: "now" } });
  if (FEATURES.blog || FEATURES.notes)
    paths.push({ params: { route: "tags" } });

  try {
    const publishedPosts = await getPosts();

    for (const post of publishedPosts) {
      paths.push({
        params: { route: `blog/${post.id}` },
      });
    }

    const notes = await getNotes();
    for (const note of notes) {
      paths.push({ params: { route: `notes/${note.id}` } });
    }

    const tagSlugs = new Set<string>();
    for (const post of [...publishedPosts, ...notes]) {
      for (const tag of parseTags(post.data.tags)) {
        tagSlugs.add(tagToSlug(tag));
      }
    }
    for (const slug of tagSlugs) {
      paths.push({ params: { route: `tags/${slug}` } });
    }
  } catch (error) {
    console.warn(
      "Error loading content collections for OG static paths:",
      error,
    );
  }

  return paths;
}
