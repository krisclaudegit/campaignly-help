import type { Metadata } from "next";
import type { Article } from "./articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://help.campaignly.net";
const SITE_NAME = "Campaignly Help";
const DEFAULT_DESCRIPTION =
  "Help center, guides, and blog for Campaignly — the local marketing platform for agencies and marketers.";

export function baseMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export function generateArticleMetadata(article: Article): Metadata {
  const canonicalPath = article.href;
  return {
    title: article.title,
    description: article.description,
    keywords: article.tags?.join(", "),
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: `${SITE_URL}${canonicalPath}`,
      publishedTime: article.lastUpdated,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
  };
}

export function generateCategoryMetadata(
  label: string,
  description: string,
  canonicalPath: string
): Metadata {
  return {
    title: `${label} — Help`,
    description,
    openGraph: { type: "website", title: `${label} | ${SITE_NAME}`, description, url: `${SITE_URL}${canonicalPath}` },
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
  };
}
