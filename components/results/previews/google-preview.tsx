// components/results/previews/google-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";

interface GooglePreviewProps {
  preview: PlatformPreview;
}

export function GooglePreview({ preview }: GooglePreviewProps) {
  const domain = extractDomain(preview.url);

  return (
    <div className="bg-white dark:bg-[#202124] p-4 rounded-lg border">
      <div className="space-y-1">
        {/* URL breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {preview.favicon && (
            <img
              src={preview.favicon}
              alt=""
              className="h-4 w-4 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <span className="text-[#202124] dark:text-[#bdc1c6]">{domain}</span>
          <span className="text-[#5f6368] dark:text-[#9aa0a6]">
            › {preview.url.split("/").slice(3).join(" › ") || "Home"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-normal">
          {truncate(preview.title, 60) || "No title"}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
          {truncate(preview.description, 160) || "No description available"}
        </p>
      </div>
    </div>
  );
}
