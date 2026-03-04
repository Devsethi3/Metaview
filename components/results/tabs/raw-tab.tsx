// components/results/tabs/raw-tab.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Download,
  Table as TableIcon,
  Code,
  FileJson,
} from "lucide-react";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types";

interface RawTabProps {
  result: AnalysisResult;
}

export function RawTab({ result }: RawTabProps) {
  const [view, setView] = useState<"table" | "json" | "html">("table");

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  // Convert raw tags to CSV
  const generateCSV = () => {
    const headers = ["#", "Type", "Name", "Value"];
    const rows = result.rawTags.map((tag, i) => [
      i + 1,
      tag.type,
      tag.name,
      `"${(tag.value || "").replace(/"/g, '""')}"`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  };

  // Generate JSON output
  const generateJSON = () => {
    return JSON.stringify(
      {
        url: result.url,
        analyzedAt: result.analyzedAt,
        basic: result.basic,
        openGraph: result.openGraph,
        twitter: result.twitter,
        images: {
          ogImage: result.images.ogImage
            ? {
                url: result.images.ogImage.url,
                width: result.images.ogImage.width,
                height: result.images.ogImage.height,
                fileSize: result.images.ogImage.fileSize,
                format: result.images.ogImage.format,
              }
            : null,
        },
        site: {
          https: result.site.https,
          httpStatus: result.site.httpStatus,
          loadTime: result.site.loadTime,
          robotsTxt: result.site.robotsTxt.exists,
          sitemapXml: result.site.sitemapXml.exists,
        },
        score: {
          total: result.score.total,
          grade: result.score.grade,
          passCount: result.score.passCount,
          warningCount: result.score.warningCount,
          failCount: result.score.failCount,
        },
      },
      null,
      2,
    );
  };

  const getTypeBadgeVariant = (
    type: string,
  ): "default" | "secondary" | "outline" => {
    switch (type) {
      case "og":
        return "default";
      case "twitter":
        return "secondary";
      default:
        return "outline";
    }
  };

  const jsonOutput = generateJSON();
  const csvOutput = generateCSV();

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="html" className="gap-2">
              <Code className="h-4 w-4" />
              HTML Head
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {view === "table" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(csvOutput, "CSV")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(csvOutput, "meta-tags.csv", "text/csv")
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </>
            )}
            {view === "json" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(jsonOutput, "JSON")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      jsonOutput,
                      "metadata.json",
                      "application/json",
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            {view === "html" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.rawHead, "HTML")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(result.rawHead, "head.html", "text/html")
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>All Meta Tags ({result.rawTags.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="w-48">Name</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rawTags.map((tag, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(tag.type)}>
                            {tag.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tag.name}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <span className="text-sm break-all line-clamp-2">
                            {tag.value || (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>JSON Export</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[600px] overflow-y-auto">
                <code>{jsonOutput}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Raw HTML &lt;head&gt;</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                <code>{result.rawHead}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                result.rawTags.filter(
                  (t) => t.type === "title" || t.type === "meta",
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Basic Meta Tags</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {result.rawTags.filter((t) => t.type === "og").length}
            </div>
            <div className="text-sm text-muted-foreground">Open Graph Tags</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {result.rawTags.filter((t) => t.type === "twitter").length}
            </div>
            <div className="text-sm text-muted-foreground">Twitter Tags</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {result.rawTags.filter((t) => t.type === "link").length}
            </div>
            <div className="text-sm text-muted-foreground">Link Tags</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
