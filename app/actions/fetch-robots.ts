// app/actions/fetch-robots.ts
"use server";

export async function fetchRobotsTxt(origin: string): Promise<{
  exists: boolean;
  allowsIndexing: boolean;
  content: string | null;
}> {
  try {
    const response = await fetch(`${origin}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Metaview/1.0)",
      },
    });

    if (!response.ok) {
      return { exists: false, allowsIndexing: true, content: null };
    }

    const content = await response.text();

    // Check if indexing is allowed (look for Disallow: /)
    const lines = content.toLowerCase().split("\n");
    let currentUserAgent = "";
    let allowsIndexing = true;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("user-agent:")) {
        currentUserAgent = trimmed.replace("user-agent:", "").trim();
      } else if (
        trimmed.startsWith("disallow:") &&
        (currentUserAgent === "*" || currentUserAgent === "")
      ) {
        const path = trimmed.replace("disallow:", "").trim();
        if (path === "/") {
          allowsIndexing = false;
        }
      }
    }

    return { exists: true, allowsIndexing, content: content.slice(0, 5000) };
  } catch {
    return { exists: false, allowsIndexing: true, content: null };
  }
}
