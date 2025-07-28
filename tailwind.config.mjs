import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  safelist: ["message-note", "message-warning", "message-tip", "message-info"],
  corePlugins: {
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Atkinson Hyperlegible Next", "system-ui", "sans-serif"],
        display: ["Atkinson Hyperlegible Next", "system-ui", "sans-serif"],
        mono: ["Commit Mono", "SF Mono", "Monaco", "Menlo", "monospace"],
      },
      colors: {
        background: {
          DEFAULT: "#ffffff",
          dark: "#111111",
        },
        text: {
          primary: {
            DEFAULT: "#000000",
            dark: "#e5e5e5",
          },
          secondary: {
            DEFAULT: "#333333",
            dark: "#aaaaaa",
          },
          muted: {
            DEFAULT: "#666666",
            dark: "#808080",
          },
        },
        link: {
          DEFAULT: "#000000",
          dark: "#ffffff",
        },
        "link-hover": {
          DEFAULT: "#000000",
          dark: "#ffffff",
        },
        "card-hover": {
          DEFAULT: "#f5f5f5",
          dark: "#1a1a1a",
        },
        border: {
          DEFAULT: "#e0e0e0",
          dark: "#2a2a2a",
        },
        card: {
          DEFAULT: "#fafafa",
          dark: "#1f1f1f",
        },
      },
      maxWidth: {
        content: "42rem",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            "--tw-prose-body": "#000000",
            "--tw-prose-headings": "#000000",
            "--tw-prose-links": "#000000",
            "--tw-prose-code": "#000000",
            "--tw-prose-pre-bg": "#fafafa",
            "--tw-prose-quote-borders": "#e5e5e5",
            fontFamily: "Atkinson Hyperlegible Next, sans-serif",
            fontSize: "1.125rem",
            lineHeight: "1.5",
            h1: {
              fontFamily: "Atkinson Hyperlegible Next, sans-serif",
              fontWeight: "700",
              color: "#000000",
            },
            h2: {
              fontFamily: "Atkinson Hyperlegible Next, sans-serif",
              fontWeight: "700",
              borderBottomWidth: "1px",
              borderBottomColor: "#e5e5e5",
              paddingBottom: "0.5rem",
              color: "#000000",
            },
            h3: {
              fontFamily: "Atkinson Hyperlegible Next, sans-serif",
              fontWeight: "600",
              color: "#000000",
            },
            h4: {
              fontFamily: "Atkinson Hyperlegible Next, sans-serif",
              fontWeight: "600",
              color: "#000000",
            },
            h5: {
              fontFamily: "Atkinson Hyperlegible Next, sans-serif",
              fontWeight: "600",
              color: "#000000",
            },
            h6: {
              fontFamily: "Atkinson Hyperlegible Next, sans-serif",
              fontWeight: "600",
              color: "#000000",
            },
            code: {
              fontFamily: "Commit Mono, SF Mono, Monaco, Menlo, monospace",
              fontSize: "0.85rem !important",
              fontWeight: "400",
              color: "#000000",
              backgroundColor: "transparent",
              border: "1px solid #000000",
              padding: "0.025rem 0.25rem",
              margin: "3px",
              borderRadius: "0",
              "&::before": {
                display: "none",
              },
              "&::after": {
                display: "none",
              },
            },
            pre: {
              fontFamily: "Commit Mono, SF Mono, Monaco, Menlo, monospace",
              fontSize: "0.85rem",
              backgroundColor: "#f5f5f5",
              border: "1px solid #e5e5e5",
            },
            blockquote: {
              fontStyle: "italic",
              fontWeight: "400",
              border: "1px solid #000000",
              "& p": {
                color: "#666666",
              },
              backgroundColor: "#fefefe",
              padding: "1rem",
              borderRadius: "0",
            },
            a: {
              color: "#000000",
              textDecoration: "underline",
              textDecorationThickness: "2px",
              textUnderlineOffset: "2px",
              textDecorationSkipInk: "auto",
              "&:hover": {
                backgroundColor: "#000000",
                color: "#ffffff",
                textDecoration: "none",
                padding: "0.0625rem 0.1875rem",
                margin: "-0.0625rem -0.1875rem",
                "& code": {
                  backgroundColor: "transparent",
                  color: "#ffffff",
                },
              },
            },
            strong: {
              color: "#000000",
              fontWeight: "700",
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body": "#ffffff",
            "--tw-prose-headings": "#ffffff",
            "--tw-prose-links": "#ffffff",
            "--tw-prose-code": "#ffffff",
            "--tw-prose-pre-bg": "#1f1f1f",
            "--tw-prose-quote-borders": "#333333",
            h1: { color: "#ffffff" },
            h2: {
              borderBottomColor: "#333333",
              color: "#ffffff",
            },
            h3: { color: "#ffffff" },
            h4: { color: "#ffffff" },
            h5: { color: "#ffffff" },
            h6: { color: "#ffffff" },
            blockquote: {
              borderLeftColor: "#333333",
              color: "#cccccc",
              backgroundColor: "#111111",
            },
            code: {
              fontFamily: "Commit Mono, SF Mono, Monaco, Menlo, monospace",
              backgroundColor: "transparent",
              border: "1px solid #ffffff",
              color: "#ffffff",
              padding: "0.025rem 0.25rem",
              margin: "3px",
              borderRadius: "0",
              fontSize: "0.85rem !important",
              fontWeight: "400",
              "&::before": {
                content: '""',
                display: "none",
              },
              "&::after": {
                content: '""',
                display: "none",
              },
            },
            pre: {
              fontFamily: "Commit Mono, SF Mono, Monaco, Menlo, monospace",
              fontSize: "0.65rem",
              backgroundColor: "#1f1f1f",
              border: "1px solid #2a2a2a",
            },
            a: {
              color: "#ffffff",
              textDecoration: "underline",
              textDecorationThickness: "2px",
              textUnderlineOffset: "2px",
              textDecorationSkipInk: "auto",
              "&:hover": {
                backgroundColor: "#ffffff",
                color: "#000000",
                textDecoration: "none",
                padding: "0.0625rem 0.1875rem",
                margin: "-0.0625rem -0.1875rem",
                "& code": {
                  backgroundColor: "transparent",
                  color: "#000000",
                },
              },
            },
            strong: {
              color: "#ffffff",
              fontWeight: "700",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography")({
      modifiers: ["lg", "sm"],
    }),
  ],
};
