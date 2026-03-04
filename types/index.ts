// types/index.ts
export interface MetaTag {
  type: "title" | "meta" | "og" | "twitter" | "link" | "other";
  name: string;
  value: string;
  property?: string;
}

export interface BasicMeta {
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  canonical: string | null;
  favicon: string | null;
  appleTouchIcon: string | null;
  language: string | null;
  charset: string | null;
  viewport: string | null;
  themeColor: string | null;
  author: string | null;
  keywords: string | null;
  generator: string | null;
  robots: string | null;
}

export interface OpenGraphMeta {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  type: string | null;
  siteName: string | null;
  locale: string | null;
  imageWidth: string | null;
  imageHeight: string | null;
  imageAlt: string | null;
  imageType: string | null;
  video: string | null;
  audio: string | null;
  determiner: string | null;
  // Article specific
  articleAuthor: string | null;
  articlePublishedTime: string | null;
  articleModifiedTime: string | null;
  articleSection: string | null;
  articleTag: string[] | null;
}

export interface TwitterMeta {
  card: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  imageAlt: string | null;
  site: string | null;
  creator: string | null;
}

export interface ImageAnalysis {
  url: string;
  accessible: boolean;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  format: string | null;
  fileSize: number | null;
  loadTime: number | null;
  alt: string | null;
  error?: string;
}

export interface SiteConfig {
  https: boolean;
  robotsTxt: {
    exists: boolean;
    allowsIndexing: boolean;
    content: string | null;
  };
  sitemapXml: {
    exists: boolean;
    urlCount: number | null;
    url: string | null;
    content: string | null;
  };
  httpStatus: number;
  loadTime: number;
  contentType: string | null;
  server: string | null;
  redirectChain: string[];
  securityHeaders: {
    strictTransportSecurity: boolean;
    xContentTypeOptions: boolean;
    xFrameOptions: boolean;
    contentSecurityPolicy: boolean;
  };
}

export interface ContentStructure {
  h1: {
    exists: boolean;
    count: number;
    content: string[];
  };
  headingHierarchy: {
    valid: boolean;
    structure: string[];
    issues: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    decorative: number;
  };
  links: {
    internal: number;
    external: number;
    broken: string[];
    noFollow: number;
  };
}

export interface AccessibilityBasics {
  formLabels: {
    total: number;
    labeled: number;
    unlabeled: number;
  };
  landmarks: {
    hasMain: boolean;
    hasNav: boolean;
    hasFooter: boolean;
    hasHeader: boolean;
  };
  tapTargets: {
    adequate: boolean;
    issues: number;
  };
}

export interface StructuredData {
  exists: boolean;
  types: string[];
  valid: boolean;
  content: object | null;
  errors: string[];
}

export interface PWAMetadata {
  manifest: boolean;
  serviceWorker: boolean;
  themeColor: boolean;
  icons: boolean;
}

export interface PerformanceMetrics {
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  renderBlockingResources: number;
  compression: boolean;
  brokenAssets: string[];
  jsErrors: string[];
}

export interface ScoreCheck {
  id: string;
  category:
    | "essential"
    | "openGraph"
    | "twitter"
    | "images"
    | "technical"
    | "extras"
    | "accessibility"
    | "performance";
  label: string;
  status: "pass" | "warning" | "fail" | "pending";
  points: number;
  maxPoints: number;
  value: string | null;
  message: string;
  fix?: string;
  fixCode?: {
    html?: string;
    nextjs?: string;
    astro?: string;
  };
}

export interface ScoreCategory {
  name: string;
  key: string;
  points: number;
  maxPoints: number;
  checks: ScoreCheck[];
}

export interface AnalysisResult {
  url: string;
  analyzedAt: string;
  basic: BasicMeta;
  openGraph: OpenGraphMeta;
  twitter: TwitterMeta;
  images: {
    ogImage: ImageAnalysis | null;
    twitterImage: ImageAnalysis | null;
    favicon: ImageAnalysis | null;
    appleTouchIcon: ImageAnalysis | null;
  };
  site: SiteConfig;
  content: ContentStructure;
  accessibility: AccessibilityBasics;
  structuredData: StructuredData;
  pwa: PWAMetadata;
  performance: PerformanceMetrics;
  rawTags: MetaTag[];
  rawHead: string;
  score: {
    total: number;
    maxTotal: number;
    grade: string;
    gradeColor: string;
    categories: ScoreCategory[];
    passCount: number;
    warningCount: number;
    failCount: number;
  };
}

export interface HistoryItem {
  id: string;
  url: string;
  analyzedAt: string;
  score: number;
  grade: string;
  passCount: number;
  warningCount: number;
  failCount: number;
}

export type Platform =
  | "google"
  | "twitter"
  | "linkedin"
  | "discord"
  | "slack"
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "imessage";

export interface PlatformPreview {
  platform: Platform;
  title: string;
  description: string;
  image: string | null;
  url: string;
  siteName: string | null;
  favicon: string | null;
  themeColor: string | null;
  usedTags: string[];
  status: "perfect" | "warning" | "error";
  issues: string[];
}
