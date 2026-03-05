// components/ui/virtualized-code-block.tsx
"use client";

import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VirtualizedCodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  maxHeight?: string;
  linesPerPage?: number;
}

/**
 * Virtualized code block for extremely large content
 * - Only renders visible lines
 * - No syntax highlighting (too expensive for huge files)
 * - Pagination for navigation
 */
export const VirtualizedCodeBlock = memo(function VirtualizedCodeBlock({
  code,
  language = "html",
  className,
  maxHeight = "500px",
  linesPerPage = 100,
}: VirtualizedCodeBlockProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Split code into lines
  const lines = useMemo(() => code.split("\n"), [code]);
  const totalPages = Math.ceil(lines.length / linesPerPage);

  // Get current page lines
  const visibleLines = useMemo(() => {
    const start = currentPage * linesPerPage;
    const end = start + linesPerPage;
    return lines.slice(start, end);
  }, [lines, currentPage, linesPerPage]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(0, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const containerClass = cn(
    "not-prose flex w-full flex-col overflow-clip border",
    "border-border bg-card text-card-foreground rounded-xl",
    className,
  );

  return (
    <div className={containerClass}>
      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-xs text-muted-foreground">
        <span>
          {lines.length.toLocaleString()} lines ·{" "}
          {Math.round(code.length / 1024)}KB
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
        )}
      </div>

      {/* Code content */}
      <div
        ref={containerRef}
        className="overflow-auto font-mono text-[13px]"
        style={{ maxHeight }}
      >
        <pre className="p-4">
          <code className="text-foreground">
            {visibleLines.map((line, i) => {
              const lineNumber = currentPage * linesPerPage + i + 1;
              return (
                <div key={lineNumber} className="flex">
                  <span className="select-none text-muted-foreground w-12 text-right pr-4 shrink-0">
                    {lineNumber}
                  </span>
                  <span className="break-all">{line || " "}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="h-7"
          >
            <ChevronUp className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="h-7 w-7 p-0"
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="h-7"
          >
            Next
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
});
