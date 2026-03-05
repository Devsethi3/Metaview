// components/results/results-wrapper.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { analyzeUrl } from "@/app/actions/analyze-url";
import { useAnalysisStore } from "@/stores/analysis-store";
import {
  getCachedResult,
  setCachedResult,
  removeCachedResult,
} from "@/lib/cache";
import { ResultsHeader } from "./results-header";
import { ResultsTabs } from "./results-tab";
import { ResultsError } from "./results-error";
import { ResultsLoading } from "./results-loading";
import { CacheIndicator } from "./cache-indicator";
import type { AnalysisResult } from "@/types";

interface ResultsWrapperProps {
  url: string;
}

export function ResultsWrapper({ url }: ResultsWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    fromCache: boolean;
    timestamp?: number;
  } | null>(null);
  const { setResult: storeResult } = useAnalysisStore();
  const hasInitialized = useRef(false);

  const runAnalysis = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!url) {
        setError("No URL provided");
        setIsLoading(false);
        return;
      }

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = getCachedResult(url);
        if (cached) {
          setResult(cached.result);
          setCacheInfo({ fromCache: true, timestamp: cached.timestamp });
          storeResult(cached.result);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      setCacheInfo(null);

      try {
        const response = await analyzeUrl(url);

        if (response.success && response.data) {
          setResult(response.data);
          setCacheInfo({ fromCache: false });
          storeResult(response.data);
          setCachedResult(url, response.data);
        } else {
          setError(response.error || "An unexpected error occurred");
        }
      } catch (err) {
        console.error("[ResultsWrapper] Analysis error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [url, storeResult],
  );

  const handleReanalyze = useCallback(async () => {
    removeCachedResult(url);
    await runAnalysis(true);
  }, [url, runAnalysis]);

  // Initial load
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      runAnalysis(false);
    }
  }, [runAnalysis]);

  if (isLoading) {
    return <ResultsLoading url={url} />;
  }

  if (error) {
    return (
      <ResultsError url={url} error={error} onRetry={() => runAnalysis(true)} />
    );
  }

  if (!result) {
    return (
      <ResultsError
        url={url}
        error="No results found"
        onRetry={() => runAnalysis(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResultsHeader
        result={result}
        onReanalyze={handleReanalyze}
        cacheInfo={cacheInfo}
      />
      {cacheInfo?.fromCache && cacheInfo.timestamp && (
        <CacheIndicator
          timestamp={cacheInfo.timestamp}
          onRefresh={handleReanalyze}
        />
      )}
      <ResultsTabs result={result} />
    </div>
  );
}
