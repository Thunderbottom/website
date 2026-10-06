import getReadingTime from "reading-time";

/**
 * Estimate reading time from a raw Markdown/MDX body.
 */
export function getBodyReadingTime(body?: string): string {
  if (!body) return "1 min read";
  return getReadingTime(body).text;
}

function extractDate(item: {
  data?: { date: string | Date };
  date?: string | Date;
}): string | Date {
  return item.data?.date ?? item.date ?? new Date(0);
}

/**
 * Sort items by date in descending order (most recent first)
 */
export function sortByDateDesc<T extends { data: { date: string | Date } }>(
  items: T[],
): T[];
export function sortByDateDesc<T extends { date: string | Date }>(
  items: T[],
): T[];
export function sortByDateDesc<
  T extends { data?: { date: string | Date }; date?: string | Date },
>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(extractDate(b)).valueOf() - new Date(extractDate(a)).valueOf(),
  );
}

/**
 * Parse a comma-separated tag string into an array of trimmed tag names.
 */
export function parseTags(tags?: string): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Convert a tag name to a URL-safe slug.
 */
export function tagToSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, "-");
}
