import { getImage } from "astro:assets";
import { getCollection } from "astro:content";
import type { GetImageResult, ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import {
  PHOTOGRAPHY,
  SITE,
  IMAGE_SETTINGS,
  formatDate,
  getPhotoGroup,
  type PhotoGroup,
} from "@lib/config";
import { sortByDateDesc } from "@lib/utils";

// Any common web or camera format, in either letter case. (HEIC isn't read by
// the image pipeline; convert those first, see scripts/optimize-images.sh.)
const photoImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/content/photography/images/*.{jpg,jpeg,png,webp,avif,tif,tiff,JPG,JPEG,PNG,WEBP,AVIF,TIF,TIFF}",
  { eager: true },
);

const EXTENSION = /\.(jpe?g|png|webp|avif|tiff?)$/i;

// A photo's `image` front matter is the file name, with or without extension.
const imagesByName = new Map<string, { path: string; image: ImageMetadata }>();
for (const [path, module] of Object.entries(photoImages)) {
  const name = path.split("/").pop()!.replace(EXTENSION, "");
  if (imagesByName.has(name)) {
    console.warn(
      `Two images in src/content/photography/images/ are named "${name}"; using the first.`,
    );
    continue;
  }
  imagesByName.set(name, { path, image: module.default });
}

export interface ImageSet {
  thumbnailImage: GetImageResult;
  fullImage: GetImageResult;
}

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  focalLength35?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
}

/** A camera or lens a photo can be filtered by. */
export interface Facet {
  name: string;
  slug: string;
}

export type FacetKind = "camera" | "lens";

/** One labelled line of the photo's details; `href` makes it a filter link. */
export interface ExifRow {
  label: string;
  value: string;
  href?: string;
}

export interface ProcessedPhoto {
  id: string;
  data: {
    title: string;
    date: string | Date;
    image: string;
    alt?: string;
    tags?: string;
    draft?: boolean;
  };
  body: string;
  images: ImageSet;
  camera?: Facet;
  lens?: Facet;
  exifRows: ExifRow[];
  formattedDate: string;
  group: PhotoGroup;
}

export const photoHref = (photo: { id: string }) => `/photography/${photo.id}/`;

export const facetHref = (kind: FacetKind, facet: Facet) =>
  `/photography/${kind}/${facet.slug}/`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generatePhotoImages(
  photoImage: ImageMetadata,
): Promise<ImageSet> {
  const [thumbnailImage, fullImage] = await Promise.all([
    getImage({
      src: photoImage,
      width: IMAGE_SETTINGS.THUMBNAIL.WIDTH,
      format: IMAGE_SETTINGS.THUMBNAIL.FORMAT,
      quality: IMAGE_SETTINGS.THUMBNAIL.QUALITY,
    }),
    getImage({
      src: photoImage,
      width: IMAGE_SETTINGS.FULL.WIDTH,
      format: IMAGE_SETTINGS.FULL.FORMAT,
      quality: IMAGE_SETTINGS.FULL.QUALITY,
    }),
  ]);

  return { thumbnailImage, fullImage };
}

/** Lens names often carry a series suffix ("... | Contemporary 018"). */
function cleanLensName(lens: string): string {
  if (/^iPhone/i.test(lens)) {
    // "15 Pro Main (6.765mm)" -> "iPhone 15 Pro Main"
    const name = formatAppleLensText(lens, true).replace(
      /\s*\([\d.]+mm\)$/,
      "",
    );
    if (name && !name.startsWith("undefined")) return `iPhone ${name}`;
  }
  return lens.split(" | ")[0].trim();
}

async function extractExifData(imagePath: string): Promise<ExifData> {
  try {
    const exifr = (await import("exifr")).default;

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("EXIF extraction timeout")), 3000),
    );

    const rawExif = await Promise.race([
      exifr.parse(imagePath, {
        pick: [
          "Make",
          "Model",
          "LensModel",
          "FocalLength",
          "FocalLengthIn35mmFormat",
          "FNumber",
          "ExposureTime",
          "ISO",
        ],
      }),
      timeout,
    ]);

    if (!rawExif) return {};

    const exifData: ExifData = {};

    if (rawExif.Make && rawExif.Model) {
      // "DJI" + "DJI AC003" should not read "DJI DJI AC003".
      const make = String(rawExif.Make).trim();
      const model = String(rawExif.Model).trim();
      exifData.camera = model.toLowerCase().startsWith(make.toLowerCase())
        ? model
        : `${make} ${model}`;
    }
    if (rawExif.LensModel) {
      exifData.lens = cleanLensName(String(rawExif.LensModel));
    }
    if (rawExif.FocalLength) {
      exifData.focalLength = `${Math.round(rawExif.FocalLength)}mm`;
      const eq = Math.round(rawExif.FocalLengthIn35mmFormat ?? 0);
      if (eq && Math.abs(eq - rawExif.FocalLength) > 1) {
        exifData.focalLength35 = `${eq}mm`;
      }
    }
    if (rawExif.FNumber) {
      exifData.aperture = `f/${Number((Math.round(rawExif.FNumber * 10) / 10).toFixed(1))}`;
    }
    if (rawExif.ExposureTime) {
      const exposure = rawExif.ExposureTime;
      exifData.shutterSpeed =
        exposure < 1 ? `1/${Math.round(1 / exposure)}s` : `${exposure}s`;
    }
    if (rawExif.ISO) {
      exifData.iso = rawExif.ISO.toString();
    }

    return exifData;
  } catch (error) {
    console.warn(
      `Failed to extract EXIF for ${imagePath}:`,
      (error as Error).message,
    );
    return {};
  }
}

