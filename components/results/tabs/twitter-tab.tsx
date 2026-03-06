"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  ArrowRight,
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import { TwitterPreview } from "../previews/twitter-preview";
import { extractDomain } from "@/lib/utils";
import { goeyToast } from "goey-toast";

interface TwitterTabProps {
  result: AnalysisResult;
}

type Status = "pass" | "warning" | "fail";

// Moved StatusIcon outside of TwitterTab to fix lint errors
function StatusIcon({ status }: { status: Status }) {
  if (status === "pass") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (status === "warning") {
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  }
  return <XCircle className="h-4 w-4 text-red-500" />;
}

export function TwitterTab({ result }: TwitterTabProps) {
  const twitter = result.twitter;
  const og = result.openGraph;
  const basic = result.basic;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      goeyToast.success(`${label} copied to clipboard`);
    } catch {
      goeyToast.error("Failed to copy");
    }
  };

  // Determine card type display
  const cardTypeDisplay = () => {
    switch (twitter.card) {
      case "summary_large_image":
        return {
          label: "Summary Large Image",
          description: "Shows a large image above the title and description.",
        };
      case "summary":
        return {
          label: "Summary",
          description: "Shows a small thumbnail with title and description.",
        };
      case "app":
        return { label: "App", description: "For app install cards." };
      case "player":
        return { label: "Player", description: "For video/audio content." };
      default:
        return {
          label: "Not Set",
          description: "X will use default summary card.",
        };
    }
  };

  const cardType = cardTypeDisplay();

  // Fallback chain data
  const fallbackChains = [
    {
      field: "Title",
      chain: [
        { tag: "twitter:title", value: twitter.title },
        { tag: "og:title", value: og.title },
        { tag: "<title>", value: basic.title },
      ],
    },
    {
      field: "Description",
      chain: [
        { tag: "twitter:description", value: twitter.description },
        { tag: "og:description", value: og.description },
        { tag: "meta description", value: basic.description },
      ],
    },
    {
      field: "Image",
      chain: [
        { tag: "twitter:image", value: twitter.image },
        { tag: "og:image", value: og.image },
      ],
    },
  ];

  const twitterTags = [
    {
      label: "twitter:card",
      value: twitter.card,
      required: true,
      description: "The card type (summary, summary_large_image, app, player).",
    },
    {
      label: "twitter:title",
      value: twitter.title,
      fallback: og.title || basic.title,
      fallbackSource: og.title ? "og:title" : basic.title ? "title" : null,
      description: "Title of the content.",
    },
    {
      label: "twitter:description",
      value: twitter.description,
      fallback: og.description || basic.description,
      fallbackSource: og.description
        ? "og:description"
        : basic.description
          ? "description"
          : null,
      description: "Description of the content (max 200 characters).",
    },
    {
      label: "twitter:image",
      value: twitter.image,
      fallback: og.image,
      fallbackSource: og.image ? "og:image" : null,
      description: "URL to the image (max 5MB, aspect ratio 2:1).",
    },
    {
      label: "twitter:image:alt",
      value: twitter.imageAlt,
      description: "Alternative text for the image (max 420 characters).",
    },
    {
      label: "twitter:site",
      value: twitter.site,
      description: "The @username of the website.",
    },
    {
      label: "twitter:creator",
      value: twitter.creator,
      description: "The @username of the content creator.",
    },
  ];

  // Generate preview data for the preview component
  const previewData = {
    platform: "twitter" as const,
    title: twitter.title || og.title || basic.title || "",
    description:
      twitter.description || og.description || basic.description || "",
    image: twitter.image || og.image,
    url: result.url,
    siteName: twitter.site || extractDomain(result.url),
    favicon: basic.favicon,
    themeColor: basic.themeColor,
    usedTags: [],
    status: twitter.card ? ("perfect" as const) : ("warning" as const),
    issues: [],
  };

  // Generate fix code
  const missingTags = twitterTags.filter(
    (t) => !t.value && (t.required || t.label === "twitter:image")
  );
  const generateFixCode = () => {
    if (missingTags.length === 0) return null;

    const htmlCode = missingTags
      .map((tag) => {
        switch (tag.label) {
          case "twitter:card":
            return `<meta name="twitter:card" content="summary_large_image" />`;
          case "twitter:image":
            return `<meta name="twitter:image" content="https://yoursite.com/twitter-image.jpg" />`;
          default:
            return `<meta name="${tag.label}" content="Your ${tag.label.replace("twitter:", "")} here" />`;
        }
      })
      .join("\n");

    const nextjsCode = `export const metadata = {
  twitter: {
    card: 'summary_large_image',
${missingTags
  .filter((t) => t.label !== "twitter:card")
  .map((tag) => {
    const key = tag.label.replace("twitter:", "").replace(":", "");
    if (key === "image")
      return `    images: ['https://yoursite.com/twitter-image.jpg'],`;
    return `    ${key}: 'Your ${key} here',`;
  })
  .join("\n")}
  },
}`;

    return { html: htmlCode, nextjs: nextjsCode };
  };

  const fixCode = generateFixCode();

  return (
    <div className="space-y-6">
      {/* Card Type & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant={twitter.card ? "default" : "destructive"}
                className="text-sm"
              >
                {cardType.label}
              </Badge>
              <StatusIcon status={twitter.card ? "pass" : "fail"} />
            </div>
            <p className="text-sm text-muted-foreground">
              {cardType.description}
            </p>
            {!twitter.card && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Missing twitter:card meta tag. Add it for better X preview
                  control.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <TwitterPreview preview={previewData} />
          </CardContent>
        </Card>
      </div>

      {/* Fallback Chain Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Fallback Chain</CardTitle>
          <p className="text-sm text-muted-foreground">
            X uses this fallback order to determine what to display.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fallbackChains.map((chain) => {
              const usedIndex = chain.chain.findIndex((c) => c.value);

              return (
                <div key={chain.field}>
                  <div className="text-sm font-medium mb-2">{chain.field}</div>
                  <div className="flex items-center flex-wrap gap-2">
                    {chain.chain.map((item, index) => (
                      <div key={item.tag} className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1.5 rounded-lg text-sm font-mono ${
                            index === usedIndex
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : item.value
                                ? "bg-muted text-muted-foreground"
                                : "bg-muted/50 text-muted-foreground/50 line-through"
                          }`}
                        >
                          {item.tag}
                          {index === usedIndex && (
                            <span className="ml-2 text-xs">✓ Used</span>
                          )}
                        </div>
                        {index < chain.chain.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  {usedIndex >= 0 && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      Value: &ldquo;
                      {chain.chain[usedIndex].value?.slice(0, 80)}...&rdquo;
                    </p>
                  )}
                  {usedIndex === -1 && (
                    <p className="text-xs text-red-500 mt-2">
                      No value found in any fallback source.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Twitter Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Twitter Card Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {twitterTags.map((tag) => {
              const hasValue = !!tag.value;
              const hasFallback = !tag.value && tag.fallback;

              return (
                <div key={tag.label} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                          {tag.label}
                        </code>
                        {tag.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {tag.description}
                      </p>
                      {hasValue ? (
                        <p className="text-sm break-all">{tag.value}</p>
                      ) : hasFallback ? (
                        <div className="text-sm">
                          <span className="text-yellow-600 dark:text-yellow-500">
                            Missing — falling back to {tag.fallbackSource}:
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            &ldquo;{tag.fallback?.slice(0, 60)}...&rdquo;
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-red-500">
                          Missing (no fallback)
                        </p>
                      )}
                    </div>
                    <StatusIcon
                      status={
                        hasValue ? "pass" : hasFallback ? "warning" : "fail"
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fix Suggestions */}
      {fixCode && (
        <Card>
          <CardHeader>
            <CardTitle>Fix Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="nextjs">Next.js</TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(fixCode.html, "HTML code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    {fixCode.html}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="nextjs">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyToClipboard(fixCode.nextjs, "Next.js code")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    {fixCode.nextjs}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}