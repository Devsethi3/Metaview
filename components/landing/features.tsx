// components/landing/features.tsx
"use client";

import { motion } from "motion/react";
import {
  Eye,
  Target,
  Wand2,
  Image,
  FileCode,
  Share2,
  History,
  Moon,
  Smartphone,
  Zap,
  Shield,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Eye,
    title: "9+ Platform Previews",
    description:
      "See exactly how your links appear on Google, X, LinkedIn, Discord, Slack, WhatsApp, Telegram, Facebook, and iMessage.",
  },
  {
    icon: Target,
    title: "35+ Quality Checks",
    description:
      "Comprehensive scoring across essential tags, Open Graph, Twitter Cards, images, technical SEO, and more.",
  },
  {
    icon: Wand2,
    title: "Copy-Paste Fixes",
    description:
      "Get framework-specific code snippets for Next.js, Astro, Hugo, and plain HTML. Just copy and paste.",
  },
  {
    icon: Image,
    title: "Image Analysis",
    description:
      "Analyze OG image dimensions, file size, load time, aspect ratio, and see how it fits each platform.",
  },
  {
    icon: FileCode,
    title: "Raw Data Export",
    description:
      "View and download all meta tags as JSON, CSV, or raw HTML. Perfect for documentation and debugging.",
  },
  {
    icon: Share2,
    title: "Shareable Results",
    description:
      "Every result has a unique URL. Share your score with your team or on social media.",
  },
  {
    icon: Download,
    title: "Export as PNG",
    description:
      "Generate beautiful score report cards to share on X and impress your followers.",
  },
  {
    icon: History,
    title: "Local History",
    description:
      "All your checks are saved locally. Track improvements over time without any account.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "No tracking, no accounts, no data collection. Everything happens in your browser.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description: "Full dark mode support. Easy on the eyes, day or night.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description:
      "Works perfectly on all screen sizes. Check previews from anywhere.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for performance. Get results in seconds, not minutes.",
  },
];

export function LandingFeatures() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to perfect your link previews
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Metaview goes beyond basic meta tag checking. Get detailed analysis,
            actionable fixes, and beautiful previews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
