import { getCollection, type CollectionEntry } from "astro:content";
import { parseTags } from "@lib/utils";
import { FEATURES } from "@site";

export type Post = CollectionEntry<"blog">;
export type Note = CollectionEntry<"notes">;

/** One piece of writing, whichever collection it came from. */
export type WritingItem =
  { kind: "post"; entry: Post } | { kind: "note"; entry: Note };

const time = (item: { entry: { data: { date: string | Date } } }) =>
  new Date(item.entry.data.date).valueOf();

export async function getPosts(): Promise<Post[]> {
  if (!FEATURES.blog) return [];
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );
}

export async function getNotes(): Promise<Note[]> {
  if (!FEATURES.notes) return [];
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  return notes.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );
}

/** Posts and notes together, newest first. */
export async function getWriting(): Promise<WritingItem[]> {
  const [posts, notes] = await Promise.all([getPosts(), getNotes()]);
  const items: WritingItem[] = [
    ...posts.map((entry): WritingItem => ({ kind: "post", entry })),
    ...notes.map((entry): WritingItem => ({ kind: "note", entry })),
  ];
  return items.sort((a, b) => time(b) - time(a));
}

export const postHref = (post: Post) => `/blog/${post.id}/`;
export const noteHref = (note: Note) => `/notes/${note.id}/`;
export const itemHref = (item: WritingItem) =>
  item.kind === "post" ? postHref(item.entry) : noteHref(item.entry);

export const itemTags = (item: WritingItem) => parseTags(item.entry.data.tags);

/** The first line of a note as plain text, for notes with no title. */
export function noteExcerpt(body: string | undefined, max = 90): string {
  const text =
    (body ?? "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/[*_`#>~]/g, "")
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "";
  if (text.length <= max) return text;
  // Cut at a word boundary where there is one, so it never ends mid-word.
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** What to call a note in a list: its title, or the start of its text. */
export const noteHeadline = (note: Note) =>
  note.data.title ?? (noteExcerpt(note.body) || "Untitled note");
