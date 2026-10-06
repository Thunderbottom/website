import type { APIRoute } from "astro";
import { THEME } from "@site";
import { SITE } from "@lib/config";

// The web app manifest, from the site's own name and palette. The icon files
// themselves are in public/icons/favicon/; replace them to change the icon.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: SITE.NAME,
        short_name: SITE.DOMAIN,
        icons: [
          {
            src: "/icons/favicon/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/favicon/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        theme_color: THEME.light.bg,
        background_color: THEME.light.bg,
        display: "standalone",
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/manifest+json" } },
  );
