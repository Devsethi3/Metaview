"use server";

import { z } from "zod";
import * as cheerio from "cheerio";
import type {
  AnalysisResult,
  BasicMeta,
  OpenGraphMeta,
  TwitterMeta,
  MetaTag,
  SiteConfig,
  ContentStructure,
  AccessibilityBasics,
  StructuredData,
  PWAMetadata,
  PerformanceMetrics,
} from "@/types";
import { normalizeUrl } from "@/lib/utils";
import { analyzeImage } from "./analyze-image";
import { fetchRobotsTxt } from "./fetch-robots";
import { fetchSitemapXml } from "./fetch-sitemap";
import { calculateScore } from "@/lib/scoring";

const urlSchema = z.string().url();

export async function analyzeUrl(inputUrl: string): Promise<{
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}> {
  const startTime = Date.now();

  console.log("[analyzeUrl] Starting analysis for:", inputUrl);

  try {
    const url = normalizeUrl(inputUrl);
    console.log("[analyzeUrl] Normalized URL:", url);

    const validationResult = urlSchema.safeParse(url);

    if (!validationResult.success) {
      console.log(
        "[analyzeUrl] URL validation failed:",
        validationResult.error,
      );
      return {
        success: false,
        error: "Invalid URL format. Please enter a valid URL.",
      };
    }

    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      return {
        success: false,
        error:
          "Localhost URLs are not supported. Please use a publicly accessible URL.",
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    const redirectChain: string[] = [];
    let currentUrl = url;

    try {
      console.log("[analyzeUrl] Fetching URL...");
      response = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Metaview/1.0; +https://metaview.dev)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      console.log("[analyzeUrl] Response status:", response.status);

      if (response.redirected) {
        redirectChain.push(url);
        currentUrl = response.url;
      }
    } catch (fetchError) {
      console.error("[analyzeUrl] Fetch error:", fetchError);
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          return {
            success: false,
            error: "Request timed out. The page took too long to respond.",
          };
        }
        return {
          success: false,
          error: `Failed to fetch: ${fetchError.message}`,
        };
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    const loadTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch page: HTTP ${response.status} ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      return {
        success: false,
        error: `Invalid content type: ${contentType}. Expected HTML.`,
      };
    }

    const html = await response.text();
    console.log("[analyzeUrl] HTML length:", html.length);

    const $ = cheerio.load(html);

    const rawHead = $("head").html() || "";

    const rawTags: MetaTag[] = [];

    const titleText = $("title").first().text().trim();
    if (titleText) {
      rawTags.push({ type: "title", name: "title", value: titleText });
    }

    $("meta").each((_, el) => {
      const $el = $(el);
      const name = $el.attr("name") || "";
      const property = $el.attr("property") || "";
      const content = $el.attr("content") || "";
      const charset = $el.attr("charset");
      const httpEquiv = $el.attr("http-equiv");

      if (property.startsWith("og:")) {
        rawTags.push({ type: "og", name: property, property, value: content });
      } else if (
        name.startsWith("twitter:") ||
        property.startsWith("twitter:")
      ) {
        rawTags.push({
          type: "twitter",
          name: name || property,
          property,
          value: content,
        });
      } else if (charset) {
        rawTags.push({ type: "meta", name: "charset", value: charset });
      } else if (httpEquiv) {
        rawTags.push({ type: "meta", name: httpEquiv, value: content });
      } else if (name || property) {
        rawTags.push({
          type: "meta",
          name: name || property,
          property,
          value: content,
        });
      }
    });

    $("link").each((_, el) => {
      const $el = $(el);
      const rel = $el.attr("rel") || "";
      const href = $el.attr("href") || "";

      if (rel && href) {
        rawTags.push({ type: "link", name: rel, value: href });
      }
    });

    console.log("[analyzeUrl] Found", rawTags.length, "meta tags");

    const basic: BasicMeta = {
      title: titleText || null,
      titleLength: titleText?.length || 0,
      description: $('meta[name="description"]').attr("content") || null,
      descriptionLength:
        $('meta[name="description"]').attr("content")?.length || 0,
      canonical: $('link[rel="canonical"]').attr("href") || null,
      favicon:
        $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href") ||
        "/favicon.ico",
      appleTouchIcon: $('link[rel="apple-touch-icon"]').attr("href") || null,
      language: $("html").attr("lang") || null,
      charset:
        $("meta[charset]").attr("charset") ||
        $('meta[http-equiv="Content-Type"]')
          .attr("content")
          ?.match(/charset=([^;]+)/)?.[1] ||
        null,
      viewport: $('meta[name="viewport"]').attr("content") || null,
      themeColor: $('meta[name="theme-color"]').attr("content") || null,
      author: $('meta[name="author"]').attr("content") || null,
      keywords: $('meta[name="keywords"]').attr("content") || null,
      generator: $('meta[name="generator"]').attr("content") || null,
      robots: $('meta[name="robots"]').attr("content") || null,
    };

    const openGraph: OpenGraphMeta = {
      title: $('meta[property="og:title"]').attr("content") || null,
      description: $('meta[property="og:description"]').attr("content") || null,
      image: $('meta[property="og:image"]').attr("content") || null,
      url: $('meta[property="og:url"]').attr("content") || null,
      type: $('meta[property="og:type"]').attr("content") || null,
      siteName: $('meta[property="og:site_name"]').attr("content") || null,
      locale: $('meta[property="og:locale"]').attr("content") || null,
      imageWidth: $('meta[property="og:image:width"]').attr("content") || null,
      imageHeight:
        $('meta[property="og:image:height"]').attr("content") || null,
      imageAlt: $('meta[property="og:image:alt"]').attr("content") || null,
      imageType: $('meta[property="og:image:type"]').attr("content") || null,
      video: $('meta[property="og:video"]').attr("content") || null,
      audio: $('meta[property="og:audio"]').attr("content") || null,
      determiner: $('meta[property="og:determiner"]').attr("content") || null,
      articleAuthor:
        $('meta[property="article:author"]').attr("content") || null,
      articlePublishedTime:
        $('meta[property="article:published_time"]').attr("content") || null,
      articleModifiedTime:
        $('meta[property="article:modified_time"]').attr("content") || null,
      articleSection:
        $('meta[property="article:section"]').attr("content") || null,
      articleTag:
        ($('meta[property="article:tag"]')
          .map((_, el) => $(el).attr("content"))
          .get()
          .filter(Boolean) as string[]) || null,
    };

    const twitter: TwitterMeta = {
      card:
        $('meta[name="twitter:card"]').attr("content") ||
        $('meta[property="twitter:card"]').attr("content") ||
        null,
      title:
        $('meta[name="twitter:title"]').attr("content") ||
        $('meta[property="twitter:title"]').attr("content") ||
        null,
      description:
        $('meta[name="twitter:description"]').attr("content") ||
        $('meta[property="twitter:description"]').attr("content") ||
        null,
      image:
        $('meta[name="twitter:image"]').attr("content") ||
        $('meta[property="twitter:image"]').attr("content") ||
        null,
      imageAlt:
        $('meta[name="twitter:image:alt"]').attr("content") ||
        $('meta[property="twitter:image:alt"]').attr("content") ||
        null,
      site:
        $('meta[name="twitter:site"]').attr("content") ||
        $('meta[property="twitter:site"]').attr("content") ||
        null,
      creator:
        $('meta[name="twitter:creator"]').attr("content") ||
        $('meta[property="twitter:creator"]').attr("content") ||
        null,
    };

    console.log("[analyzeUrl] Extracted meta:", {
      title: basic.title?.slice(0, 50),
      ogTitle: openGraph.title?.slice(0, 50),
      ogImage: openGraph.image?.slice(0, 50),
    });

    const baseUrl = new URL(currentUrl);
    const resolveUrl = (path: string | null): string | null => {
      if (!path) return null;
      try {
        return new URL(path, baseUrl).href;
      } catch {
        return path;
      }
    };

    console.log("[analyzeUrl] Analyzing images...");
    const [
      ogImageAnalysis,
      twitterImageAnalysis,
      faviconAnalysis,
      appleTouchIconAnalysis,
    ] = await Promise.all([
      openGraph.image
        ? analyzeImage(resolveUrl(openGraph.image)!, openGraph.imageAlt).catch(
            (e) => {
              console.error("[analyzeUrl] OG image analysis failed:", e);
              return null;
            },
          )
        : Promise.resolve(null),
      twitter.image && twitter.image !== openGraph.image
        ? analyzeImage(resolveUrl(twitter.image)!, twitter.imageAlt).catch(
            (e) => {
              console.error("[analyzeUrl] Twitter image analysis failed:", e);
              return null;
            },
          )
        : Promise.resolve(null),
      basic.favicon
        ? analyzeImage(resolveUrl(basic.favicon)!, "favicon").catch(() => null)
        : Promise.resolve(null),
      basic.appleTouchIcon
        ? analyzeImage(
            resolveUrl(basic.appleTouchIcon)!,
            "apple-touch-icon",
          ).catch(() => null)
        : Promise.resolve(null),
    ]);

    console.log("[analyzeUrl] Fetching robots.txt and sitemap...");
    const [robotsResult, sitemapResult] = await Promise.all([
      fetchRobotsTxt(baseUrl.origin).catch((e) => {
        console.error("[analyzeUrl] robots.txt fetch failed:", e);
        return { exists: false, allowsIndexing: true, content: null };
      }),
      fetchSitemapXml(baseUrl.origin).catch((e) => {
        console.error("[analyzeUrl] sitemap.xml fetch failed:", e);
        return { exists: false, urlCount: null, url: null, content: null };
      }),
    ]);

    const site: SiteConfig = {
      https: baseUrl.protocol === "https:",
      robotsTxt: robotsResult,
      sitemapXml: sitemapResult,
      httpStatus: response.status,
      loadTime,
      contentType: response.headers.get("content-type"),
      server: response.headers.get("server"),
      redirectChain,
      securityHeaders: {
        strictTransportSecurity: !!response.headers.get(
          "strict-transport-security",
        ),
        xContentTypeOptions: !!response.headers.get("x-content-type-options"),
        xFrameOptions: !!response.headers.get("x-frame-options"),
        contentSecurityPolicy: !!response.headers.get(
          "content-security-policy",
        ),
      },
    };

    const h1Elements = $("h1");
    const h1Contents: string[] = [];
    h1Elements.each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1Contents.push(text);
    });

    const headings: string[] = [];
    const headingIssues: string[] = [];
    let lastLevel = 0;

    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const level = parseInt(tag[1]);
      const text = $(el).text().trim().slice(0, 50);
      headings.push(`${tag}: ${text}`);

      if (lastLevel > 0 && level > lastLevel + 1) {
        headingIssues.push(`Skipped heading level: ${tag} after h${lastLevel}`);
      }
      lastLevel = level;
    });

    const images = $("img");
    let withAlt = 0;
    let withoutAlt = 0;
    let decorative = 0;

    images.each((_, el) => {
      const alt = $(el).attr("alt");
      const role = $(el).attr("role");

      if (alt === "" || role === "presentation") {
        decorative++;
      } else if (alt) {
        withAlt++;
      } else {
        withoutAlt++;
      }
    });

    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    let noFollow = 0;

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const rel = $(el).attr("rel") || "";

      if (rel.includes("nofollow")) noFollow++;

      try {
        const linkUrl = new URL(href, baseUrl);
        if (linkUrl.hostname === baseUrl.hostname) {
          internalLinks.push(href);
        } else if (href.startsWith("http")) {
          externalLinks.push(href);
        }
      } catch {
        // Invalid URL, skip
      }
    });

    const content: ContentStructure = {
      h1: {
        exists: h1Contents.length > 0,
        count: h1Contents.length,
        content: h1Contents,
      },
      headingHierarchy: {
        valid: headingIssues.length === 0,
        structure: headings.slice(0, 20),
        issues: headingIssues,
      },
      images: {
        total: images.length,
        withAlt,
        withoutAlt,
        decorative,
      },
      links: {
        internal: internalLinks.length,
        external: externalLinks.length,
        broken: [],
        noFollow,
      },
    };

    let labeledInputs = 0;
    let unlabeledInputs = 0;

    $("input, select, textarea").each((_, el) => {
      const $el = $(el);
      const id = $el.attr("id");
      const ariaLabel = $el.attr("aria-label");
      const ariaLabelledby = $el.attr("aria-labelledby");
      const type = $el.attr("type");

      if (type === "hidden" || type === "submit" || type === "button") return;

      if (
        ariaLabel ||
        ariaLabelledby ||
        (id && $(`label[for="${id}"]`).length)
      ) {
        labeledInputs++;
      } else {
        unlabeledInputs++;
      }
    });

    const accessibility: AccessibilityBasics = {
      formLabels: {
        total: labeledInputs + unlabeledInputs,
        labeled: labeledInputs,
        unlabeled: unlabeledInputs,
      },
      landmarks: {
        hasMain: $('main, [role="main"]').length > 0,
        hasNav: $('nav, [role="navigation"]').length > 0,
        hasFooter: $('footer, [role="contentinfo"]').length > 0,
        hasHeader: $('header, [role="banner"]').length > 0,
      },
      tapTargets: {
        adequate: true,
        issues: 0,
      },
    };

    const jsonLdScripts = $('script[type="application/ld+json"]');
    const structuredDataContent: object[] = [];
    const structuredDataTypes: string[] = [];
    const structuredDataErrors: string[] = [];

    jsonLdScripts.each((_, el) => {
      try {
        const scriptContent = $(el).html();
        if (scriptContent) {
          const parsed = JSON.parse(scriptContent);
          structuredDataContent.push(parsed);

          if (parsed["@type"]) {
            structuredDataTypes.push(parsed["@type"]);
          }
          if (Array.isArray(parsed["@graph"])) {
            parsed["@graph"].forEach((item: { "@type"?: string }) => {
              if (item["@type"]) structuredDataTypes.push(item["@type"]);
            });
          }
        }
      } catch {
        structuredDataErrors.push("Invalid JSON-LD syntax");
      }
    });

    const structuredData: StructuredData = {
      exists: jsonLdScripts.length > 0,
      types: [...new Set(structuredDataTypes)],
      valid: structuredDataErrors.length === 0,
      content: structuredDataContent.length > 0 ? structuredDataContent : null,
      errors: structuredDataErrors,
    };

    const pwa: PWAMetadata = {
      manifest: !!$('link[rel="manifest"]').attr("href"),
      serviceWorker: false,
      themeColor: !!basic.themeColor,
      icons: !!(basic.favicon || basic.appleTouchIcon),
    };

    const performance: PerformanceMetrics = {
      lcp: null,
      cls: null,
      tbt: null,
      renderBlockingResources:
        $('link[rel="stylesheet"]:not([media="print"])').length +
        $(
          'script:not([async]):not([defer]):not([type="application/ld+json"])',
        ).filter((_, el) => !$(el).attr("src")?.includes("async")).length,
      compression:
        response.headers.get("content-encoding")?.includes("gzip") ||
        response.headers.get("content-encoding")?.includes("br") ||
        false,
      brokenAssets: [],
      jsErrors: [],
    };

    const images_data = {
      ogImage: ogImageAnalysis,
      twitterImage: twitterImageAnalysis,
      favicon: faviconAnalysis,
      appleTouchIcon: appleTouchIconAnalysis,
    };

    console.log("[analyzeUrl] Calculating score...");
    const score = calculateScore(
      basic,
      openGraph,
      twitter,
      images_data,
      site,
      content,
      accessibility,
      structuredData,
      performance,
    );

    const result: AnalysisResult = {
      url: currentUrl,
      analyzedAt: new Date().toISOString(),
      basic,
      openGraph,
      twitter,
      images: images_data,
      site,
      content,
      accessibility,
      structuredData,
      pwa,
      performance,
      rawTags,
      rawHead,
      score,
    };

    console.log("[analyzeUrl] Analysis complete. Score:", score.total);
    return { success: true, data: result };
  } catch (error) {
    console.error("[analyzeUrl] Unexpected error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
