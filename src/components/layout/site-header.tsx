"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-[15px] no-underline" style={{ color: "var(--foreground)" }}>
          <span style={{ color: "var(--brand)", fontWeight: 700 }}>Campaignly</span>
          <span style={{ color: "var(--muted-fg)", fontWeight: 400 }}>Help</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/help" className="text-sm font-medium no-underline transition-colors hover:opacity-70" style={{ color: "var(--muted-fg)" }}>
            Help Center
          </Link>
          <Link href="/guides" className="text-sm font-medium no-underline transition-colors hover:opacity-70" style={{ color: "var(--muted-fg)" }}>
            Guides
          </Link>
          <Link href="/blog" className="text-sm font-medium no-underline transition-colors hover:opacity-70" style={{ color: "var(--muted-fg)" }}>
            Blog
          </Link>
        </nav>

        {/* CTA */}
        <a
          href="https://campaignly.net"
          className="hidden rounded-lg px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90 md:inline-flex"
          style={{ background: "var(--brand)" }}
        >
          Open Campaignly
        </a>
      </div>
    </header>
  );
}
