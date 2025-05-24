import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./src/utils/remark-reading-time.js";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://maych.in",
  integrations: [
    mdx(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
    smartypants: true,
  },
  build: {
    format: "directory",
    assets: "_astro", // Organize built assets
    inlineStylesheets: "auto", // Inline small CSS files automatically
  },
  vite: {
    build: {
      // Optimize bundle splitting
      rollupOptions: {
        output: {
          // Add content hashes for cache busting
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split(".").pop();
            // Organize assets by type for better caching
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
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
    },
    server: {
      // Development optimizations
      fs: {
        strict: false,
      },
    },
  },
  // Enable compression
  compressHTML: true,
  // Prefetch settings for better navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
