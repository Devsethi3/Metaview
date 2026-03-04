// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeUrl(input: string): string {
  let url = input.trim();

  // Remove leading/trailing whitespace and quotes
  url = url.replace(/^["']|["']$/g, "");

  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return url;
  }
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function truncate(
  str: string | null | undefined,
  length: number,
): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}

export function getGrade(score: number): {
  grade: string;
  color: string;
  bg: string;
  message: string;
} {
  if (score >= 95)
    return {
      grade: "A+",
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      message: "Outstanding! Your metadata is perfectly optimized.",
    };
  if (score >= 90)
    return {
      grade: "A",
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      message: "Excellent! Just a few minor improvements possible.",
    };
  if (score >= 85)
    return {
      grade: "A-",
      color: "text-green-500",
      bg: "bg-green-500",
      message: "Great job! Your link previews look professional.",
    };
  if (score >= 80)
    return {
      grade: "B+",
      color: "text-lime-500",
      bg: "bg-lime-500",
      message: "Good work! A few optimizations will make it perfect.",
    };
  if (score >= 75)
    return {
      grade: "B",
      color: "text-yellow-500",
      bg: "bg-yellow-500",
      message: "Solid foundation. Some improvements recommended.",
    };
  if (score >= 70)
    return {
      grade: "B-",
      color: "text-yellow-500",
      bg: "bg-yellow-500",
      message: "Decent start. Several areas need attention.",
    };
  if (score >= 60)
    return {
      grade: "C",
      color: "text-orange-500",
      bg: "bg-orange-500",
      message: "Needs work. Multiple issues affecting previews.",
    };
  if (score >= 50)
    return {
      grade: "D",
      color: "text-red-400",
      bg: "bg-red-400",
      message: "Poor. Many critical metadata tags are missing.",
    };
  return {
    grade: "F",
    color: "text-red-500",
    bg: "bg-red-500",
    message: "Critical issues. Most previews will look broken.",
  };
}

export function generateShareText(
  url: string,
  score: number,
  grade: string,
): string {
  const emoji =
    score >= 90 ? "🚀" : score >= 75 ? "✅" : score >= 50 ? "⚠️" : "❌";
  return `${emoji} My site scored ${score}/100 (${grade}) on Metaview!\n\nCheck your link previews → metaview.dev/?url=${encodeURIComponent(url)}`;
}

export function getRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}
