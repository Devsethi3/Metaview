// components/results/previews/twitter-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface TwitterPreviewProps {
  preview: PlatformPreview;
}

export function TwitterPreview({ preview }: TwitterPreviewProps) {
  const domain = extractDomain(preview.url);

  return (
    <div className="border rounded-2xl overflow-hidden bg-white dark:bg-black">
      {/* Image */}
      {preview.image ? (
        <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove("hidden");
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
      <div className="p-3 space-y-0.5">
        <div className="text-[13px] text-[#536471] dark:text-[#71767b]">
          {domain}
        </div>
        <div className="text-[15px] text-[#0f1419] dark:text-[#e7e9ea] font-normal line-clamp-1">
          {truncate(preview.title, 70) || "No title"}
        </div>
        <div className="text-[15px] text-[#536471] dark:text-[#71767b] line-clamp-2">
          {truncate(preview.description, 125) || "No description"}
        </div>
      </div>
    </div>
  );
}
