// components/results/previews/imessage-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";

interface IMessagePreviewProps {
  preview: PlatformPreview;
}

export function IMessagePreview({ preview }: IMessagePreviewProps) {
  const domain = extractDomain(preview.url);

  return (
    <div className="bg-[#e9e9eb] dark:bg-[#3a3a3c] rounded-2xl overflow-hidden max-w-xs">
      {/* Image */}
      {preview.image && (
        <div className="aspect-[1.6/1] overflow-hidden">
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

      {/* Content */}
      <div className="p-3">
        <div className="text-[11px] text-[#8e8e93] uppercase tracking-wide mb-1">
          {domain}
        </div>
        <div className="text-[15px] font-semibold text-[#000000] dark:text-white line-clamp-2 leading-tight">
          {truncate(preview.title, 70) || "No title"}
        </div>
        {preview.description && (
          <div className="text-[13px] text-[#8e8e93] line-clamp-2 mt-0.5 leading-snug">
            {truncate(preview.description, 80)}
          </div>
        )}
      </div>
    </div>
  );
}
