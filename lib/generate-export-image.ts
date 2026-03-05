// lib/generate-export-image.ts
import type { AnalysisResult } from "@/types";
import { extractDomain } from "@/lib/utils";
import { getGradeColors } from "@/lib/export-utils";

/**
 * Generate PNG image from analysis result
 * Uses canvas for reliable, theme-independent rendering
 */
export async function generateExportImage(
  result: AnalysisResult,
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  // Canvas dimensions (2x for retina)
  const scale = 2;
  const width = 600;
  const height = 400;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Colors
  const colors = {
    bg: "#09090b",
    cardBg: "#18181b",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    textDim: "#71717a",
    border: "#27272a",
    emerald: "#10b981",
    yellow: "#eab308",
    orange: "#f97316",
    red: "#ef4444",
  };

  // Get grade color
  const getGradeColor = (grade: string): string => {
    if (grade.startsWith("A")) return colors.emerald;
    if (grade.startsWith("B")) return colors.yellow;
    if (grade === "C") return colors.orange;
    return colors.red;
  };

  // Draw background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw card background
  ctx.fillStyle = colors.cardBg;
  roundRect(ctx, 20, 20, width - 40, height - 40, 16);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  roundRect(ctx, 20, 20, width - 40, height - 40, 16);
  ctx.stroke();

  // Header - Logo and brand
  ctx.fillStyle = colors.text;
  ctx.font = "bold 18px Inter, system-ui, sans-serif";
  ctx.fillText("Metaview", 48, 60);

  // Logo circle
  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.arc(36, 55, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.text;
  ctx.font = "bold 10px Inter, system-ui, sans-serif";
  ctx.fillText("M", 32, 59);

  // Domain
  ctx.fillStyle = colors.textMuted;
  ctx.font = "14px Inter, system-ui, sans-serif";
  ctx.fillText(extractDomain(result.url), 48, 90);

  // Score
  ctx.fillStyle = colors.text;
  ctx.font = "bold 64px Inter, system-ui, sans-serif";
  ctx.fillText(result.score.total.toString(), 48, 165);

  // Grade badge
  const gradeX = 48 + ctx.measureText(result.score.total.toString()).width + 16;
  const gradeColor = getGradeColor(result.score.grade);
  ctx.fillStyle = gradeColor;
  roundRect(ctx, gradeX, 125, 50, 36, 8);
  ctx.fill();
  ctx.fillStyle = colors.bg;
  ctx.font = "bold 20px Inter, system-ui, sans-serif";
  ctx.fillText(result.score.grade, gradeX + 10, 150);

  // Stats row
  const statsY = 200;
  const stats = [
    { label: "Passed", value: result.score.passCount, color: colors.emerald },
    {
      label: "Warnings",
      value: result.score.warningCount,
      color: colors.yellow,
    },
    { label: "Failed", value: result.score.failCount, color: colors.red },
  ];

  let statsX = 48;
  stats.forEach((stat) => {
    // Dot
    ctx.fillStyle = stat.color;
    ctx.beginPath();
    ctx.arc(statsX + 5, statsY + 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Value and label
    ctx.fillStyle = colors.text;
    ctx.font = "bold 14px Inter, system-ui, sans-serif";
    ctx.fillText(stat.value.toString(), statsX + 18, statsY + 12);
    ctx.fillStyle = colors.textMuted;
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText(stat.label, statsX + 35, statsY + 12);

    statsX += 100;
  });

  // Categories
  const categories = result.score.categories.slice(0, 6);
  const catY = 250;
  const catWidth =
    (width - 40 - 48 - 48 - (categories.length - 1) * 8) / categories.length;

  categories.forEach((cat, index) => {
    const catX = 48 + index * (catWidth + 8);
    const percentage = Math.round((cat.points / cat.maxPoints) * 100);

    // Category background
    ctx.fillStyle = colors.bg;
    roundRect(ctx, catX, catY, catWidth, 70, 8);
    ctx.fill();

    // Category name
    ctx.fillStyle = colors.textDim;
    ctx.font = "10px Inter, system-ui, sans-serif";
    const catName = cat.name.length > 8 ? cat.name.slice(0, 7) + "…" : cat.name;
    ctx.fillText(catName, catX + 8, catY + 20);

    // Category score
    ctx.fillStyle = colors.text;
    ctx.font = "bold 14px Inter, system-ui, sans-serif";
    ctx.fillText(`${cat.points}/${cat.maxPoints}`, catX + 8, catY + 42);

    // Progress bar background
    ctx.fillStyle = colors.border;
    roundRect(ctx, catX + 8, catY + 52, catWidth - 16, 4, 2);
    ctx.fill();

    // Progress bar fill
    const barColor =
      percentage >= 80
        ? colors.emerald
        : percentage >= 60
          ? colors.yellow
          : colors.red;
    ctx.fillStyle = barColor;
    roundRect(
      ctx,
      catX + 8,
      catY + 52,
      (catWidth - 16) * (percentage / 100),
      4,
      2,
    );
    ctx.fill();
  });

  // Footer
  ctx.fillStyle = colors.textDim;
  ctx.font = "11px Inter, system-ui, sans-serif";
  const footerText = `metaview.dev • ${new Date(result.analyzedAt).toLocaleDateString()}`;
  const footerWidth = ctx.measureText(footerText).width;
  ctx.fillText(footerText, (width - footerWidth) / 2, height - 45);

  // Convert to data URL
  return canvas.toDataURL("image/png", 1.0);
}

/**
 * Helper to draw rounded rectangles
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
