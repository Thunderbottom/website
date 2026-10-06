import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import astroExpressiveCode from "astro-expressive-code";
import compressor from "astro-compressor";
import features from "./src/integrations/features.ts";
import { SITE } from "./site.config.ts";

export default defineConfig({
  site: SITE.URL,
  output: "static",

  integrations: [
    features(),
    astroExpressiveCode({
      defaultProps: {
        showLineNumbers: false,
      },
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
        codeFontSize: "0.875rem",
        codeLineHeight: "1.5",
        uiFontSize: "0.75rem",
        uiFontFamily: "Commit Mono, SF Mono, Monaco, Menlo, monospace",
        borderRadius: "0",
      },
      useThemedScrollbars: false,
    }),
    mdx(),
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
    // /resume is noindex, so it stays out of the sitemap too.
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/resume"),
    }),
    compressor({
      gzip: true,
      brotli: true,
    }),
  ],

  vite: {
    server: {
      host: true,
    },
    css: {
      postcss: "./postcss.config.mjs",
    },
    build: {
      // Vite 8 minifies CSS with Lightning CSS by default, which drops the
      // standard backdrop-filter when a -webkit- one sits beside it (so the
      // header glass vanished in Chrome and Firefox). esbuild keeps both.
      cssMinify: "esbuild",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },

  build: {
    inlineStylesheets: "never",
  },

  compressHTML: true,
});
