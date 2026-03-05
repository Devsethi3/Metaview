// lib/validation.ts
import { z } from "zod";

/**
 * URL validation schema
 */
const urlSchema = z.string().refine(
  (value) => {
    if (!value.trim()) return false;

    // Add protocol if missing for validation
    let urlToValidate = value.trim();
    if (
      !urlToValidate.startsWith("http://") &&
      !urlToValidate.startsWith("https://")
    ) {
      urlToValidate = `https://${urlToValidate}`;
    }

    try {
      const url = new URL(urlToValidate);

      // Must have a valid hostname with at least one dot (e.g., example.com)
      // Exception for localhost
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return false; // We don't support localhost
      }

      // Check for valid domain format
      const domainRegex =
        /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(url.hostname)) {
        // Allow IP addresses (but not localhost)
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(url.hostname)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  },
  {
    message:
      "Please enter a valid URL (e.g., example.com or https://example.com)",
  },
);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Validate URL input
 */
export function validateUrl(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Please enter a URL to analyze",
    };
  }

  // Check for localhost
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
    return {
      isValid: false,
      error: "Localhost URLs are not supported. Please use a public URL.",
    };
  }

  const result = urlSchema.safeParse(trimmed);

  if (!result.success) {
    return {
      isValid: false,
      error: result.error.issues[0]?.message || "Invalid URL format",
    };
  }

  // Normalize the URL
  let normalizedUrl = trimmed;
  if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://")
  ) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  return {
    isValid: true,
    normalizedUrl,
  };
}

/**
 * Quick check if input looks like it could be a URL
 */
export function looksLikeUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  // Has a dot and no spaces
  return trimmed.includes(".") && !trimmed.includes(" ");
}