function facetOf(name?: string): Facet | undefined {
  return name ? { name, slug: slugify(name) } : undefined;
}

function buildExifRows(
  exif: ExifData,
  camera?: Facet,
  lens?: Facet,
): ExifRow[] {
  const focal = exif.focalLength
    ? exif.focalLength35
      ? `${exif.focalLength} (${exif.focalLength35} equiv.)`
      : exif.focalLength
    : undefined;

  const rows: (ExifRow | undefined)[] = [
    camera && {
      label: "camera",
      value: camera.name,
      href: facetHref("camera", camera),
    },
    lens && { label: "lens", value: lens.name, href: facetHref("lens", lens) },
    focal ? { label: "focal length", value: focal } : undefined,
    exif.aperture ? { label: "aperture", value: exif.aperture } : undefined,
    exif.shutterSpeed
      ? { label: "shutter", value: exif.shutterSpeed }
      : undefined,
    exif.iso ? { label: "iso", value: exif.iso } : undefined,
  ];
  return rows.filter((r): r is ExifRow => Boolean(r));
}

async function processPhoto(
  photo: CollectionEntry<"photography">,
): Promise<ProcessedPhoto | null> {
  const found = imagesByName.get(photo.data.image.replace(EXTENSION, ""));

  if (!found) {
    console.error(
      `Photo "${photo.id}" uses image "${photo.data.image}", but no such file is in src/content/photography/images/ (jpg, jpeg, png, webp, avif or tiff).`,
    );
    return null;
  }

  const images = await generatePhotoImages(found.image);
  const exif = await extractExifData(`.${found.path}`);
  const camera = facetOf(exif.camera);
  const lens = facetOf(exif.lens);

  return {
    id: photo.id,
    data: photo.data,
    body: photo.body || "",
    images,
    camera,
    lens,
    exifRows: buildExifRows(exif, camera, lens),
    formattedDate: formatDate(new Date(photo.data.date), "%Y-%m-%d"),
    group: getPhotoGroup(photo.data.date),
  };
}

let allPhotos: Promise<ProcessedPhoto[]> | undefined;

/**
 * Every published photo, newest first, with images and EXIF resolved. Built
 * once per build and shared by the gallery, photo and filter pages.
 */
export function getAllPhotos(): Promise<ProcessedPhoto[]> {
  allPhotos ??= (async () => {
    const entries = await getCollection(
      "photography",
      ({ data }) => !data.draft,
    );
    const processed = await Promise.all(
      sortByDateDesc(entries).map(processPhoto),
    );
    return processed.filter((p): p is ProcessedPhoto => p !== null);
  })();
  return allPhotos;
}

/** Photos grouped by year, in the order given. */
export function groupByYear(photos: ProcessedPhoto[]) {
  const groups = new Map<
    string,
    { group: PhotoGroup; photos: ProcessedPhoto[] }
  >();
  for (const photo of photos) {
    const entry = groups.get(photo.group.key) ?? {
      group: photo.group,
      photos: [],
    };
    entry.photos.push(photo);
    groups.set(photo.group.key, entry);
  }
  return [...groups.values()];
}

