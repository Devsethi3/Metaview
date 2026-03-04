// components/results/tabs/basic-tab.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Shield,
  Clock,
  Server,
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import { TITLE_LIMITS, DESCRIPTION_LIMITS } from "@/lib/constants";
import { formatMs } from "@/lib/utils";
import { useState } from "react";

interface BasicTabProps {
  result: AnalysisResult;
}

export function BasicTab({ result }: BasicTabProps) {
  const [robotsOpen, setRobotsOpen] = useState(false);
  const [sitemapOpen, setSitemapOpen] = useState(false);

  const StatusIcon = ({ status }: { status: "pass" | "warning" | "fail" }) => {
    if (status === "pass")
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "warning")
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const CharacterBar = ({
    current,
    min,
    max,
    ideal,
  }: {
    current: number;
    min: number;
    max: number;
    ideal: number;
  }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const isGood = current >= min && current <= max;
    const isTooShort = current < min;
    const isTooLong = current > max;

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{current} characters</span>
          <span>
            {isTooShort
              ? `${min - current} too short`
              : isTooLong
                ? `${current - max} too long`
                : "Good length"}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isGood
                ? "bg-emerald-500"
                : isTooShort
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span className="text-emerald-500">{ideal} ideal</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const basicMeta = [
    {
      label: "Canonical URL",
      value: result.basic.canonical,
      status: result.basic.canonical ? "pass" : "warning",
    },
    {
      label: "Favicon",
      value: result.basic.favicon,
      status: result.basic.favicon ? "pass" : "warning",
    },
    {
      label: "Apple Touch Icon",
      value: result.basic.appleTouchIcon,
      status: result.basic.appleTouchIcon ? "pass" : "warning",
    },
    {
      label: "Language",
      value: result.basic.language,
      status: result.basic.language ? "pass" : "warning",
    },
    {
      label: "Charset",
      value: result.basic.charset,
      status: result.basic.charset ? "pass" : "warning",
    },
    {
      label: "Viewport",
      value: result.basic.viewport,
      status: result.basic.viewport ? "pass" : "fail",
    },
    {
      label: "Theme Color",
      value: result.basic.themeColor,
      status: result.basic.themeColor ? "pass" : "warning",
      color: result.basic.themeColor,
    },
    {
      label: "Author",
      value: result.basic.author,
      status: result.basic.author ? "pass" : "warning",
    },
    { label: "Keywords", value: result.basic.keywords, status: "warning" },
    { label: "Generator", value: result.basic.generator, status: "pass" },
    {
      label: "Robots",
      value: result.basic.robots || "Not set (index, follow)",
      status: "pass",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Title Tag</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-lg font-medium break-all">
                {result.basic.title || (
                  <span className="text-red-500">Missing title tag</span>
                )}
              </p>
            </div>
            <StatusIcon
              status={
                result.basic.title
                  ? result.basic.titleLength >= TITLE_LIMITS.min &&
                    result.basic.titleLength <= TITLE_LIMITS.max
                    ? "pass"
                    : "warning"
                  : "fail"
              }
            />
          </div>
          {result.basic.title && (
            <CharacterBar
              current={result.basic.titleLength}
              min={TITLE_LIMITS.min}
              max={TITLE_LIMITS.max}
              ideal={TITLE_LIMITS.ideal}
            />
          )}
        </CardContent>
      </Card>

      {/* Description Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Meta Description</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-muted-foreground break-all">
                {result.basic.description || (
                  <span className="text-red-500">Missing meta description</span>
                )}
              </p>
            </div>
            <StatusIcon
              status={
                result.basic.description
                  ? result.basic.descriptionLength >= DESCRIPTION_LIMITS.min &&
                    result.basic.descriptionLength <= DESCRIPTION_LIMITS.max
                    ? "pass"
                    : "warning"
                  : "fail"
              }
            />
          </div>
          {result.basic.description && (
            <CharacterBar
              current={result.basic.descriptionLength}
              min={DESCRIPTION_LIMITS.min}
              max={DESCRIPTION_LIMITS.max}
              ideal={DESCRIPTION_LIMITS.ideal}
            />
          )}
        </CardContent>
      </Card>

      {/* Other Meta Tags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Other Meta Tags</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {basicMeta.map((item) => (
              <div
                key={item.label}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                    {item.color && (
                      <span
                        className="inline-block w-4 h-4 rounded border"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    {item.value || (
                      <span className="text-muted-foreground/50">Not set</span>
                    )}
                  </div>
                </div>
                <StatusIcon
                  status={item.status as "pass" | "warning" | "fail"}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Site Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HTTPS */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">HTTPS</span>
              </div>
              <Badge variant={result.site.https ? "default" : "destructive"}>
                {result.site.https ? "Enabled" : "Not Enabled"}
              </Badge>
            </div>

            {/* HTTP Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">HTTP Status</span>
              <Badge
                variant={
                  result.site.httpStatus === 200 ? "default" : "secondary"
                }
              >
                {result.site.httpStatus}
              </Badge>
            </div>

            {/* Load Time */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <Badge
                variant={result.site.loadTime < 1000 ? "default" : "secondary"}
              >
                {formatMs(result.site.loadTime)}
              </Badge>
            </div>

            {/* Content Type */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Content-Type</span>
              <span className="text-sm text-muted-foreground font-mono">
                {result.site.contentType?.split(";")[0] || "Unknown"}
              </span>
            </div>

            {/* Server */}
            {result.site.server && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium">Server</span>
                <span className="text-sm text-muted-foreground">
                  {result.site.server}
                </span>
              </div>
            )}

            {/* Redirects */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Redirect Chain</span>
              <Badge
                variant={
                  result.site.redirectChain.length === 0
                    ? "default"
                    : "secondary"
                }
              >
                {result.site.redirectChain.length === 0
                  ? "None"
                  : `${result.site.redirectChain.length} redirect(s)`}
              </Badge>
            </div>
          </div>

          {/* robots.txt */}
          <Collapsible open={robotsOpen} onOpenChange={setRobotsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={result.site.robotsTxt.exists ? "pass" : "warning"}
                  />
                  <span>robots.txt</span>
                  {result.site.robotsTxt.exists && (
                    <Badge variant="secondary" className="ml-2">
                      {result.site.robotsTxt.allowsIndexing
                        ? "Allows indexing"
                        : "Blocks indexing"}
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${robotsOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {result.site.robotsTxt.content ? (
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-64">
                  {result.site.robotsTxt.content}
                </pre>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No robots.txt found at the site root.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* sitemap.xml */}
          <Collapsible open={sitemapOpen} onOpenChange={setSitemapOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={result.site.sitemapXml.exists ? "pass" : "warning"}
                  />
                  <span>sitemap.xml</span>
                  {result.site.sitemapXml.exists && (
                    <Badge variant="secondary" className="ml-2">
                      {result.site.sitemapXml.urlCount} URLs
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${sitemapOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {result.site.sitemapXml.content ? (
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-64">
                  {result.site.sitemapXml.content}
                </pre>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No sitemap.xml found.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Security Headers */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Security Headers</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Strict-Transport-Security",
                  value: result.site.securityHeaders.strictTransportSecurity,
                },
                {
                  label: "X-Content-Type-Options",
                  value: result.site.securityHeaders.xContentTypeOptions,
                },
                {
                  label: "X-Frame-Options",
                  value: result.site.securityHeaders.xFrameOptions,
                },
                {
                  label: "Content-Security-Policy",
                  value: result.site.securityHeaders.contentSecurityPolicy,
                },
              ].map((header) => (
                <div
                  key={header.label}
                  className="flex items-center gap-2 text-sm"
                >
                  <StatusIcon status={header.value ? "pass" : "warning"} />
                  <span className="text-muted-foreground">{header.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
