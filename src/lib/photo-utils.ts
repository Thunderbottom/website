import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { PHOTOGRAPHY, SITE } from "@lib/constants";

export interface ImageSet {
  thumbnailImage: any;
  lightboxImage: any;
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

export interface ProcessedPhoto {
  slug: string;
  data: {
    title: string;
    date: string;
    image: string;
    tags?: string;
    draft?: boolean;
  };
  body: string;
  images: ImageSet;
  exifItems: string[];
  formattedDate: string;
}

// Image quality and size constants - WebP only for performance
export const IMAGE_SETTINGS = {
  THUMBNAIL: {
    WIDTH: 800,
    QUALITY: 75,
    FORMAT: "webp" as const,
  },
  LIGHTBOX: {
    WIDTH: 1280,
    QUALITY: 85,
    FORMAT: "webp" as const,
  },
} as const;

/**
 * Generate optimized images for both thumbnail and lightbox (WebP only)
 */
export async function generatePhotoImages(
  photoImage: ImageMetadata,
): Promise<ImageSet> {
  const [thumbnailWebp, lightboxWebp] = await Promise.all([
    getImage({
      src: photoImage,
      width: IMAGE_SETTINGS.THUMBNAIL.WIDTH,
      format: IMAGE_SETTINGS.THUMBNAIL.FORMAT,
      quality: IMAGE_SETTINGS.THUMBNAIL.QUALITY,
    }),
    getImage({
      src: photoImage,
      width: IMAGE_SETTINGS.LIGHTBOX.WIDTH,
      format: IMAGE_SETTINGS.LIGHTBOX.FORMAT,
      quality: IMAGE_SETTINGS.LIGHTBOX.QUALITY,
    }),
  ]);

  return {
    thumbnailImage: thumbnailWebp,
    lightboxImage: lightboxWebp,
  };
}

/**
 * Extract essential EXIF data efficiently
 */
export async function extractExifData(imagePath: string): Promise<ExifData> {
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
      exifData.date =
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
  ].filter(Boolean) as string[];
}

/**
 * Process a single photo with all metadata and optimizations
 */
export async function processPhotoForStatic(
  photo: any,
  formatDate: (date: Date | string, format?: string) => string,
): Promise<ProcessedPhoto | null> {
  try {
    // Import the photo image
    const photoImage = await import(
      `../content/photography/images/${photo.data.image}.jpg`
    );

    if (!photoImage?.default) {
      console.error(`Failed to import image: ${photo.data.image}`);
      return null;
    }

    // Generate optimized images
    const images = await generatePhotoImages(photoImage.default);

    // Extract EXIF data
    let exifItems: string[] = [];
    try {
      const imagePath = `./src/content/photography/images/${photo.data.image}.jpg`;
      const exifData = await extractExifData(imagePath);
      exifItems = formatExifItems(exifData);
    } catch (error) {
      console.debug(`EXIF extraction failed for ${photo.data.image}:`, error);
    }

    const formattedDate = formatDate(new Date(photo.data.date), "%B %d, %Y");

    return {
      slug: photo.slug,
      data: photo.data,
      body: photo.body || "",
      images,
      exifItems,
      formattedDate,
    };
  } catch (error) {
    console.error(`Error processing photo ${photo.slug}:`, error);
    return null;
  }
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
