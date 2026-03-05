// components/landing/recent-checks.tsx
"use client";

import { useEffect, useState } from "react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  Zap,
} from "lucide-react";
import { getRelativeTime, extractDomain } from "@/lib/utils";
import { encodeUrlParam } from "@/lib/url-helpers";
import { getCachedResult } from "@/lib/cache";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { goeyToast } from "goey-toast";

export function RecentChecks() {
  const [mounted, setMounted] = useState(false);
  const { history, removeFromHistory, clearHistory } = useAnalysisStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) {
    return null;
  }

  const recentHistory = history.slice(0, 5);

  const handleClearAll = () => {
    clearHistory();
    goeyToast.success("History cleared");
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-500";
    if (grade.startsWith("B")) return "text-yellow-500";
    if (grade === "C") return "text-orange-500";
    return "text-red-500";
  };

  const getGradeBg = (grade: string) => {
    if (grade.startsWith("A")) return "bg-emerald-500/10 border-emerald-500/20";
    if (grade.startsWith("B")) return "bg-yellow-500/10 border-yellow-500/20";
    if (grade === "C") return "bg-orange-500/10 border-orange-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Recent Checks</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {recentHistory.map((item) => {
              const isCached = getCachedResult(item.url) !== null;

              return (
                <Card
                  key={item.id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link
                            href={`/?url=${encodeUrlParam(item.url)}`}
                            className="font-medium truncate hover:text-primary transition-colors"
                          >
                            {extractDomain(item.url)}
                          </Link>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          {isCached && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                              <Zap className="h-3 w-3" />
                              Cached
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {getRelativeTime(item.analyzedAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-emerald-500">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {item.passCount}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-500">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {item.warningCount}
                            </span>
                            <span className="flex items-center gap-1 text-red-500">
                              <XCircle className="h-3.5 w-3.5" />
                              {item.failCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "text-center px-3 py-2 rounded-lg border",
                            getGradeBg(item.grade),
                          )}
                        >
                          <div className="text-2xl font-bold">{item.score}</div>
                          <div
                            className={`text-sm font-medium ${getGradeColor(item.grade)}`}
                          >
                            {item.grade}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromHistory(item.id);
                            goeyToast.success("Removed from history");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
