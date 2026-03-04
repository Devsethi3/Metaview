// components/results/previews/telegram-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface TelegramPreviewProps {
  preview: PlatformPreview;
}

export function TelegramPreview({ preview }: TelegramPreviewProps) {
  const domain = extractDomain(preview.url);

  return (
    <div className="bg-[#effdde] dark:bg-[#2a5f4e] rounded-lg overflow-hidden max-w-md">
      {/* Image */}
      {preview.image && (
        <div className="aspect-[1.6/1] bg-[#d9fdd3] dark:bg-[#1e4a3d]">
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.parentElement?.classList.add("hidden");
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <div className="text-[15px] font-medium text-[#000000] dark:text-white line-clamp-2">
          {truncate(preview.title, 80) || "No title"}
        </div>
        {preview.description && (
          <div className="text-[14px] text-[#000000]/70 dark:text-white/70 line-clamp-2 mt-1">
            {truncate(preview.description, 120)}
          </div>
        )}
        <div className="text-[13px] text-[#168acd] dark:text-[#6ab7f5] mt-2">
          {domain}
        </div>
      </div>
    </div>
  );
}
