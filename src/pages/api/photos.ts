// src/pages/api/photos.ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { formatDate } from "@lib/utils";
import {
  generateApiPhotoImages,
  validatePhotoData,
  createPhotoCacheKey,
  importPhotoImage,
  extractExifWithTimeout,
  type ProcessedPhoto,
} from "@lib/photo-api-utils";

// Opt out of prerendering for this API route
export const prerender = false;

// Configuration constants
const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 20,
  MIN_PAGE_SIZE: 1,
  CACHE_DURATION: 3600, // 1 hour in seconds
  EXIF_TIMEOUT: 3000, // 3 seconds for EXIF extraction
} as const;

// Types
interface PhotosByYear {
  [year: number]: ProcessedPhoto[];
}

interface ApiResponse {
  photosByYear: PhotosByYear;
  hasMore: boolean;
  page: number;
  total: number;
  loaded: number;
}

interface ApiError {
  error: string;
  message: string;
  code?: string;
}

// In-memory cache for processed photos
const photoCache = new Map<string, ProcessedPhoto>();

/**
 * Process a single photo with error handling and caching
 */
async function processPhoto(photo: any): Promise<ProcessedPhoto | null> {
  const cacheKey = createPhotoCacheKey(photo.slug, photo.data.image);

  // Return from cache if available
  if (photoCache.has(cacheKey)) {
    return photoCache.get(cacheKey)!;
  }

  // Validate photo data
  if (!validatePhotoData(photo)) {
    console.warn(`[Photos API] Invalid photo data for ${photo.slug}`);
    return null;
  }

  try {
    // Import the photo image
    const photoImage = await importPhotoImage(photo.data.image);
    if (!photoImage) {
      console.error(`[Photos API] Failed to import image: ${photo.data.image}`);
      return null;
    }

    // Generate optimized images
    const images = await generateApiPhotoImages(photoImage, cacheKey);

    // Extract EXIF data with timeout
    let exifItems: string[] = [];
    try {
      exifItems = await extractExifWithTimeout(
        photo.data.image,
        CONFIG.EXIF_TIMEOUT,
      );
    } catch (error) {
      // Continue without EXIF data - this is not critical
      console.debug(
        `[Photos API] EXIF extraction failed for ${photo.data.image}:`,
        error,
      );
    }

    const formattedDate = formatDate(new Date(photo.data.date), "%B %d, %Y");

    const processedPhoto: ProcessedPhoto = {
      slug: photo.slug,
      data: photo.data,
      body: photo.body || "",
      images,
      exifItems,
      formattedDate,
    };

    // Cache the processed photo
    photoCache.set(cacheKey, processedPhoto);

    return processedPhoto;
  } catch (error) {
    console.error(`[Photos API] Error processing photo ${photo.slug}:`, error);
    return null;
  }
}

/**
 * Parse and validate request parameters
 */
function parseRequestParams(searchParams: URLSearchParams) {
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const page = Math.max(
    CONFIG.MIN_PAGE_SIZE,
    parseInt(pageParam || "1", 10) || 1,
  );
  const limit = Math.min(
    CONFIG.MAX_PAGE_SIZE,
    Math.max(
      CONFIG.MIN_PAGE_SIZE,
      parseInt(limitParam || CONFIG.DEFAULT_PAGE_SIZE.toString(), 10) ||
        CONFIG.DEFAULT_PAGE_SIZE,
    ),
  );

  return { page, limit };
}

/**
 * Create standardized API response headers
 */
function createResponseHeaders(
  processingTime: number,
  options: {
    cacheMaxAge?: number;
    errorCount?: number;
    pageInfo?: string;
  } = {},
) {
  const {
    cacheMaxAge = CONFIG.CACHE_DURATION,
    errorCount = 0,
    pageInfo = "",
  } = options;

  return {
    "Content-Type": "application/json",
    "Cache-Control": `public, max-age=${cacheMaxAge}`,
    "X-Processing-Time": processingTime.toString(),
    "X-Error-Count": errorCount.toString(),
    "X-Cache-Size": photoCache.size.toString(),
    ...(pageInfo && { "X-Page-Info": pageInfo }),
  };
}

/**
 * Main API route handler
 */
export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  try {
    // Parse URL parameters
    const requestUrl = new URL(request.url);
    const { page, limit } = parseRequestParams(requestUrl.searchParams);
    const offset = (page - 1) * limit;

    console.log(
      `[Photos API] Request: page=${page}, limit=${limit}, offset=${offset}`,
    );

    // Get all published photos
    const allPhotos = await getCollection(
      "photography",
      ({ data }) => !data.draft,
    );

    // Sort by date (newest first)
    const sortedPhotos = allPhotos.sort(
      (a, b) =>
        new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
    );

    const total = sortedPhotos.length;
    const paginatedPhotos = sortedPhotos.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // Return early if no photos in this page
    if (paginatedPhotos.length === 0) {
      const emptyResponse: ApiResponse = {
        photosByYear: {},
        hasMore: false,
        page,
        total,
        loaded: 0,
      };

      const processingTime = Date.now() - startTime;

      return new Response(JSON.stringify(emptyResponse), {
        status: 200,
        headers: createResponseHeaders(processingTime, {
          pageInfo: `page-${page}-empty`,
        }),
      });
    }

    console.log(
      `[Photos API] Processing ${paginatedPhotos.length} photos for page ${page}`,
    );

    // Process photos with controlled concurrency
    const processedPhotos: ProcessedPhoto[] = [];
    const errors: string[] = [];

    // Process in batches to avoid overwhelming the system
    const BATCH_SIZE = 3;
    for (let i = 0; i < paginatedPhotos.length; i += BATCH_SIZE) {
      const batch = paginatedPhotos.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map((photo) => processPhoto(photo)),
      );

      batchResults.forEach((result, batchIndex) => {
        const photo = batch[batchIndex];

        if (result.status === "fulfilled" && result.value) {
          processedPhotos.push(result.value);
        } else {
          const error =
            result.status === "rejected"
              ? result.reason?.message || result.reason
              : "Processing returned null";
          errors.push(`${photo.slug}: ${error}`);
        }
      });
    }

    // Group photos by year
    const photosByYear: PhotosByYear = processedPhotos.reduce((acc, photo) => {
      const year = new Date(photo.data.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(photo);
      return acc;
    }, {} as PhotosByYear);

    const response: ApiResponse = {
      photosByYear,
      hasMore,
      page,
      total,
      loaded: processedPhotos.length,
    };

    const processingTime = Date.now() - startTime;

    console.log(
      `[Photos API] Success: page=${page}, processed=${processedPhotos.length}/${paginatedPhotos.length}, ` +
        `errors=${errors.length}, time=${processingTime}ms`,
    );

    if (errors.length > 0) {
      console.warn(`[Photos API] Processing errors:`, errors);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: createResponseHeaders(processingTime, {
        errorCount: errors.length,
        pageInfo: `page-${page}-offset-${offset}-limit-${limit}`,
        // Reduce cache time if there were errors
        cacheMaxAge: errors.length > 0 ? 300 : CONFIG.CACHE_DURATION,
      }),
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("[Photos API] Fatal error:", error);

    const errorResponse: ApiError = {
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "X-Processing-Time": processingTime.toString(),
      },
    });
  }
};
