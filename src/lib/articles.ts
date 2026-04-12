import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleSection = "help" | "guides" | "blog";

export type HelpCategory =
  | "getting-started"
  | "campaigns"
  | "audit"
  | "integrations"
  | "benchmarks"
  | "proposals"
  | "team"
  | "account";

export type GuidesCategory =
  | "local-marketing"
  | "google-ads"
  | "meta-ads"
  | "analytics"
  | "seo"
  | "reporting";

export type BlogCategory =
  | "updates"
  | "guides"
  | "tips"
  | "case-studies"
  | "industry";

export type ArticleSchema = "article" | "howto" | "faq";

export interface ArticleFrontmatter {
  title: string;
  description: string;
  section: ArticleSection;
  category: string;
  tags: string[];
  seoKeyword?: string;
  lastUpdated: string;
  author?: string;
  readTime?: number;
  featured?: boolean;
  relatedArticles?: string[];
  schema?: ArticleSchema;
}

export interface Article extends ArticleFrontmatter {
  slug: string;          // e.g. "audit/what-is-a-campaign-audit"
  href: string;          // e.g. "/help/audit/what-is-a-campaign-audit"
  content?: string;      // raw MDX source — only populated by getArticleContent()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONTENT_ROOT = path.join(process.cwd(), "content");

function sectionToBasePath(section: ArticleSection): string {
  return path.join(CONTENT_ROOT, section);
}

function hrefForArticle(section: ArticleSection, category: string, slug: string): string {
  if (section === "blog") return `/blog/${slug}`;
  return `/${section}/${category}/${slug}`;
}

function readFrontmatter(filePath: string): { data: ArticleFrontmatter; content: string } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { data: data as ArticleFrontmatter, content };
}

function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMdxFiles(full));
    } else if (entry.name.endsWith(".mdx")) {
      results.push(full);
    }
  }
  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all articles for a given section, sorted newest-first.
 * Frontmatter only — no MDX content body (fast).
 */
export function getAllArticles(section: ArticleSection): Article[] {
  const base = sectionToBasePath(section);
  const files = walkMdxFiles(base);

  return files
    .map((filePath) => {
      const rel = path.relative(base, filePath); // e.g. "audit/what-is-a-campaign-audit.mdx"
      const parts = rel.replace(/\\/g, "/").replace(/\.mdx$/, "").split("/");
      const category = parts.length > 1 ? parts[0] : "uncategorized";
      const slugPart = parts[parts.length - 1];
      const slug = section === "blog" ? slugPart : `${category}/${slugPart}`;

      const { data } = readFrontmatter(filePath);
      return {
        ...data,
        slug,
        href: hrefForArticle(section, category, slugPart),
      } satisfies Article;
    })
    .sort((a, b) => {
      const da = new Date(a.lastUpdated).getTime();
      const db = new Date(b.lastUpdated).getTime();
      return db - da;
    });
}

/**
 * Returns all articles across all sections (for global search index).
 */
export function getAllArticlesGlobal(): Article[] {
  return [
    ...getAllArticles("help"),
    ...getAllArticles("guides"),
    ...getAllArticles("blog"),
  ];
}

/**
 * Returns articles for a specific category within a section.
 */
export function getArticlesByCategory(section: ArticleSection, category: string): Article[] {
  return getAllArticles(section).filter((a) => a.category === category);
}

/**
 * Returns featured articles (featured: true in frontmatter).
 */
export function getFeaturedArticles(): Article[] {
  return getAllArticlesGlobal().filter((a) => a.featured);
}

/**
 * Returns the MDX source content for a specific article.
 * Used only on the individual article page — not in listing pages.
 */
export function getArticleContent(
  section: ArticleSection,
  category: string,
  slug: string
): Article | null {
  const base = sectionToBasePath(section);
  const filePath = section === "blog"
    ? path.join(base, `${slug}.mdx`)
    : path.join(base, category, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const { data, content } = readFrontmatter(filePath);
  return {
    ...data,
    slug: section === "blog" ? slug : `${category}/${slug}`,
    href: hrefForArticle(section, category, slug),
    content,
  };
}

/**
 * Returns all unique categories for a given section.
 */
export function getCategoriesForSection(section: ArticleSection): string[] {
  const articles = getAllArticles(section);
  return [...new Set(articles.map((a) => a.category))];
}

/**
 * Builds the lightweight JSON index used by client-side fuse.js search.
 * Only includes slug, href, title, description, tags — no content body.
 */
export function buildSearchIndex(): Pick<Article, "slug" | "href" | "title" | "description" | "tags" | "section" | "category">[] {
  return getAllArticlesGlobal().map(({ slug, href, title, description, tags, section, category }) => ({
    slug, href, title, description, tags, section, category,
  }));
}

// ─── Category metadata ────────────────────────────────────────────────────────

export const HELP_CATEGORIES: Record<HelpCategory, { label: string; description: string; icon: string }> = {
  "getting-started": { label: "Getting Started", description: "Set up your account and connect your first campaign", icon: "🚀" },
  "campaigns":       { label: "Campaigns",        description: "Create and manage your marketing campaigns",          icon: "📊" },
  "audit":           { label: "Audit",             description: "Audit your campaigns and find improvement areas",    icon: "🔍" },
  "integrations":    { label: "Integrations",      description: "Connect Google, Meta, LinkedIn and more",           icon: "🔗" },
  "benchmarks":      { label: "Benchmarks",        description: "Set KPI targets and track performance grades",      icon: "🎯" },
  "proposals":       { label: "Proposals",         description: "Create and export white-label proposals",           icon: "📄" },
  "team":            { label: "Team",              description: "Invite teammates and manage roles",                 icon: "👥" },
  "account":         { label: "Account",           description: "Account settings, billing, and privacy",           icon: "⚙️" },
};

export const GUIDES_CATEGORIES: Record<GuidesCategory, { label: string; description: string; icon: string }> = {
  "local-marketing": { label: "Local Marketing",  description: "Strategies for reaching local audiences",         icon: "📍" },
  "google-ads":      { label: "Google Ads",        description: "Google Ads campaigns from beginner to advanced",  icon: "🔵" },
  "meta-ads":        { label: "Meta Ads",          description: "Facebook and Instagram advertising guides",       icon: "🟦" },
  "analytics":       { label: "Analytics",         description: "GA4, Tag Manager, and measurement guides",       icon: "📈" },
  "seo":             { label: "SEO",               description: "Search engine optimization for local businesses", icon: "🔎" },
  "reporting":       { label: "Reporting",         description: "Marketing reporting and ROI measurement",         icon: "📋" },
};

export const BLOG_CATEGORIES: Record<BlogCategory, { label: string }> = {
  "updates":     { label: "Updates" },
  "guides":      { label: "Guides" },
  "tips":        { label: "Tips" },
  "case-studies":{ label: "Case Studies" },
  "industry":    { label: "Industry" },
};
