// lib/generate-export-image.ts
import type { AnalysisResult } from "@/types";
import { extractDomain } from "@/lib/utils";

interface ThemeColors {
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  ringBg: string;
}

/**
 * Generate a high-fidelity, minimal PNG image from analysis result
 * Style: Modern Dark Mode SaaS (Linear/Vercel aesthetic)
 * Dimensions: 1200x630 (Standard Open Graph Size)
 */
export async function generateExportImage(
  result: AnalysisResult,
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  // Standard Open Graph Dimensions
  const width = 1200;
  const height = 630;

  // Set actual canvas size (no DPI scaling needed for backend/export generation)
  canvas.width = width;
  canvas.height = height;

  // Modern Dark Theme Palette (Zinc/Slate based)
  const colors: ThemeColors = {
    bg: "#09090b", // Zinc 950
    cardBg: "#18181b", // Zinc 900
    cardBorder: "#27272a", // Zinc 800
    textPrimary: "#ffffff",
    textSecondary: "#e4e4e7", // Zinc 200
    textMuted: "#71717a", // Zinc 500
    accent: "#fafafa",
    success: "#10b981", // Emerald 500
    warning: "#f59e0b", // Amber 500
    error: "#ef4444", // Red 500
    ringBg: "#27272a", // Zinc 800
  };

  const score = result.score.total;
  const domain = extractDomain(result.url);

  // 1. Background Fill
  // Add a very subtle radial gradient to the center for depth
  const bgGradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    width,
  );
  bgGradient.addColorStop(0, "#1c1c1f"); // Slightly lighter center
  bgGradient.addColorStop(1, colors.bg);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Main Glass/Card Container
  const margin = 60;
  const cardX = margin;
  const cardY = margin;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;

  ctx.fillStyle = colors.cardBg;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();

  // Reset shadow for internal elements
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Card Border (Inner Stroke)
  ctx.strokeStyle = colors.cardBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.stroke();

  // ---------------------------------------------------------
  // Left Side: The Score Ring (Hero)
  // ---------------------------------------------------------
  const centerY = height / 2;
  const leftCenter = cardX + cardW * 0.35; // Left 35%
  const radius = 100;

  // Draw Ring Background
  ctx.beginPath();
  ctx.arc(leftCenter, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = colors.ringBg;
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.stroke();

  // Draw Score Progress Arc
  const startAngle = -0.5 * Math.PI; // Top
  const progress = score / 100;
  const endAngle = startAngle + 2 * Math.PI * progress;

  // Determine Score Color
  let scoreColor = colors.success;
  if (score < 50) scoreColor = colors.error;
  else if (score < 90) scoreColor = colors.warning;

  ctx.beginPath();
  ctx.arc(leftCenter, centerY, radius, startAngle, endAngle);
  ctx.strokeStyle = scoreColor;
  ctx.lineWidth = 20;
  ctx.stroke();

  // Draw Score Text
  ctx.fillStyle = colors.textPrimary;
  ctx.font =
    "bold 80px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(score.toString(), leftCenter, centerY + 5); // +5 visual optical adjustment

  // Draw "Score" Label below ring
  ctx.fillStyle = colors.textMuted;
  ctx.font =
    "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("OPTIMIZATION SCORE", leftCenter, centerY + radius + 45);

  // ---------------------------------------------------------
  // Divider Line
  // ---------------------------------------------------------
  const dividerX = cardX + cardW * 0.65; // Split point
  ctx.beginPath();
  ctx.moveTo(dividerX - 100, cardY + 60);
  ctx.lineTo(dividerX - 100, cardY + cardH - 60);
  ctx.strokeStyle = colors.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // ---------------------------------------------------------
  // Right Side: Details & Metrics
  // ---------------------------------------------------------
  const contentStart = dividerX - 40;
  ctx.textAlign = "left";

  // 1. URL / Title
  ctx.fillStyle = colors.textMuted;
  ctx.font =
    "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("ANALYSIS REPORT", contentStart, cardY + 100);

  ctx.fillStyle = colors.textPrimary;
  ctx.font =
    "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  // Truncate domain if too long visually
  const maxTextW = cardW - (contentStart - cardX) - 40;
  const displayDomain =
    domain.length > 25 ? domain.substring(0, 24) + "..." : domain;
  ctx.fillText(displayDomain, contentStart, cardY + 145);

  // 2. Metrics Grid (Passed, Warnings, Failed)
  const metricsY = centerY + 20;
  const rowHeight = 60;

  // Helper to draw a metric row
  const drawMetricRow = (
    y: number,
    label: string,
    count: number,
    color: string,
  ) => {
    // Dot
    ctx.beginPath();
    ctx.arc(contentStart + 10, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Label
    ctx.fillStyle = colors.textSecondary;
    ctx.font =
      "500 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(label, contentStart + 35, y + 8);

    // Count (Right aligned relative to a column)
    ctx.fillStyle = colors.textPrimary;
    ctx.font =
      "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(count.toString(), contentStart + 240, y + 8);
  };

  drawMetricRow(
    metricsY - rowHeight,
    "Passed",
    result.score.passCount,
    colors.success,
  );
  drawMetricRow(
    metricsY,
    "Warnings",
    result.score.warningCount,
    colors.warning,
  );
  drawMetricRow(
    metricsY + rowHeight,
    "Errors",
    result.score.failCount,
    colors.error,
  );

  return canvas.toDataURL("image/png", 1.0);
}

/**
 * Utility to draw rounded rectangles
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
