// app/actions/fetch-sitemap.ts
"use server";

export async function fetchSitemapXml(origin: string): Promise<{
  exists: boolean;
  urlCount: number | null;
  url: string | null;
  content: string | null;
}> {
  const sitemapUrls = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap/sitemap.xml`,
  ];

  for (const url of sitemapUrls) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Metaview/1.0)",
        },
      });

      if (!response.ok) continue;

      const content = await response.text();

      // Check if it's valid XML
      if (
        !content.includes("<?xml") &&
        !content.includes("<urlset") &&
        !content.includes("<sitemapindex")
      ) {
        continue;
      }

      // Count URLs
      const urlMatches = content.match(/<loc>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;

      return {
        exists: true,
        urlCount,
        url,
        content: content.slice(0, 10000),
      };
    } catch {
      continue;
    }
  }

  return { exists: false, urlCount: null, url: null, content: null };
}
