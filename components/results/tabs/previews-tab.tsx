"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid, List, Search, Users, MessageSquare } from "lucide-react";
import type { AnalysisResult, Platform, PlatformPreview } from "@/types";
import { PLATFORMS } from "@/lib/constants";
import { extractDomain } from "@/lib/utils";

// Platform preview components
import { GooglePreview } from "../previews/google-preview";
import { TwitterPreview } from "../previews/twitter-preview";
import { LinkedInPreview } from "../previews/linkedin-preview";
import { DiscordPreview } from "../previews/discord-preview";
import { SlackPreview } from "../previews/slack-preview";
import { WhatsAppPreview } from "../previews/whatsapp-preview";
import { TelegramPreview } from "../previews/telegram-preview";
import { FacebookPreview } from "../previews/facebook-preview";
import { IMessagePreview } from "../previews/imessage-preview";

interface PreviewsTabProps {
  result: AnalysisResult;
}

type FilterCategory = "all" | "search" | "social" | "messaging";
type ViewMode = "grid" | "list";

export function PreviewsTab({ result }: PreviewsTabProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Generate preview data for each platform
  const generatePreviews = (): Record<Platform, PlatformPreview> => {
    const domain = extractDomain(result.url);

    // Helper to get fallback value
    const getFallback = (...values: (string | null | undefined)[]): string => {
      for (const v of values) {
        if (v) return v;
      }
      return "";
    };

    const basePreview = {
      url: result.url,
      favicon: result.basic.favicon,
      themeColor: result.basic.themeColor,
    };

    return {
      google: {
        platform: "google",
        title: getFallback(result.basic.title),
        description: getFallback(result.basic.description),
        image: null,
        siteName: domain,
        usedTags: [
          result.basic.title ? "title" : null,
          result.basic.description ? "meta description" : null,
        ].filter(Boolean) as string[],
        status:
          result.basic.title && result.basic.description
            ? "perfect"
            : "warning",
        issues: [
          !result.basic.title ? "Missing title tag" : null,
          !result.basic.description ? "Missing meta description" : null,
        ].filter(Boolean) as string[],
        ...basePreview,
      },
      twitter: {
        platform: "twitter",
        title: getFallback(
          result.twitter.title,
          result.openGraph.title,
          result.basic.title,
        ),
        description: getFallback(
          result.twitter.description,
          result.openGraph.description,
          result.basic.description,
        ),
        image: getFallback(result.twitter.image, result.openGraph.image),
        siteName: result.twitter.site || domain,
        usedTags: [
          result.twitter.title
            ? "twitter:title"
            : result.openGraph.title
              ? "og:title"
              : result.basic.title
                ? "title"
                : null,
          result.twitter.image
            ? "twitter:image"
            : result.openGraph.image
              ? "og:image"
              : null,
        ].filter(Boolean) as string[],
        status: result.twitter.card
          ? "perfect"
          : result.openGraph.image
            ? "warning"
            : "error",
        issues: [
          !result.twitter.card ? "Missing twitter:card" : null,
          !result.twitter.image && !result.openGraph.image
            ? "No image for preview"
            : null,
        ].filter(Boolean) as string[],
        ...basePreview,
      },
      linkedin: {
        platform: "linkedin",
        title: getFallback(result.openGraph.title, result.basic.title),
        description: getFallback(
          result.openGraph.description,
          result.basic.description,
        ),
        image: result.openGraph.image,
        siteName: result.openGraph.siteName || domain,
        usedTags: [
          result.openGraph.title
            ? "og:title"
            : result.basic.title
              ? "title"
              : null,
          result.openGraph.image ? "og:image" : null,
        ].filter(Boolean) as string[],
        status:
          result.openGraph.title && result.openGraph.image
            ? "perfect"
            : "warning",
        issues: [
          !result.openGraph.title ? "Missing og:title" : null,
          !result.openGraph.image ? "Missing og:image" : null,
        ].filter(Boolean) as string[],
        ...basePreview,
      },
      discord: {
        platform: "discord",
        title: getFallback(result.openGraph.title, result.basic.title),
        description: getFallback(
          result.openGraph.description,
          result.basic.description,
        ),
        image: result.openGraph.image,
        siteName: result.openGraph.siteName || domain,
        usedTags: [
          result.openGraph.title ? "og:title" : null,
          result.openGraph.description ? "og:description" : null,
          result.openGraph.image ? "og:image" : null,
          result.basic.themeColor ? "theme-color" : null,
        ].filter(Boolean) as string[],
        status:
          result.openGraph.title && result.openGraph.description
            ? "perfect"
            : "warning",
        issues: [],
        ...basePreview,
      },
      slack: {
        platform: "slack",
        title: getFallback(result.openGraph.title, result.basic.title),
        description: getFallback(
          result.openGraph.description,
          result.basic.description,
        ),
        image: result.openGraph.image,
        siteName: result.openGraph.siteName || domain,
        usedTags: [
          result.openGraph.title ? "og:title" : null,
          result.openGraph.image ? "og:image" : null,
        ].filter(Boolean) as string[],
        status: result.openGraph.title ? "perfect" : "warning",
        issues: [],
        ...basePreview,
      },
      whatsapp: {
        platform: "whatsapp",
        title: getFallback(result.openGraph.title, result.basic.title),
        description: getFallback(
          result.openGraph.description,
          result.basic.description,
        ),
        image: result.openGraph.image,
        siteName: domain,
        usedTags: [
          result.openGraph.title ? "og:title" : null,
          result.openGraph.image ? "og:image" : null,
        ].filter(Boolean) as string[],
        status:
          result.openGraph.title && result.openGraph.image
            ? "perfect"
            : "warning",
        issues: [],
        ...basePreview,
      },
      telegram: {
        platform: "telegram",
        title: getFallback(result.openGraph.title, result.basic.title),
        description: getFallback(
          result.openGraph.description,
          result.basic.description,
        ),
        image: result.openGraph.image,
        siteName: result.openGraph.siteName || domain,
        usedTags: [
          result.openGraph.title ? "og:title" : null,
          result.openGraph.image ? "og:image" : null,
        ].filter(Boolean) as string[],
        status: result.openGraph.image ? "perfect" : "warning",
        issues: [],
        ...basePreview,
      },
      facebook: {
        platform: "facebook",
        title: getFallback(result.openGraph.title, result.basic.title),
        description: getFallback(
          result.openGraph.description,
          result.basic.description,
        ),
        image: result.openGraph.image,
        siteName: result.openGraph.siteName || domain,
        usedTags: [
          result.openGraph.title ? "og:title" : null,
          result.openGraph.image ? "og:image" : null,
        ].filter(Boolean) as string[],
        status:
          result.openGraph.title && result.openGraph.image
            ? "perfect"
            : "warning",
        issues: [],
        ...basePreview,
      },
      imessage: {
        platform: "imessage",
        title: getFallback(result.openGraph.title, result.basic.title),
        description: getFallback(
          result.openGraph.description,
          result.basic.description,
        ),
        image: result.openGraph.image,
        siteName: domain,
        usedTags: [
          result.openGraph.title ? "og:title" : null,
          result.openGraph.image ? "og:image" : null,
        ].filter(Boolean) as string[],
        status: result.openGraph.image ? "perfect" : "warning",
        issues: [],
        ...basePreview,
      },
    };
  };

  const previews = generatePreviews();

  const filteredPlatforms = Object.entries(PLATFORMS).filter(([_, config]) => {
    if (filter === "all") return true;
    return config.category === filter;
  });

  const PreviewComponent: Record<
    Platform,
    React.ComponentType<{ preview: PlatformPreview }>
  > = {
    google: GooglePreview,
    twitter: TwitterPreview,
    linkedin: LinkedInPreview,
    discord: DiscordPreview,
    slack: SlackPreview,
    whatsapp: WhatsAppPreview,
    telegram: TelegramPreview,
    facebook: FacebookPreview,
    imessage: IMessagePreview,
  };

  return (
    <div className="space-y-6">
      {/* Filters and view toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "search" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("search")}
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          <Button
            variant={filter === "social" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("social")}
          >
            <Users className="h-4 w-4 mr-1" />
            Social
          </Button>
          <Button
            variant={filter === "messaging" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("messaging")}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Messaging
          </Button>
        </div>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as ViewMode)}
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Preview cards */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-6"
        }
      >
        {filteredPlatforms.map(([platform, config]) => {
          const preview = previews[platform as Platform];
          const Component = PreviewComponent[platform as Platform];

          return (
            <Card key={platform} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {config.name}
                  </CardTitle>
                  <Badge
                    variant={
                      preview.status === "perfect"
                        ? "default"
                        : preview.status === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                    className={
                      preview.status === "perfect"
                        ? "bg-emerald-500"
                        : preview.status === "warning"
                          ? "bg-yellow-500"
                          : ""
                    }
                  >
                    {preview.status === "perfect"
                      ? "Perfect"
                      : preview.status === "warning"
                        ? "Warning"
                        : "Error"}
                  </Badge>
                </div>
                {preview.usedTags.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Using: {preview.usedTags.join(" + ")}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <Component preview={preview} />
                {preview.issues.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {preview.issues.map((issue, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500"
                      >
                        <span>⚠</span> {issue}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
