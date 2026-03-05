// components/results/previews/discord-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";

interface DiscordPreviewProps {
  preview: PlatformPreview;
}

export function DiscordPreview({ preview }: DiscordPreviewProps) {
  // Discord uses theme-color for the left border, default to Discord blurple
  const themeColor = preview.themeColor || "#5865F2";
  const domain = extractDomain(preview.url);

  return (
    <div
      className="rounded-[4px] bg-[#2b2d31] overflow-hidden"
      style={{ borderLeft: `4px solid ${themeColor}` }}
    >
      <div className="p-3 pr-4">
        {/* Site name */}
        {preview.siteName && (
          <div className="text-xs text-[#b5bac1] mb-1 font-medium">
            {preview.siteName}
          </div>
        )}

        {/* Title */}
        <a
          href={preview.url}
          className="text-[#00a8fc] hover:underline font-semibold text-sm block mb-1 leading-tight"
        >
          {truncate(preview.title, 80) || domain}
        </a>

        {/* Description */}
        {preview.description && (
          <div className="text-sm text-[#dbdee1] line-clamp-3 leading-snug">
            {truncate(preview.description, 200)}
          </div>
        )}

        {/* Image */}
        {preview.image && (
          <div className="mt-3 rounded overflow-hidden max-w-[400px] max-h-[300px]">
            <img
              src={preview.image}
              alt=""
              className="w-full h-auto object-cover"
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
    </div>
  );
}
