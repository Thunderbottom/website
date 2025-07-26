import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";
import type { Root } from "mdast";

interface RemarkData {
  astro: {
    frontmatter: {
      minutesRead?: string;
      [key: string]: any;
    };
  };
}

export function remarkReadingTime() {
  return function (tree: Root, { data }: { data: RemarkData }): void {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);

    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
