import satori from "satori";
import { SITE } from "@lib/config";
import { THEME } from "@site";
import type { FontData } from "@lib/fonts";

export interface OgTemplateProps {
  title: string;
  subtitle?: string;
  /** A small label at the top right, like the "latest" tag: "blog post". */
  badge?: string;
  /** Dates and the like, in mono above the title: ["2025-06-04", "5 min read"]. */
  meta?: string[];
}

// The share image is the site's light theme: the same palette, and the same
// type roles. Sans for the title, serif italic for the description (as on a
// post), mono for dates and tags.
const { ink, ink2, ink3, rule, accent, bg } = THEME.light;

const SIZE = { width: 1200, height: 630 };
const GUTTER = 72;

function titleFontSize(title: string): number {
  if (title.length > 70) return 46;
  if (title.length > 45) return 54;
  if (title.length > 24) return 64;
  return 76;
}

type Node = {
  type: string;
  props: { style: Record<string, unknown>; children?: unknown };
};

const box = (style: Record<string, unknown>, children?: unknown): Node => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

export async function generateOgTemplate(
  props: OgTemplateProps,
  fonts: FontData[],
): Promise<string> {
  const { title, subtitle, badge, meta } = props;

  const has = (name: string) => fonts.some((f) => f.name === name);
  const sans = has("Atkinson Hyperlegible Next")
    ? "Atkinson Hyperlegible Next"
    : "sans-serif";
  const mono = has("Commit Mono") ? "Commit Mono" : sans;
  const serif = has("Source Serif 4") ? "Source Serif 4" : sans;

  const size = titleFontSize(title);

  // The header: the brand on the left like the site's header, the kind of page
  // on the right, a hairline under both.
  const header = box(
    {
      alignItems: "center",
      justifyContent: "space-between",
      padding: `0 ${GUTTER}px`,
      height: "104px",
      borderBottom: `1px solid ${rule}`,
      flexShrink: "0",
    },
    [
      box(
        {
          fontFamily: sans,
          fontWeight: 700,
          fontSize: "28px",
          letterSpacing: "-0.01em",
          color: ink,
        },
        SITE.DOMAIN,
      ),
      badge
        ? box(
            {
              fontFamily: mono,
              fontSize: "20px",
              color: accent,
              border: `2px solid ${accent}`,
              padding: "4px 14px",
            },
            badge,
          )
        : box({}, ""),
    ],
  );

  const body = box(
    {
      flex: "1",
      flexDirection: "column",
      justifyContent: "center",
      padding: `0 ${GUTTER}px`,
    },
    [
      meta && meta.length > 0
        ? box(
            {
              fontFamily: mono,
              fontSize: "22px",
              color: ink3,
              marginBottom: "22px",
              gap: "24px",
            },
            meta.map((part) => box({}, part)),
          )
        : box({}, ""),
      box(
        {
          fontFamily: sans,
          fontWeight: 700,
          fontSize: `${size}px`,
          letterSpacing: `${(-0.02 * size).toFixed(1)}px`,
          lineHeight: 1.1,
          color: ink,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
        },
        title,
      ),
      subtitle
        ? box(
            {
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: "32px",
              lineHeight: 1.4,
              color: ink2,
              marginTop: "28px",
              maxWidth: "980px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            },
            subtitle,
          )
        : box({}, ""),
    ],
  );

  return await satori(
    box(
      {
        height: "100%",
        width: "100%",
        flexDirection: "column",
        backgroundColor: bg,
      },
      [header, body],
    ) as never,
    {
      ...SIZE,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight as 400 | 600 | 700,
        style: f.style,
      })),
    },
  );
}
