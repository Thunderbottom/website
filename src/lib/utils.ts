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
  return items.sort((a, b) => {
    const dateA = "data" in a && a.data?.date ? a.data.date : (a as any).date;
    const dateB = "data" in b && b.data?.date ? b.data.date : (b as any).date;

    return new Date(dateB).valueOf() - new Date(dateA).valueOf();
  });
}

/**
 * Escape HTML special characters for safe attribute and content usage
 */
export function escapeHtml(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
