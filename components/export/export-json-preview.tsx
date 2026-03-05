"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import { Copy, Check } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { generateExportJSON } from "@/lib/export-utils";
import { useTheme } from "next-themes";
import { goeyToast } from "goey-toast";

interface ExportJsonPreviewProps {
  result: AnalysisResult;
}

export function ExportJsonPreview({ result }: ExportJsonPreviewProps) {
  const [copied, setCopied] = useState(false);
  const jsonContent = generateExportJSON(result);
  const { resolvedTheme } = useTheme();

  // Memoize expensive computations
  //   const jsonOutput = useMemo(() => generateExportJSON(result), [result]);
  const codeTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopied(true);
      goeyToast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      goeyToast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">JSON Preview</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <CodeBlock className="max-h-[300px] overflow-auto">
        <CodeBlockCode code={jsonContent} language="json" theme={codeTheme} />
      </CodeBlock>
    </div>
  );
}
