// components/ui/smart-code-block.tsx
"use client";

import { memo, useMemo } from "react";
import { LazyCodeBlock } from "./lazy-code-block";
import { VirtualizedCodeBlock } from "./virtualized-code-block";

interface SmartCodeBlockProps {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
  maxHeight?: string;
}

// Thresholds for different rendering strategies
const HIGHLIGHT_THRESHOLD = 50000; // 50KB - use syntax highlighting
const VIRTUALIZE_THRESHOLD = 100000; // 100KB - use virtualization

/**
 * Smart code block that automatically chooses the best rendering strategy
 * based on content size:
 * - Small (<50KB): Full syntax highlighting
 * - Medium (50-100KB): Lazy highlighting with truncation
 * - Large (>100KB): Virtualized plain text
 */
export const SmartCodeBlock = memo(function SmartCodeBlock({
  code,
  language = "html",
  theme = "github-dark",
  className,
  maxHeight = "500px",
}: SmartCodeBlockProps) {
  const strategy = useMemo(() => {
    const size = code.length;
    if (size > VIRTUALIZE_THRESHOLD) return "virtualized";
    if (size > HIGHLIGHT_THRESHOLD) return "lazy-truncated";
    return "highlighted";
  }, [code.length]);

  if (strategy === "virtualized") {
    return (
      <VirtualizedCodeBlock
        code={code}
        language={language}
        className={className}
        maxHeight={maxHeight}
      />
    );
  }

  return (
    <LazyCodeBlock
      code={code}
      language={language}
      theme={theme}
      className={className}
      maxHeight={maxHeight}
    />
  );
});
