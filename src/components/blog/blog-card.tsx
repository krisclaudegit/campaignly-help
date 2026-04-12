import Link from "next/link";
import type { Article } from "@/lib/articles";
import { BLOG_CATEGORIES } from "@/lib/articles";

interface BlogCardProps {
  article: Article;
  featured?: boolean;
}

export function BlogCard({ article, featured = false }: BlogCardProps) {
  const categoryLabel = BLOG_CATEGORIES[article.category as keyof typeof BLOG_CATEGORIES]?.label || article.category;

  if (featured) {
    return (
      <Link
        href={article.href}
        className="group block rounded-2xl p-8 no-underline transition-colors"
        style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-light)" }}
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--brand)", color: "#fff" }}>
            {categoryLabel}
          </span>
          {article.readTime && (
            <span className="text-xs" style={{ color: "var(--brand-dark)" }}>{article.readTime} min read</span>
          )}
        </div>
        <h2 className="mb-2 text-xl font-700 leading-snug" style={{ color: "var(--foreground)" }}>{article.title}</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>{article.description}</p>
        <p className="mt-4 text-sm font-medium" style={{ color: "var(--brand)" }}>Read article →</p>
      </Link>
    );
  }

  return (
    <Link
      href={article.href}
      className="group flex flex-col gap-2 rounded-xl p-5 no-underline transition-colors"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "var(--muted)", color: "var(--muted-fg)" }}>
          {categoryLabel}
        </span>
        <span className="text-xs" style={{ color: "var(--muted-fg)" }}>
          {new Date(article.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
      <h3 className="text-[15px] font-semibold leading-snug" style={{ color: "var(--foreground)" }}>{article.title}</h3>
      <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>{article.description}</p>
      {article.readTime && (
        <span className="mt-1 text-xs" style={{ color: "var(--muted-fg)" }}>{article.readTime} min read</span>
      )}
    </Link>
  );
}
