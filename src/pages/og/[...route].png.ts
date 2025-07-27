import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import { loadSiteFonts } from "@lib/fonts";
import { generateOgTemplate } from "@lib/og/template";
import { getRouteConfigForOg } from "@lib/og/utils";

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const route = params.route as string;

    const fonts = await loadSiteFonts();

    const config = await getRouteConfigForOg(route || "");

    const templateProps = {
      title: config.title,
      subtitle: config.subtitle,
      badge: config.badge,
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
  const { getCollection } = await import("astro:content");
  const paths = [];

  paths.push(
    { params: { route: "index" } },
    { params: { route: "blog" } },
    { params: { route: "photography" } },
    { params: { route: "projects" } },
    { params: { route: "now" } },
  );

  try {
    const blogPosts = await getCollection("blog");
    for (const post of blogPosts) {
      if (!post.data.draft) {
        paths.push({
          params: { route: `blog/${post.slug}` },
        });
      }
    }
  } catch (error) {
    console.warn(
      "Error loading content collections for OG static paths:",
      error,
    );
  }

  return paths;
}

export const prerender = true;
