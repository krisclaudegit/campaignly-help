import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllArticles, HELP_CATEGORIES, type HelpCategory } from "@/lib/articles";
import { generateCategoryMetadata } from "@/lib/metadata";
import { ArticleCard } from "@/components/article/article-card";
import { breadcrumbSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return Object.keys(HELP_CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = HELP_CATEGORIES[category as HelpCategory];
  if (!cat) return {};
  return generateCategoryMetadata(cat.label, cat.description, `/help/${category}`);
}

export default async function HelpCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = HELP_CATEGORIES[category as HelpCategory];
  if (!cat) notFound();

  const articles = getAllArticles("help").filter((a) => a.category === category);
  const crumbs = [{ name: "Help Center", href: "/help" }, { name: cat.label, href: `/help/${category}` }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", href: "/" }, ...crumbs])) }} />
      <main className="mx-auto max-w-7xl px-6 py-14">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm" style={{ color: "var(--muted-fg)" }}>
          <a href="/help" className="no-underline hover:underline" style={{ color: "var(--muted-fg)" }}>Help Center</a>
          <span>/</span>
          <span style={{ color: "var(--foreground)" }}>{cat.label}</span>
        </nav>

        <div className="mb-10 flex items-center gap-4">
          <span className="text-4xl">{cat.icon}</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{cat.label}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>{cat.description}</p>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        ) : (
          <div className="rounded-xl px-6 py-12 text-center" style={{ background: "var(--muted)" }}>
            <p className="text-sm" style={{ color: "var(--muted-fg)" }}>Articles in this category are coming soon.</p>
          </div>
        )}
      </main>
    </>
  );
}
