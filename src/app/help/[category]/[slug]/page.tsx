import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllArticles, getArticleContent, HELP_CATEGORIES, type HelpCategory } from "@/lib/articles";
import { generateArticleMetadata } from "@/lib/metadata";
import { ArticleLayout } from "@/components/article/article-layout";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles("help");
  return articles.map((a) => {
    const parts = a.slug.split("/");
    return { category: parts[0], slug: parts[1] };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getArticleContent("help", category, slug);
  if (!article) return {};
  return generateArticleMetadata(article);
}

export default async function HelpArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const article = getArticleContent("help", category, slug);
  if (!article) notFound();

  const cat = HELP_CATEGORIES[category as HelpCategory];
  const breadcrumbs = [
    { name: "Help Center", href: "/help" },
    { name: cat?.label || category, href: `/help/${category}` },
    { name: article.title, href: article.href },
  ];

  // Dynamically import the MDX file
  const { default: MDXContent } = await import(`@/../content/help/${category}/${slug}.mdx`);

  return (
    <ArticleLayout article={article} breadcrumbs={breadcrumbs}>
      <MDXContent />
    </ArticleLayout>
  );
}
