"use client"

import { useState, useEffect, useRef, memo } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const lazyHighlightCache = new Map<string, string>()

function getCacheKey(code: string, language: string, theme: string): string {
  let hash = 0
  const str = `${language}:${theme}:${code}`
  for (let i = 0; i < Math.min(str.length, 500); i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `lazy:${language}:${theme}:${code.length}:${hash}`
}

interface LazyCodeBlockProps {
  code: string
  language?: string
  theme?: string
  className?: string
  maxHeight?: string
  placeholder?: React.ReactNode
}

export const LazyCodeBlock = memo(function LazyCodeBlock({
  code,
  language = "html",
  theme = "github-dark",
  className,
  maxHeight = "500px",
  placeholder,
}: LazyCodeBlockProps) {
  const MAX_CHARS = 50000
  const truncatedCode =
    code.length > MAX_CHARS
      ? code.slice(0, MAX_CHARS) +
        "\n\n/* ... Content truncated for performance ... */"
      : code
  const isTruncated = code.length > MAX_CHARS

  const cacheKey = getCacheKey(truncatedCode, language, theme)
  const cached = lazyHighlightCache.get(cacheKey)

  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(
    cached ?? null
  )
  const [error, setError] = useState(false)
  const mountedRef = useRef(true)
  const currentKeyRef = useRef(cacheKey)

  useEffect(() => {
    mountedRef.current = true
    currentKeyRef.current = cacheKey

    if (lazyHighlightCache.has(cacheKey)) {
      setHighlightedHtml(lazyHighlightCache.get(cacheKey)!)
      return
    }

    let cancelled = false

    async function highlight() {
      try {
        await new Promise<void>((resolve) => {
          if ("requestIdleCallback" in window) {
            requestIdleCallback(() => resolve(), { timeout: 150 })
          } else {
            setTimeout(resolve, 16)
          }
        })

        if (cancelled) return

        const { codeToHtml } = await import("shiki")
        const html = await codeToHtml(truncatedCode, { lang: language, theme })

        if (!cancelled && mountedRef.current && currentKeyRef.current === cacheKey) {
          lazyHighlightCache.set(cacheKey, html)
          setHighlightedHtml(html)
          setError(false)
        }
      } catch (err) {
        console.error("Syntax highlighting failed:", err)
        if (!cancelled && mountedRef.current) {
          setError(true)
        }
      }
    }

    highlight()

    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [cacheKey, truncatedCode, language, theme])

  const containerClass = cn(
    "not-prose flex w-full flex-col overflow-clip border",
    "border-border bg-card text-card-foreground rounded-xl",
    className
  )

  const codeClass = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4",
    "font-mono"
  )

  return (
    <div className={containerClass}>
      {isTruncated && (
        <div className="px-4 py-2 bg-muted/50 border-b text-xs text-muted-foreground flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
          <span>
            Content truncated for performance ({Math.round(code.length / 1024)}
            KB total)
          </span>
        </div>
      )}

      {highlightedHtml ? (
        <div
          className={codeClass}
          style={{ maxHeight, overflowY: "auto" }}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : error ? (
        <div className={codeClass} style={{ maxHeight, overflowY: "auto" }}>
          <pre className="px-4 py-4">
            <code className="text-muted-foreground whitespace-pre-wrap break-all">
              {truncatedCode}
            </code>
          </pre>
        </div>
      ) : (
        <div className="relative">
          <div className={codeClass} style={{ maxHeight, overflowY: "auto" }}>
            <pre className="px-4 py-4">
              <code className="text-muted-foreground whitespace-pre-wrap break-all">
                {truncatedCode}
              </code>
            </pre>
          </div>
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 border text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Highlighting…</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-t">
          Syntax highlighting unavailable
        </div>
      )}
    </div>
  )
})