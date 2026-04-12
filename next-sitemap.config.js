/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://help.campaignly.net",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // Homepage
    if (path === "/") return { loc: path, priority: 1.0, changefreq: "daily", lastmod: new Date().toISOString() };
    // Help docs — high priority, updated as product changes
    if (path.startsWith("/help/")) return { loc: path, priority: 0.8, changefreq: "weekly", lastmod: new Date().toISOString() };
    // Guides — evergreen content, highest SEO priority
    if (path.startsWith("/guides/")) return { loc: path, priority: 0.9, changefreq: "monthly", lastmod: new Date().toISOString() };
    // Blog posts
    if (path.startsWith("/blog/")) return { loc: path, priority: 0.7, changefreq: "monthly", lastmod: new Date().toISOString() };
    // Section roots (listing pages)
    return { loc: path, priority: 0.6, changefreq: "weekly", lastmod: new Date().toISOString() };
  },
};
