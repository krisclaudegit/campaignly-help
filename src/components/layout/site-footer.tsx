import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t py-12" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-fg)" }}>Help Center</p>
            <ul className="space-y-2">
              {[
                { href: "/help/getting-started", label: "Getting Started" },
                { href: "/help/campaigns", label: "Campaigns" },
                { href: "/help/audit", label: "Audit" },
                { href: "/help/integrations", label: "Integrations" },
                { href: "/help/benchmarks", label: "Benchmarks" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm no-underline transition-colors" style={{ color: "var(--muted-fg)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-fg)" }}>Guides</p>
            <ul className="space-y-2">
              {[
                { href: "/guides/local-marketing", label: "Local Marketing" },
                { href: "/guides/google-ads", label: "Google Ads" },
                { href: "/guides/meta-ads", label: "Meta Ads" },
                { href: "/guides/analytics", label: "Analytics" },
                { href: "/guides/seo", label: "SEO" },
                { href: "/guides/reporting", label: "Reporting" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm no-underline transition-colors" style={{ color: "var(--muted-fg)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-fg)" }}>Resources</p>
            <ul className="space-y-2">
              {[
                { href: "/blog", label: "Blog" },
                { href: "/blog?category=updates", label: "Updates" },
                { href: "/blog?category=tips", label: "Tips & Tricks" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm no-underline transition-colors" style={{ color: "var(--muted-fg)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-fg)" }}>Campaignly</p>
            <ul className="space-y-2">
              {[
                { href: "https://campaignly.net", label: "Open App" },
                { href: "https://campaignly.net/privacy", label: "Privacy Policy" },
                { href: "https://campaignly.net/terms", label: "Terms of Service" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm no-underline transition-colors" style={{ color: "var(--muted-fg)" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-fg)" }}>
          © {new Date().getFullYear()} Campaignly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
