// lib/cache.ts
import type { AnalysisResult } from "@/types";

const CACHE_KEY_PREFIX = "metaview_cache_";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedResult {
  result: AnalysisResult;
  timestamp: number;
  expiresAt: number;
}

/**
 * Get cached analysis result for a URL
 */
export function getCachedResult(url: string): CachedResult | null {
  if (typeof window === "undefined") return null;

  try {
    const key = getCacheKey(url);
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const parsed: CachedResult = JSON.parse(cached);

    // Check if cache has expired
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("[Cache] Error reading cache:", error);
    return null;
  }
}

/**
 * Store analysis result in cache
 */
export function setCachedResult(url: string, result: AnalysisResult): void {
  if (typeof window === "undefined") return;

  try {
    const key = getCacheKey(url);
    const cached: CachedResult = {
      result,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY_MS,
    };

    localStorage.setItem(key, JSON.stringify(cached));

    // Clean up old cache entries
    cleanupOldCache();
  } catch (error) {
    console.error("[Cache] Error writing cache:", error);
    // If localStorage is full, clear old entries and try again
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearAllCache();
      try {
        const key = getCacheKey(url);
        const cached: CachedResult = {
          result,
          timestamp: Date.now(),
          expiresAt: Date.now() + CACHE_EXPIRY_MS,
        };
        localStorage.setItem(key, JSON.stringify(cached));
      } catch {
        // Give up if still failing
      }
    }
  }
}

/**
 * Remove cached result for a specific URL
 */
export function removeCachedResult(url: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = getCacheKey(url);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("[Cache] Error removing cache:", error);
  }
}

/**
 * Clear all cached results
 */
export function clearAllCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("[Cache] Error clearing cache:", error);
  }
}

/**
 * Get cache key for a URL (normalized)
 */
function getCacheKey(url: string): string {
  // Normalize URL for consistent caching
  const normalized = url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");

  return `${CACHE_KEY_PREFIX}${normalized}`;
}

/**
 * Clean up expired cache entries
 */
function cleanupOldCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed: CachedResult = JSON.parse(cached);
            if (now > parsed.expiresAt) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid cache entry, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("[Cache] Error cleaning cache:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; totalSize: number } {
  if (typeof window === "undefined") return { count: 0, totalSize: 0 };

  let count = 0;
  let totalSize = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        count++;
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length * 2; // UTF-16 characters = 2 bytes each
        }
      }
    }
  } catch (error) {
    console.error("[Cache] Error getting stats:", error);
  }

  return { count, totalSize };
}

/**
 * Format cache age for display
 */
export function formatCacheAge(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
