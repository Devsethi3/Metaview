// components/ui/lazy-code-block.tsx
"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LazyCodeBlockProps {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
  maxHeight?: string;
  placeholder?: React.ReactNode;
}

/**
 * Optimized code block with lazy syntax highlighting
 * - Defers highlighting to avoid blocking UI
 * - Shows plain text immediately, then highlights
 * - Truncates extremely large content
 * - Memoized to prevent unnecessary re-renders
 */
export const LazyCodeBlock = memo(function LazyCodeBlock({
  code,
  language = "html",
  theme = "github-dark",
  className,
  maxHeight = "500px",
  placeholder,
}: LazyCodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);
  const highlightingRef = useRef(false);

  // Truncate extremely large content to prevent performance issues
  const MAX_CHARS = 50000; // ~50KB limit for highlighting
  const truncatedCode =
    code.length > MAX_CHARS
      ? code.slice(0, MAX_CHARS) +
        "\n\n/* ... Content truncated for performance ... */"
      : code;
  const isTruncated = code.length > MAX_CHARS;

  const highlight = useCallback(async () => {
    // Prevent duplicate highlighting
    if (highlightingRef.current) return;
    highlightingRef.current = true;
    setIsHighlighting(true);

    try {
      // Use requestIdleCallback or setTimeout to defer work
      await new Promise<void>((resolve) => {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => resolve(), { timeout: 100 });
        } else {
          setTimeout(resolve, 0);
        }
      });

      if (!mountedRef.current) return;

      // Dynamic import to reduce initial bundle
      const { codeToHtml } = await import("shiki");

      // Process in chunks for very large content
      const html = await codeToHtml(truncatedCode, {
        lang: language,
        theme,
      });

      if (mountedRef.current) {
        setHighlightedHtml(html);
        setError(false);
      }
    } catch (err) {
      console.error("Syntax highlighting failed:", err);
      if (mountedRef.current) {
        setError(true);
      }
    } finally {
      if (mountedRef.current) {
        setIsHighlighting(false);
      }
      highlightingRef.current = false;
    }
  }, [truncatedCode, language, theme]);

  useEffect(() => {
    mountedRef.current = true;

    // Defer highlighting to next frame to prevent blocking
    const timeoutId = setTimeout(() => {
      highlight();
    }, 50);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [highlight]);

  const containerClass = cn(
    "not-prose flex w-full flex-col overflow-clip border",
    "border-border bg-card text-card-foreground rounded-xl",
    className,
  );

  const codeClass = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    "font-mono",
  );

  // Show placeholder while loading (if provided)
  if (!highlightedHtml && placeholder) {
    return <div className={containerClass}>{placeholder}</div>;
  }

  return (
    <div className={containerClass}>
      {/* Truncation warning */}
      {isTruncated && (
        <div className="px-4 py-2 bg-muted/50 border-b text-xs text-muted-foreground flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
          Content truncated for performance ({Math.round(code.length / 1024)}KB
          total)
        </div>
      )}

      {/* Loading indicator overlay */}
      {isHighlighting && !highlightedHtml && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Highlighting syntax...
          </span>
        </div>
      )}

      {/* Highlighted content */}
      {highlightedHtml && (
        <div
          className={codeClass}
          style={{ maxHeight }}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      )}

      {/* Fallback: plain text if highlighting fails or not ready */}
      {!highlightedHtml && !isHighlighting && (
        <div className={codeClass} style={{ maxHeight }}>
          <pre className="px-4 py-4">
            <code className="text-muted-foreground">{truncatedCode}</code>
          </pre>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-t">
          Syntax highlighting unavailable
        </div>
      )}
    </div>
  );
});
