// components/results/previews/slack-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";
import { getFaviconUrl } from "@/lib/url-helpers";
import { ImageIcon } from "lucide-react";

interface SlackPreviewProps {
  preview: PlatformPreview;
}

export function SlackPreview({ preview }: SlackPreviewProps) {
  const domain = extractDomain(preview.url);
  const faviconUrl = getFaviconUrl(preview.url, 32);

  return (
    <div className="flex gap-3 p-3 bg-white dark:bg-[#1a1d21] rounded border-l-4 border-l-[#36c5f0]">
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <img
            src={faviconUrl}
            alt=""
            className="h-4 w-4 rounded"
            loading="lazy"
          />
          <span className="text-xs font-bold text-[#1d1c1d] dark:text-white">
            {preview.siteName || domain}
          </span>
        </div>
        <a
          href={preview.url}
          className="text-[#1264a3] dark:text-[#1d9bd1] hover:underline font-bold text-sm block mb-0.5"
        >
          {truncate(preview.title, 100) || "No title"}
        </a>
        {preview.description && (
          <div className="text-sm text-[#616061] dark:text-[#ababad] line-clamp-2">
            {truncate(preview.description, 150)}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {preview.image && (
        <div className="w-20 h-20 rounded overflow-hidden shrink-0 bg-muted">
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).classList.add(
                "hidden",
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
