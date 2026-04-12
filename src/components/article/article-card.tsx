import Link from "next/link";
import type { Article } from "@/lib/articles";

interface ArticleCardProps {
  article: Article;
  showCategory?: boolean;
}

export function ArticleCard({ article, showCategory = false }: ArticleCardProps) {
  return (
    <Link
      href={article.href}
      className="group flex flex-col gap-2 rounded-xl p-4 no-underline transition-colors"
      style={{ background: "var(--background)", border: "1px solid var(--border)" }}
    >
      {showCategory && (
        <span className="text-xs font-medium" style={{ color: "var(--brand)" }}>
          {article.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      )}
      <h3
        className="text-[15px] font-semibold leading-snug transition-colors"
        style={{ color: "var(--foreground)" }}
      >
        {article.title}
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>
        {article.description}
      </p>
      {article.readTime && (
        <span className="mt-1 text-xs" style={{ color: "var(--muted-fg)" }}>
          {article.readTime} min read
        </span>
      )}
    </Link>
  );
}
