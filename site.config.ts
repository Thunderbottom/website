/**
 * Everything personal about the site that isn't a piece of content: who it's
 * for, what it's called, where it lives, how it looks, what's switched on.
 * It's plain data, so it can be read from anywhere (the pages, the build
 * config, the OG image generator).
 *
 * Your writing, photos, projects, resume and homepage text live in
 * src/content/, not here.
 */

export const SITE = {
  /** Shown in the header's tab title, the footer, feeds and share images. */
  NAME: "Chinmay D. Pai",
  /** Public contact address, linked from the footer and the resume. */
  EMAIL: "chinmaydpai@gmail.com",
  /** The address the site is served from, with no trailing slash. */
  URL: "https://maych.in",
  /** Shown on share images and as the home link in the header. */
  DOMAIN: "maych.in",
  /** The one-line description used in search results and share images. */
  DESCRIPTION: "Notes from the intersection of tech and life",
  /** Language of the site's text: <html lang>, feeds. A BCP 47 tag. */
  LANG: "en",
  /** How many pieces of writing the homepage shows (latest post + rows). */
  NUM_POSTS_ON_HOMEPAGE: 3,
  /** How many projects the homepage shows. */
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

/** Each page's heading and the sentence under it (also its search snippet). */
export const PAGES = {
  blog: {
    TITLE: "Blog",
    DESCRIPTION: "A collection of articles on topics I am passionate about.",
  },
  writing: {
    TITLE: "Writing",
    DESCRIPTION: "Long-form posts, and shorter notes in between.",
  },
  notes: {
    TITLE: "Notes",
    DESCRIPTION: "Short thoughts, half-formed ideas and things worth keeping.",
  },
  photography: {
    TITLE: "Photos",
    DESCRIPTION: "A collection of moments straight off the camera.",
  },
  projects: {
    TITLE: "Projects",
    DESCRIPTION: "A collection of what I have been working on.",
  },
  now: {
    TITLE: "Now",
    DESCRIPTION: "What I’m up to right now.",
  },
};

/** Links in the footer, in order. Email is built from SITE.EMAIL. */
export const SOCIALS: { name: string; href: string }[] = [
  { name: "Bluesky", href: "https://bsky.app/profile/maych.in" },
  { name: "GitHub", href: "https://github.com/Thunderbottom" },
  { name: "Lobsters", href: "https://lobste.rs/u/Thunderbottom" },
  { name: "Forgejo", href: "https://git.deku.moe" },
  { name: "Email", href: `mailto:${SITE.EMAIL}` },
];

/** One colour palette. Every colour on the site comes from these. */
export interface Palette {
  /** The page. */
  bg: string;
  /** Code blocks, wells, the image-loading background. */
  bgSunk: string;
  /** Body text and headings. */
  ink: string;
  /** Secondary text. */
  ink2: string;
  /** Dates, labels and annotation. Keep at 4.5:1 or better against `bg`. */
  ink3: string;
  /** Hairlines between rows. */
  rule: string;
  /** Heavier lines. */
  ruleStrong: string;
  /** Borders of things you click. Keep at 3:1 or better against `bg`. */
  control: string;
  /** The one accent: active states, anchors, the reading-progress bar. */
  accent: string;
  /** Text on a filled accent. */
  accentInk: string;
  /** Hover wash. */
  hover: string;
}

export const THEME: { light: Palette; dark: Palette } = {
  light: {
    bg: "#fbfbf9",
    bgSunk: "#f4f4f1",
    ink: "#151514",
    ink2: "#3f3f3c",
    ink3: "#5f5f5a",
    rule: "#e4e4e0",
    ruleStrong: "#c9c9c3",
    control: "#80807a",
    accent: "#c42b1c",
    accentInk: "#ffffff",
    hover: "rgba(0, 0, 0, 0.04)",
  },
  dark: {
    bg: "#121211",
    bgSunk: "#1a1a18",
    ink: "#e9e7e2",
    ink2: "#b9b7b1",
    ink3: "#a09e98",
    rule: "#2a2a28",
    ruleStrong: "#3c3c39",
    control: "#75746e",
    accent: "#ea7664",
    accentInk: "#121211",
    hover: "rgba(255, 255, 255, 0.05)",
  },
};

/**
 * Switch sections on or off. A section that is off is not built at all: no
 * pages, no nav link, no footer link, no feed, no sitemap entry, no share
 * image.
 *
 *  blog         /blog, its posts, and the /rss.xml feed
 *  notes        /notes, its notes, and the /notes/rss.xml feed
 *  photography  /photography, a page per photo, camera and lens filters
 *  projects     /projects
 *  now          /now, and the "Now" block on the homepage
 *  resume       /resume (hidden from search engines), linked from the footer
 *
 * With both blog and notes on, there is also a combined /writing page and the
 * nav says "Writing". With only one, the nav links straight to it. Tag pages
 * exist while either is on.
 */
export const FEATURES = {
  blog: true,
  notes: true,
  photography: true,
  projects: true,
  now: true,
  resume: true,
};
