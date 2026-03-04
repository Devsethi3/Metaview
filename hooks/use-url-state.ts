// hooks/use-url-state.ts
"use client";

import { useQueryState } from "nuqs";

export function useUrlState() {
  const [url, setUrl] = useQueryState("url", {
    defaultValue: "",
    parse: (value) => value || "",
    serialize: (value) => value,
  });

  return {
    url,
    setUrl,
    hasUrl: !!url,
    clearUrl: () => setUrl(null),
  };
}
