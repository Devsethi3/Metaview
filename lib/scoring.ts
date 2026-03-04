// lib/scoring.ts
import type {
  BasicMeta,
  OpenGraphMeta,
  TwitterMeta,
  ImageAnalysis,
  SiteConfig,
  ContentStructure,
  AccessibilityBasics,
  StructuredData,
  PerformanceMetrics,
  ScoreCheck,
  ScoreCategory,
} from "@/types";
import { TITLE_LIMITS, DESCRIPTION_LIMITS, OG_IMAGE_LIMITS } from "./constants";
import { getGrade } from "./utils";

export function calculateScore(
  basic: BasicMeta,
  openGraph: OpenGraphMeta,
  twitter: TwitterMeta,
  images: {
    ogImage: ImageAnalysis | null;
    twitterImage: ImageAnalysis | null;
    favicon: ImageAnalysis | null;
    appleTouchIcon: ImageAnalysis | null;
  },
  site: SiteConfig,
  content: ContentStructure,
  accessibility: AccessibilityBasics,
  structuredData: StructuredData,
  performance: PerformanceMetrics,
): {
  total: number;
  maxTotal: number;
  grade: string;
  gradeColor: string;
  categories: ScoreCategory[];
  passCount: number;
  warningCount: number;
  failCount: number;
} {
  const checks: ScoreCheck[] = [];

  // ==================== ESSENTIAL (25 points) ====================

  // Title tag (5pts)
  checks.push({
    id: "title-exists",
    category: "essential",
    label: "Title Tag",
    status: basic.title ? "pass" : "fail",
    points: basic.title ? 5 : 0,
    maxPoints: 5,
    value: basic.title,
    message: basic.title
      ? `Title tag found: "${basic.title.slice(0, 50)}${basic.title.length > 50 ? "..." : ""}"`
      : "Missing title tag. This is critical for SEO and link previews.",
    fix: basic.title ? undefined : "Add a <title> tag to your page head.",
    fixCode: basic.title
      ? undefined
      : {
          html: "<title>Your Page Title | Brand Name</title>",
          nextjs: `export const metadata = {\n  title: 'Your Page Title | Brand Name',\n}`,
          astro:
            '---\nconst title = "Your Page Title | Brand Name";\n---\n<title>{title}</title>',
        },
  });

  // Title length (3pts)
  const titleLengthStatus = !basic.title
    ? "fail"
    : basic.titleLength >= TITLE_LIMITS.min &&
        basic.titleLength <= TITLE_LIMITS.max
      ? "pass"
      : "warning";
  checks.push({
    id: "title-length",
    category: "essential",
    label: "Title Length",
    status: titleLengthStatus,
    points:
      titleLengthStatus === "pass"
        ? 3
        : titleLengthStatus === "warning"
          ? 1
          : 0,
    maxPoints: 3,
    value: basic.title ? `${basic.titleLength} characters` : null,
    message: !basic.title
      ? "No title tag to measure."
      : basic.titleLength < TITLE_LIMITS.min
        ? `Title is too short (${basic.titleLength} chars). Aim for ${TITLE_LIMITS.min}-${TITLE_LIMITS.max} characters for optimal display.`
        : basic.titleLength > TITLE_LIMITS.max
          ? `Title is too long (${basic.titleLength} chars). It may be truncated. Keep under ${TITLE_LIMITS.max} characters.`
          : `Title length is optimal (${basic.titleLength} chars).`,
    fix:
      titleLengthStatus !== "pass" && basic.title
        ? `Adjust title to be between ${TITLE_LIMITS.min}-${TITLE_LIMITS.max} characters.`
        : undefined,
  });

  // Meta description (5pts)
  checks.push({
    id: "description-exists",
    category: "essential",
    label: "Meta Description",
    status: basic.description ? "pass" : "fail",
    points: basic.description ? 5 : 0,
    maxPoints: 5,
    value: basic.description,
    message: basic.description
      ? `Description found: "${basic.description.slice(0, 80)}${basic.description.length > 80 ? "..." : ""}"`
      : "Missing meta description. This affects SEO and how your link appears in search results.",
    fix: basic.description ? undefined : "Add a meta description tag.",
    fixCode: basic.description
      ? undefined
      : {
          html: '<meta name="description" content="A compelling description of your page (120-160 characters)." />',
          nextjs: `export const metadata = {\n  description: 'A compelling description of your page (120-160 characters).',\n}`,
          astro:
            '<meta name="description" content="A compelling description of your page (120-160 characters)." />',
        },
  });

  // Description length (3pts)
  const descLengthStatus = !basic.description
    ? "fail"
    : basic.descriptionLength >= DESCRIPTION_LIMITS.min &&
        basic.descriptionLength <= DESCRIPTION_LIMITS.max
      ? "pass"
      : "warning";
  checks.push({
    id: "description-length",
    category: "essential",
    label: "Description Length",
    status: descLengthStatus,
    points:
      descLengthStatus === "pass" ? 3 : descLengthStatus === "warning" ? 1 : 0,
    maxPoints: 3,
    value: basic.description ? `${basic.descriptionLength} characters` : null,
    message: !basic.description
      ? "No description to measure."
      : basic.descriptionLength < DESCRIPTION_LIMITS.min
        ? `Description is too short (${basic.descriptionLength} chars). Aim for ${DESCRIPTION_LIMITS.min}-${DESCRIPTION_LIMITS.max} characters.`
        : basic.descriptionLength > DESCRIPTION_LIMITS.max
          ? `Description is too long (${basic.descriptionLength} chars). It will be truncated. Keep under ${DESCRIPTION_LIMITS.max} characters.`
          : `Description length is optimal (${basic.descriptionLength} chars).`,
    fix:
      descLengthStatus !== "pass" && basic.description
        ? `Adjust description to be between ${DESCRIPTION_LIMITS.min}-${DESCRIPTION_LIMITS.max} characters.`
        : undefined,
  });

  // HTTPS (3pts)
  checks.push({
    id: "https",
    category: "essential",
    label: "HTTPS",
    status: site.https ? "pass" : "fail",
    points: site.https ? 3 : 0,
    maxPoints: 3,
    value: site.https ? "Enabled" : "Not enabled",
    message: site.https
      ? "Site is served over HTTPS. ✓"
      : "Site is not using HTTPS. This affects security and SEO ranking.",
    fix: site.https
      ? undefined
      : "Configure your server or hosting provider to use HTTPS with a valid SSL certificate.",
  });

  // Canonical URL (3pts)
  checks.push({
    id: "canonical",
    category: "essential",
    label: "Canonical URL",
    status: basic.canonical ? "pass" : "warning",
    points: basic.canonical ? 3 : 0,
    maxPoints: 3,
    value: basic.canonical,
    message: basic.canonical
      ? `Canonical URL set: ${basic.canonical}`
      : "No canonical URL specified. This can cause duplicate content issues.",
    fix: basic.canonical ? undefined : "Add a canonical link tag.",
    fixCode: basic.canonical
      ? undefined
      : {
          html: '<link rel="canonical" href="https://yoursite.com/page" />',
          nextjs: `export const metadata = {\n  alternates: {\n    canonical: 'https://yoursite.com/page',\n  },\n}`,
          astro: '<link rel="canonical" href="https://yoursite.com/page" />',
        },
  });

  // Charset (2pts)
  checks.push({
    id: "charset",
    category: "essential",
    label: "Character Encoding",
    status: basic.charset ? "pass" : "warning",
    points: basic.charset ? 2 : 0,
    maxPoints: 2,
    value: basic.charset,
    message: basic.charset
      ? `Charset defined: ${basic.charset}`
      : "No charset specified. This can cause character display issues.",
    fix: basic.charset
      ? undefined
      : 'Add <meta charset="UTF-8" /> at the start of your <head>.',
  });

  // Language (1pt)
  checks.push({
    id: "language",
    category: "essential",
    label: "Language Attribute",
    status: basic.language ? "pass" : "warning",
    points: basic.language ? 1 : 0,
    maxPoints: 1,
    value: basic.language,
    message: basic.language
      ? `Language set: ${basic.language}`
      : "No lang attribute on <html> tag. This affects accessibility and SEO.",
    fix: basic.language
      ? undefined
      : 'Add lang attribute to your <html> tag: <html lang="en">',
  });

  // ==================== OPEN GRAPH (20 points) ====================

  // og:title (4pts)
  checks.push({
    id: "og-title",
    category: "openGraph",
    label: "og:title",
    status: openGraph.title ? "pass" : "fail",
    points: openGraph.title ? 4 : 0,
    maxPoints: 4,
    value: openGraph.title,
    message: openGraph.title
      ? `og:title: "${openGraph.title.slice(0, 60)}${openGraph.title.length > 60 ? "..." : ""}"`
      : "Missing og:title. Social platforms will fall back to the page title or may display nothing.",
    fix: openGraph.title ? undefined : "Add og:title meta tag.",
    fixCode: openGraph.title
      ? undefined
      : {
          html: '<meta property="og:title" content="Your Page Title" />',
          nextjs: `export const metadata = {\n  openGraph: {\n    title: 'Your Page Title',\n  },\n}`,
          astro: '<meta property="og:title" content="Your Page Title" />',
        },
  });

  // og:description (4pts)
  checks.push({
    id: "og-description",
    category: "openGraph",
    label: "og:description",
    status: openGraph.description ? "pass" : "fail",
    points: openGraph.description ? 4 : 0,
    maxPoints: 4,
    value: openGraph.description,
    message: openGraph.description
      ? `og:description: "${openGraph.description.slice(0, 80)}${openGraph.description.length > 80 ? "..." : ""}"`
      : "Missing og:description. Social platforms will fall back to meta description or show nothing.",
    fix: openGraph.description ? undefined : "Add og:description meta tag.",
    fixCode: openGraph.description
      ? undefined
      : {
          html: '<meta property="og:description" content="A compelling description for social sharing." />',
          nextjs: `export const metadata = {\n  openGraph: {\n    description: 'A compelling description for social sharing.',\n  },\n}`,
          astro:
            '<meta property="og:description" content="A compelling description for social sharing." />',
        },
  });

  // og:image (5pts)
  const ogImageStatus = openGraph.image
    ? images.ogImage?.accessible
      ? "pass"
      : "warning"
    : "fail";
  checks.push({
    id: "og-image",
    category: "openGraph",
    label: "og:image",
    status: ogImageStatus,
    points: ogImageStatus === "pass" ? 5 : ogImageStatus === "warning" ? 2 : 0,
    maxPoints: 5,
    value: openGraph.image,
    message: !openGraph.image
      ? "Missing og:image. Your links will appear without images on social platforms."
      : images.ogImage?.accessible
        ? `og:image found and accessible.`
        : `og:image specified but not accessible: ${images.ogImage?.error || "Unknown error"}`,
    fix: !openGraph.image
      ? "Add an og:image tag with a 1200x630 image."
      : undefined,
    fixCode: !openGraph.image
      ? {
          html: '<meta property="og:image" content="https://yoursite.com/og-image.jpg" />',
          nextjs: `export const metadata = {\n  openGraph: {\n    images: [{\n      url: 'https://yoursite.com/og-image.jpg',\n      width: 1200,\n      height: 630,\n    }],\n  },\n}`,
          astro:
            '<meta property="og:image" content="https://yoursite.com/og-image.jpg" />',
        }
      : undefined,
  });

  // og:url (2pts)
  checks.push({
    id: "og-url",
    category: "openGraph",
    label: "og:url",
    status: openGraph.url ? "pass" : "warning",
    points: openGraph.url ? 2 : 0,
    maxPoints: 2,
    value: openGraph.url,
    message: openGraph.url
      ? `og:url: ${openGraph.url}`
      : "Missing og:url. This helps consolidate shares to a single canonical URL.",
    fix: openGraph.url ? undefined : "Add og:url meta tag.",
    fixCode: openGraph.url
      ? undefined
      : {
          html: '<meta property="og:url" content="https://yoursite.com/page" />',
          nextjs: `export const metadata = {\n  openGraph: {\n    url: 'https://yoursite.com/page',\n  },\n}`,
          astro:
            '<meta property="og:url" content="https://yoursite.com/page" />',
        },
  });

  // og:type (2pts)
  checks.push({
    id: "og-type",
    category: "openGraph",
    label: "og:type",
    status: openGraph.type ? "pass" : "warning",
    points: openGraph.type ? 2 : 0,
    maxPoints: 2,
    value: openGraph.type,
    message: openGraph.type
      ? `og:type: ${openGraph.type}`
      : 'Missing og:type. Defaults to "website". Consider adding for better categorization.',
    fix: openGraph.type
      ? undefined
      : "Add og:type (common values: website, article, product).",
    fixCode: openGraph.type
      ? undefined
      : {
          html: '<meta property="og:type" content="website" />',
          nextjs: `export const metadata = {\n  openGraph: {\n    type: 'website',\n  },\n}`,
          astro: '<meta property="og:type" content="website" />',
        },
  });

  // og:site_name (1pt)
  checks.push({
    id: "og-site-name",
    category: "openGraph",
    label: "og:site_name",
    status: openGraph.siteName ? "pass" : "warning",
    points: openGraph.siteName ? 1 : 0,
    maxPoints: 1,
    value: openGraph.siteName,
    message: openGraph.siteName
      ? `og:site_name: ${openGraph.siteName}`
      : "Missing og:site_name. Helps identify your brand on social platforms.",
  });

  // og:image:alt (1pt)
  checks.push({
    id: "og-image-alt",
    category: "openGraph",
    label: "og:image:alt",
    status: openGraph.imageAlt ? "pass" : openGraph.image ? "warning" : "pass",
    points: openGraph.imageAlt ? 1 : 0,
    maxPoints: 1,
    value: openGraph.imageAlt,
    message: openGraph.imageAlt
      ? `og:image:alt: "${openGraph.imageAlt.slice(0, 50)}..."`
      : openGraph.image
        ? "Missing og:image:alt. Add alt text for accessibility."
        : "No og:image to add alt text for.",
  });

  // og:locale (1pt)
  checks.push({
    id: "og-locale",
    category: "openGraph",
    label: "og:locale",
    status: openGraph.locale ? "pass" : "warning",
    points: openGraph.locale ? 1 : 0,
    maxPoints: 1,
    value: openGraph.locale,
    message: openGraph.locale
      ? `og:locale: ${openGraph.locale}`
      : "Missing og:locale. Helps platforms show content in the right language.",
  });

  // ==================== TWITTER/X (15 points) ====================

  // twitter:card (3pts)
  checks.push({
    id: "twitter-card",
    category: "twitter",
    label: "twitter:card",
    status: twitter.card ? "pass" : "fail",
    points: twitter.card ? 3 : 0,
    maxPoints: 3,
    value: twitter.card,
    message: twitter.card
      ? `twitter:card: ${twitter.card}`
      : "Missing twitter:card. X will use a minimal preview without this.",
    fix: twitter.card ? undefined : "Add twitter:card meta tag.",
    fixCode: twitter.card
      ? undefined
      : {
          html: '<meta name="twitter:card" content="summary_large_image" />',
          nextjs: `export const metadata = {\n  twitter: {\n    card: 'summary_large_image',\n  },\n}`,
          astro: '<meta name="twitter:card" content="summary_large_image" />',
        },
  });

  // twitter:title (2pts)
  const twitterTitleResolved = twitter.title || openGraph.title || basic.title;
  checks.push({
    id: "twitter-title",
    category: "twitter",
    label: "twitter:title",
    status: twitter.title ? "pass" : twitterTitleResolved ? "warning" : "fail",
    points: twitter.title ? 2 : twitterTitleResolved ? 1 : 0,
    maxPoints: 2,
    value: twitter.title || `(fallback: ${twitterTitleResolved || "none"})`,
    message: twitter.title
      ? `twitter:title: "${twitter.title.slice(0, 50)}..."`
      : twitterTitleResolved
        ? `Missing twitter:title. Falling back to ${openGraph.title ? "og:title" : "page title"}.`
        : "Missing twitter:title and no fallback available.",
  });

  // twitter:description (2pts)
  const twitterDescResolved =
    twitter.description || openGraph.description || basic.description;
  checks.push({
    id: "twitter-description",
    category: "twitter",
    label: "twitter:description",
    status: twitter.description
      ? "pass"
      : twitterDescResolved
        ? "warning"
        : "fail",
    points: twitter.description ? 2 : twitterDescResolved ? 1 : 0,
    maxPoints: 2,
    value:
      twitter.description ||
      `(fallback: ${twitterDescResolved?.slice(0, 30) || "none"}...)`,
    message: twitter.description
      ? `twitter:description set.`
      : twitterDescResolved
        ? `Missing twitter:description. Falling back to ${openGraph.description ? "og:description" : "meta description"}.`
        : "Missing twitter:description and no fallback available.",
  });

  // twitter:image (3pts)
  const twitterImageResolved = twitter.image || openGraph.image;
  checks.push({
    id: "twitter-image",
    category: "twitter",
    label: "twitter:image",
    status: twitter.image ? "pass" : twitterImageResolved ? "warning" : "fail",
    points: twitter.image ? 3 : twitterImageResolved ? 1 : 0,
    maxPoints: 3,
    value:
      twitter.image ||
      `(fallback: ${twitterImageResolved ? "og:image" : "none"})`,
    message: twitter.image
      ? "twitter:image set."
      : twitterImageResolved
        ? "Missing twitter:image. Falling back to og:image."
        : "Missing twitter:image and no og:image fallback.",
  });

  // twitter:site (2pts)
  checks.push({
    id: "twitter-site",
    category: "twitter",
    label: "twitter:site",
    status: twitter.site ? "pass" : "warning",
    points: twitter.site ? 2 : 0,
    maxPoints: 2,
    value: twitter.site,
    message: twitter.site
      ? `twitter:site: ${twitter.site}`
      : "Missing twitter:site. Add your X handle for attribution.",
  });

  // twitter:creator (2pts)
  checks.push({
    id: "twitter-creator",
    category: "twitter",
    label: "twitter:creator",
    status: twitter.creator ? "pass" : "warning",
    points: twitter.creator ? 2 : 0,
    maxPoints: 2,
    value: twitter.creator,
    message: twitter.creator
      ? `twitter:creator: ${twitter.creator}`
      : "Missing twitter:creator. Add the content author's X handle.",
  });

  // twitter:image:alt (1pt)
  checks.push({
    id: "twitter-image-alt",
    category: "twitter",
    label: "twitter:image:alt",
    status: twitter.imageAlt
      ? "pass"
      : twitterImageResolved
        ? "warning"
        : "pass",
    points: twitter.imageAlt ? 1 : 0,
    maxPoints: 1,
    value: twitter.imageAlt,
    message: twitter.imageAlt
      ? "twitter:image:alt set for accessibility."
      : twitterImageResolved
        ? "Missing twitter:image:alt. Add alt text for accessibility."
        : "No image to add alt text for.",
  });

  // ==================== IMAGES (20 points) ====================

  // OG image accessible (3pts)
  checks.push({
    id: "og-image-accessible",
    category: "images",
    label: "OG Image Accessible",
    status: !openGraph.image
      ? "fail"
      : images.ogImage?.accessible
        ? "pass"
        : "fail",
    points: images.ogImage?.accessible ? 3 : 0,
    maxPoints: 3,
    value: images.ogImage?.accessible
      ? "Yes"
      : images.ogImage?.error || "No image",
    message: !openGraph.image
      ? "No OG image specified."
      : images.ogImage?.accessible
        ? "OG image is accessible and loads correctly."
        : `OG image failed to load: ${images.ogImage?.error}`,
  });

  // OG image dimensions (4pts)
  const hasGoodDimensions =
    images.ogImage?.width &&
    images.ogImage?.height &&
    images.ogImage.width >= OG_IMAGE_LIMITS.idealWidth * 0.8 &&
    images.ogImage.height >= OG_IMAGE_LIMITS.idealHeight * 0.8;
  checks.push({
    id: "og-image-dimensions",
    category: "images",
    label: "OG Image Dimensions",
    status: !openGraph.image
      ? "fail"
      : hasGoodDimensions
        ? "pass"
        : images.ogImage?.width
          ? "warning"
          : "fail",
    points: hasGoodDimensions ? 4 : images.ogImage?.width ? 2 : 0,
    maxPoints: 4,
    value: images.ogImage?.width
      ? `${images.ogImage.width}x${images.ogImage.height}`
      : null,
    message: !openGraph.image
      ? "No OG image to analyze."
      : hasGoodDimensions
        ? `Image dimensions (${images.ogImage?.width}x${images.ogImage?.height}) are good for social sharing.`
        : images.ogImage?.width
          ? `Image dimensions (${images.ogImage.width}x${images.ogImage.height}) are smaller than ideal (1200x630). May appear pixelated.`
          : "Could not determine image dimensions.",
    fix:
      !hasGoodDimensions && openGraph.image
        ? "Use an image at least 1200x630 pixels."
        : undefined,
  });

  // OG image aspect ratio (3pts)
  const idealRatio = 1200 / 630; // ~1.9
  const actualRatio =
    images.ogImage?.width && images.ogImage?.height
      ? images.ogImage.width / images.ogImage.height
      : null;
  const goodAspectRatio =
    actualRatio && Math.abs(actualRatio - idealRatio) < 0.2;
  checks.push({
    id: "og-image-aspect-ratio",
    category: "images",
    label: "OG Image Aspect Ratio",
    status: !openGraph.image
      ? "fail"
      : goodAspectRatio
        ? "pass"
        : actualRatio
          ? "warning"
          : "fail",
    points: goodAspectRatio ? 3 : actualRatio ? 1 : 0,
    maxPoints: 3,
    value: images.ogImage?.aspectRatio || null,
    message: !openGraph.image
      ? "No OG image to analyze."
      : goodAspectRatio
        ? `Aspect ratio (${images.ogImage?.aspectRatio}) is good for social platforms.`
        : actualRatio
          ? `Aspect ratio (${images.ogImage?.aspectRatio}) differs from ideal 1.91:1. Image may be cropped.`
          : "Could not determine aspect ratio.",
  });

  // OG image file size (4pts)
  const goodFileSize =
    images.ogImage?.fileSize &&
    images.ogImage.fileSize < OG_IMAGE_LIMITS.warningFileSize;
  const okFileSize =
    images.ogImage?.fileSize &&
    images.ogImage.fileSize < OG_IMAGE_LIMITS.maxFileSize;
  checks.push({
    id: "og-image-file-size",
    category: "images",
    label: "OG Image File Size",
    status: !openGraph.image
      ? "fail"
      : goodFileSize
        ? "pass"
        : okFileSize
          ? "warning"
          : images.ogImage?.fileSize
            ? "fail"
            : "warning",
    points: goodFileSize ? 4 : okFileSize ? 2 : 0,
    maxPoints: 4,
    value: images.ogImage?.fileSize
      ? `${Math.round(images.ogImage.fileSize / 1024)} KB`
      : null,
    message: !openGraph.image
      ? "No OG image to analyze."
      : goodFileSize
        ? `Image file size (${Math.round(images.ogImage!.fileSize! / 1024)} KB) is optimized.`
        : okFileSize
          ? `Image file size (${Math.round(images.ogImage!.fileSize! / 1024)} KB) is large. Consider optimizing to under 100KB.`
          : images.ogImage?.fileSize
            ? `Image file size (${Math.round(images.ogImage.fileSize / 1024)} KB) is too large. This will slow down previews.`
            : "Could not determine file size.",
    fix:
      !goodFileSize && images.ogImage?.fileSize
        ? "Compress your image using tools like TinyPNG, Squoosh, or convert to WebP format."
        : undefined,
  });

  // OG image load time (3pts)
  const goodLoadTime =
    images.ogImage?.loadTime &&
    images.ogImage.loadTime < OG_IMAGE_LIMITS.warningLoadTime;
  const okLoadTime =
    images.ogImage?.loadTime &&
    images.ogImage.loadTime < OG_IMAGE_LIMITS.maxLoadTime;
  checks.push({
    id: "og-image-load-time",
    category: "images",
    label: "OG Image Load Time",
    status: !openGraph.image
      ? "fail"
      : goodLoadTime
        ? "pass"
        : okLoadTime
          ? "warning"
          : images.ogImage?.loadTime
            ? "fail"
            : "warning",
    points: goodLoadTime ? 3 : okLoadTime ? 1 : 0,
    maxPoints: 3,
    value: images.ogImage?.loadTime ? `${images.ogImage.loadTime}ms` : null,
    message: !openGraph.image
      ? "No OG image to analyze."
      : goodLoadTime
        ? `Image loads quickly (${images.ogImage!.loadTime}ms).`
        : okLoadTime
          ? `Image load time (${images.ogImage!.loadTime}ms) is acceptable but could be faster.`
          : images.ogImage?.loadTime
            ? `Image loads slowly (${images.ogImage.loadTime}ms). This may cause preview timeouts.`
            : "Could not measure load time.",
    fix:
      !goodLoadTime && images.ogImage?.loadTime
        ? "Use a CDN, optimize image size, or use a faster hosting provider."
        : undefined,
  });

  // Favicon (2pts)
  checks.push({
    id: "favicon",
    category: "images",
    label: "Favicon",
    status: basic.favicon
      ? images.favicon?.accessible
        ? "pass"
        : "warning"
      : "warning",
    points:
      basic.favicon && images.favicon?.accessible ? 2 : basic.favicon ? 1 : 0,
    maxPoints: 2,
    value: basic.favicon,
    message: !basic.favicon
      ? "No favicon specified. Add one for better brand recognition in browser tabs."
      : images.favicon?.accessible
        ? "Favicon found and accessible."
        : `Favicon specified but not accessible: ${images.favicon?.error}`,
    fix: !basic.favicon ? "Add a favicon link tag." : undefined,
    fixCode: !basic.favicon
      ? {
          html: '<link rel="icon" href="/favicon.ico" />\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
          nextjs:
            "// Place favicon.ico in your /app directory or /public directory",
          astro: '<link rel="icon" href="/favicon.ico" />',
        }
      : undefined,
  });

  // Apple touch icon (1pt)
  checks.push({
    id: "apple-touch-icon",
    category: "images",
    label: "Apple Touch Icon",
    status: basic.appleTouchIcon ? "pass" : "warning",
    points: basic.appleTouchIcon ? 1 : 0,
    maxPoints: 1,
    value: basic.appleTouchIcon,
    message: basic.appleTouchIcon
      ? "Apple touch icon found for iOS home screen bookmarks."
      : "No apple-touch-icon. iOS users saving your site will see a default icon.",
    fix: !basic.appleTouchIcon
      ? "Add an apple-touch-icon (180x180 PNG recommended)."
      : undefined,
    fixCode: !basic.appleTouchIcon
      ? {
          html: '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
          nextjs: "// Place apple-touch-icon.png in your /public directory",
          astro:
            '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
        }
      : undefined,
  });

  // ==================== TECHNICAL (10 points) ====================

  // Viewport (2pts)
  checks.push({
    id: "viewport",
    category: "technical",
    label: "Viewport Meta",
    status: basic.viewport ? "pass" : "fail",
    points: basic.viewport ? 2 : 0,
    maxPoints: 2,
    value: basic.viewport,
    message: basic.viewport
      ? "Viewport meta tag configured for responsive design."
      : "Missing viewport meta tag. Site may not display correctly on mobile devices.",
    fix: !basic.viewport ? "Add viewport meta tag." : undefined,
    fixCode: !basic.viewport
      ? {
          html: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
          nextjs:
            "// Next.js adds viewport automatically, or configure in metadata",
          astro:
            '<meta name="viewport" content="width=device-width, initial-scale=1" />',
        }
      : undefined,
  });

  // robots.txt (2pts)
  checks.push({
    id: "robots-txt",
    category: "technical",
    label: "robots.txt",
    status: site.robotsTxt.exists ? "pass" : "warning",
    points: site.robotsTxt.exists ? 2 : 0,
    maxPoints: 2,
    value: site.robotsTxt.exists ? "Found" : "Not found",
    message: site.robotsTxt.exists
      ? site.robotsTxt.allowsIndexing
        ? "robots.txt found and allows indexing."
        : "robots.txt found but blocks indexing. Your site may not appear in search results."
      : "No robots.txt found. Consider adding one to control crawler behavior.",
    fix: !site.robotsTxt.exists
      ? "Create a robots.txt file in your site root."
      : undefined,
  });

  // sitemap.xml (2pts)
  checks.push({
    id: "sitemap",
    category: "technical",
    label: "Sitemap",
    status: site.sitemapXml.exists ? "pass" : "warning",
    points: site.sitemapXml.exists ? 2 : 0,
    maxPoints: 2,
    value: site.sitemapXml.exists
      ? `Found (${site.sitemapXml.urlCount} URLs)`
      : "Not found",
    message: site.sitemapXml.exists
      ? `Sitemap found with ${site.sitemapXml.urlCount} URLs.`
      : "No sitemap.xml found. Adding one helps search engines discover your pages.",
    fix: !site.sitemapXml.exists ? "Create a sitemap.xml file." : undefined,
  });

  // Meta robots (1pt)
  const robotsAllowsIndex =
    !basic.robots ||
    (!basic.robots.includes("noindex") && !basic.robots.includes("none"));
  checks.push({
    id: "meta-robots",
    category: "technical",
    label: "Meta Robots",
    status: robotsAllowsIndex ? "pass" : "warning",
    points: robotsAllowsIndex ? 1 : 0,
    maxPoints: 1,
    value: basic.robots || "Not set (defaults to index, follow)",
    message: robotsAllowsIndex
      ? basic.robots
        ? `Meta robots: ${basic.robots}`
        : "No meta robots tag (defaults to index, follow)."
      : `Meta robots set to "${basic.robots}". Page will not be indexed by search engines.`,
  });

  // Theme color (1pt)
  checks.push({
    id: "theme-color",
    category: "technical",
    label: "Theme Color",
    status: basic.themeColor ? "pass" : "warning",
    points: basic.themeColor ? 1 : 0,
    maxPoints: 1,
    value: basic.themeColor,
    message: basic.themeColor
      ? `Theme color set: ${basic.themeColor}`
      : "No theme-color meta tag. Browser UI may not match your brand.",
    fix: !basic.themeColor ? "Add theme-color meta tag." : undefined,
    fixCode: !basic.themeColor
      ? {
          html: '<meta name="theme-color" content="#000000" />',
          nextjs: `export const metadata = {\n  themeColor: '#000000',\n}`,
          astro: '<meta name="theme-color" content="#000000" />',
        }
      : undefined,
  });

  // No redirect chain (1pt)
  checks.push({
    id: "no-redirects",
    category: "technical",
    label: "No Redirect Chain",
    status: site.redirectChain.length === 0 ? "pass" : "warning",
    points: site.redirectChain.length === 0 ? 1 : 0,
    maxPoints: 1,
    value:
      site.redirectChain.length === 0
        ? "No redirects"
        : `${site.redirectChain.length} redirect(s)`,
    message:
      site.redirectChain.length === 0
        ? "URL resolves directly without redirects."
        : `URL has ${site.redirectChain.length} redirect(s). This adds latency to preview generation.`,
  });

  // Response time (1pt)
  const fastResponse = site.loadTime < 1000;
  checks.push({
    id: "response-time",
    category: "technical",
    label: "Response Time",
    status: fastResponse ? "pass" : site.loadTime < 3000 ? "warning" : "fail",
    points: fastResponse ? 1 : 0,
    maxPoints: 1,
    value: `${site.loadTime}ms`,
    message: fastResponse
      ? `Page responds quickly (${site.loadTime}ms).`
      : site.loadTime < 3000
        ? `Page response time (${site.loadTime}ms) is acceptable but could be faster.`
        : `Page is slow to respond (${site.loadTime}ms). This may cause preview timeouts.`,
  });

  // ==================== EXTRAS (10 points) ====================

  // Structured data (2pts)
  checks.push({
    id: "structured-data",
    category: "extras",
    label: "Structured Data (JSON-LD)",
    status: structuredData.exists
      ? structuredData.valid
        ? "pass"
        : "warning"
      : "warning",
    points:
      structuredData.exists && structuredData.valid
        ? 2
        : structuredData.exists
          ? 1
          : 0,
    maxPoints: 2,
    value: structuredData.exists
      ? `Found: ${structuredData.types.join(", ")}`
      : "Not found",
    message: structuredData.exists
      ? structuredData.valid
        ? `Valid structured data found: ${structuredData.types.join(", ")}`
        : `Structured data found but has errors: ${structuredData.errors.join(", ")}`
      : "No JSON-LD structured data. Adding it improves rich snippets in search results.",
    fix: !structuredData.exists
      ? "Add JSON-LD structured data for rich search results."
      : undefined,
  });

  // Explicit image dimensions (2pts)
  const hasExplicitDimensions = openGraph.imageWidth && openGraph.imageHeight;
  checks.push({
    id: "explicit-image-dimensions",
    category: "extras",
    label: "Explicit Image Dimensions",
    status: hasExplicitDimensions
      ? "pass"
      : openGraph.image
        ? "warning"
        : "pass",
    points: hasExplicitDimensions ? 2 : 0,
    maxPoints: 2,
    value: hasExplicitDimensions
      ? `${openGraph.imageWidth}x${openGraph.imageHeight}`
      : null,
    message: hasExplicitDimensions
      ? `Image dimensions explicitly set (${openGraph.imageWidth}x${openGraph.imageHeight}).`
      : openGraph.image
        ? "No explicit og:image:width/height. Adding these helps platforms render previews faster."
        : "No image to set dimensions for.",
    fix:
      !hasExplicitDimensions && openGraph.image
        ? "Add og:image:width and og:image:height meta tags."
        : undefined,
    fixCode:
      !hasExplicitDimensions && openGraph.image
        ? {
            html: '<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />',
            nextjs: `export const metadata = {\n  openGraph: {\n    images: [{\n      url: '...',\n      width: 1200,\n      height: 630,\n    }],\n  },\n}`,
            astro:
              '<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />',
          }
        : undefined,
  });

  // Author (1pt)
  checks.push({
    id: "author",
    category: "extras",
    label: "Author",
    status: basic.author ? "pass" : "warning",
    points: basic.author ? 1 : 0,
    maxPoints: 1,
    value: basic.author,
    message: basic.author
      ? `Author: ${basic.author}`
      : "No author meta tag. Useful for content attribution.",
  });

  // Article published time (1pt)
  checks.push({
    id: "article-published-time",
    category: "extras",
    label: "Article Published Time",
    status: openGraph.articlePublishedTime
      ? "pass"
      : openGraph.type === "article"
        ? "warning"
        : "pass",
    points: openGraph.articlePublishedTime ? 1 : 0,
    maxPoints: 1,
    value: openGraph.articlePublishedTime,
    message: openGraph.articlePublishedTime
      ? `Published: ${new Date(openGraph.articlePublishedTime).toLocaleDateString()}`
      : openGraph.type === "article"
        ? "Article type detected but no published time set."
        : "Not an article type page.",
  });

  // Article modified time (1pt)
  checks.push({
    id: "article-modified-time",
    category: "extras",
    label: "Article Modified Time",
    status: openGraph.articleModifiedTime
      ? "pass"
      : openGraph.type === "article"
        ? "warning"
        : "pass",
    points: openGraph.articleModifiedTime ? 1 : 0,
    maxPoints: 1,
    value: openGraph.articleModifiedTime,
    message: openGraph.articleModifiedTime
      ? `Last modified: ${new Date(openGraph.articleModifiedTime).toLocaleDateString()}`
      : openGraph.type === "article"
        ? "Article type detected but no modified time set."
        : "Not an article type page.",
  });

  // Content-type header (1pt)
  const hasProperContentType = site.contentType?.includes("text/html");
  checks.push({
    id: "content-type",
    category: "extras",
    label: "Content-Type Header",
    status: hasProperContentType ? "pass" : "warning",
    points: hasProperContentType ? 1 : 0,
    maxPoints: 1,
    value: site.contentType,
    message: hasProperContentType
      ? "Proper text/html content type set."
      : `Content-Type is "${site.contentType}". Expected text/html.`,
  });

  // Fast response under 1 second (2pts)
  checks.push({
    id: "fast-response",
    category: "extras",
    label: "Fast Response (<1s)",
    status:
      site.loadTime < 1000 ? "pass" : site.loadTime < 2000 ? "warning" : "fail",
    points: site.loadTime < 1000 ? 2 : site.loadTime < 2000 ? 1 : 0,
    maxPoints: 2,
    value: `${site.loadTime}ms`,
    message:
      site.loadTime < 1000
        ? `Excellent response time (${site.loadTime}ms).`
        : site.loadTime < 2000
          ? `Good response time (${site.loadTime}ms), but could be faster.`
          : `Slow response time (${site.loadTime}ms). Consider optimizing server performance.`,
  });

  // ==================== ACCESSIBILITY (bonus checks, not scored heavily) ====================

  // H1 tag
  checks.push({
    id: "h1-tag",
    category: "accessibility",
    label: "H1 Tag",
    status: content.h1.exists
      ? content.h1.count === 1
        ? "pass"
        : "warning"
      : "fail",
    points: content.h1.exists ? (content.h1.count === 1 ? 2 : 1) : 0,
    maxPoints: 2,
    value: content.h1.exists
      ? `${content.h1.count} found: "${content.h1.content[0]?.slice(0, 40)}..."`
      : "Not found",
    message: !content.h1.exists
      ? "No H1 tag found. Every page should have exactly one H1."
      : content.h1.count === 1
        ? "Single H1 tag found. ✓"
        : `Multiple H1 tags found (${content.h1.count}). Consider using only one H1 per page.`,
  });

  // Heading hierarchy
  checks.push({
    id: "heading-hierarchy",
    category: "accessibility",
    label: "Heading Hierarchy",
    status: content.headingHierarchy.valid ? "pass" : "warning",
    points: content.headingHierarchy.valid ? 1 : 0,
    maxPoints: 1,
    value: content.headingHierarchy.valid ? "Valid" : "Issues found",
    message: content.headingHierarchy.valid
      ? "Heading hierarchy is properly structured."
      : `Heading hierarchy issues: ${content.headingHierarchy.issues.join(", ")}`,
  });

  // Image alt text
  const altTextPercentage =
    content.images.total > 0
      ? Math.round(
          (content.images.withAlt /
            (content.images.total - content.images.decorative)) *
            100,
        )
      : 100;
  checks.push({
    id: "image-alt-text",
    category: "accessibility",
    label: "Image Alt Text",
    status:
      altTextPercentage >= 90
        ? "pass"
        : altTextPercentage >= 50
          ? "warning"
          : "fail",
    points: altTextPercentage >= 90 ? 2 : altTextPercentage >= 50 ? 1 : 0,
    maxPoints: 2,
    value: `${content.images.withAlt}/${content.images.total - content.images.decorative} images have alt text`,
    message:
      content.images.total === 0
        ? "No images found on page."
        : altTextPercentage >= 90
          ? `${altTextPercentage}% of images have alt text. ✓`
          : `Only ${altTextPercentage}% of images have alt text. Add alt text for accessibility.`,
  });

  // Form labels
  checks.push({
    id: "form-labels",
    category: "accessibility",
    label: "Form Labels",
    status:
      accessibility.formLabels.total === 0
        ? "pass"
        : accessibility.formLabels.unlabeled === 0
          ? "pass"
          : "warning",
    points: accessibility.formLabels.unlabeled === 0 ? 1 : 0,
    maxPoints: 1,
    value:
      accessibility.formLabels.total === 0
        ? "No form inputs"
        : `${accessibility.formLabels.labeled}/${accessibility.formLabels.total} labeled`,
    message:
      accessibility.formLabels.total === 0
        ? "No form inputs to check."
        : accessibility.formLabels.unlabeled === 0
          ? "All form inputs have proper labels. ✓"
          : `${accessibility.formLabels.unlabeled} form input(s) missing labels.`,
  });

  // Landmarks
  const landmarkCount = [
    accessibility.landmarks.hasMain,
    accessibility.landmarks.hasNav,
    accessibility.landmarks.hasHeader,
    accessibility.landmarks.hasFooter,
  ].filter(Boolean).length;
  checks.push({
    id: "landmarks",
    category: "accessibility",
    label: "ARIA Landmarks",
    status:
      landmarkCount >= 2 ? "pass" : landmarkCount >= 1 ? "warning" : "fail",
    points: landmarkCount >= 2 ? 1 : 0,
    maxPoints: 1,
    value: `${landmarkCount}/4 landmarks`,
    message:
      landmarkCount >= 2
        ? `Good landmark structure (${landmarkCount}/4 key landmarks).`
        : landmarkCount >= 1
          ? "Limited landmarks found. Consider adding main, nav, header, footer elements."
          : "No ARIA landmarks found. Add semantic HTML5 elements for accessibility.",
  });

  // Security headers
  const securityHeaderCount = [
    site.securityHeaders.strictTransportSecurity,
    site.securityHeaders.xContentTypeOptions,
    site.securityHeaders.xFrameOptions,
    site.securityHeaders.contentSecurityPolicy,
  ].filter(Boolean).length;
  checks.push({
    id: "security-headers",
    category: "technical",
    label: "Security Headers",
    status:
      securityHeaderCount >= 3
        ? "pass"
        : securityHeaderCount >= 1
          ? "warning"
          : "fail",
    points: securityHeaderCount >= 3 ? 1 : 0,
    maxPoints: 1,
    value: `${securityHeaderCount}/4 headers`,
    message:
      securityHeaderCount >= 3
        ? `Good security headers (${securityHeaderCount}/4).`
        : securityHeaderCount >= 1
          ? `Some security headers missing (${securityHeaderCount}/4). Consider adding HSTS, X-Content-Type-Options, X-Frame-Options, CSP.`
          : "No security headers found. Your site may be vulnerable to attacks.",
  });

  // Compression
  checks.push({
    id: "compression",
    category: "performance",
    label: "Compression",
    status: performance.compression ? "pass" : "warning",
    points: performance.compression ? 1 : 0,
    maxPoints: 1,
    value: performance.compression ? "Enabled (gzip/br)" : "Not detected",
    message: performance.compression
      ? "Response is compressed (gzip or brotli). ✓"
      : "No compression detected. Enable gzip or brotli for faster loading.",
  });

  // Render blocking resources
  checks.push({
    id: "render-blocking",
    category: "performance",
    label: "Render-Blocking Resources",
    status:
      performance.renderBlockingResources <= 2
        ? "pass"
        : performance.renderBlockingResources <= 5
          ? "warning"
          : "fail",
    points: performance.renderBlockingResources <= 2 ? 1 : 0,
    maxPoints: 1,
    value: `${performance.renderBlockingResources} resources`,
    message:
      performance.renderBlockingResources <= 2
        ? `Minimal render-blocking resources (${performance.renderBlockingResources}).`
        : performance.renderBlockingResources <= 5
          ? `${performance.renderBlockingResources} render-blocking resources. Consider deferring non-critical scripts/styles.`
          : `${performance.renderBlockingResources} render-blocking resources. This significantly impacts page load.`,
  });

  // ==================== CALCULATE TOTALS ====================

  // Group checks by category
  const categoryGroups: Record<string, ScoreCheck[]> = {};
  checks.forEach((check) => {
    if (!categoryGroups[check.category]) {
      categoryGroups[check.category] = [];
    }
    categoryGroups[check.category].push(check);
  });

  // Build categories array
  const categoryNames: Record<string, string> = {
    essential: "Essential",
    openGraph: "Open Graph",
    twitter: "Twitter/X",
    images: "Images",
    technical: "Technical",
    extras: "Extras",
    accessibility: "Accessibility",
    performance: "Performance",
  };

  const categories: ScoreCategory[] = Object.entries(categoryGroups).map(
    ([key, categoryChecks]) => ({
      name: categoryNames[key] || key,
      key,
      points: categoryChecks.reduce((sum, c) => sum + c.points, 0),
      maxPoints: categoryChecks.reduce((sum, c) => sum + c.maxPoints, 0),
      checks: categoryChecks,
    }),
  );

  // Calculate totals (only count main scoring categories, not accessibility/performance extras)
  const scoringCategories = [
    "essential",
    "openGraph",
    "twitter",
    "images",
    "technical",
    "extras",
  ];
  const scoringChecks = checks.filter((c) =>
    scoringCategories.includes(c.category),
  );

  const total = scoringChecks.reduce((sum, c) => sum + c.points, 0);
  const maxTotal = scoringChecks.reduce((sum, c) => sum + c.maxPoints, 0);
  const percentage = Math.round((total / maxTotal) * 100);

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  const gradeInfo = getGrade(percentage);

  return {
    total: percentage,
    maxTotal: 100,
    grade: gradeInfo.grade,
    gradeColor: gradeInfo.color,
    categories,
    passCount,
    warningCount,
    failCount,
  };
}
