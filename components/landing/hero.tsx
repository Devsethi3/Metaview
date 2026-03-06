// components/landing/hero.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { QUICK_TRY_URLS } from "@/lib/constants";
import { encodeUrlParam } from "@/lib/url-helpers";
import { validateUrl, looksLikeUrl } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function LandingHero() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const router = useRouter();

  const handleValidation = useCallback(
    (value: string, showError: boolean = true) => {
      if (!value.trim()) {
        if (showError && touched) {
          setError("Please enter a URL to analyze");
        }
        return false;
      }

      const validation = validateUrl(value);

      if (!validation.isValid) {
        if (showError) {
          setError(validation.error || "Invalid URL");
        }
        return false;
      }

      setError(null);
      return validation;
    },
    [touched],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const validation = handleValidation(url, true);

    if (!validation) {
      return;
    }

    const result = validateUrl(url);
    if (!result.isValid || !result.normalizedUrl) {
      setError(result.error || "Invalid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    const encodedUrl = encodeUrlParam(result.normalizedUrl);
    router.push(`/?url=${encodedUrl}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);

    if (error && value.trim()) {
      if (looksLikeUrl(value)) {
        const validation = validateUrl(value);
        if (validation.isValid) {
          setError(null);
        }
      } else {
        setError(null);
      }
    }
  };

  const handleInputBlur = () => {
    setTouched(true);
    if (url.trim() && !looksLikeUrl(url)) {
      setError("Please enter a valid URL (e.g., example.com)");
    }
  };

  const handleQuickTry = (quickUrl: string) => {
    setIsLoading(true);
    setError(null);
    router.push(`/?url=${quickUrl}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
              Free & Open Source
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl instrument-serif text-balance tracking-wide">
            Your link previews are broken.{" "}
            <span className="text-primary">Find out why in seconds</span>
          </h1>

          {/* <p className="lg:text-lg text-base text-muted-foreground max-w-2xl mx-auto text-balance">
            Instantly audit your meta tags, preview social cards across platforms, and ship links that actually get clicks
          </p> */}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 max-w-xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter any URL to analyze..."
                  value={url}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "h-10 text-base pr-4 pl-4 transition-colors",
                    error &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  disabled={isLoading}
                  aria-invalid={!!error}
                  aria-describedby={error ? "url-error" : undefined}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-10 px-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Error message */}
            {error && (
              <div
                id="url-error"
                className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Quick try links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Try:</span>
            {QUICK_TRY_URLS.map((quickUrl) => (
              <button
                key={quickUrl}
                type="button"
                onClick={() => handleQuickTry(quickUrl)}
                disabled={isLoading}
                className="text-primary hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              >
                {quickUrl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
