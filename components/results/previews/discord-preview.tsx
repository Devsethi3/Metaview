// components/results/previews/discord-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface DiscordPreviewProps {
  preview: PlatformPreview;
}

export function DiscordPreview({ preview }: DiscordPreviewProps) {
  const themeColor = preview.themeColor || "#5865F2";
  const domain = extractDomain(preview.url);

  return (
    <div
      className="rounded bg-[#2b2d31] p-4 border-l-4"
      style={{ borderLeftColor: themeColor }}
    >
      {/* Site name */}
      <div className="text-xs text-[#b5bac1] mb-1">
        {preview.siteName || domain}
      </div>

      {/* Title */}
      <a
        href={preview.url}
        className="text-[#00a8fc] hover:underline font-medium text-sm block mb-1"
      >
        {truncate(preview.title, 80) || "No title"}
      </a>

      {/* Description */}
      {preview.description && (
        <div className="text-sm text-[#dbdee1] line-clamp-3 mb-2">
          {truncate(preview.description, 200)}
        </div>
      )}

      {/* Image */}
      {preview.image && (
        <div className="mt-2 rounded overflow-hidden max-w-xs">
          <img
            src={preview.image}
            alt=""
            className="w-full h-auto max-h-48 object-cover"
            onError={(e) => {
              e.currentTarget.parentElement?.classList.add("hidden");
            }}
          />
        </div>
      )}
    </div>
  );
}
