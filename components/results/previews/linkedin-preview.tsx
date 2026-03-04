// components/results/previews/linkedin-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface LinkedInPreviewProps {
  preview: PlatformPreview;
}

export function LinkedInPreview({ preview }: LinkedInPreviewProps) {
  const domain = extractDomain(preview.url);

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-[#1d2226]">
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
      <div className="p-3 space-y-1 bg-[#eef3f8] dark:bg-[#38434f]">
        <div className="text-sm font-semibold text-[#000000e6] dark:text-white line-clamp-2">
          {truncate(preview.title, 100) || "No title"}
        </div>
        <div className="text-xs text-[#00000099] dark:text-[#ffffffb3]">
          {domain}
        </div>
      </div>
    </div>
  );
}
