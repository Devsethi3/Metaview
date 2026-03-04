// components/results/results-header.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  RefreshCw,
  Share2,
  Download,
  Copy,
  Twitter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  MoreHorizontal,
  FileJson,
  FileImage,
  Link2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { extractDomain, generateShareText } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { ScoreCircle } from "./score-circle";

interface ResultsHeaderProps {
  result: AnalysisResult;
}

export function ResultsHeader({ result }: ResultsHeaderProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const handleRecheck = () => {
    router.refresh();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareTwitter = () => {
    const text = generateShareText(
      result.url,
      result.score.total,
      result.score.grade,
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metaview-${extractDomain(result.url)}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON exported");
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      // Dynamic import to reduce initial bundle size
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
      a.download = `metaview-${extractDomain(result.url)}-score.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Score card exported as PNG");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const getGradeColorClass = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-500";
    if (grade.startsWith("B")) return "text-yellow-500";
    if (grade === "C") return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left side - URL and score */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to home</span>
              </Link>
            </Button>

            <div className="flex items-center gap-4 min-w-0">
              <ScoreCircle
                score={result.score.total}
                grade={result.score.grade}
                size="sm"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold truncate">
                    {extractDomain(result.url)}
                  </h1>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span
                    className={`font-medium ${getGradeColorClass(result.score.grade)}`}
                  >
                    {result.score.grade}
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {result.score.passCount}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {result.score.warningCount}
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-3.5 w-3.5" />
                      {result.score.failCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 pl-12 lg:pl-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleRecheck}>
                    <RefreshCw className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Re-check</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Re-analyze this URL</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    <Link2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy shareable link</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareTwitter}
                  >
                    <Twitter className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Share on X</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share your score on X</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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

            <Button asChild>
              <Link href="/">Check Another URL</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden export card for PNG generation */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <ExportCard result={result} />
      </div>
    </div>
  );
}

// Export card component for PNG generation
function ExportCard({ result }: { result: AnalysisResult }) {
  const getGradeBg = (grade: string) => {
    if (grade.startsWith("A")) return "bg-emerald-500";
    if (grade.startsWith("B")) return "bg-yellow-500";
    if (grade === "C") return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      id="score-export-card"
      className="w-[600px] p-8 bg-[#09090b] text-white rounded-xl"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
          <span className="text-sm font-bold">M</span>
        </div>
        <span className="text-lg font-semibold">Metaview</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-gray-400 text-sm mb-1">
            {extractDomain(result.url)}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold">{result.score.total}</span>
            <span
              className={`text-2xl font-semibold px-3 py-1 rounded ${getGradeBg(result.score.grade)}`}
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

      <div className="text-center text-gray-500 text-sm">
        metaview.dev • {new Date(result.analyzedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
