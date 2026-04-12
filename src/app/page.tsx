import Link from "next/link";
import { buildSearchIndex, getFeaturedArticles, getAllArticles, HELP_CATEGORIES, GUIDES_CATEGORIES } from "@/lib/articles";
import { HelpSearch } from "@/components/search/help-search";
import { ArticleCard } from "@/components/article/article-card";

export default function HomePage() {
  const searchIndex = buildSearchIndex();
  const featured = getFeaturedArticles().slice(0, 3);
  const recentBlog = getAllArticles("blog").slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="border-b py-16 text-center" style={{ background: "var(--brand-subtle)", borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="mb-3 text-3xl font-bold leading-tight" style={{ color: "var(--foreground)" }}>
            How can we help?
          </h1>
          <p className="mb-8 text-base" style={{ color: "var(--muted-fg)" }}>
            Search our help center, marketing guides, and blog.
          </p>
          <HelpSearch index={searchIndex} placeholder="Search articles, guides, and tips…" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6">
        {/* Help Center Categories */}
        <section className="py-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Help Center</h2>
            <Link href="/help" className="text-sm no-underline" style={{ color: "var(--brand)" }}>View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(Object.entries(HELP_CATEGORIES) as [string, { label: string; description: string; icon: string }][]).map(([slug, cat]) => (
              <Link
                key={slug}
                href={`/help/${slug}`}
                className="flex flex-col gap-2 rounded-xl p-4 no-underline transition-all"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{cat.label}</span>
                <span className="text-xs leading-snug" style={{ color: "var(--muted-fg)" }}>{cat.description}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Guides */}
        <section className="border-t py-14" style={{ borderColor: "var(--border)" }}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Marketing Guides</h2>
            <Link href="/guides" className="text-sm no-underline" style={{ color: "var(--brand)" }}>View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(Object.entries(GUIDES_CATEGORIES) as [string, { label: string; description: string; icon: string }][]).map(([slug, cat]) => (
              <Link
                key={slug}
                href={`/guides/${slug}`}
                className="flex flex-col items-center gap-2 rounded-xl p-4 text-center no-underline transition-all"
                style={{ background: "var(--muted)" }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured articles */}
        {featured.length > 0 && (
          <section className="border-t py-14" style={{ borderColor: "var(--border)" }}>
            <h2 className="mb-6 text-xl font-bold" style={{ color: "var(--foreground)" }}>Featured articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((a) => (
                <ArticleCard key={a.slug} article={a} showCategory />
              ))}
            </div>
          </section>
        )}

        {/* Recent blog posts */}
        {recentBlog.length > 0 && (
          <section className="border-t py-14" style={{ borderColor: "var(--border)" }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Latest from the blog</h2>
              <Link href="/blog" className="text-sm no-underline" style={{ color: "var(--brand)" }}>View all →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentBlog.map((a) => (
                <ArticleCard key={a.slug} article={a} showCategory />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
