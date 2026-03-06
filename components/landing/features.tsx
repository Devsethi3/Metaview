import { cn } from "@/lib/utils";
import type React from "react";
import { GridPattern } from "@/components/ui/grid-pattern";
import {
  Image,
  Zap,
  Download,
  Share2,
  FileCode,
  Wand2,
  Target,
  Eye,
  History,
} from "lucide-react";

type FeatureType = {
  title: string;
  icon: React.ReactNode;
  description: string;
};

export function LandingFeatures() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="text-center mb-12">
        {/* <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything you need to perfect your link previews
        </h2> */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Metaview goes beyond basic meta tag checking. Get detailed analysis,
          actionable fixes, and beautiful previews.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard feature={feature} key={feature.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureCard({
  feature,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  feature: FeatureType;
}) {
  return (
    <div
      className={cn("relative overflow-hidden bg-background p-6", className)}
      {...props}
    >
      <div className="mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full">
        <GridPattern
          className="absolute inset-0 size-full stroke-foreground/20"
          height={40}
          width={40}
          x={20}
        />
      </div>
      <div className="[&_svg]:size-6 [&_svg]:text-foreground/75">
        {feature.icon}
      </div>
      <h3 className="mt-10 text-sm md:text-base">{feature.title}</h3>
      <p className="relative z-20 mt-2 font-light text-muted-foreground text-xs">
        {feature.description}
      </p>
    </div>
  );
}

const features: FeatureType[] = [
  {
    title: "9+ Platform Previews",
    icon: <Eye />,
    description:
      "See exactly how your links appear on Google, X, LinkedIn, Discord, Slack, WhatsApp, Telegram, Facebook, and iMessage.",
  },
  {
    title: "35+ Quality Checks",
    icon: <Target />,
    description:
      "Comprehensive scoring across essential tags, Open Graph, Twitter Cards, images, technical SEO, and more.",
  },
  {
    title: "Copy-Paste Fixes",
    icon: <Wand2 />,
    description:
      "Get framework-specific code snippets for Next.js, Astro, Hugo, and plain HTML. Just copy and paste.",
  },
  {
    title: "Image Analysis",
    icon: <Image />,
    description:
      "Analyze OG image dimensions, file size, load time, aspect ratio, and see how it fits each platform.",
  },
  {
    title: "Raw Data Export",
    icon: <FileCode />,
    description:
      "View and download all meta tags as JSON, CSV, or raw HTML. Perfect for documentation and debugging.",
  },
  {
    title: "Shareable Results",
    icon: <Share2 />,
    description:
      "Every result has a unique URL. Share your score with your team or on social media.",
  },
  {
    title: "Export as PNG",
    icon: <Download />,
    description:
      "Generate beautiful score report cards to share on X and impress your followers.",
  },
  {
    title: "Lightning Fast",
    icon: <Zap />,
    description:
      "Optimized for performance. Get results in seconds, not minutes.",
  },
  {
    title: "Local History",
    icon: <History />,
    description:
      "All your checks are saved locally. Track improvements over time without any account.",
  },
];
