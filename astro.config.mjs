import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/utils/remark-reading-time.js";

// Astro integrations
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

// Expressive Code
import astroExpressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

// Expressive Code configuration
const expressiveCodeConfig = {
  defaultProps: {
    showLineNumbers: false,
  },
  // minSyntaxHighlightingColorContrast: 0,
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
  themes: ["github-light", "github-dark-dimmed"],
  styleOverrides: {
    frames: {
      shadowColor: "transparent",
    },
    codeFontFamily: "var(--font-mono)",
    borderRadius: "0.5rem",
  },
  useThemedScrollbars: false,
};

// Tailwind configuration
const tailwindConfig = {
  applyBaseStyles: false,
};

// Markdown configuration
const markdownConfig = {
  remarkPlugins: [remarkReadingTime],
  smartypants: true,
};

// Build configuration
const buildConfig = {
  format: "directory",
  assets: "_astro",
  inlineStylesheets: "auto",
};

// Vite configuration
const viteConfig = {
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
};

// Prefetch configuration
const prefetchConfig = {
  prefetchAll: true,
  defaultStrategy: "viewport",
};

export default defineConfig({
  site: "https://maych.in",

  integrations: [
    astroExpressiveCode(expressiveCodeConfig),
    mdx(),
    tailwind(tailwindConfig),
    robotsTxt(),
    sitemap(),
  ],

  markdown: markdownConfig,
  build: buildConfig,
  vite: viteConfig,
  compressHTML: true,
  prefetch: prefetchConfig,
});
