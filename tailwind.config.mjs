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
          DEFAULT: "#f8fafc",
          dark: "#0f0f19",
        },
        text: {
          primary: {
            DEFAULT: "#0f172a",
            dark: "#f1f5f9",
          },
          secondary: {
            DEFAULT: "#475569",
            dark: "#cbd5e1",
          },
          muted: {
            DEFAULT: "#64748b",
            dark: "#94a3b8",
          },
        },
        link: {
          DEFAULT: "#1d4ed8",
          dark: "#3b82f6",
        },
        "link-hover": {
          DEFAULT: "#dbeafe",
          dark: "#1e40af",
        },
        border: {
          DEFAULT: "#d1d5db",
          dark: "#475569",
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
            "--tw-prose-body": "#0f172a",
            "--tw-prose-headings": "#0f172a",
            "--tw-prose-links": "#1d4ed8",
            "--tw-prose-code": "#dc2626",
            "--tw-prose-pre-bg": "#f8fafc",
            "--tw-prose-quote-borders": "#d1d5db",
            fontFamily: "Georgia, serif",
            fontSize: "1.25rem",
            lineHeight: "1.7",
            h1: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              color: "#0f172a",
            },
            h2: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              borderBottomWidth: "1px",
              borderBottomColor: "#d1d5db",
              paddingBottom: "0.5rem",
              color: "#0f172a",
            },
            h3: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              color: "#0f172a",
            },
            h4: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              color: "#0f172a",
            },
            h5: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              color: "#0f172a",
            },
            h6: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              color: "#0f172a",
            },
            code: {
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.875em",
              fontWeight: "400",
              color: "#dc2626",
            },
            pre: {
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.875em",
            },
            blockquote: {
              fontStyle: "italic",
              borderLeftColor: "#d1d5db",
              color: "#374151",
            },
            a: {
              textDecoration: "none",
              borderBottom: "1px solid currentColor",
              color: "#1d4ed8",
              "&:hover": {
                backgroundColor: "#dbeafe",
                color: "#1e40af",
              },
            },
            strong: {
              color: "#0f172a",
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body": "#f1f5f9",
            "--tw-prose-headings": "#f1f5f9",
            "--tw-prose-links": "#3b82f6",
            "--tw-prose-code": "#f87171",
            "--tw-prose-pre-bg": "#1e293b",
            "--tw-prose-quote-borders": "#475569",
            h1: { color: "#f1f5f9" },
            h2: {
              borderBottomColor: "#475569",
              color: "#f1f5f9",
            },
            h3: { color: "#f1f5f9" },
            h4: { color: "#f1f5f9" },
            h5: { color: "#f1f5f9" },
            h6: { color: "#f1f5f9" },
            blockquote: {
              borderLeftColor: "#475569",
              color: "#cbd5e1",
            },
            a: {
              color: "#3b82f6",
              "&:hover": {
                backgroundColor: "#1e40af",
                color: "#f1f5f9",
              },
            },
            strong: {
              color: "#f1f5f9",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
