import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { NOTES, SITE } from "@lib/config";
import { getNotes, noteExcerpt, noteHeadline, noteHref } from "@lib/writing";

export const GET: APIRoute = async (context) => {
  const notes = await getNotes();

  return rss({
    title: `${SITE.NAME}: ${NOTES.TITLE}`,
    description: NOTES.DESCRIPTION,
    site: context.site!,
    items: notes.map((note) => ({
      title: noteHeadline(note),
      pubDate: new Date(note.data.date),
      description: noteExcerpt(note.body, 280),
      link: noteHref(note),
    })),
    customData: `<language>${SITE.LANG}</language>`,
  });
};
