// components/results/cache-indicator.tsx
"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from "lucide-react";
import { formatCacheAge } from "@/lib/cache";

interface CacheIndicatorProps {
  timestamp: number;
  onRefresh: () => void;
}

export function CacheIndicator({ timestamp, onRefresh }: CacheIndicatorProps) {
  return (
    <div className="border-b bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            <span>
              Loaded from cache | {formatCacheAge(timestamp)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
