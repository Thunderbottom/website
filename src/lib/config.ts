import {
  FEATURES,
  PAGES,
  SITE as SITE_CONFIG,
  SOCIALS as SOCIAL_LINKS,
} from "@site";

export interface PageConfig {
  TITLE: string;
  DESCRIPTION: string;
}

export interface NavigationItem {
  name: string;
  url: string;
  /** Path prefixes that light this item up (defaults to `url`). */
  match?: string[];
}

export interface SocialLink {
  name: string;
  href: string;
}

// The settings themselves live in site.config.ts; they're re-exported here so
// the rest of the code has one place to import them from.
export const SITE = SITE_CONFIG;
export const SOCIALS: SocialLink[] = SOCIAL_LINKS;
export const BLOG: PageConfig = PAGES.blog;
export const WRITING: PageConfig = PAGES.writing;
export const NOTES: PageConfig = PAGES.notes;
export const PHOTOGRAPHY: PageConfig = PAGES.photography;
export const PROJECTS_CONFIG: PageConfig = PAGES.projects;
export const NOW: PageConfig = PAGES.now;

/**
 * Where all the writing lives: the combined page when blog and notes are both
 * on, otherwise whichever one is. Undefined when neither is.
 */
export const WRITING_HOME = FEATURES.blog
  ? FEATURES.notes
    ? "/writing"
    : "/blog"
  : FEATURES.notes
    ? "/notes"
    : undefined;

// The nav follows FEATURES. Writing is one item when both kinds exist.
const writingNav: NavigationItem | undefined =
  WRITING_HOME === "/writing"
    ? {
        name: "Writing",
        url: "/writing",
        match: ["/writing", "/blog", "/notes"],
      }
    : WRITING_HOME === "/blog"
      ? { name: "Blog", url: "/blog" }
      : WRITING_HOME === "/notes"
        ? { name: "Notes", url: "/notes" }
        : undefined;

export const NAVIGATION: NavigationItem[] = [
  writingNav,
  FEATURES.photography && { name: "Photos", url: "/photography" },
  FEATURES.projects && { name: "Projects", url: "/projects" },
  FEATURES.now && { name: "Now", url: "/now" },
].filter((item): item is NavigationItem => Boolean(item));

export interface PhotoGroup {
  key: string;
  label: string;
  /** Photos in the whole year, not just the ones loaded so far. */
  count?: number;
}

export function getPhotoGroup(date: Date | string): PhotoGroup {
  const year =
    typeof date === "string" ? date.slice(0, 4) : String(date.getFullYear());
  return { key: year, label: year };
}

export const IMAGE_SETTINGS = {
  THUMBNAIL: {
    WIDTH: 1200,
    QUALITY: 65,
    FORMAT: "avif" as const,
  },
  FULL: {
    WIDTH: 2400,
    QUALITY: 75,
    FORMAT: "avif" as const,
  },
} as const;

export function formatDate(date: Date | string, format = "%B %d, %Y"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formatMap = {
    "%Y": dateObj.getFullYear().toString(),
    "%m": String(dateObj.getMonth() + 1).padStart(2, "0"),
    "%d": String(dateObj.getDate()).padStart(2, "0"),
    "%B": new Intl.DateTimeFormat("en-US", { month: "long" }).format(dateObj),
    "%b": new Intl.DateTimeFormat("en-US", { month: "short" }).format(dateObj),
    "%H": String(dateObj.getHours()).padStart(2, "0"),
    "%M": String(dateObj.getMinutes()).padStart(2, "0"),
    "%S": String(dateObj.getSeconds()).padStart(2, "0"),
  };

  return format.replace(
    /%[YmdBbHMS]/g,
    (matched) => formatMap[matched as keyof typeof formatMap] || matched,
  );
}
