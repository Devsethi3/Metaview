// lib/url-helpers.ts
/**
 * Encode URL for query parameter - keeps it readable
 * Instead of: https%3A%2F%2Fexample.com
 * We get: example.com (just the domain for simplicity)
 */
export function encodeUrlParam(url: string): string {
  try {
    const parsed = new URL(url);
    // Return just hostname + pathname (without trailing slash if it's just "/")
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    const search = parsed.search || "";
    const result = parsed.hostname + path + search;
    return result;
  } catch {
    // If parsing fails, return cleaned input
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

/**
 * Decode URL from query parameter - reconstructs full URL
 * Input: example.com or example.com/path
 * Output: https://example.com or https://example.com/path
 */
export function decodeUrlParam(param: string): string {
  if (!param) return "";

  // If it already has a protocol, return as-is
  if (param.startsWith("http://") || param.startsWith("https://")) {
    return param;
  }

  // Add https:// protocol
  return `https://${param}`;
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
