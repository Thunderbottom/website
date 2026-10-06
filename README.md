# maych.in

A fast, static personal site built with [Astro](https://astro.build): a blog,
short notes, a photography gallery with camera details, a projects page, a
"now" page and a resume. Dark and light themes, no client-side framework, and
almost no JavaScript.

It is meant to be cloned and made yours: delete the sample content, drop in
your own, edit one config file, and you have the same site.

## Quick start

You need [Node](https://nodejs.org) 22.12 or newer and/or [Bun](https://bun.sh).

```sh
bun install
bun run dev        # http://localhost:4321
```

```sh
bun run build      # builds the site into dist/
bun run preview    # serves dist/ locally
```

If you use Nix, `nix develop` gives you Bun and everything else (see
[Nix](#nix)).

## Make it yours

1. **`site.config.ts`**: your name, email, address, description, language,
   footer links, page headings, colours, and which sections are on. Everything
   personal that isn't a piece of content is here, with a comment on each
   setting.
2. **`src/content/`**: your writing, photos, projects, resume, "now" page and
   the homepage text (see [Content](#content)). Delete the sample content first.
3. **`public/icons/favicon/`**: replace the icon files (`favicon.ico`, the PNGs
   and `apple-touch-icon.png`) with your own.
4. **Check your fonts and licences** if you change the typefaces (see
   [Fonts](#fonts)).

Then search the project for `maych` to catch the last few names: `package.json`,
and the Nix files if you use them.

## Content

Everything you write lives in `src/content/`. The front matter of each file is
checked when you build, so a typo gives a clear error rather than a broken page.

| What          | Where                                    | Format                       |
| ------------- | ---------------------------------------- | ---------------------------- |
| Posts         | `src/content/blog/*.mdx`                 | Markdown, with front matter  |
| Notes         | `src/content/notes/*.md` (or `.mdx`)     | Markdown, with front matter  |
| Photos        | `src/content/photography/*.mdx` + images | front matter + image file    |
| Projects      | `src/content/projects/*.md`              | front matter only            |
| Homepage text | `src/content/pages/home.mdx`             | Markdown                     |
| Now page      | `src/content/now.yaml`                   | YAML                         |
| Resume        | `src/content/resume.yaml`                | YAML                         |

`src/content/blog/example-post.mdx` and `src/content/notes/example-note.md` are
drafts that show every field and feature. Copy one to start. A file with
`draft: true` is left out of every page, feed and the sitemap.

### Posts

```mdx
---
title: "Post title"
description: "One sentence, shown under the title and in search results."
date: "2025-06-04T19:23:54+05:30"
slug: "address-of-the-post"   # optional: /blog/<slug>/ (defaults to the file name)
tags: "nix,linux"             # optional, comma separated
---
```

Other optional fields: `last_modified_at`, `toc: false` (hide the table of
contents), and `cover`, `coverAlt`, `coverCaption` (a cover image: the name of
a file in `src/content/blog/images/`, without its extension).

In a post you can use **sidenotes** and **message boxes**, which need no
imports:

```mdx
Some text.<Sidenote id="1">A note in the margin, with [a link](https://example.com).</Sidenote>

<Message type="tip">Types: note, tip, info, warning.</Message>
```

Code blocks use [Expressive Code](https://expressive-code.com), so
` ```ts title="file.ts" {2} ` adds a title and highlights line 2.

### Notes

Short writing that appears in full in the list. The title is optional; an
untitled note is shown by its date. Front matter: `date` (required), `title`,
`tags`, `draft`. Use `.mdx` instead of `.md` if you want sidenotes.

### Photos

1. Put the image in `src/content/photography/images/`. JPG, PNG, WebP, AVIF
   and TIFF all work. (HEIC doesn't; convert it first.)
2. Add a file next to it in `src/content/photography/` with the same name and
   front matter:

   ```mdx
   ---
   title: "Fushimi Inari Romon Gate"
   date: "2024-03-13T08:12:00"
   image: "fushimi-inari-romon-gate"   # the image's file name (extension optional)
   alt: "A description for screen readers"   # optional
   ---

   Anything written here appears beside the photo.
   ```

The camera, lens, focal length, aperture, shutter and ISO are read from the
image's EXIF data, and become links to pages that list every photo taken with
the same camera or lens. Each photo gets its own page; in the gallery a click
opens it in an overlay.

Two helper scripts (run inside `nix develop .#images`, or install
[ImageMagick](https://imagemagick.org) and [exiftool](https://exiftool.org)):

```sh
scripts/optimize-images.sh                       # resize and strip location data
scripts/generate-img-mdx.sh <images> <out-dir>   # one .mdx per image, dated from EXIF
```

Photos are resized to AVIF at build time. This is slow for the first build of a
large gallery and fast afterwards, because the results are cached in
`node_modules/.astro`.

### Projects

One markdown file per project in `src/content/projects/`, with front matter
only: `title`, `description`, `date`, `tags` (a list), and any of `repoURL`,
`websiteURL`, `demoURL`.

### Homepage, Now and resume

- **`pages/home.mdx`** is the text under your name. Its `quote` field (and
  `quoteLang`) sets an italic line below it; delete them to hide it. A link in
  this text to a section you've switched off (such as `/photography`) is shown as
  plain text.
- **`now.yaml`** holds the "now" page; the homepage shows the first item of each
  section. Items are plain text where `[text](url)` is a link.
- **`resume.yaml`** holds the resume page, which is hidden from search engines
  and linked from the footer. Dates are `YYYY-MM`; omit `end` for a current
  role. Printing the page (Ctrl/Cmd+P) gives a compact resume with no site chrome.

## Sections you can switch off

In `site.config.ts`:

```ts
export const FEATURES = {
  blog: true,
  notes: true,
  photography: true,
  projects: true,
  now: true,
  resume: true,
};
```

A section that is off isn't built at all: no pages, no nav link, no footer link,
no feed, no sitemap entry, no share image. With blog and notes both on there is a
combined `/writing` page and the nav says "Writing"; with just one on, the nav
links straight to it.

## Look and feel

- **Colours** are one palette per theme in `site.config.ts`. The same values
  colour the page, the share images and the browser's address bar.
- **Type** is Source Serif 4 for reading, Atkinson Hyperlegible Next for
  headings and interface text, and Commit Mono for dates, code and margin notes.
  Every font size, weight and line height is set in `src/styles/typography.css`,
  from the scale in `src/styles/tokens.css`. `bun run lint:type` fails if
  something strays from that scale.
- **Layout** is in `src/styles/`, one file per concern, and the components in
  `src/components/`.

### Fonts

The fonts are open source (SIL Open Font License; the licence for each is next to
its files in `public/fonts/`). To change one: put the file in `public/fonts/`,
update its `@font-face` in `src/styles/tokens.css` and its preload in
`src/layouts/PageLayout.astro`. The share-image generator can't read WOFF2, so
also add the font as `.ttf`, `.otf` or `.woff` to `src/assets/fonts/` and list
it in `src/lib/fonts.ts`. (The share images use the sans, serif italic and mono
of the site's own type.)

## Deploying

`bun run build` writes a plain static site to `dist/`. Upload it anywhere that
serves static files (Cloudflare Pages, Netlify, GitHub Pages, an nginx folder).
Set `SITE.URL` in `site.config.ts` first: it is used for feeds, the sitemap,
canonical links and share images. Compressed copies (gzip, brotli, zstd) are
written next to each file for servers that can use them.

`.github/workflows/ci.yml` checks formatting and typography and builds the site
on every push. It runs unchanged on GitHub Actions, Forgejo Actions and Gitea
Actions; if your runner's label isn't `ubuntu-latest`, change `runs-on`.

### Nix

`flake.nix` builds the site (`nix build`) and provides a dev shell
(`nix develop`, or `nix develop .#images` for the photo tools). After changing
dependencies, update `outputHash` in `node-modules.nix`. Rename `maych-in` in
both files for your own site.

## Commands

| Command                | Does                                                   |
| ---------------------- | ------------------------------------------------------ |
| `bun run dev`          | Dev server with hot reload                             |
| `bun run build`        | Build to `dist/`                                       |
| `bun run build:prod`   | Same, with `NODE_ENV=production`                       |
| `bun run preview`      | Serve `dist/`                                          |
| `bun run lint:type`    | Check the type scale is respected                      |
| `bun run format`       | Format the code with Prettier                          |
| `bun run format:check` | Check formatting (CI runs this)                        |

## Where things are

```
site.config.ts           identity, colours, page text, feature flags
src/content/             all your writing, photos, projects, resume, text
src/pages/               home, 404, share images, llms.txt, web manifest
src/routes/              each section's pages (registered by the flags)
src/components/          building blocks
src/lib/                 loaders and helpers
src/styles/              the design, one file per concern
src/integrations/        the feature-flag route registration
public/                  favicons and fonts
scripts/                 photo helpers and the typography lint
```

## Good to know

- **After deleting a content file, clear the cache** if the page still shows up:
  `rm -rf .astro node_modules/.astro`. A running dev server can hold on to it.
- **Empty content folders only warn.** Delete all your posts or photos and the
  build still works: the pages say there is nothing yet, and sections that would
  be empty are hidden.
- **A page that is missing its content stops the build with a message** naming
  the file and field. For the resume, either fill in `resume.yaml` or set
  `resume: false`.
- **The resume is `noindex`** and left out of the sitemap; it is only linked from
  the footer.
- **`llms.txt` and the web manifest are generated** from your content and config.

## Licence

The code is MIT licensed (see `LICENSE`). The sample content in `src/content/`
and the images in `public/` belong to their author; replace them with your own.
The bundled fonts keep their own licences (`public/fonts/*/OFL.txt`).
