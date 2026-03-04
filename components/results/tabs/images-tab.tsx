// components/results/tabs/images-tab.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Image as ImageIcon,
  Ruler,
  FileType,
  HardDrive,
  Clock,
  Accessibility,
} from "lucide-react";
import type { AnalysisResult, ImageAnalysis } from "@/types";
import { PLATFORMS, OG_IMAGE_LIMITS } from "@/lib/constants";
import { formatBytes, formatMs } from "@/lib/utils";

interface ImagesTabProps {
  result: AnalysisResult;
}

export function ImagesTab({ result }: ImagesTabProps) {
  const { images } = result;

  const StatusIcon = ({ status }: { status: "pass" | "warning" | "fail" }) => {
    if (status === "pass")
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "warning")
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const ImageCard = ({
    title,
    image,
    type,
  }: {
    title: string;
    image: ImageAnalysis | null;
    type: "og" | "twitter" | "favicon" | "apple";
  }) => {
    if (!image && type !== "og") return null;

    const issues: string[] = [];
    let overallStatus: "pass" | "warning" | "fail" = "pass";

    if (!image) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No image specified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Check for issues
    if (!image.accessible) {
      issues.push("Image not accessible");
      overallStatus = "fail";
    } else {
      if (type === "og" || type === "twitter") {
        if (image.width && image.width < OG_IMAGE_LIMITS.idealWidth * 0.8) {
          issues.push(
            `Width (${image.width}px) below recommended ${OG_IMAGE_LIMITS.idealWidth}px`,
          );
          overallStatus = "warning";
        }
        if (image.height && image.height < OG_IMAGE_LIMITS.idealHeight * 0.8) {
          issues.push(
            `Height (${image.height}px) below recommended ${OG_IMAGE_LIMITS.idealHeight}px`,
          );
          overallStatus = "warning";
        }
        if (
          image.fileSize &&
          image.fileSize > OG_IMAGE_LIMITS.warningFileSize
        ) {
          issues.push(
            `File size (${formatBytes(image.fileSize)}) exceeds 100KB recommendation`,
          );
          overallStatus = "warning";
        }
        if (
          image.loadTime &&
          image.loadTime > OG_IMAGE_LIMITS.warningLoadTime
        ) {
          issues.push(
            `Load time (${formatMs(image.loadTime)}) exceeds 500ms recommendation`,
          );
          overallStatus = "warning";
        }
      }
      if (!image.alt) {
        issues.push("Missing alt text");
        if (overallStatus === "pass") overallStatus = "warning";
      }
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-5 w-5" />
              {title}
            </CardTitle>
            <Badge
              variant={
                overallStatus === "pass"
                  ? "default"
                  : overallStatus === "warning"
                    ? "secondary"
                    : "destructive"
              }
              className={
                overallStatus === "pass"
                  ? "bg-emerald-500"
                  : overallStatus === "warning"
                    ? "bg-yellow-500"
                    : ""
              }
            >
              {overallStatus === "pass"
                ? "Good"
                : overallStatus === "warning"
                  ? "Needs Attention"
                  : "Error"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Preview */}
          <div className="relative aspect-[1.91/1] max-w-md rounded-lg overflow-hidden bg-muted">
            {image.accessible ? (
              <img
                src={image.url}
                alt={image.alt || "Preview"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-500">
                  <XCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">{image.error || "Failed to load"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Image Properties */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Dimensions</div>
                <div className="text-sm font-medium">
                  {image.width && image.height
                    ? `${image.width} × ${image.height}`
                    : "Unknown"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <FileType className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Format</div>
                <div className="text-sm font-medium">
                  {image.format || "Unknown"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">File Size</div>
                <div className="text-sm font-medium">
                  {image.fileSize ? formatBytes(image.fileSize) : "Unknown"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Load Time</div>
                <div className="text-sm font-medium">
                  {image.loadTime ? formatMs(image.loadTime) : "Unknown"}
                </div>
              </div>
            </div>
            {image.aspectRatio && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    Aspect Ratio
                  </div>
                  <div className="text-sm font-medium">{image.aspectRatio}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Accessibility className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Alt Text</div>
                <div className="text-sm font-medium">
                  {image.alt ? "Set" : "Missing"}
                </div>
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            <span className="truncate flex-1">{image.url}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
              <a href={image.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Issues */}
          {issues.length > 0 && (
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {issue}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Platform fit table data
  const platformFitData = Object.entries(PLATFORMS).map(([key, config]) => {
    const ogImage = images.ogImage;
    let fit: "perfect" | "resize" | "crop" | "none" = "none";
    let note = "";

    if (!ogImage || !ogImage.accessible) {
      fit = "none";
      note = "No image";
    } else if (ogImage.width && ogImage.height) {
      const idealRatio =
        config.idealImageSize.width / config.idealImageSize.height;
      const actualRatio = ogImage.width / ogImage.height;
      const ratioDiff = Math.abs(idealRatio - actualRatio);

      if (
        ogImage.width >= config.idealImageSize.width * 0.9 &&
        ogImage.height >= config.idealImageSize.height * 0.9 &&
        ratioDiff < 0.1
      ) {
        fit = "perfect";
        note = "Optimal size";
      } else if (ratioDiff < 0.2) {
        fit = "resize";
        note = "Will be resized";
      } else {
        fit = "crop";
        note = "May be cropped";
      }
    }

    return {
      platform: config.name,
      idealSize: `${config.idealImageSize.width}×${config.idealImageSize.height}`,
      aspectRatio: config.aspectRatio,
      fit,
      note,
    };
  });

  return (
    <div className="space-y-6">
      {/* Image Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageCard title="OG Image" image={images.ogImage} type="og" />
        {images.twitterImage &&
          images.twitterImage.url !== images.ogImage?.url && (
            <ImageCard
              title="Twitter Image"
              image={images.twitterImage}
              type="twitter"
            />
          )}
        <ImageCard title="Favicon" image={images.favicon} type="favicon" />
        <ImageCard
          title="Apple Touch Icon"
          image={images.appleTouchIcon}
          type="apple"
        />
      </div>

      {/* Platform Fit Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Image Fit</CardTitle>
          <p className="text-sm text-muted-foreground">
            How your OG image will appear on each platform based on their ideal
            dimensions.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Ideal Size</TableHead>
                <TableHead>Aspect Ratio</TableHead>
                <TableHead>Your Image Fit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformFitData.map((row) => (
                <TableRow key={row.platform}>
                  <TableCell className="font-medium">{row.platform}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {row.idealSize}
                  </TableCell>
                  <TableCell>{row.aspectRatio}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        status={
                          row.fit === "perfect"
                            ? "pass"
                            : row.fit === "resize"
                              ? "warning"
                              : row.fit === "crop"
                                ? "warning"
                                : "fail"
                        }
                      />
                      <span
                        className={
                          row.fit === "perfect"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : row.fit === "none"
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                        }
                      >
                        {row.note}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Image Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Use <strong>1200×630 pixels</strong> for optimal display across
                all platforms.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Keep file size under <strong>100KB</strong> for fast loading.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Use <strong>JPG</strong> or <strong>PNG</strong> format. WebP is
                not universally supported.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Add <strong>og:image:alt</strong> for accessibility.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Include <strong>og:image:width</strong> and{" "}
                <strong>og:image:height</strong> for faster rendering.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                Use absolute URLs (starting with https://) for all images.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
