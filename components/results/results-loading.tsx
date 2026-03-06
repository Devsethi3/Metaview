"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Globe,
  FileSearch,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import { extractDomain, cn } from "@/lib/utils";
import { MorphingSquare } from "../ui/morphing-square";

// ------------------------------------------------------------------
// Animated Sub-components
// ------------------------------------------------------------------

const AnimatedCheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
    >
      <motion.path
        d="M20 6L9 17l-5-5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
};

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

interface ResultsLoadingProps {
  url: string;
}

const loadingSteps = [
  { id: 1, label: "Connecting to server...", icon: Globe },
  { id: 2, label: "Fetching page content...", icon: FileSearch },
  { id: 3, label: "Parsing meta tags...", icon: FileSearch },
  { id: 4, label: "Analyzing images...", icon: ImageIcon },
  { id: 5, label: "Calculating score...", icon: BarChart3 },
];

export function ResultsLoading({ url }: ResultsLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Main Central Loader */}
        <MorphingSquare />

        {/* URL being analyzed */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Analyzing Website
          </h2>
          <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
            {extractDomain(url)}
          </span>
        </div>

        {/* Progress steps */}
        <div className="space-y-3 text-left max-w-xs mx-auto pt-2">
          {loadingSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-4 text-sm transition-colors duration-300",
                  isCompleted
                    ? "text-emerald-600 dark:text-emerald-500"
                    : isCurrent
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/40",
                )}
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 border",
                    isCompleted
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : isCurrent
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "bg-transparent border-transparent",
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <AnimatedCheckIcon />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        key="spinner"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pending"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <StepIcon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <span className="flex-1">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground/60"
        >
          This usually takes 3-5 seconds
        </motion.p>
      </div>
    </div>
  );
}
