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
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import {
  Copy,
  Download,
  Table as TableIcon,
  Code,
  FileJson,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types";
import {
  generateExportJSON,
  downloadFile,
  generateFilename,
} from "@/lib/export-utils";
import { useTheme } from "next-themes";

interface RawTabProps {
  result: AnalysisResult;
}

export function RawTab({ result }: RawTabProps) {
  const [view, setView] = useState<"table" | "json" | "html">("table");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const { setTheme, resolvedTheme, theme } = useTheme();

  // Avoid hydration mismatch
  if (!resolvedTheme) return null;

  const jsonOutput = generateExportJSON(result);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopiedJson(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(result.rawHead);
      setCopiedHtml(true);
      toast.success("HTML copied to clipboard");
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownloadJson = () => {
    downloadFile(
      jsonOutput,
      generateFilename(result.url, "json"),
      "application/json",
    );
    toast.success("JSON downloaded");
  };

  const handleDownloadHtml = () => {
    const filename = `metaview-${result.url.replace(/[^a-zA-Z0-9]/g, "-")}-head.html`;
    downloadFile(result.rawHead, filename, "text/html");
    toast.success("HTML downloaded");
  };

  const handleDownloadCsv = () => {
    const headers = ["#", "Type", "Name", "Value"];
    const rows = result.rawTags.map((tag, i) => [
      i + 1,
      tag.type,
      tag.name,
      `"${(tag.value || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const filename = `metaview-${result.url.replace(/[^a-zA-Z0-9]/g, "-")}-tags.csv`;
    downloadFile(csvContent, filename, "text/csv");
    toast.success("CSV downloaded");
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

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON</span>
            </TabsTrigger>
            <TabsTrigger value="html" className="gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">HTML Head</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {view === "table" && (
              <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download CSV</span>
              </Button>
            )}
            {view === "json" && (
              <>
                <Button variant="outline" size="sm" onClick={handleCopyJson}>
                  {copiedJson ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {copiedJson ? "Copied" : "Copy"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadJson}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </>
            )}
            {view === "html" && (
              <>
                <Button variant="outline" size="sm" onClick={handleCopyHtml}>
                  {copiedHtml ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {copiedHtml ? "Copied" : "Copy"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadHtml}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                All Meta Tags ({result.rawTags.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
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
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {i + 1}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getTypeBadgeVariant(tag.type)}
                              className="text-xs"
                            >
                              {tag.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">JSON Export</CardTitle>
            </CardHeader>
            <CardContent>
gi              <CodeBlock className="max-h-[500px] overflow-auto">
                <CodeBlockCode
                  code={jsonOutput}
                  language="json"
                  // theme="github-dark"
                />
              </CodeBlock>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Raw HTML &lt;head&gt;</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock className="max-h-[500px] overflow-auto">
                <CodeBlockCode
                  code={result.rawHead}
                  language="html"
                  theme="github-dark"
                />
              </CodeBlock>
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
