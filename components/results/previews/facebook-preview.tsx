// components/results/previews/facebook-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface FacebookPreviewProps {
  preview: PlatformPreview;
}

export function FacebookPreview({ preview }: FacebookPreviewProps) {
  const domain = extractDomain(preview.url).toUpperCase();

  return (
    <div className="border rounded-lg overflow-hidden bg-[#f0f2f5] dark:bg-[#242526]">
      {/* Image */}
      {preview.image ? (
        <div className="aspect-[1.91/1] bg-muted relative">
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <div className="text-[12px] text-[#65676b] dark:text-[#b0b3b8] uppercase tracking-wide">
          {domain}
        </div>
        <div className="text-[16px] font-semibold text-[#050505] dark:text-[#e4e6eb] line-clamp-2 mt-1">
          {truncate(preview.title, 80) || "No title"}
        </div>
        {preview.description && (
          <div className="text-[14px] text-[#65676b] dark:text-[#b0b3b8] line-clamp-1 mt-0.5">
            {truncate(preview.description, 60)}
          </div>
        )}
      </div>
    </div>
  );
}
