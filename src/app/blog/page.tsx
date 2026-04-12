import type { Metadata } from "next";
import { getAllArticles, BLOG_CATEGORIES } from "@/lib/articles";
import { BlogCard } from "@/components/blog/blog-card";

export const metadata: Metadata = {
  title: "Blog",
  description: "Marketing tips, platform updates, and in-depth guides from the Campaignly team.",
};

export default function BlogIndexPage() {
  const posts = getAllArticles("blog");
  const [featured, ...rest] = posts;

  return (
    <main className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Blog</h1>
        <p className="mt-2 text-base" style={{ color: "var(--muted-fg)" }}>
          Marketing tips, platform updates, and practical guides.
        </p>
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "var(--brand)", color: "#fff" }}>All</span>
        {(Object.entries(BLOG_CATEGORIES) as [string, { label: string }][]).map(([slug, cat]) => (
          <span key={slug} className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors" style={{ background: "var(--muted)", color: "var(--muted-fg)" }}>
            {cat.label}
          </span>
        ))}
      </div>

      {/* Featured post */}
      {featured && (
        <div className="mb-8">
          <BlogCard article={featured} featured />
        </div>
      )}

      {/* Post grid */}
      {rest.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => <BlogCard key={post.slug} article={post} />)}
        </div>
      ) : (
        <div className="rounded-xl px-6 py-12 text-center" style={{ background: "var(--muted)" }}>
          <p className="text-sm" style={{ color: "var(--muted-fg)" }}>More posts coming soon — subscribe to get notified.</p>
        </div>
      )}
    </main>
  );
}
