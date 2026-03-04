// hooks/use-analysis.ts
"use client";

import { useState, useCallback } from "react";
import { analyzeUrl } from "@/app/actions/analyze-url";
import { useAnalysisStore } from "@/stores/analysis-store";
import type { AnalysisResult } from "@/types";

export function useAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setResult, result } = useAnalysisStore();

  const analyze = useCallback(
    async (url: string): Promise<AnalysisResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await analyzeUrl(url);

        if (response.success && response.data) {
          setResult(response.data);
          return response.data;
        } else {
          setError(response.error || "Analysis failed");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setResult],
  );

  return {
    analyze,
    isLoading,
    error,
    result,
  };
}
