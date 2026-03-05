// lib/url-helpers.ts
/**
 * Encode URL for query parameter - keeps it readable
 */
export function encodeUrlParam(url: string): string {
  try {
    const parsed = new URL(url);
    let result = parsed.hostname;

    if (parsed.pathname && parsed.pathname !== "/") {
      result += parsed.pathname;
    }

    if (parsed.search) {
      result += parsed.search;
    }

    if (parsed.hash) {
      result += parsed.hash;
    }

    return result;
  } catch {
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  }
}

/**
 * Decode URL from query parameter - reconstructs full URL
 */
export function decodeUrlParam(param: string): string {
  if (!param) return "";

  if (param.startsWith("http://") || param.startsWith("https://")) {
    return param;
  }

  return `https://${param}`;
}

/**
 * Get a reliable favicon URL using Google's favicon service
 * This bypasses CORS issues and always returns a valid image
 */
export function getFaviconUrl(url: string, size: number = 32): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const domain = parsed.hostname;

    // Use Google's favicon service - reliable and CORS-free
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  } catch {
    // Fallback to Google's favicon service with raw input
    return `https://www.google.com/s2/favicons?domain=${url}&sz=${size}`;
  }
}

/**
 * Alternative: Use DuckDuckGo's favicon service
 */
export function getFaviconUrlDDG(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const domain = parsed.hostname;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return `https://icons.duckduckgo.com/ip3/${url}.ico`;
  }
}

/**
 * Normalize URL for display (remove protocol and trailing slash)
 */
export function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}
