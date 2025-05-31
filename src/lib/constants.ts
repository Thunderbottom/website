export interface SiteConfig {
  NAME: string;
  EMAIL: string;
  URL: string;
  DOMAIN: string;
  DESCRIPTION: string;
  NUM_POSTS_ON_HOMEPAGE: number;
  NUM_PROJECTS_ON_HOMEPAGE: number;
}

export interface PageConfig {
  TITLE: string;
  DESCRIPTION: string;
}

export interface NavigationItem {
  name: string;
  url: string;
}

export interface SocialLink {
  name: string;
  href: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  date: string;
  demoURL?: string;
  repoURL?: string;
  tags?: string[];
}

// Main site configuration
export const SITE: SiteConfig = {
  NAME: "Chinmay D. Pai",
  EMAIL: "chinmaydpai@gmail.com",
  URL: "https://maych.in",
  DOMAIN: "maych.in",
  DESCRIPTION: "Musings on life, tech, and other interests",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

// Page configurations
export const BLOG: PageConfig = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const NOW: PageConfig = {
  TITLE: "Now",
  DESCRIPTION: "What I'm up to right now.",
};

export const PROJECTS_CONFIG: PageConfig = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of what I have been working on.",
};

export const PHOTOGRAPHY: PageConfig = {
  TITLE: "Photography",
  DESCRIPTION: "A collection of moments straight off the camera.",
};

// Navigation
export const NAVIGATION: NavigationItem[] = [
  { name: "Blog", url: "/blog" },
  { name: "Photos", url: "/photography" },
  { name: "Projects", url: "/projects" },
  { name: "Now", url: "/now" },
];

// Social links
export const SOCIALS: SocialLink[] = [
  { name: "Bsky", href: "https://bsky.app/profile/maych.in" },
  { name: "GitHub", href: "https://github.com/Thunderbottom" },
  { name: "Lobsters", href: "https://lobste.rs/u/Thunderbottom" },
  { name: "Forgejo", href: "https://git.deku.moe" },
];

// Projects data
export const PROJECTS: ProjectItem[] = [
  {
    title: "umami-alerts",
    description:
      "A fast, efficient daily analytics report generator for Umami Analytics.",
    date: "2025-03-01",
    repoURL: "https://github.com/Thunderbottom/umami-alerts",
    tags: ["Rust", "Analytics", "Automation"],
  },
  {
    title: "damon",
    description:
      "A Nomad operator to automate deployment workflows and reduce manual gruntwork.",
    date: "2024-12-01",
    repoURL: "https://github.com/Thunderbottom/damon",
    tags: ["Go", "Nomad", "Automation", "DevOps"],
  },
  {
    title: "NixOS Flakes",
    description:
      "Personal NixOS configuration flakes for reproducible system management.",
    date: "2024-10-15",
    repoURL: "https://git.deku.moe/thunderbottom/flakes",
    tags: ["Nix", "NixOS", "System Configuration"],
  },
];

// NOW data
export interface NowSection {
  title: string;
  items: string[];
}

function createLink(href: string, text: string, external = true): string {
  const target = external ? ' target="_blank"' : "";
  const rel = external ? ' rel="noopener noreferrer"' : "";
  return `<a href="${href}"${target}${rel} class="text-link transition-all duration-200 ease-in-out hover:opacity-80">${text}</a>`;
}

export const NOW_DATA: NowSection[] = [
  {
    title: "Personal",
    items: [
      `Perpetually learning Nix and setting up ${createLink("https://git.deku.moe/thunderbottom/flakes", "NixOS")}.`,
      `Working on ${createLink("https://github.com/Thunderbottom/damon", "damon")} as a Nomad operator.`,
    ],
  },
  {
    title: "Reading",
    items: [
      `${createLink("https://www.goodreads.com/book/show/38485991-the-skeptics-guide-to-the-universe", "The Skeptic's Guide to the Universe")}, by Steven Novella`,
      `${createLink("https://www.goodreads.com/book/show/350.Stranger_in_a_Strange_Land", "Stranger in a Strange Land")}, by Robert A. Heinlein`,
    ],
  },
  {
    title: "Playing",
    items: [
      `${createLink("https://mintrock.et/en/davethediver/platform", "Dave the Diver")} on repeat.`,
    ],
  },
];
