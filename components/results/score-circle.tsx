// components/results/score-circle.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  grade: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function ScoreCircle({
  score,
  grade,
  size = "md",
  animate = true,
}: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) return;

    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animate]);

  const sizeConfig = {
    sm: { wrapper: "h-14 w-14", text: "text-lg", grade: "text-xs", stroke: 3 },
    md: { wrapper: "h-24 w-24", text: "text-3xl", grade: "text-sm", stroke: 4 },
    lg: { wrapper: "h-32 w-32", text: "text-4xl", grade: "text-lg", stroke: 5 },
  };

  const config = sizeConfig[size];
  const radius = size === "sm" ? 24 : size === "md" ? 44 : 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "stroke-emerald-500";
    if (grade.startsWith("B")) return "stroke-yellow-500";
    if (grade === "C") return "stroke-orange-500";
    return "stroke-red-500";
  };

  const getGradeTextColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-500";
    if (grade.startsWith("B")) return "text-yellow-500";
    if (grade === "C") return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className={cn("relative", config.wrapper)}>
      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${(radius + config.stroke) * 2} ${(radius + config.stroke) * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={radius + config.stroke}
          cy={radius + config.stroke}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={radius + config.stroke}
          cy={radius + config.stroke}
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          className={getGradeColor(grade)}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animate ? 1 : 0, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold", config.text)}>{displayScore}</span>
        {size !== "sm" && (
          <span
            className={cn(
              "font-medium",
              config.grade,
              getGradeTextColor(grade),
            )}
          >
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}
