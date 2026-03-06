// components/ui/code-block.tsx
"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";

// Global cache for highlighted HTML — survives component unmount/remount
const highlightCache = new Map<string, string>();

function getCacheKey(code: string, language: string, theme: string): string {
  // Use a fast hash to avoid storing huge keys
  let hash = 0;
  const str = `${language}:${theme}:${code}`;
  for (let i = 0; i < Math.min(str.length, 500); i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `${language}:${theme}:${code.length}:${hash}`;
}

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-light",
  className,
  ...props
}: CodeBlockCodeProps) {
  const cacheKey = getCacheKey(code, language, theme);
  const cached = highlightCache.get(cacheKey);

  // Initialize with cached value if available — no flash
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(
    cached ?? null,
  );
  const mountedRef = useRef(true);
  const currentKeyRef = useRef(cacheKey);

  useEffect(() => {
    mountedRef.current = true;
    currentKeyRef.current = cacheKey;

    // Already cached — set immediately and skip
    if (highlightCache.has(cacheKey)) {
      setHighlightedHtml(highlightCache.get(cacheKey)!);
      return;
    }

    if (!code) {
      const empty = "<pre><code></code></pre>";
      setHighlightedHtml(empty);
      return;
    }

    let cancelled = false;

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, { lang: language, theme });

        if (
          !cancelled &&
          mountedRef.current &&
          currentKeyRef.current === cacheKey
        ) {
          highlightCache.set(cacheKey, html);
          setHighlightedHtml(html);
        }
      } catch (err) {
        console.error("Highlighting failed:", err);
      }
    }

    highlight();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [cacheKey, code, language, theme]);

  const classNames = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    className,
  );

  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre className="px-4 py-4">
        <code className="text-muted-foreground whitespace-pre-wrap break-all">
          {code}
        </code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
