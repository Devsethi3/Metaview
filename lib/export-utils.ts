// lib/export-utils.ts
import type { AnalysisResult } from "@/types";
import { extractDomain } from "@/lib/utils";

/**
 * Generate export data for JSON
 */
export function generateExportJSON(result: AnalysisResult): string {
  const exportData = {
    meta: {
      exportedAt: new Date().toISOString(),
      exportedFrom: "Metaview",
      version: "1.0.0",
    },
    analysis: {
      url: result.url,
      analyzedAt: result.analyzedAt,
      score: {
        total: result.score.total,
        grade: result.score.grade,
        summary: {
          passed: result.score.passCount,
          warnings: result.score.warningCount,
          failed: result.score.failCount,
        },
        categories: result.score.categories.map((cat) => ({
          name: cat.name,
          points: cat.points,
          maxPoints: cat.maxPoints,
          percentage: Math.round((cat.points / cat.maxPoints) * 100),
        })),
      },
      metadata: {
        basic: result.basic,
        openGraph: result.openGraph,
        twitter: result.twitter,
      },
      technical: {
        https: result.site.https,
        loadTime: result.site.loadTime,
        httpStatus: result.site.httpStatus,
        robotsTxt: result.site.robotsTxt.exists,
        sitemap: result.site.sitemapXml.exists,
      },
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download a file
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  type: string,
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 */
export function generateFilename(
  url: string,
  extension: "png" | "json",
): string {
  const domain = extractDomain(url).replace(/[^a-zA-Z0-9]/g, "-");
  const timestamp = new Date().toISOString().split("T")[0];
  return `metaview-${domain}-${timestamp}.${extension}`;
}

/**
 * Get grade color classes
 */
export function getGradeColors(grade: string): {
  bg: string;
  text: string;
  border: string;
} {
  if (grade.startsWith("A")) {
    return {
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      border: "border-emerald-500",
    };
  }
  if (grade.startsWith("B")) {
    return {
      bg: "bg-yellow-500",
      text: "text-yellow-500",
      border: "border-yellow-500",
    };
  }
  if (grade === "C") {
    return {
      bg: "bg-orange-500",
      text: "text-orange-500",
      border: "border-orange-500",
    };
  }
  return {
    bg: "bg-red-500",
    text: "text-red-500",
    border: "border-red-500",
  };
}
