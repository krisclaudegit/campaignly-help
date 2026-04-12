import type { Article } from "./articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://help.campaignly.net";

const PUBLISHER = {
  "@type": "Organization",
  name: "Campaignly",
  url: "https://campaignly.net",
  logo: { "@type": "ImageObject", url: "https://campaignly.net/logo.svg" },
};

export function articleSchema(article: Article): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    keywords: article.tags?.join(", "),
    datePublished: article.lastUpdated,
    dateModified: article.lastUpdated,
    author: { "@type": "Organization", name: article.author || "Campaignly Team" },
    publisher: PUBLISHER,
    url: `${SITE_URL}${article.href}`,
  };
}

export function breadcrumbSchema(crumbs: { name: string; href: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.href}`,
    })),
  };
}

export function websiteSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Campaignly Help",
    url: SITE_URL,
    publisher: PUBLISHER,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
