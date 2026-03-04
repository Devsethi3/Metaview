// app/actions/analyze-image.ts
"use server";

import type { ImageAnalysis } from "@/types";

export async function analyzeImage(
  url: string,
  alt?: string | null,
): Promise<ImageAnalysis> {
  const startTime = Date.now();

  try {
    // First, make a HEAD request to get basic info
    const headResponse = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });

    if (!headResponse.ok) {
      return {
        url,
        accessible: false,
        width: null,
        height: null,
        aspectRatio: null,
        format: null,
        fileSize: null,
        loadTime: null,
        alt: alt || null,
        error: `HTTP ${headResponse.status}`,
      };
    }

    const contentType = headResponse.headers.get("content-type");
    const contentLength = headResponse.headers.get("content-length");
    const fileSize = contentLength ? parseInt(contentLength) : null;

    // Determine format from content-type
    let format: string | null = null;
    if (contentType) {
      if (contentType.includes("jpeg") || contentType.includes("jpg"))
        format = "JPEG";
      else if (contentType.includes("png")) format = "PNG";
      else if (contentType.includes("gif")) format = "GIF";
      else if (contentType.includes("webp")) format = "WebP";
      else if (contentType.includes("svg")) format = "SVG";
      else if (contentType.includes("avif")) format = "AVIF";
      else if (contentType.includes("ico")) format = "ICO";
    }

    // For getting dimensions, we need to fetch the image
    // Using a partial fetch for efficiency
    let width: number | null = null;
    let height: number | null = null;

    try {
      // Fetch first 64KB to get dimensions from header
      const imageResponse = await fetch(url, {
        headers: {
          Range: "bytes=0-65535",
        },
        signal: AbortSignal.timeout(5000),
      });

      const buffer = await imageResponse.arrayBuffer();
      const dimensions = getImageDimensions(new Uint8Array(buffer), format);
      if (dimensions) {
        width = dimensions.width;
        height = dimensions.height;
      }
    } catch {
      // Couldn't get dimensions, continue without them
    }

    const loadTime = Date.now() - startTime;

    let aspectRatio: string | null = null;
    if (width && height) {
      const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
      const divisor = gcd(width, height);
      aspectRatio = `${width / divisor}:${height / divisor}`;
    }

    return {
      url,
      accessible: true,
      width,
      height,
      aspectRatio,
      format,
      fileSize,
      loadTime,
      alt: alt || null,
    };
  } catch (error) {
    return {
      url,
      accessible: false,
      width: null,
      height: null,
      aspectRatio: null,
      format: null,
      fileSize: null,
      loadTime: null,
      alt: alt || null,
      error: error instanceof Error ? error.message : "Failed to analyze image",
    };
  }
}

function getImageDimensions(
  data: Uint8Array,
  format: string | null,
): { width: number; height: number } | null {
  try {
    // PNG
    if (
      data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47
    ) {
      const width =
        (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
      const height =
        (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23];
      return { width, height };
    }

    // JPEG
    if (data[0] === 0xff && data[1] === 0xd8) {
      let offset = 2;
      while (offset < data.length) {
        if (data[offset] !== 0xff) break;
        const marker = data[offset + 1];

        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const height = (data[offset + 5] << 8) | data[offset + 6];
          const width = (data[offset + 7] << 8) | data[offset + 8];
          return { width, height };
        }

        const length = (data[offset + 2] << 8) | data[offset + 3];
        offset += 2 + length;
      }
    }

    // GIF
    if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
      const width = data[6] | (data[7] << 8);
      const height = data[8] | (data[9] << 8);
      return { width, height };
    }

    // WebP
    if (
      data[0] === 0x52 &&
      data[1] === 0x49 &&
      data[2] === 0x46 &&
      data[3] === 0x46
    ) {
      if (data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38) {
        // VP8
        if (data[15] === 0x20) {
          const width = (data[26] | (data[27] << 8)) & 0x3fff;
          const height = (data[28] | (data[29] << 8)) & 0x3fff;
          return { width, height };
        }
        // VP8L
        if (data[15] === 0x4c) {
          const bits =
            data[21] | (data[22] << 8) | (data[23] << 16) | (data[24] << 24);
          const width = (bits & 0x3fff) + 1;
          const height = ((bits >> 14) & 0x3fff) + 1;
          return { width, height };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}
