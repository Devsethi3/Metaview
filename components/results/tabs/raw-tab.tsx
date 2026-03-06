"use client";

import { useState, useMemo, useCallback, memo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import {
  generateExportJSON,
  downloadFile,
  generateFilename,
} from "@/lib/export-utils";
import { useTheme } from "next-themes";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import { goeyToast } from "goey-toast";

interface RawTabProps {
  result: AnalysisResult;
}


const StatsCards = memo(function StatsCards({
  rawTags,
}: {
  rawTags: AnalysisResult["rawTags"];
}) {
  const stats = useMemo(() => {
    let basic = 0,
      og = 0,
      twitter = 0,
      link = 0;
    for (const t of rawTags) {
      if (t.type === "title" || t.type === "meta") basic++;
      else if (t.type === "og") og++;
      else if (t.type === "twitter") twitter++;
      else if (t.type === "link") link++;
    }
    return { basic, og, twitter, link };
  }, [rawTags]);

  const items = useMemo(
    () => [
      { label: "Basic Meta Tags", value: stats.basic },
      { label: "Open Graph Tags", value: stats.og },
      { label: "Twitter Tags", value: stats.twitter },
      { label: "Link Tags", value: stats.link },
    ],
    [stats],
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-4 pb-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold">{item.value}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {item.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});


const getBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
  switch (type) {
    case "og":
      return "default";
    case "twitter":
      return "secondary";
    default:
      return "outline";
  }
};


const TagTableRow = memo(function TagTableRow({
  tag,
  index,
}: {
  tag: AnalysisResult["rawTags"][0];
  index: number;
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
      <TableCell className="font-mono text-xs max-w-[120px] sm:max-w-none truncate sm:overflow-visible">
        {tag.name}
      </TableCell>
      <TableCell className="max-w-[200px] sm:max-w-md">
        <span className="text-sm break-all line-clamp-2">
          {tag.value || <span className="text-muted-foreground">—</span>}
        </span>
      </TableCell>
    </TableRow>
  );
});


const TableContent = memo(function TableContent({
  rawTags,
}: {
  rawTags: AnalysisResult["rawTags"];
}) {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-sm sm:text-base">
          All Meta Tags ({rawTags.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overscroll-contain">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-10 sm:w-12">#</TableHead>
                  <TableHead className="w-20 sm:w-24">Type</TableHead>
                  <TableHead className="w-32 sm:w-48">Name</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawTags.map((tag, i) => (
                  <TagTableRow
                    key={`${tag.type}-${tag.name}-${i}`}
                    tag={tag}
                    index={i}
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


const JsonView = memo(function JsonView({
  jsonOutput,
  codeTheme,
}: {
  jsonOutput: string;
  codeTheme: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-sm sm:text-base">JSON Export</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <CodeBlock className="max-h-[500px] overflow-auto">
          <CodeBlockCode code={jsonOutput} language="json" theme={codeTheme} />
        </CodeBlock>
      </CardContent>
    </Card>
  );
});


const HtmlView = memo(function HtmlView({
  rawHead,
  codeTheme,
}: {
  rawHead: string;
  codeTheme: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-sm sm:text-base">
          Raw HTML &lt;head&gt;
          {rawHead.length > 10000 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({Math.round(rawHead.length / 1024)}KB)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <LazyCodeBlock
          code={rawHead}
          language="html"
          theme={codeTheme}
          maxHeight="500px"
        />
      </CardContent>
    </Card>
  );
});

const ActionButtons = memo(function ActionButtons({
  view,
  onCopyJson,
  onCopyHtml,
  onDownloadJson,
  onDownloadHtml,
  onDownloadCsv,
  copiedJson,
  copiedHtml,
}: {
  view: string;
  onCopyJson: () => void;
  onCopyHtml: () => void;
  onDownloadJson: () => void;
  onDownloadHtml: () => void;
  onDownloadCsv: () => void;
  copiedJson: boolean;
  copiedHtml: boolean;
}) {
  if (view === "table") {
    return (
      <Button variant="outline" size="sm" onClick={onDownloadCsv}>
        <Download className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Download CSV</span>
      </Button>
    );
  }

  if (view === "json") {
    return (
      <>
        <Button variant="outline" size="sm" onClick={onCopyJson}>
          {copiedJson ? (
            <Check className="h-4 w-4 sm:mr-2" />
          ) : (
            <Copy className="h-4 w-4 sm:mr-2" />
          )}
          <span className="hidden sm:inline">
            {copiedJson ? "Copied" : "Copy"}
          </span>
        </Button>
        <Button variant="outline" size="sm" onClick={onDownloadJson}>
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </>
    );
  }

  if (view === "html") {
    return (
      <>
        <Button variant="outline" size="sm" onClick={onCopyHtml}>
          {copiedHtml ? (
            <Check className="h-4 w-4 sm:mr-2" />
          ) : (
            <Copy className="h-4 w-4 sm:mr-2" />
          )}
          <span className="hidden sm:inline">
            {copiedHtml ? "Copied" : "Copy"}
          </span>
        </Button>
        <Button variant="outline" size="sm" onClick={onDownloadHtml}>
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </>
    );
  }

  return null;
});


export function RawTab({ result }: RawTabProps) {
  const [view, setView] = useState<"table" | "json" | "html">("table");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const { resolvedTheme } = useTheme();

  const activatedRef = useRef<Set<string>>(new Set(["table"]));
  if (!activatedRef.current.has(view)) {
    activatedRef.current.add(view);
  }
  const activated = activatedRef.current;

  const jsonOutput = useMemo(() => generateExportJSON(result), [result]);
  const codeTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";

  const handleCopyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopiedJson(true);
      goeyToast.success("JSON copied to clipboard");
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      goeyToast.error("Failed to copy");
    }
  }, [jsonOutput]);

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.rawHead);
      setCopiedHtml(true);
      goeyToast.success("HTML copied to clipboard");
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      goeyToast.error("Failed to copy");
    }
  }, [result.rawHead]);

  const handleDownloadJson = useCallback(() => {
    downloadFile(
      jsonOutput,
      generateFilename(result.url, "json"),
      "application/json",
    );
    goeyToast.success("JSON downloaded");
  }, [jsonOutput, result.url]);

  const handleDownloadHtml = useCallback(() => {
    const filename = `metaview-${result.url.replace(/[^a-zA-Z0-9]/g, "-")}-head.html`;
    downloadFile(result.rawHead, filename, "text/html");
    goeyToast.success("HTML downloaded");
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
    goeyToast.success("CSV downloaded");
  }, [result.rawTags, result.url]);

  // Hydration guard — show skeleton only on first paint
  if (!resolvedTheme) {
    return (
      <div className="space-y-6">
        <div className="h-10 sm:h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex h-9 sm:h-10 items-center rounded-lg bg-muted p-1 text-muted-foreground">
          {(
            [
              { value: "table", icon: TableIcon, label: "Table" },
              { value: "json", icon: FileJson, label: "JSON" },
              { value: "html", icon: Code, label: "HTML Head" },
            ] as const
          ).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setView(value)}
              className={`
                inline-flex items-center justify-center gap-1.5 sm:gap-2
                whitespace-nowrap rounded-md px-2.5 sm:px-3 py-1 sm:py-1.5
                text-xs sm:text-sm font-medium ring-offset-background
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2
                ${
                  view === value
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground"
                }
              `}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ActionButtons
            view={view}
            onCopyJson={handleCopyJson}
            onCopyHtml={handleCopyHtml}
            onDownloadJson={handleDownloadJson}
            onDownloadHtml={handleDownloadHtml}
            onDownloadCsv={handleDownloadCsv}
            copiedJson={copiedJson}
            copiedHtml={copiedHtml}
          />
        </div>
      </div>
      
      <div className="relative">
        {activated.has("table") && (
          <div className={view === "table" ? "block" : "hidden"}>
            <TableContent rawTags={result.rawTags} />
          </div>
        )}

        {activated.has("json") && (
          <div className={view === "json" ? "block" : "hidden"}>
            <JsonView jsonOutput={jsonOutput} codeTheme={codeTheme} />
          </div>
        )}

        {activated.has("html") && (
          <div className={view === "html" ? "block" : "hidden"}>
            <HtmlView rawHead={result.rawHead} codeTheme={codeTheme} />
          </div>
        )}
      </div>

      <StatsCards rawTags={result.rawTags} />
    </div>
  );
}
