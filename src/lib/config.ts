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
  websiteURL?: string;
  tags?: string[];
}

// Main site configuration
export const SITE: SiteConfig = {
  NAME: "Chinmay D. Pai",
  EMAIL: "chinmaydpai@gmail.com",
  URL: "https://maych.in",
  DOMAIN: "maych.in",
  DESCRIPTION: "Notes from the intersection of tech and life",
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
  { name: "Email", href: `mailto:${SITE.EMAIL}` },
];

// Projects data
export const PROJECTS: ProjectItem[] = [
  {
    title: "kiln",
    description:
      "Encrypt, share, and run with secure environment variables from the command line ",
    date: "2025-07-10",
    repoURL: "https://github.com/Thunderbottom/kiln",
    websiteURL: "https://kiln.sh",
    tags: ["Go", "Encryption", "Secrets Manager"],
  },
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
    tags: ["Go", "Nomad", "Automation"],
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
      `Working on ${createLink("https://github.com/Thunderbottom/kiln", "kiln")}, an encrypted environment variables manager.`,
    ],
  },
  {
    title: "Reading",
    items: [
      `${createLink("https://www.goodreads.com/book/show/34376766-blood-sweat-and-pixels", "Blood, Sweat, and Pixels")}, by Jason Schreier`,
      `${createLink("https://www.goodreads.com/book/show/350.Stranger_in_a_Strange_Land", "Stranger in a Strange Land")}, by Robert A. Heinlein`,
    ],
  },
  {
    title: "Playing",
    items: [],
  },
];

// Image optimization settings
export const IMAGE_SETTINGS = {
  THUMBNAIL: {
    WIDTH: 800,
    QUALITY: 75,
    FORMAT: "webp" as const,
  },
  LIGHTBOX: {
    WIDTH: 1280,
    QUALITY: 85,
    FORMAT: "webp" as const,
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
