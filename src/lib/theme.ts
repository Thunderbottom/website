import { THEME, type Palette } from "@site";

const VARS: Record<keyof Palette, string> = {
  bg: "--bg",
  bgSunk: "--bg-sunk",
  ink: "--ink",
  ink2: "--ink-2",
  ink3: "--ink-3",
  rule: "--rule",
  ruleStrong: "--rule-strong",
  control: "--control",
  accent: "--accent",
  accentInk: "--accent-ink",
  hover: "--hover",
};

const declarations = (palette: Palette) =>
  (Object.keys(VARS) as (keyof Palette)[])
    .map((key) => `${VARS[key]}:${palette[key]};`)
    .join("");

/**
 * The palette as CSS custom properties, from site.config.ts. The theme is
 * chosen by an inline script (data-theme on <html>), with a
 * prefers-color-scheme fallback for visitors without JS.
 */
export function themeCss(): string {
  const { light, dark } = THEME;
  return [
    // --accent-on-dark is the dark theme's accent in both themes, for UI that
    // sits on a dark surface in either (the photo overlay).
    `:root{color-scheme:light;${declarations(light)}--accent-on-dark:${dark.accent};}`,
    `:root[data-theme="dark"]{color-scheme:dark;${declarations(dark)}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme]){color-scheme:dark;${declarations(dark)}}}`,
  ].join("\n");
}
