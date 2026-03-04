// app/page.tsx
import { Suspense } from "react";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingPlatforms } from "@/components/landing/platforms";
import { LandingDemo } from "@/components/landing/demo";
import { LandingFAQ } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";
import { RecentChecks } from "@/components/landing/recent-checks";
import { ResultsWrapper } from "@/components/results/results-wrapper";
import { Header } from "@/components/shared/header";
import { decodeUrlParam } from "@/lib/url-helpers";

interface PageProps {
  searchParams: Promise<{ url?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  // Await the searchParams in Next.js 15
  const params = await searchParams;
  const urlParam = params.url;

  // Decode the URL param back to full URL
  // Input: "github.com" or "github.com/vercel/next.js"
  // Output: "https://github.com" or "https://github.com/vercel/next.js"
  const urlToAnalyze = urlParam ? decodeUrlParam(urlParam) : null;

  // If URL is provided, show results page
  if (urlToAnalyze) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<ResultsLoadingSkeleton />}>
            <ResultsWrapper url={urlToAnalyze} />
          </Suspense>
        </main>
      </div>
    );
  }

  // Otherwise show landing page
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <LandingHero />
        <LandingPlatforms />
        <Suspense fallback={null}>
          <RecentChecks />
        </Suspense>
        <LandingFeatures />
        <LandingDemo />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  );
}

function ResultsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-12 bg-muted rounded-lg w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
