import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES_CATEGORIES, getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Marketing Guides",
  description: "In-depth marketing guides for local businesses and agencies — Google Ads, Meta Ads, GA4, SEO, local marketing, and reporting.",
};

export default function GuidesIndexPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Marketing Guides</h1>
        <p className="mt-2 text-base" style={{ color: "var(--muted-fg)" }}>
          Free in-depth guides to help you run better local marketing campaigns.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(GUIDES_CATEGORIES) as [string, { label: string; description: string; icon: string }][]).map(([slug, cat]) => {
          const articles = getAllArticles("guides").filter((a) => a.category === slug).slice(0, 5);
          return (
            <div key={slug} className="rounded-xl p-5" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <Link href={`/guides/${slug}`} className="mb-3 flex items-center gap-3 no-underline">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{cat.label}</span>
              </Link>
              <p className="mb-4 text-sm" style={{ color: "var(--muted-fg)" }}>{cat.description}</p>
              {articles.length > 0 ? (
                <ul className="space-y-1.5">
                  {articles.map((a) => (
                    <li key={a.slug}>
                      <Link href={a.href} className="text-sm no-underline hover:underline" style={{ color: "var(--brand)" }}>
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic" style={{ color: "var(--muted-fg)" }}>Guides coming soon</p>
              )}
              <Link href={`/guides/${slug}`} className="mt-4 block text-xs no-underline" style={{ color: "var(--muted-fg)" }}>
                View all {cat.label} guides →
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
