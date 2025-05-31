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

// Build configuration optimized for static sites
const buildConfig = {
  inlineStylesheets: "auto",
  splitting: true,
};

// Image optimization configuration - WebP only for performance
const imageConfig = {
  domains: ["maych.in"],
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.maych.in",
    },
  ],
  service: {
    entrypoint: "astro/assets/services/sharp",
    config: {
      limitInputPixels: 268402689, // ~16K x 16K images
      // Optimize for WebP only
      webp: {
        quality: 85,
        effort: 6,
      },
    },
  },
};

// Vite configuration optimized for static builds
const viteConfig = {
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) {
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
    // Enable CSS code splitting for better performance
    cssCodeSplit: true,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Production minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
      format: {
        comments: false, // Remove comments
      },
    },
    // Enable source maps for debugging in development only
    sourcemap: process.env.NODE_ENV === "development",
  },

  // Development server configuration
  server: {
    fs: {
      strict: false,
    },
    host: true, // Allow external connections
  },

  // Production optimizations
  define: {
    __DEV__: process.env.NODE_ENV === "development",
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "astro/assets",
      "exifr", // Pre-bundle EXIF reader for photography pages
    ],
    exclude: [
      "@astrojs/image", // Legacy image handling
    ],
  },
};

// Prefetch configuration for better performance
const prefetchConfig = {
  prefetchAll: true,
  defaultStrategy: "viewport", // Prefetch when links enter viewport
};

export default defineConfig({
  site: "https://maych.in",

  // Pure static site generation
  output: "static",

  integrations: [
    astroExpressiveCode(expressiveCodeConfig),
    mdx(),
    tailwind(tailwindConfig),
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [], // No restrictions for static sites
        },
      ],
      sitemap: true,
    }),
    sitemap({
      // Generate sitemap with proper priorities
      customPages: [
        "https://maych.in/",
        "https://maych.in/blog/",
        "https://maych.in/photography/",
        "https://maych.in/projects/",
      ],
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  markdown: markdownConfig,
  build: buildConfig,
  image: imageConfig,
  vite: viteConfig,

  // Enable HTML compression for production
  compressHTML: true,

  // Configure prefetching for better performance
  prefetch: prefetchConfig,

  // Performance monitoring (enable in development)
  devToolbar: {
    enabled: process.env.NODE_ENV === "development",
  },
});
