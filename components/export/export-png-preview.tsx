// components/export/export-png-preview.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ImageIcon } from "lucide-react";

interface ExportPngPreviewProps {
  dataUrl: string | null;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export function ExportPngPreview({
  dataUrl,
  isGenerating,
  onRegenerate,
}: ExportPngPreviewProps) {
  if (isGenerating) {
    return (
      <div className="relative aspect-[3/2] w-full rounded-lg border bg-muted overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Generating image...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div className="relative aspect-[3/2] w-full rounded-lg border bg-muted overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Failed to generate image
            </p>
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/2] w-full rounded-lg border bg-muted overflow-hidden shadow-sm">
        <img
          src={dataUrl}
          alt="Export preview"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Preview of exported image</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
