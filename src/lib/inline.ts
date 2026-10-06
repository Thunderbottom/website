/** A run of text, optionally a link. */
export interface InlinePart {
  text: string;
  href?: string;
}

/**
 * Splits a line of plain text containing [text](url) links into parts. This is
 * the only markdown allowed in the Now and resume data files.
 */
export function parseInline(source: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const link = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of source.matchAll(link)) {
    if (match.index > last)
      parts.push({ text: source.slice(last, match.index) });
    parts.push({ text: match[1], href: match[2] });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push({ text: source.slice(last) });
  return parts;
}
