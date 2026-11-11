"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Local, instant text-filter state whose visible value never waits on a
 * network round trip. The URL's `q` param is kept in sync in the background
 * — debounced, via router.replace — purely so a search stays shareable and
 * bookmarkable; nothing about what's on screen depends on that sync landing.
 *
 * Shared by LibrarySearch and ProvisionSearch — both filter a small
 * in-memory array on every keystroke and only need the URL sync, not the
 * filtering itself, which stays specific to each caller's data shape.
 */
export function useDebouncedQuerySync(
  initialQuery: string,
  paramsWithoutQuery: string,
  path: string,
) {
  const router = useRouter();
  const [query, setQueryState] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setQuery(value: string) {
    setQueryState(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(paramsWithoutQuery);
      const trimmed = value.trim().slice(0, 100);
      if (trimmed) params.set("q", trimmed);
      const qs = params.toString();
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    }, 350);
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return [query, setQuery] as const;
}
