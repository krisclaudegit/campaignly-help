import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllArticles, getArticleContent } from "@/lib/articles";
import { generateArticleMetadata } from "@/lib/metadata";
import { ArticleLayout } from "@/components/article/article-layout";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticles("blog").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleContent("blog", "", slug);
  if (!article) return {};
  return generateArticleMetadata(article);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleContent("blog", "", slug);
  if (!article) notFound();

  const breadcrumbs = [
    { name: "Blog", href: "/blog" },
    { name: article.title, href: article.href },
  ];

  const { default: MDXContent } = await import(`@/../content/blog/${slug}.mdx`);

  return (
    <ArticleLayout article={article} breadcrumbs={breadcrumbs}>
      <MDXContent />
    </ArticleLayout>
  );
}
