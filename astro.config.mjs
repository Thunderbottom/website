import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/utils/remark-reading-time.ts";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import astroExpressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

export default defineConfig({
  site: "http://localhost:4321",
  output: "static",

  integrations: [
    astroExpressiveCode({
      defaultProps: {
        showLineNumbers: false,
      },
      plugins: [pluginLineNumbers()],
      themeCssSelector(theme, { styleVariants }) {
        if (styleVariants.length >= 2) {
          const baseTheme = styleVariants[0]?.theme;
          const altTheme = styleVariants.find(
            (v) => v.theme.type !== baseTheme?.type,
          )?.theme;
          if (theme === baseTheme || theme === altTheme)
            return `[data-theme='${theme.type}']`;
        }
        return `[data-theme="${theme.name}"]`;
      },
      themes: ["vitesse-light", "vitesse-dark"],
      styleOverrides: {
        borderColor: ({ theme }) =>
          theme.type === "dark" ? "#2a2a2a" : "#e5e5e5",
        frames: {
          shadowColor: "transparent",
        },
        codeFontFamily: "Commit Mono, SF Mono, Monaco, Menlo, monospace",
        uiFontFamily: "Commit Mono, SF Mono, Monaco, Menlo, monospace",
        borderRadius: "0",
      },
      useThemedScrollbars: false,
    }),
    mdx(),
    tailwind({
      applyBaseStyles: false,
    }),
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [],
        },
      ],
      sitemap: true,
    }),
    sitemap(),
  ],

  markdown: {
    remarkPlugins: [remarkReadingTime],
    smartypants: true,
  },

  image: {
    domains: ["maych.in"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.maych.in",
      },
    ],
  },

  vite: {
    server: {
      host: true,
    },
  },

  compressHTML: true,
});
