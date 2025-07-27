import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@lib/config";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const blog = await getCollection("blog", ({ data }) => {
    return !data.draft;
  });

  const sortedPosts = blog.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  return rss({
    title: SITE.NAME,
    description: SITE.DESCRIPTION,
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description || post.data.summary || "",
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en</language>`,
  });
};
