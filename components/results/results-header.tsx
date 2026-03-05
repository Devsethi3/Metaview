// components/results/results-header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  RefreshCw,
  Download,
  ArrowLeft,
  FileJson,
  FileImage,
  Link2,
  Twitter,
  Loader2,
  MoreVertical,
  ChevronDown,
  Share2,
  Home,
  Copy,
} from "lucide-react";
import { extractDomain } from "@/lib/utils";
import { encodeUrlParam } from "@/lib/url-helpers";
import type { AnalysisResult } from "@/types";
import { toast } from "sonner";

interface ResultsHeaderProps {
  result: AnalysisResult;
  onReanalyze?: () => void;
  cacheInfo?: { fromCache: boolean; timestamp?: number } | null;
}

export function ResultsHeader({
  result,
  onReanalyze,
  cacheInfo,
}: ResultsHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const domain = extractDomain(result.url);

  // Action handlers
  const handleReanalyze = async () => {
    if (!onReanalyze) return;
    setIsReanalyzing(true);
    try {
      await onReanalyze();
      toast.success("Analysis complete");
    } catch {
      toast.error("Failed to re-analyze");
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareableUrl = `${window.location.origin}/?url=${encodeUrlParam(result.url)}`;
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleShareTwitter = () => {
    const shareableUrl = `${window.location.origin}/?url=${encodeUrlParam(result.url)}`;
    const text = `🚀 Check out my site's link preview analysis on Metaview!\n\n${shareableUrl}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(result, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `metaview-${domain}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("JSON exported");
    } catch {
      toast.error("Failed to export JSON");
    }
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const element = document.getElementById("score-export-card");
      if (!element) {
        toast.error("Export element not found");
        return;
      }
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#09090b",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `metaview-${domain}-score.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Score card exported");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Left Section: Back + URL */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back Button */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      asChild
                    >
                      <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to home</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Back to home</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Divider */}
              <div className="h-4 w-px bg-border shrink-0 hidden sm:block" />

              {/* URL Display */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
                  {domain}
                </span>

                {/* External Link */}
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="sr-only">Open URL</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Open in new tab
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Copy URL Button (visible on larger screens) */}
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hidden md:flex"
                        onClick={handleCopyUrl}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy URL</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Copy URL</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2">
                {/* Re-analyze Button */}
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReanalyze}
                        disabled={isReanalyzing}
                        className="h-8"
                      >
                        {isReanalyzing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-2 hidden lg:inline">
                          Re-analyze
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Run fresh analysis
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Share Dropdown */}
                <DropdownMenu>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="ml-2 hidden lg:inline">Share</span>
                            <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Share options
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Link2 className="h-4 w-4 mr-2" />
                      Copy shareable link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareTwitter}>
                      <Twitter className="h-4 w-4 mr-2" />
                      Share on X
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Dropdown */}
                <DropdownMenu>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={isExporting}
                          >
                            {isExporting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-2 hidden lg:inline">
                              Export
                            </span>
                            <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Export options
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleExportPNG}
                      disabled={isExporting}
                    >
                      <FileImage className="h-4 w-4 mr-2" />
                      Export as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJSON}>
                      <FileJson className="h-4 w-4 mr-2" />
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:hidden"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={handleCopyUrl}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleReanalyze}
                    disabled={isReanalyzing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-analyze
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy shareable link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareTwitter}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Share on X
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleExportPNG}
                    disabled={isExporting}
                  >
                    <FileImage className="h-4 w-4 mr-2" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Analysis Button */}
              <Button size="sm" className="h-8" asChild>
                <Link href="/">
                  <Home className="h-3.5 w-3.5 md:hidden" />
                  <span className="hidden md:inline">New Analysis</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hidden Export Card */}
      <ExportCard result={result} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Card (Hidden, used for PNG generation)
// ─────────────────────────────────────────────────────────────────────────────

function ExportCard({ result }: { result: AnalysisResult }) {
  const getGradeBgClass = (grade: string): string => {
    if (grade.startsWith("A")) return "bg-emerald-500";
    if (grade.startsWith("B")) return "bg-yellow-500";
    if (grade === "C") return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      id="score-export-card"
      className="fixed -left-[9999px] -top-[9999px] w-[600px] p-8 bg-[#09090b] text-white rounded-xl"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
          <span className="text-sm font-bold">M</span>
        </div>
        <span className="text-lg font-semibold">Metaview</span>
      </div>

      {/* Score Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-gray-400 text-sm mb-1">
            {extractDomain(result.url)}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold">{result.score.total}</span>
            <span
              className={`text-2xl font-semibold px-3 py-1 rounded ${getGradeBgClass(result.score.grade)}`}
            >
              {result.score.grade}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>{result.score.passCount} passed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>{result.score.warningCount} warnings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>{result.score.failCount} failed</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {result.score.categories.slice(0, 6).map((cat) => (
          <div key={cat.key} className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">{cat.name}</div>
            <div className="text-lg font-semibold">
              {cat.points}/{cat.maxPoints}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        metaview.dev • {new Date(result.analyzedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
