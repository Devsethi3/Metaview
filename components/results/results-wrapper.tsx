"use client";

import { useEffect, useState, useCallback } from "react";
import { analyzeUrl } from "@/app/actions/analyze-url";
import { useAnalysisStore } from "@/stores/analysis-store";
import { ResultsHeader } from "./results-header";
import { ResultsTabs } from "./results-tab";
import { ResultsError } from "./results-error";
import { ResultsLoading } from "./results-loading";
import type { AnalysisResult } from "@/types";

interface ResultsWrapperProps {
  url: string;
}

export function ResultsWrapper({ url }: ResultsWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { setResult: storeResult } = useAnalysisStore();

  const runAnalysis = useCallback(async () => {
    if (!url) {
      setError("No URL provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting analysis for:", url);
      const response = await analyzeUrl(url);
      console.log("Analysis response:", response);

      if (response.success && response.data) {
        setResult(response.data);
        storeResult(response.data);
      } else {
        setError(response.error || "An unexpected error occurred");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }, [url, storeResult]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  if (isLoading) {
    return <ResultsLoading url={url} />;
  }

  if (error) {
    return <ResultsError url={url} error={error} onRetry={runAnalysis} />;
  }

  if (!result) {
    return (
      <ResultsError url={url} error="No results found" onRetry={runAnalysis} />
    );
  }

  return (
    <div className="min-h-screen">
      <ResultsHeader result={result} />
      <ResultsTabs result={result} />
    </div>
  );
}
