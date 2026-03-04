// components/results/previews/whatsapp-preview.tsx
"use client";

import type { PlatformPreview } from "@/types";
import { truncate, extractDomain } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface WhatsAppPreviewProps {
  preview: PlatformPreview;
}

export function WhatsAppPreview({ preview }: WhatsAppPreviewProps) {
  const domain = extractDomain(preview.url);

  return (
    <div className="bg-[#025c4c] dark:bg-[#1f2c34] rounded-lg overflow-hidden max-w-sm">
      <div className="flex gap-3 p-2">
        {/* Thumbnail */}
        {preview.image ? (
          <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-[#128c7e]">
            <img
              src={preview.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded bg-[#128c7e] flex items-center justify-center shrink-0">
            <ImageIcon className="h-6 w-6 text-white/50" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <div className="text-[13px] font-medium text-white line-clamp-2 leading-tight">
            {truncate(preview.title, 60) || "No title"}
          </div>
          {preview.description && (
            <div className="text-[12px] text-white/70 line-clamp-1 mt-0.5">
              {truncate(preview.description, 50)}
            </div>
          )}
          <div className="text-[11px] text-white/50 mt-1">{domain}</div>
        </div>
      </div>
    </div>
  );
}
