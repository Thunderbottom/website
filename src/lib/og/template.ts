/**
 * OG image template based on astro-paper design
 */

import satori from "satori";
import { SITE } from "@lib/config";
import type { FontData } from "@lib/fonts";

export interface OgTemplateProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export async function generateOgTemplate(
  props: OgTemplateProps,
  fonts: FontData[],
): Promise<string> {
  const { title, subtitle, badge } = props;

  const font = fonts.find((f) => f.name === "Atkinson Hyperlegible Next")
    ? "Atkinson Hyperlegible Next"
    : "sans-serif";

  return await satori(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fefbfb",
          position: "relative",
        },
        children: [
          // Main container with layered design
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                position: "relative",
              },
              children: [
                // Background layer
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      width: "95%",
                      height: "90%",
                      backgroundColor: "#ecebeb",
                      border: "4px solid #000",
                      top: "5%",
                      left: "2.5%",
                    },
                  },
                },
                // Foreground content layer
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      width: "90%",
                      height: "85%",
                      backgroundColor: "#fefbfb",
                      border: "4px solid #000",
                      top: "7.5%",
                      left: "5%",
                      display: "flex",
                      flexDirection: "column",
                      padding: "60px 60px 40px 60px",
                    },
                    children: [
                      // Header with badge
                      badge && {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            justifyContent: "flex-end",
                            marginBottom: "40px",
                          },
                          children: [
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  color: "#000000",
                                  fontFamily: font,
                                  padding: "6px 12px",
                                  border: "2px solid #000000",
                                  backgroundColor: "#fefbfb",
                                  textTransform: "uppercase",
                                },
                                children: badge,
                              },
                            },
                          ],
                        },
                      },
                      // Main content
                      {
                        type: "div",
                        props: {
                          style: {
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          },
                          children: [
                            // Title
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize:
                                    title.length > 60
                                      ? "42px"
                                      : title.length > 30
                                        ? "48px"
                                        : "56px",
                                  fontWeight: "700",
                                  color: "#000000",
                                  fontFamily: font,
                                  marginBottom: subtitle ? "32px" : "0px",
                                  overflow: "hidden",
                                },
                                children: title,
                              },
                            },
                            // Subtitle
                            subtitle && {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: "28px",
                                  color: "#555555",
                                  fontFamily: font,
                                  fontWeight: "400",
                                  overflow: "hidden",
                                },
                                children: subtitle,
                              },
                            },
                          ].filter(Boolean),
                        },
                      },
                      // Footer with author/site
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginTop: "32px",
                          },
                          children: [
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: "28px",
                                  fontWeight: "700",
                                  color: "#000000",
                                  fontFamily: font,
                                },
                                children: SITE.DOMAIN,
                              },
                            },
                          ],
                        },
                      },
                    ].filter(Boolean),
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
          ? fonts.map((font) => ({
              name: font.name,
              data: font.data,
              weight: font.weight,
              style: font.style,
            }))
          : [],
    },
  );
}
