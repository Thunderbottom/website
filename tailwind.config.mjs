import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        serif: ["Georgia", ...defaultTheme.fontFamily.serif],
        display: ["Playfair Display", ...defaultTheme.fontFamily.serif],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        background: {
          DEFAULT: "#f4f4f5",
          dark: "#0f0f19",
        },
        text: {
          primary: {
            DEFAULT: "#1e212b",
            dark: "#e2e8f0",
          },
          secondary: {
            DEFAULT: "#64748b",
            dark: "#94a3b8",
          },
          muted: {
            DEFAULT: "#94a3b8",
            dark: "#64748b",
          },
        },
        link: {
          DEFAULT: "#1c6ae2",
          dark: "#60a5fa",
        },
        "link-hover": {
          DEFAULT: "#dbe8f6",
          dark: "#1e3a8a",
        },
        border: {
          DEFAULT: "#e2e8f0",
          dark: "#334155",
        },
        card: {
          DEFAULT: "#ffffff",
          dark: "#1e293b",
        },
      },
      maxWidth: {
        content: "42rem",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            "--tw-prose-body": "#1e212b",
            "--tw-prose-headings": "#1e212b",
            "--tw-prose-links": "#1c6ae2",
            "--tw-prose-code": "#dc2626",
            "--tw-prose-pre-bg": "#fafafa",
            "--tw-prose-quote-borders": "#e2e8f0",
            fontFamily: "Georgia, serif",
            fontSize: "1.25rem",
            lineHeight: "1.7",
            h1: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
            },
            h2: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              borderBottomWidth: "1px",
              borderBottomColor: "#e2e8f0",
              paddingBottom: "0.5rem",
            },
            h3: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
            },
            h4: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
            },
            h5: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
            },
            h6: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
            },
            code: {
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.875em",
              fontWeight: "400",
            },
            pre: {
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.875em",
            },
            blockquote: {
              fontStyle: "italic",
              borderLeftColor: "#e2e8f0",
            },
            a: {
              textDecoration: "none",
              borderBottom: "1px solid currentColor",
              "&:hover": {
                backgroundColor: "#dbe8f6",
              },
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body": "#e2e8f0",
            "--tw-prose-headings": "#e2e8f0",
            "--tw-prose-links": "#60a5fa",
            "--tw-prose-code": "#f87171",
            "--tw-prose-pre-bg": "#1e293b",
            "--tw-prose-quote-borders": "#334155",
            h2: {
              borderBottomColor: "#334155",
            },
            blockquote: {
              borderLeftColor: "#334155",
            },
            a: {
              "&:hover": {
                backgroundColor: "#1e3a8a",
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
