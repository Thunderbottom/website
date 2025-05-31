// src/lib/photo-api-utils.ts
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { extractExifData, formatExifItems } from "@lib/photo-utils";

export interface ProcessedPhotoImages {
  thumbnail: {
    avif: { src: string; attributes: { width: number; height: number } };
    webp: { src: string; attributes: { width: number; height: number } };
  };
  lightbox: {
    avif: { src: string; attributes: { width: number; height: number } };
    webp: { src: string; attributes: { width: number; height: number } };
  };
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
  images: ProcessedPhotoImages;
  exifItems: string[];
  formattedDate: string;
}

// Image processing configuration
export const IMAGE_CONFIG = {
  THUMBNAIL: {
    WIDTH: 800,
    QUALITY: 75,
    FORMATS: ["avif", "webp"] as const,
  },
  LIGHTBOX: {
    WIDTH: 1280,
    QUALITY: 85,
    FORMATS: ["avif", "webp"] as const,
  },
} as const;

// In-memory cache for processed images
const imageCache = new Map<string, ProcessedPhotoImages>();

/**
 * Generate optimized images for API responses with caching
 */
export async function generateApiPhotoImages(
  photoImage: ImageMetadata,
  cacheKey: string,
): Promise<ProcessedPhotoImages> {
  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Generate all image variants in parallel
    const [thumbnailAvif, thumbnailWebp, lightboxAvif, lightboxWebp] =
      await Promise.all([
        getImage({
          src: photoImage,
          width: IMAGE_CONFIG.THUMBNAIL.WIDTH,
          format: "avif",
          quality: IMAGE_CONFIG.THUMBNAIL.QUALITY,
        }),
        getImage({
          src: photoImage,
          width: IMAGE_CONFIG.THUMBNAIL.WIDTH,
          format: "webp",
          quality: IMAGE_CONFIG.THUMBNAIL.QUALITY,
        }),
        getImage({
          src: photoImage,
          width: IMAGE_CONFIG.LIGHTBOX.WIDTH,
          format: "avif",
          quality: IMAGE_CONFIG.LIGHTBOX.QUALITY,
        }),
        getImage({
          src: photoImage,
          width: IMAGE_CONFIG.LIGHTBOX.WIDTH,
          format: "webp",
          quality: IMAGE_CONFIG.LIGHTBOX.QUALITY,
        }),
      ]);

    const processedImages: ProcessedPhotoImages = {
      thumbnail: { avif: thumbnailAvif, webp: thumbnailWebp },
      lightbox: { avif: lightboxAvif, webp: lightboxWebp },
    };

    // Cache the processed images
    imageCache.set(cacheKey, processedImages);

    return processedImages;
  } catch (error) {
    console.error(
      `[Photo Utils] Failed to process images for ${cacheKey}:`,
      error,
    );
    throw new Error(
      `Image processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract EXIF data with timeout protection
 * Reuses the existing extractExifData and formatExifItems functions
 */
export async function extractExifWithTimeout(
  imageName: string,
  timeoutMs: number = 5000,
): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `EXIF extraction timeout after ${timeoutMs}ms for ${imageName}`,
        ),
      );
    }, timeoutMs);

    try {
      // Reuse existing EXIF extraction logic
      const imagePath = `./src/content/photography/images/${imageName}.jpg`;
      const exifData = await extractExifData(imagePath);
      const exifItems = formatExifItems(exifData);

      clearTimeout(timeoutId);
      resolve(exifItems);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Validate photo data structure before processing
 */
export function validatePhotoData(photo: any): boolean {
  const required = ["slug", "data"];
  const requiredData = ["title", "date", "image"];

  // Check top-level properties
  if (!photo || typeof photo !== "object") {
    return false;
  }

  for (const prop of required) {
    if (!(prop in photo)) {
      return false;
    }
  }

  // Check data properties
  if (!photo.data || typeof photo.data !== "object") {
    return false;
  }

  for (const prop of requiredData) {
    if (!(prop in photo.data) || typeof photo.data[prop] !== "string") {
      return false;
    }
  }

  return true;
}

/**
 * Create a cache key for a photo
 */
export function createPhotoCacheKey(slug: string, imageName: string): string {
  return `${slug}-${imageName}`;
}

/**
 * Safely import a photo image with error handling
 */
export async function importPhotoImage(
  imageName: string,
): Promise<ImageMetadata | null> {
  try {
    const photoImage = await import(
      `../content/photography/images/${imageName}.jpg`
    );
    return photoImage.default;
  } catch (error) {
    console.error(`[Photo Utils] Failed to import image ${imageName}:`, error);
    return null;
  }
}

/**
 * Clear the image cache (useful for development or memory management)
 */
export function clearImageCache(): void {
  imageCache.clear();
  console.log("[Photo Utils] Image cache cleared");
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys()),
  };
}

/**
 * Prune cache based on age or size limits
 */
export function pruneCache(maxSize: number = 100): void {
  if (imageCache.size <= maxSize) {
    return;
  }

  // Remove oldest entries (FIFO)
  const keysToRemove = Array.from(imageCache.keys()).slice(
    0,
    imageCache.size - maxSize,
  );
  keysToRemove.forEach((key) => imageCache.delete(key));

  console.log(
    `[Photo Utils] Pruned ${keysToRemove.length} cache entries, ${imageCache.size} remaining`,
  );
}
