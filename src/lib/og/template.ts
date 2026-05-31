import satori from "satori";
import { SITE } from "@lib/config";
import type { FontData } from "@lib/fonts";

export interface OgTemplateProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

const INK = "#000000";
const PAPER = "#ffffff";
const MUTED = "#666666";
const ACCENT = "#C42B1C";
const RULE = "#e0e0e0";

function titleFontSize(title: string): string {
  if (title.length > 55) return "42px";
  if (title.length > 28) return "54px";
  return "64px";
}

export async function generateOgTemplate(
  props: OgTemplateProps,
  fonts: FontData[],
): Promise<string> {
  const { title, subtitle, badge } = props;

  const fontName = fonts.find((f) => f.name === "Atkinson Hyperlegible Next")
    ? "Atkinson Hyperlegible Next"
    : "sans-serif";

  const monoName = fonts.find((f) => f.name === "Commit Mono")
    ? "Commit Mono"
    : fontName;

  return await satori(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPER,
        },
        children: [
          // Editorial red rule — full-width top stroke
          {
            type: "div",
            props: {
              style: {
                width: "100%",
                height: "3px",
                backgroundColor: ACCENT,
                flexShrink: "0",
              },
            },
          },
          // Main content — title centered in upper zone
          {
            type: "div",
            props: {
              style: {
                flex: "1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "52px 64px 36px",
              },
              children: [
                // Title
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: titleFontSize(title),
                      fontWeight: "700",
                      fontFamily: fontName,
                      color: INK,
                      lineHeight: "1.2",
                      marginBottom: subtitle ? "20px" : "0px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: "3",
                    },
                    children: title,
                  },
                },
                // Subtitle
                ...(subtitle
                  ? [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "22px",
                            fontWeight: "400",
                            fontFamily: fontName,
                            color: MUTED,
                            lineHeight: "1.55",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: "2",
                          },
                          children: subtitle,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
          // Colophon — domain + badge at bottom
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                flexShrink: "0",
                padding: "0px 64px 44px",
              },
              children: [
                // Rule
                {
                  type: "div",
                  props: {
                    style: {
                      width: "100%",
                      height: "1px",
                      backgroundColor: RULE,
                      marginBottom: "20px",
                    },
                  },
                },
                // Domain + badge row
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                    children: [
                      // Domain
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "18px",
                            fontWeight: "700",
                            fontFamily: fontName,
                            color: INK,
                          },
                          children: SITE.DOMAIN,
                        },
                      },
                      // Badge — only when present
                      badge
                        ? {
                            type: "div",
                            props: {
                              style: {
                                fontSize: "11px",
                                fontWeight: "400",
                                fontFamily: monoName,
                                color: ACCENT,
                                border: `1px solid ${ACCENT}`,
                                padding: "5px 14px",
                                letterSpacing: "0.08em",
                              },
                              children: badge,
                            },
                          }
                        : { type: "div", props: { style: {}, children: "" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts:
        fonts && fonts.length > 0
          ? fonts.map((f) => ({
              name: f.name,
              data: f.data,
              weight: f.weight,
              style: f.style,
            }))
          : [],
    },
  );
}
