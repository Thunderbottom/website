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
          DEFAULT: "#f8fafc", // Slightly lighter for better contrast
          dark: "#0f172a", // Darker for better contrast
        },
        text: {
          primary: {
            DEFAULT: "#0f172a", // Much darker for better contrast (was #1e212b)
            dark: "#f1f5f9", // Lighter for better contrast (was #e2e8f0)
          },
          secondary: {
            DEFAULT: "#475569", // Darker for better contrast (was #64748b)
            dark: "#cbd5e1", // Lighter for better contrast (was #94a3b8)
          },
          muted: {
            DEFAULT: "#64748b", // Darker for better contrast (was #94a3b8)
            dark: "#94a3b8", // Keep as is
          },
        },
        link: {
          DEFAULT: "#1d4ed8", // Darker blue for better contrast (was #1c6ae2)
          dark: "#3b82f6", // Slightly darker blue (was #60a5fa)
        },
        "link-hover": {
          DEFAULT: "#dbeafe", // Keep as is
          dark: "#1e40af", // Darker blue for better contrast
        },
        border: {
          DEFAULT: "#d1d5db", // Slightly darker (was #e2e8f0)
          dark: "#475569", // Lighter for better contrast (was #334155)
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
            "--tw-prose-body": "#0f172a", // Much darker
            "--tw-prose-headings": "#0f172a", // Much darker
            "--tw-prose-links": "#1d4ed8", // Darker blue
            "--tw-prose-code": "#dc2626",
            "--tw-prose-pre-bg": "#f8fafc",
            "--tw-prose-quote-borders": "#d1d5db",
            fontFamily: "Georgia, serif",
            fontSize: "1.25rem",
            lineHeight: "1.7",
            h1: {
              fontFamily: "Playfair Display, serif",
              fontWeight: "600",
              color: "#0f172a", // Ensure headings are dark enough
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
              color: "#dc2626", // Keep red for code
            },
            pre: {
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.875em",
            },
            blockquote: {
              fontStyle: "italic",
              borderLeftColor: "#d1d5db",
              color: "#374151", // Darker for better contrast
            },
            a: {
              textDecoration: "none",
              borderBottom: "1px solid currentColor",
              color: "#1d4ed8", // Darker blue
              "&:hover": {
                backgroundColor: "#dbeafe",
                color: "#1e40af", // Even darker on hover
              },
            },
            strong: {
              color: "#0f172a", // Ensure bold text is dark enough
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body": "#f1f5f9", // Lighter
            "--tw-prose-headings": "#f1f5f9", // Lighter
            "--tw-prose-links": "#3b82f6", // Slightly darker blue
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
              color: "#cbd5e1", // Better contrast
            },
            a: {
              color: "#3b82f6",
              "&:hover": {
                backgroundColor: "#1e40af",
                color: "#f1f5f9",
              },
            },
            strong: {
              color: "#f1f5f9", // Ensure bold text is light enough
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
