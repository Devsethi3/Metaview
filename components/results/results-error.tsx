// components/results/results-error.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ResultsErrorProps {
  url: string;
  error: string;
  onRetry?: () => void;
}

export function ResultsError({ url, error, onRetry }: ResultsErrorProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>

            <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
            <p className="text-muted-foreground mb-2">{error}</p>
            <p className="text-sm text-muted-foreground mb-6 font-mono bg-muted px-3 py-2 rounded break-all">
              {url}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Another URL
                </Link>
              </Button>
              {onRetry && (
                <Button onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-muted-foreground text-center">
          <p className="mb-2">Common issues:</p>
          <ul className="space-y-1">
            <li>• The URL might be unreachable or behind authentication</li>
            <li>• The page might have taken too long to respond</li>
            <li>• The server might be blocking automated requests</li>
            <li>• Localhost URLs are not supported</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
