import Link from "next/link";
import type { Article } from "@/lib/articles";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { ArticleCard } from "./article-card";
import { getAllArticles } from "@/lib/articles";

interface Breadcrumb {
  name: string;
  href: string;
}

interface ArticleLayoutProps {
  article: Article;
  breadcrumbs: Breadcrumb[];
  children: React.ReactNode;
}

export function ArticleLayout({ article, breadcrumbs, children }: ArticleLayoutProps) {
  // Resolve related articles
  const allArticles = getAllArticles(article.section);
  const related = article.relatedArticles
    ?.map((slug) => allArticles.find((a) => a.slug === slug || a.href.endsWith(slug)))
    .filter(Boolean)
    .slice(0, 3) as Article[] | undefined;

  const crumbsWithHome = [{ name: "Home", href: "/" }, ...breadcrumbs];

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbsWithHome)) }}
      />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex gap-12">
          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Breadcrumbs */}
            <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm" style={{ color: "var(--muted-fg)" }}>
              {crumbsWithHome.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i < crumbsWithHome.length - 1 ? (
                    <>
                      <Link href={crumb.href} className="no-underline hover:underline" style={{ color: "var(--muted-fg)" }}>
                        {crumb.name}
                      </Link>
                      <span>/</span>
                    </>
                  ) : (
                    <span style={{ color: "var(--foreground)" }}>{crumb.name}</span>
                  )}
                </span>
              ))}
            </nav>

            {/* Article meta */}
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--brand-subtle)", color: "var(--brand)" }}>
                {article.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              {article.readTime && (
                <span className="text-xs" style={{ color: "var(--muted-fg)" }}>{article.readTime} min read</span>
              )}
              <span className="text-xs" style={{ color: "var(--muted-fg)" }}>
                Updated {new Date(article.lastUpdated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>

            {/* MDX prose */}
            <article className="prose">{children}</article>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--muted)", color: "var(--muted-fg)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related articles */}
            {related && related.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-4 text-base font-semibold" style={{ color: "var(--foreground)" }}>Related articles</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 rounded-xl p-6 text-center" style={{ background: "var(--brand-subtle)" }}>
              <p className="mb-3 text-sm font-medium" style={{ color: "var(--brand-deeper)" }}>
                Ready to put this into practice?
              </p>
              <a
                href="https://campaignly.net"
                className="inline-flex rounded-lg px-5 py-2.5 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
                style={{ background: "var(--brand)" }}
              >
                Open Campaignly →
              </a>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
