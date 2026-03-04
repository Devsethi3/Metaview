// components/results/results-loading.tsx
"use client";

import { Loader2 } from "lucide-react";
import { extractDomain } from "@/lib/utils";

interface ResultsLoadingProps {
  url: string;
}

export function ResultsLoading({ url }: ResultsLoadingProps) {
  const steps = [
    "Fetching page content...",
    "Parsing meta tags...",
    "Analyzing images...",
    "Checking robots.txt...",
    "Calculating score...",
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="relative">
          <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Analyzing...</h2>
          <p className="text-muted-foreground">{extractDomain(url)}</p>
        </div>

        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={step}
              className="text-sm text-muted-foreground animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
