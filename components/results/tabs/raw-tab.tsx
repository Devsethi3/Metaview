// components/results/tabs/raw-tab.tsx
"use client";

import { useState, useMemo, useCallback, memo } from "react";
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
import { LazyCodeBlock } from "@/components/ui/lazy-code-block";
import {
  Copy,
  Download,
  Table as TableIcon,
  Code,
  FileJson,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types";
import {
  generateExportJSON,
  downloadFile,
  generateFilename,
} from "@/lib/export-utils";
import { useTheme } from "next-themes";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";

interface RawTabProps {
  result: AnalysisResult;
}

// Memoized stats cards to prevent re-renders
const StatsCards = memo(function StatsCards({
  rawTags,
}: {
  rawTags: AnalysisResult["rawTags"];
}) {
  const stats = useMemo(
    () => ({
      basic: rawTags.filter((t) => t.type === "title" || t.type === "meta")
        .length,
      og: rawTags.filter((t) => t.type === "og").length,
      twitter: rawTags.filter((t) => t.type === "twitter").length,
      link: rawTags.filter((t) => t.type === "link").length,
    }),
    [rawTags],
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.basic}</div>
          <div className="text-sm text-muted-foreground">Basic Meta Tags</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.og}</div>
          <div className="text-sm text-muted-foreground">Open Graph Tags</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.twitter}</div>
          <div className="text-sm text-muted-foreground">Twitter Tags</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.link}</div>
          <div className="text-sm text-muted-foreground">Link Tags</div>
        </CardContent>
      </Card>
    </div>
  );
});

// Memoized table row component
const TagTableRow = memo(function TagTableRow({
  tag,
  index,
  getBadgeVariant,
}: {
  tag: AnalysisResult["rawTags"][0];
  index: number;
  getBadgeVariant: (type: string) => "default" | "secondary" | "outline";
}) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground font-mono text-xs">
        {index + 1}
      </TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(tag.type)} className="text-xs">
          {tag.type}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-xs">{tag.name}</TableCell>
      <TableCell className="max-w-md">
        <span className="text-sm break-all line-clamp-2">
          {tag.value || <span className="text-muted-foreground">—</span>}
        </span>
      </TableCell>
    </TableRow>
  );
});

// Memoized table content
const TableContent = memo(function TableContent({
  rawTags,
}: {
  rawTags: AnalysisResult["rawTags"];
}) {
  const getBadgeVariant = useCallback(
    (type: string): "default" | "secondary" | "outline" => {
      switch (type) {
        case "og":
          return "default";
        case "twitter":
          return "secondary";
        default:
          return "outline";
      }
    },
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          All Meta Tags ({rawTags.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-48">Name</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawTags.map((tag, i) => (
                  <TagTableRow
                    key={`${tag.type}-${tag.name}-${i}`}
                    tag={tag}
                    index={i}
                    getBadgeVariant={getBadgeVariant}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Loading placeholder for code blocks
const CodeLoadingPlaceholder = memo(function CodeLoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">
        Loading content...
      </span>
    </div>
  );
});

export function RawTab({ result }: RawTabProps) {
  const [view, setView] = useState<"table" | "json" | "html">("table");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const { resolvedTheme } = useTheme();

  // Memoize expensive computations
  const jsonOutput = useMemo(() => generateExportJSON(result), [result]);
  const codeTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";

  // Memoize handlers
  const handleCopyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopiedJson(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [jsonOutput]);

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.rawHead);
      setCopiedHtml(true);
      toast.success("HTML copied to clipboard");
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [result.rawHead]);

  const handleDownloadJson = useCallback(() => {
    downloadFile(
      jsonOutput,
      generateFilename(result.url, "json"),
      "application/json",
    );
    toast.success("JSON downloaded");
  }, [jsonOutput, result.url]);

  const handleDownloadHtml = useCallback(() => {
    const filename = `metaview-${result.url.replace(/[^a-zA-Z0-9]/g, "-")}-head.html`;
    downloadFile(result.rawHead, filename, "text/html");
    toast.success("HTML downloaded");
  }, [result.rawHead, result.url]);

  const handleDownloadCsv = useCallback(() => {
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
  }, [result.rawTags, result.url]);

  // Handle hydration
  if (!resolvedTheme) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

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

        {/* Table View */}
        <TabsContent value="table" className="mt-0">
          <TableContent rawTags={result.rawTags} />
        </TabsContent>

        {/* JSON View - Lazy loaded */}
        <TabsContent value="json" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">JSON Export</CardTitle>
            </CardHeader>
            <CardContent>
              {view === "json" && (
                <CodeBlock className="max-h-[500px] overflow-auto">
                  <CodeBlockCode
                    code={jsonOutput}
                    language="json"
                    theme={codeTheme}
                  />
                </CodeBlock>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HTML View - Lazy loaded with optimizations */}
        <TabsContent value="html" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Raw HTML &lt;head&gt;
                {result.rawHead.length > 10000 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({Math.round(result.rawHead.length / 1024)}KB)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {view === "html" && (
                <LazyCodeBlock
                  code={result.rawHead}
                  language="html"
                  theme={codeTheme}
                  maxHeight="500px"
                  placeholder={<CodeLoadingPlaceholder />}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Cards - Memoized */}
      <StatsCards rawTags={result.rawTags} />
    </div>
  );
}
