// components/landing/hero.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { QUICK_TRY_URLS } from "@/lib/constants";
import { normalizeUrl } from "@/lib/utils";
import { toast } from "sonner";

export function LandingHero() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsLoading(true);
    const normalizedUrl = normalizeUrl(url.trim());

    // Use router.push for navigation
    router.push(`/?url=${encodeURIComponent(normalizedUrl)}`);
  };

  const handleQuickTry = (quickUrl: string) => {
    setIsLoading(true);
    const normalizedUrl = normalizeUrl(quickUrl);
    router.push(`/?url=${encodeURIComponent(normalizedUrl)}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Free & Open Source
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Preview your previews.{" "}
            <span className="text-primary">Every platform.</span>{" "}
            <span className="text-muted-foreground">One click.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            See how your links appear on X, LinkedIn, Discord, Slack, WhatsApp,
            Telegram, Facebook, and Google Search — all on one page. Get a score
            out of 100 and copy-paste fixes.
          </p>

          {/* URL Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter any URL to analyze..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 text-base pr-4 pl-4"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 px-6"
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
          </form>

          {/* Quick try links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Try:</span>
            {QUICK_TRY_URLS.map((quickUrl) => (
              <button
                key={quickUrl}
                onClick={() => handleQuickTry(quickUrl)}
                disabled={isLoading}
                className="text-primary hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
