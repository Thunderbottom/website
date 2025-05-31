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

// Build configuration
const buildConfig = {
  format: "directory",
  assets: "_astro",
  inlineStylesheets: "auto",
  splitting: true,
};

// Image optimization configuration
const imageConfig = {
  domains: ["maych.in"],
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.maych.in",
    },
  ],
  // Enable image optimization service
  service: {
    entrypoint: "astro/assets/services/sharp",
    config: {
      limitInputPixels: 268402689, // ~16K x 16K images
    },
  },
};

// Vite configuration
const viteConfig = {
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
            return `assets/images/[name].[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name].[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `assets/styles/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
        chunkFileNames: "assets/js/[name].[hash].js",
        entryFileNames: "assets/js/[name].[hash].js",
        // Optimize chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("preact")) {
              return "vendor-react";
            }
            if (id.includes("astro")) {
              return "vendor-astro";
            }
            return "vendor";
          }

          // Photo-related code
          if (id.includes("photo") || id.includes("lightbox")) {
            return "photo-features";
          }

          // Core app functionality
          if (id.includes("src/components") || id.includes("src/layouts")) {
            return "app-components";
          }
        },
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

    // Enable source maps for debugging (set to false for production)
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
      // Pre-bundle commonly used dependencies
      "astro/assets",
    ],
    exclude: [
      // Don't pre-bundle large or problematic dependencies
      "@astrojs/image",
    ],
  },
};

// Security configuration
const securityConfig = {
  // Enable origin checking for SSR routes
  checkOrigin: true,
};

// Prefetch configuration for better performance
const prefetchConfig = {
  prefetchAll: true,
  defaultStrategy: "viewport", // Prefetch when links enter viewport
};

// Redirects configuration
const redirectsConfig = {
  // Add any URL redirects here
  // '/old-path': '/new-path',
};

export default defineConfig({
  site: "https://maych.in",

  // Static site generation with selective SSR
  // API routes will use SSR via prerender: false
  output: "static",

  // Security configuration
  security: securityConfig,

  integrations: [
    astroExpressiveCode(expressiveCodeConfig),
    mdx(),
    tailwind(tailwindConfig),
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/*"], // Don't crawl API routes
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
      filter: (page) => {
        // Exclude API routes from sitemap
        return !page.includes("/api/");
      },
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

  // Add redirects if needed
  redirects: redirectsConfig,

  // Performance monitoring (enable in development)
  devToolbar: {
    enabled: process.env.NODE_ENV === "development",
  },
});
