// components/results/tabs/open-graph-tab.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import { goeyToast } from "goey-toast";

interface OpenGraphTabProps {
  result: AnalysisResult;
}

export function OpenGraphTab({ result }: OpenGraphTabProps) {
  const og = result.openGraph;

  const StatusIcon = ({ status }: { status: "pass" | "warning" | "fail" }) => {
    if (status === "pass")
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "warning")
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatus = (
    value: string | null | undefined,
  ): "pass" | "warning" | "fail" => {
    return value ? "pass" : "fail";
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      goeyToast.success(`${label} copied to clipboard`);
    } catch {
      goeyToast.error("Failed to copy");
    }
  };

  const requiredTags = [
    {
      label: "og:title",
      value: og.title,
      required: true,
      description:
        "The title of your content as it should appear in the preview.",
    },
    {
      label: "og:description",
      value: og.description,
      required: true,
      description: "A brief description of the content.",
    },
    {
      label: "og:image",
      value: og.image,
      required: true,
      description: "The URL of the image that represents your content.",
      isImage: true,
    },
    {
      label: "og:url",
      value: og.url,
      required: true,
      description: "The canonical URL for your content.",
    },
    {
      label: "og:type",
      value: og.type,
      required: true,
      description: "The type of content (website, article, product, etc.).",
    },
  ];

  const optionalTags = [
    {
      label: "og:site_name",
      value: og.siteName,
      description: "The name of the overall site.",
    },
    {
      label: "og:locale",
      value: og.locale,
      description: "The locale of the content (e.g., en_US).",
    },
    {
      label: "og:image:width",
      value: og.imageWidth,
      description: "The width of the OG image in pixels.",
    },
    {
      label: "og:image:height",
      value: og.imageHeight,
      description: "The height of the OG image in pixels.",
    },
    {
      label: "og:image:alt",
      value: og.imageAlt,
      description: "Alternative text for the image.",
    },
    {
      label: "og:image:type",
      value: og.imageType,
      description: "The MIME type of the image.",
    },
    { label: "og:video", value: og.video, description: "URL to a video file." },
    {
      label: "og:audio",
      value: og.audio,
      description: "URL to an audio file.",
    },
    {
      label: "og:determiner",
      value: og.determiner,
      description: "The word before the title (a, an, the, etc.).",
    },
  ];

  const articleTags =
    og.type === "article"
      ? [
          {
            label: "article:author",
            value: og.articleAuthor,
            description: "The author of the article.",
          },
          {
            label: "article:published_time",
            value: og.articlePublishedTime,
            description: "When the article was published.",
          },
          {
            label: "article:modified_time",
            value: og.articleModifiedTime,
            description: "When the article was last modified.",
          },
          {
            label: "article:section",
            value: og.articleSection,
            description: "The section the article belongs to.",
          },
          {
            label: "article:tag",
            value: og.articleTag?.join(", "),
            description: "Tags associated with the article.",
          },
        ]
      : [];

  const missingRequired = requiredTags.filter((tag) => !tag.value);
  const missingOptional = optionalTags.filter((tag) => !tag.value);

  // Generate fix code
  const generateFixCode = () => {
    const missing = missingRequired.filter((t) => !t.value);
    if (missing.length === 0) return null;

    const htmlCode = missing
      .map((tag) => {
        if (tag.label === "og:image") {
          return `<meta property="og:image" content="https://yoursite.com/og-image.jpg" />`;
        }
        return `<meta property="${tag.label}" content="Your ${tag.label.replace("og:", "")} here" />`;
      })
      .join("\n");

    const nextjsCode = `export const metadata = {
  openGraph: {
${missing
  .map((tag) => {
    const key = tag.label.replace("og:", "");
    if (key === "image")
      return `    images: ['https://yoursite.com/og-image.jpg'],`;
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
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Open Graph Summary</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  missingRequired.length === 0 ? "default" : "destructive"
                }
              >
                {requiredTags.length - missingRequired.length}/
                {requiredTags.length} Required
              </Badge>
              <Badge variant="secondary">
                {optionalTags.length - missingOptional.length}/
                {optionalTags.length} Optional
              </Badge>
            </div>
          </div>
        </CardHeader>
        {missingRequired.length > 0 && (
          <CardContent>
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-2">
                Missing required Open Graph tags:
              </p>
              <ul className="text-sm text-destructive/80 space-y-1">
                {missingRequired.map((tag) => (
                  <li key={tag.label}>• {tag.label}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* OG Image Preview */}
      {og.image && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              og:image Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative aspect-[1.91/1] max-w-2xl rounded-lg overflow-hidden bg-muted">
                <img
                  src={og.image}
                  alt="OG Image"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate flex-1 font-mono text-xs">
                  {og.image}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(og.image!, "Image URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={og.image} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              {(og.imageWidth || og.imageHeight) && (
                <div className="flex items-center gap-4 text-sm">
                  {og.imageWidth && <span>Width: {og.imageWidth}px</span>}
                  {og.imageHeight && <span>Height: {og.imageHeight}px</span>}
                  {og.imageAlt && <span>Alt: {og.imageAlt}</span>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Required Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {requiredTags.map((tag) => (
              <div key={tag.label} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {tag.label}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {tag.description}
                    </p>
                    {tag.value ? (
                      <p className="text-sm break-all">{tag.value}</p>
                    ) : (
                      <p className="text-sm text-red-500">Missing</p>
                    )}
                  </div>
                  <StatusIcon status={getStatus(tag.value)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Optional Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {optionalTags.map((tag) => (
              <div key={tag.label} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {tag.label}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {tag.description}
                    </p>
                    {tag.value ? (
                      <p className="text-sm break-all">{tag.value}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not set</p>
                    )}
                  </div>
                  <StatusIcon status={tag.value ? "pass" : "warning"} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Article-specific Tags */}
      {og.type === "article" && (
        <Card>
          <CardHeader>
            <CardTitle>Article Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {articleTags.map((tag) => (
                <div key={tag.label} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                          {tag.label}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {tag.description}
                      </p>
                      {tag.value ? (
                        <p className="text-sm break-all">{tag.value}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not set</p>
                      )}
                    </div>
                    <StatusIcon status={tag.value ? "pass" : "warning"} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fix Suggestions */}
      {fixCode && (
        <Card>
          <CardHeader>
            <CardTitle>Fix Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">HTML</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(fixCode.html, "HTML code")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                {fixCode.html}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Next.js</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(fixCode.nextjs, "Next.js code")
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                {fixCode.nextjs}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
