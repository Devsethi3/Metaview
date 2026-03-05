"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalysisStore } from "@/stores/analysis-store";
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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRelativeTime, extractDomain, cn } from "@/lib/utils";
import { encodeUrlParam } from "@/lib/url-helpers";
import { getCachedResult } from "@/lib/cache";
import { goeyToast } from "goey-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export function RecentChecks() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { history, removeFromHistory, clearHistory } = useAnalysisStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) return null;

  const recentHistory = history.slice(0, 6);

  const handleClearAll = () => {
    clearHistory();
    goeyToast.success("History cleared");
  };

  const handleCardClick = (url: string) => {
    router.push(`/?url=${encodeUrlParam(url)}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromHistory(id);
    goeyToast.success("Removed from history");
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 bg-emerald-500/10";
    if (score >= 50) return "text-amber-500 bg-amber-500/10";
    return "text-red-500 bg-red-500/10";
  };

  return (
    <section className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-background border">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Recent Analysis</h2>
                <p className="text-xs text-muted-foreground">
                  Your latest checks
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              Clear All
            </Button>
          </div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {recentHistory.map((item) => {
                const isCached = getCachedResult(item.url) !== null;
                const scoreStyle = getScoreColor(item.score);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    variants={itemVariants}
                    exit="exit"
                    className="group"
                  >
                    <div
                      onClick={() => handleCardClick(item.url)}
                      className="cursor-pointer rounded-xl border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.98] h-full flex flex-col justify-between gap-3"
                    >
                      {/* Top: Score + Delete */}
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
                            scoreStyle,
                          )}
                        >
                          <span className="text-lg font-bold tabular-nums leading-none">
                            {item.score}
                          </span>
                          <span className="text-[10px] font-semibold uppercase opacity-80">
                            {item.grade}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, item.id)}
                          className="h-7 w-7 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Domain */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {extractDomain(item.url)}
                        </h3>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {isCached && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Zap className="h-3 w-3 shrink-0 text-blue-500 fill-blue-500" />
                              </TooltipTrigger>
                              <TooltipContent>Cached</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      {/* Bottom: Metrics + Time */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span className="tabular-nums">
                              {item.passCount}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span className="tabular-nums">
                              {item.warningCount}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span className="tabular-nums">
                              {item.failCount}
                            </span>
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(item.analyzedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
