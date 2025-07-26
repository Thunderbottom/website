import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import { loadSiteFonts } from "@lib/fonts";
import { generateOgTemplate } from "@lib/og/template";
import { getRouteConfigForOg } from "@lib/og/utils";

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const route = params.route as string;

    // Load fonts
    const fonts = await loadSiteFonts();

    // Get route configuration using shared utility
    const config = await getRouteConfigForOg(route || "");

    const templateProps = {
      title: config.title,
      subtitle: config.subtitle,
      badge: config.badge,
    };

    // Generate SVG
    const svg = await generateOgTemplate(templateProps, fonts);

    // Convert SVG to PNG
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

// For static generation, we can still pre-generate common routes
export async function getStaticPaths() {
  const { getCollection } = await import("astro:content");
  const paths = [];

  // Common page routes that would have OG images
  paths.push(
    { params: { route: "index" } }, // Site root
    { params: { route: "blog" } }, // Blog index
    { params: { route: "photography" } }, // Photography index
    { params: { route: "projects" } }, // Projects index
    { params: { route: "now" } }, // Now page
  );

  try {
    // Add individual blog posts
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
