// components/results/results-error.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ResultsErrorProps {
  url: string;
  error: string;
  onRetry?: () => void;
}

export function ResultsError({ url, error, onRetry }: ResultsErrorProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card className="border-destructive/50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>

              <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
              <p className="text-muted-foreground mb-4">{error}</p>

              <div className="bg-muted rounded-lg p-3 mb-6">
                <p className="text-sm font-mono break-all text-muted-foreground">
                  {url}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Try Another URL
                  </Link>
                </Button>
                {onRetry && (
                  <Button onClick={onRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Analysis
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Common issues:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground/50">•</span>
              The URL might be unreachable or behind authentication
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground/50">•</span>
              The page might have taken too long to respond
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground/50">•</span>
              The server might be blocking automated requests
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground/50">•</span>
              Localhost URLs are not supported
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
