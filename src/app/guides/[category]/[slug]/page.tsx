import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllArticles, getArticleContent, GUIDES_CATEGORIES, type GuidesCategory } from "@/lib/articles";
import { generateArticleMetadata } from "@/lib/metadata";
import { ArticleLayout } from "@/components/article/article-layout";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles("guides");
  return articles.map((a) => {
    const parts = a.slug.split("/");
    return { category: parts[0], slug: parts[1] };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticleContent("guides", category, slug);
  if (!article) return {};
  return generateArticleMetadata(article);
}

export default async function GuideArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const article = getArticleContent("guides", category, slug);
  if (!article) notFound();

  const cat = GUIDES_CATEGORIES[category as GuidesCategory];
  const breadcrumbs = [
    { name: "Guides", href: "/guides" },
    { name: cat?.label || category, href: `/guides/${category}` },
    { name: article.title, href: article.href },
  ];

  const { default: MDXContent } = await import(`@/../content/guides/${category}/${slug}.mdx`);

  return (
    <ArticleLayout article={article} breadcrumbs={breadcrumbs}>
      <MDXContent />
    </ArticleLayout>
  );
}
