"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileImage,
  FileJson,
  Download,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import { ExportPngPreview } from "./export-png-preview";
import { ExportJsonPreview } from "./export-json-preview";
import { generateExportImage } from "@/lib/generate-export-image";
import {
  generateExportJSON,
  downloadFile,
  generateFilename,
} from "@/lib/export-utils";
import { goeyToast } from "goey-toast";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AnalysisResult;
  initialTab?: "png" | "json";
}

export function ExportModal({
  open,
  onOpenChange,
  result,
  initialTab = "png",
}: ExportModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [activeTab, setActiveTab] = useState<"png" | "json">(initialTab);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate PNG when modal opens or tab switches to PNG
  useEffect(() => {
    if (open && activeTab === "png" && !pngDataUrl) {
      generatePng();
    }
  }, [open, activeTab]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setPngDataUrl(null);
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const generatePng = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateExportImage(result);
      setPngDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate PNG:", error);
      goeyToast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!pngDataUrl) return;

    setIsDownloading(true);
    try {
      // Convert data URL to blob
      const response = await fetch(pngDataUrl);
      const blob = await response.blob();
      downloadFile(blob, generateFilename(result.url, "png"), "image/png");
      goeyToast.success("Image downloaded");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to download PNG:", error);
      goeyToast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadJson = () => {
    try {
      const jsonContent = generateExportJSON(result);
      downloadFile(
        jsonContent,
        generateFilename(result.url, "json"),
        "application/json",
      );
      goeyToast.success("JSON downloaded");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to download JSON:", error);
      goeyToast.error("Failed to download JSON");
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "png" | "json")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="png" className="gap-2">
            <FileImage className="h-4 w-4" />
            PNG Image
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-2">
            <FileJson className="h-4 w-4" />
            JSON Data
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="png"
          className="flex-1 mt-0 data-[state=inactive]:hidden"
        >
          <div className="space-y-4">
            <ExportPngPreview
              dataUrl={pngDataUrl}
              isGenerating={isGenerating}
              onRegenerate={generatePng}
            />
            <Button
              onClick={handleDownloadPng}
              disabled={!pngDataUrl || isDownloading}
              className="w-full"
              size="lg"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PNG
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="json"
          className="flex-1 mt-0 data-[state=inactive]:hidden"
        >
          <div className="space-y-4">
            <ExportJsonPreview result={result} />
            <Button onClick={handleDownloadJson} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Export Analysis</DialogTitle>
            <DialogDescription>
              Download your analysis results as an image or JSON file.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Export Analysis</DrawerTitle>
          <DrawerDescription>
            Download your analysis results as an image or JSON file.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 overflow-y-auto">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
