// components/results/score-summary.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface ScoreSummaryProps {
  result: AnalysisResult;
}

export function ScoreSummary({ result }: ScoreSummaryProps) {
  const { score } = result;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-500";
    if (grade.startsWith("B")) return "text-yellow-500";
    if (grade === "C") return "text-orange-500";
    return "text-red-500";
  };

  const getGradeBg = (grade: string) => {
    if (grade.startsWith("A")) return "bg-emerald-500";
    if (grade.startsWith("B")) return "bg-yellow-500";
    if (grade === "C") return "bg-orange-500";
    return "bg-red-500";
  };

  const getGradeRing = (grade: string) => {
    if (grade.startsWith("A")) return "ring-emerald-500/20";
    if (grade.startsWith("B")) return "ring-yellow-500/20";
    if (grade === "C") return "ring-orange-500/20";
    return "ring-red-500/20";
  };

  const getGradeMessage = (grade: string) => {
    if (grade === "A+")
      return "Outstanding! Your metadata is perfectly optimized.";
    if (grade === "A")
      return "Excellent! Just a few minor improvements possible.";
    if (grade === "A-")
      return "Great job! Your link previews look professional.";
    if (grade === "B+")
      return "Good work! A few optimizations will make it perfect.";
    if (grade === "B")
      return "Solid foundation. Some improvements recommended.";
    if (grade === "B-") return "Decent start. Several areas need attention.";
    if (grade === "C") return "Needs work. Multiple issues affecting previews.";
    if (grade === "D") return "Poor. Many critical metadata tags are missing.";
    return "Critical issues. Most previews will look broken.";
  };

  return (
    <Card className="overflow-hidden bg-sidebar">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
          {/* Score Circle */}
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn(
                "relative h-24 w-24 rounded-full flex items-center justify-center ring-4 shrink-0",
                getGradeRing(score.grade),
              )}
            >
              <div className="text-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold"
                >
                  {score.total}
                </motion.span>
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    getGradeColor(score.grade),
                  )}
                >
                  {score.grade}
                </span>
              </div>
              {/* Progress ring */}
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={getGradeColor(score.grade).replace(
                    "text-",
                    "stroke-",
                  )}
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 46 * (1 - score.total / 100),
                  }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                />
              </svg>
            </motion.div>

            {/* Grade message */}
            <div className="flex-1 min-w-0">
              <p className="lg:text-xl text-base">
                {getGradeMessage(score.grade)}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-16 w-px bg-border" />

          {/* Stats */}
          <div className="flex items-center gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{score.passCount}</div>
                {/* <div className="text-xs text-muted-foreground">Passed</div> */}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {score.warningCount}
                </div>
                {/* <div className="text-xs text-muted-foreground">Warnings</div> */}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{score.failCount}</div>
                {/* <div className="text-xs text-muted-foreground">Failed</div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-6 border-t">
          {score.categories.slice(0, 6).map((category) => {
            const percentage = Math.round(
              (category.points / category.maxPoints) * 100,
            );
            return (
              <div key={category.key} className="text-center">
                <div className="text-xs text-muted-foreground mb-1 truncate">
                  {category.name}
                </div>
                <div className="text-sm font-medium">
                  {category.points}/{category.maxPoints}
                </div>
                <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      percentage >= 80
                        ? "bg-emerald-500"
                        : percentage >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
