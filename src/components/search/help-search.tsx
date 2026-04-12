"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { Article } from "@/lib/articles";

interface HelpSearchProps {
  index: Pick<Article, "slug" | "href" | "title" | "description" | "tags" | "section" | "category">[];
  placeholder?: string;
  autoFocus?: boolean;
}

export function HelpSearch({ index, placeholder = "Search articles…", autoFocus = false }: HelpSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof index>([]);

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "description", weight: 0.3 },
          { name: "tags", weight: 0.2 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [index]
  );

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const hits = fuse.search(query.trim()).slice(0, 8).map((r) => r.item);
    setResults(hits);
  }, [query, fuse]);

  const sectionLabel: Record<string, string> = {
    help: "Help Center",
    guides: "Guides",
    blog: "Blog",
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--muted-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border py-3 pl-11 pr-4 text-[15px] outline-none transition-shadow"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(35,31,255,.12)")}
          onBlur={(e) => (e.target.style.boxShadow = "")}
        />
      </div>

      {results.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl shadow-lg"
          style={{ background: "var(--background)", border: "1px solid var(--border)" }}
        >
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                href={r.href}
                onClick={() => setQuery("")}
                className="flex items-start gap-3 px-4 py-3 no-underline transition-colors"
                style={{ color: "var(--foreground)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="mt-0.5 truncate text-xs" style={{ color: "var(--muted-fg)" }}>{r.description}</p>
                </div>
                <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: "var(--muted)", color: "var(--muted-fg)" }}>
                  {sectionLabel[r.section] || r.section}
                </span>
              </Link>
            </li>
          ))}
          <li className="border-t px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
            <a
              href={`https://help.campaignly.net/search?q=${encodeURIComponent(query)}`}
              className="text-xs no-underline"
              style={{ color: "var(--brand)" }}
            >
              See all results for "{query}" →
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
