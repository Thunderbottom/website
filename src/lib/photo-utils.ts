import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { PHOTOGRAPHY, SITE } from "@lib/constants";

export interface ImageSet {
  thumbnailImage: {
    avif: any;
    webp: any;
  };
  lightboxImage: {
    avif: any;
    webp: any;
  };
}

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  date?: string;
}

// Image quality and size constants
export const IMAGE_SETTINGS = {
  THUMBNAIL: {
    WIDTH: 800,
    QUALITY: 75,
    FORMAT: "webp" as const,
    FALLBACK_FORMAT: "avif" as const,
  },
  LIGHTBOX: {
    WIDTH: 1080,
    QUALITY: 80,
    FORMAT: "webp" as const,
    FALLBACK_FORMAT: "avif" as const,
  },
} as const;

/**
 * Generate optimized images for both thumbnail and lightbox
 */
export async function generatePhotoImages(
  photoImage: ImageMetadata,
): Promise<ImageSet> {
  const [thumbnailAvif, thumbnailWebp, lightboxAvif, lightboxWebp] =
    await Promise.all([
      getImage({
        src: photoImage,
        width: IMAGE_SETTINGS.THUMBNAIL.WIDTH,
        format: IMAGE_SETTINGS.THUMBNAIL.FORMAT,
        quality: IMAGE_SETTINGS.THUMBNAIL.QUALITY,
      }),
      getImage({
        src: photoImage,
        width: IMAGE_SETTINGS.THUMBNAIL.WIDTH,
        format: IMAGE_SETTINGS.THUMBNAIL.FALLBACK_FORMAT,
        quality: IMAGE_SETTINGS.THUMBNAIL.QUALITY,
      }),
      getImage({
        src: photoImage,
        width: IMAGE_SETTINGS.LIGHTBOX.WIDTH,
        format: IMAGE_SETTINGS.LIGHTBOX.FORMAT,
        quality: IMAGE_SETTINGS.LIGHTBOX.QUALITY,
      }),
      getImage({
        src: photoImage,
        width: IMAGE_SETTINGS.LIGHTBOX.WIDTH,
        format: IMAGE_SETTINGS.LIGHTBOX.FALLBACK_FORMAT,
        quality: IMAGE_SETTINGS.LIGHTBOX.QUALITY,
      }),
    ]);

  return {
    thumbnailImage: { avif: thumbnailAvif, webp: thumbnailWebp },
    lightboxImage: { avif: lightboxAvif, webp: lightboxWebp },
  };
}

/**
 * Extract essential EXIF data efficiently
 */
export async function extractExifData(imagePath: string): Promise<ExifData> {
  try {
    const exifr = (await import("exifr")).default;

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("EXIF extraction timeout")), 5000),
    );

    const rawExif = await Promise.race([
      exifr.parse(imagePath, {
        pick: [
          "Make",
          "Model",
          "LensModel",
          "FocalLength",
          "FNumber",
          "ExposureTime",
          "ISO",
          "DateTimeOriginal",
          "CreateDate",
          "DateTime",
        ],
      }),
      timeout,
    ]);

    if (!rawExif) return {};

    const exifData: ExifData = {};

    if (rawExif.Make && rawExif.Model) {
      exifData.camera = `${rawExif.Make} ${rawExif.Model}`;
    }
    if (rawExif.LensModel) {
      exifData.lens = rawExif.LensModel;
    }
    if (rawExif.FocalLength) {
      exifData.focalLength = `${Math.round(rawExif.FocalLength)}mm`;
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

    const dateTaken =
      rawExif.DateTimeOriginal || rawExif.CreateDate || rawExif.DateTime;
    if (dateTaken) {
      // Convert to ISO string if it's a Date object
      exifData.dateTaken =
        dateTaken instanceof Date
          ? dateTaken.toISOString()
          : new Date(dateTaken).toISOString();
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

/**
 * Format EXIF data into display items
 */
export function formatExifItems(exifData: ExifData): string[] {
  return [
    exifData.camera,
    exifData.lens,
    exifData.aperture,
    exifData.shutterSpeed,
    exifData.iso ? `ISO ${exifData.iso}` : null,
    exifData.focalLength,
    exifData.date,
  ].filter(Boolean) as string[];
}

/**
 * Sort photos by date taken from EXIF, falling back to frontmatter date
 */
export function sortPhotosByDate<T extends { data: { date: string | Date } }>(
  photos: T[],
): T[] {
  return photos.sort((a, b) => {
    const dateA = new Date(a.data.date);
    const dateB = new Date(b.data.date);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });
}

/**
 * Generate structured data for images (SEO)
 */
export function generateImageStructuredData(
  photos: Array<{ data: { title: string; date: string; image: string } }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: PHOTOGRAPHY.TITLE,
    description: PHOTOGRAPHY.DESCRIPTION,
    image: photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: `/content/photography/images/${photo.data.image}.jpg`,
      name: photo.data.title,
      dateCreated: photo.data.date,
      creator: {
        "@type": "Person",
        name: SITE.NAME,
      },
    })),
  };
}
