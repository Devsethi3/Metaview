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
import { ExportModal } from "@/components/export/export-modal";
import ThemeToggle from "../ui/theme-toggle";

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
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState<"png" | "json">(
    "png",
  );

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

  const openExportModal = (tab: "png" | "json") => {
    setExportInitialTab(tab);
    setExportModalOpen(true);
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

                {/* Copy URL Button */}
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

                {/* Export Button */}
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => openExportModal("png")}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="ml-2 hidden lg:inline">Export</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Export analysis
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                  <DropdownMenuItem onClick={() => openExportModal("png")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export analysis
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle />

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

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        result={result}
        initialTab={exportInitialTab}
      />
    </>
  );
}
