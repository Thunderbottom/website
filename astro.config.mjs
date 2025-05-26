import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/utils/remark-reading-time.js";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

import robotsTxt from "astro-robots-txt";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://maych.in",
  integrations: [expressiveCode({
    defaultProps: {
      showLineNumbers: false,
    },
    minSyntaxHighlightingColorContrast: 0,
    plugins: [pluginLineNumbers()],
    themeCssSelector(theme, { styleVariants }) {
      // If one dark and one light theme are available
      // generate theme CSS selectors
      if (styleVariants.length >= 2) {
        const baseTheme = styleVariants[0]?.theme;
        const altTheme = styleVariants.find(
          (v) => v.theme.type !== baseTheme?.type,
        )?.theme;
        if (theme === baseTheme || theme === altTheme)
          return `[data-theme='${theme.type}']`;
      }
      // return default selector
      return `[data-theme="${theme.name}"]`;
    },
    themes: ["one-light", "one-dark-pro"],
    styleOverrides: {
      frames: {
        shadowColor: "none !important"
      },
      codeFontFamily: "var(--font-mono)",
    },
    useThemedScrollbars: false,
  }), mdx(), tailwind({
    applyBaseStyles: false,
  }), robotsTxt(), sitemap()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    smartypants: true,
  },
  build: {
    format: "directory",
    assets: "_astro",
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split(".").pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name].[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name].[hash][extname]`;
            }
            return `assets/[name].[hash][extname]`;
          },
          chunkFileNames: "assets/js/[name].[hash].js",
          entryFileNames: "assets/js/[name].[hash].js",
        },
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
    server: {
      fs: {
        strict: false,
      },
    },
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});