/** The distinct cameras or lenses in a set of photos, with photo counts. */
export function collectFacets(photos: ProcessedPhoto[], kind: FacetKind) {
  const found = new Map<string, { facet: Facet; photos: ProcessedPhoto[] }>();
  for (const photo of photos) {
    const facet = photo[kind];
    if (!facet) continue;
    const entry = found.get(facet.slug) ?? { facet, photos: [] };
    entry.photos.push(photo);
    found.set(facet.slug, entry);
  }
  return [...found.values()].sort((a, b) => b.photos.length - a.photos.length);
}

export function generateImageStructuredData(
  photos: ProcessedPhoto[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: PHOTOGRAPHY.TITLE,
    description: PHOTOGRAPHY.DESCRIPTION,
    image: photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: new URL(photo.images.thumbnailImage.src, SITE.URL).href,
      url: new URL(photoHref(photo), SITE.URL).href,
      name: photo.data.title,
      dateCreated: photo.data.date,
      creator: { "@type": "Person", name: SITE.NAME },
    })),
  };
}

export const formatAppleLensText = (
  model: string,
  includeDeviceName?: boolean,
): string => {
  const [_, phoneName, side, focalLength, aperture] =
    /iPhone ([0-9a-z]{1,3}(?: (?:Pro|Max|Plus|Mini))*).*?(back|front).*?([0-9\.]+)mm.*?f\/([0-9\.]+)/gi.exec(
      model,
    ) ?? [];

  const format = (lensName: string, includeFocalLength = true) => {
    let result = "";
    if (includeDeviceName) {
      result += `${phoneName} `;
    }
    result += lensName;
    if (!includeDeviceName) {
      result += " Camera";
    }
    if (includeFocalLength && focalLength) {
      result += ` (${focalLength}mm)`;
    }
    return result;
  };

  if (side?.toLocaleUpperCase() === "FRONT") {
    return format("front", false);
  } else if (side?.toLocaleUpperCase() === "BACK") {
    switch (phoneName?.toLocaleUpperCase()) {
      // X + XS
      case "X":
      case "XS":
      case "XS MAX":
        switch (aperture) {
          case "1.8":
            return format("Main");
          case "2.4":
            return format("Telephoto");
        }
      // XR + SE (single lens)
      case "XR":
      case "SE":
        return format("Main");
      // 11
      case "11":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.8":
            return format("Main");
        }
      case "11 PRO":
      case "11 PRO MAX":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.8":
            return format("Main");
          case "2.0":
            return format("Telephoto");
        }
      // 12
      case "12":
      case "12 MINI":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.6":
            return format("Main");
        }
      case "12 PRO":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.6":
            return format("Main");
          case "2.0":
            return format("Telephoto");
        }
      case "12 PRO MAX":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.6":
            return format("Main");
          case "2.2":
            return format("Telephoto");
        }
      // 13
      case "13":
      case "13 MINI":
      case "13 PLUS":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.6":
            return format("Main");
        }
      case "13 PRO":
      case "13 PRO MAX":
        switch (aperture) {
          case "1.8":
            return format("Wide");
          case "1.5":
            return format("Main");
          case "2.8":
            return format("Telephoto");
        }
      // 14
      case "14":
      case "14 PLUS":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.5":
            return format("Main");
        }
      case "14 PRO":
      case "14 PRO MAX":
        switch (aperture) {
          case "2.2":
            return format("Wide");
          case "1.78":
            return format("Main");
          case "2.8":
            return format("Telephoto");
        }
      // 15
      case "15":
      case "15 PLUS":
        switch (aperture) {
          case "2.4":
            return format("Wide");
          case "1.6":
            return format("Main");
        }
      case "15 PRO":
      case "15 PRO MAX":
        switch (aperture) {
          case "2.2":
            return format("Wide");
          case "1.78":
            return format("Main");
          case "2.8":
            return format("Telephoto");
        }
      // 16 (single lens)
      case "16E":
        return format("Main");
      case "16":
      case "16 PLUS":
        switch (aperture) {
          case "2.2":
            return format("Wide");
          case "1.6":
            return format("Main");
        }
      case "16 PRO":
      case "16 PRO MAX":
        switch (aperture) {
          case "2.2":
            return format("Wide");
          case "1.78":
            return format("Main");
          case "2.8":
            return format("Telephoto");
        }
      default:
        return format("Back", true);
    }
  }

  return model;
};
