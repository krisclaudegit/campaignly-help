#!/usr/bin/env node
// Generates stub MDX files for all planned articles.
// Run: node scripts/seed-stubs.js
// Skips files that already exist.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");

const TODAY = new Date().toISOString().split("T")[0];

function stub({ title, description, section, category, tags, seoKeyword, readTime, schema = "article", relatedArticles = [] }) {
  const tagsStr = tags.map((t) => t).join(", ");
  const relStr = relatedArticles.length > 0
    ? `\nrelatedArticles:\n${relatedArticles.map((r) => `  - ${r}`).join("\n")}`
    : "";
  return `---
title: "${title}"
description: "${description}"
section: ${section}
category: ${category}
tags: [${tagsStr}]
seoKeyword: "${seoKeyword || ""}"
lastUpdated: ${TODAY}
author: Campaignly Team
readTime: ${readTime || 5}
featured: false${relStr}
schema: ${schema}
---

# ${title}

> This article is coming soon. Check back shortly for the full guide.
`;
}

function write(section, category, slug, data) {
  const dir = section === "blog" ? path.join(CONTENT, "blog") : path.join(CONTENT, section, category);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, stub({ ...data, section, category }));
    console.log(`  + ${section}/${category}/${slug}.mdx`);
  } else {
    console.log(`  ~ ${section}/${category}/${slug}.mdx (exists, skipped)`);
  }
}

// ─── HELP CENTER ─────────────────────────────────────────────────────────────

const helpArticles = [
  // getting-started
  { c: "getting-started", s: "creating-your-account", t: "Creating Your Account", d: "Step-by-step guide to creating your Campaignly account and getting started.", kw: "Campaignly account setup" },
  { c: "getting-started", s: "understanding-the-dashboard", t: "Understanding the Dashboard", d: "A tour of the Campaignly dashboard — what each section does and how to navigate it.", kw: "Campaignly dashboard guide" },
  { c: "getting-started", s: "connecting-your-first-platform", t: "Connecting Your First Platform", d: "How to connect Google, Meta, or LinkedIn to Campaignly for the first time.", kw: "connect Google Ads Campaignly" },
  { c: "getting-started", s: "inviting-your-team", t: "Inviting Your Team", d: "How to invite team members to your Campaignly organization.", kw: "Campaignly team management" },
  { c: "getting-started", s: "marketer-vs-business-accounts", t: "Marketer vs Business Accounts", d: "What's the difference between a Marketer account and a Business account in Campaignly?", kw: "marketing platform user types" },
  // campaigns
  { c: "campaigns", s: "what-is-a-campaign", t: "What Is a Campaign?", d: "Learn what a campaign is in Campaignly and how campaigns are structured.", kw: "what is a marketing campaign" },
  { c: "campaigns", s: "campaign-types-explained", t: "Campaign Types Explained", d: "An overview of the campaign types available in Campaignly — SEO, Google Ads, Meta Ads, and Local.", kw: "types of digital marketing campaigns" },
  { c: "campaigns", s: "creating-a-campaign", t: "Creating a Campaign", d: "How to create a new campaign in Campaignly — choosing a type, setting a name, and initial setup.", kw: "how to create a marketing campaign" },
  { c: "campaigns", s: "campaign-phases-explained", t: "Campaign Phases Explained", d: "Campaignly campaigns move through phases: Presale, Onboarding, Production, and more. Here's what each means.", kw: "marketing campaign phases" },
  { c: "campaigns", s: "managing-campaign-settings", t: "Managing Campaign Settings", d: "How to update campaign settings, change the campaign name, and configure key options.", kw: "campaign management settings" },
  { c: "campaigns", s: "adding-brands-and-products", t: "Adding Brands and Products", d: "How to add brands and products to your campaigns in Campaignly.", kw: "brand management marketing platform" },
  { c: "campaigns", s: "scoping-a-campaign", t: "Scoping a Campaign", d: "How to use the scoping step to define campaign objectives, channels, and target audience.", kw: "marketing campaign scoping" },
  { c: "campaigns", s: "campaign-goals-and-kpis", t: "Campaign Goals and KPIs", d: "How to set campaign goals and KPIs in Campaignly to measure performance.", kw: "setting marketing campaign goals" },
  { c: "campaigns", s: "archiving-and-managing-campaigns", t: "Archiving and Managing Campaigns", d: "How to archive, duplicate, or delete campaigns in Campaignly.", kw: "" },
  // audit
  { c: "audit", s: "running-your-first-audit", t: "Running Your First Audit", d: "Step-by-step guide to running your first campaign audit in Campaignly.", kw: "how to audit a marketing campaign" },
  { c: "audit", s: "website-audit-explained", t: "Website Audit Explained", d: "What the Website audit section checks and what each result means.", kw: "website marketing audit" },
  { c: "audit", s: "analytics-audit-explained", t: "Analytics Audit Explained", d: "What the Analytics audit section checks — GA4 configuration, goals, and data accuracy.", kw: "GA4 analytics audit" },
  { c: "audit", s: "advertising-audit-explained", t: "Advertising Audit Explained", d: "What the Advertising audit section checks for Google Ads and Meta Ads campaigns.", kw: "Google Ads account audit" },
  { c: "audit", s: "local-seo-audit-explained", t: "Local SEO Audit Explained", d: "What the Local SEO audit section checks — Google Business Profile, citations, and reviews.", kw: "local SEO audit" },
  { c: "audit", s: "understanding-audit-results", t: "Understanding Your Audit Results", d: "How to read your audit results — what Pass, Warning, and Fail mean and what to do next.", kw: "how to read marketing audit results" },
  { c: "audit", s: "fixing-common-audit-issues", t: "Fixing Common Audit Issues", d: "Solutions to the most common audit failures in Campaignly — tracking, GA4, and ads setup.", kw: "marketing audit common issues" },
  { c: "audit", s: "audit-card-types-reference", t: "Audit Card Types Reference", d: "A complete reference for all audit card types in Campaignly — what they check and what they mean.", kw: "" },
  { c: "audit", s: "re-running-an-audit", t: "Re-running an Audit", d: "How to re-run an audit after fixing issues to check your progress.", kw: "" },
  // integrations
  { c: "integrations", s: "integrations-overview", t: "Integrations Overview", d: "An overview of all platform integrations available in Campaignly — Google, Meta, LinkedIn, and more.", kw: "marketing tool integrations" },
  { c: "integrations", s: "connecting-google", t: "Connecting Google", d: "How to connect your Google account to Campaignly to enable GA4, Google Ads, and Search Console.", kw: "connect Google account marketing platform" },
  { c: "integrations", s: "connecting-google-ads", t: "Connecting Google Ads", d: "Step-by-step guide to connecting your Google Ads account to Campaignly.", kw: "how to connect Google Ads" },
  { c: "integrations", s: "connecting-google-analytics-4", t: "Connecting Google Analytics 4", d: "How to connect GA4 to Campaignly for analytics audits and reporting.", kw: "connect GA4 marketing platform" },
  { c: "integrations", s: "connecting-google-search-console", t: "Connecting Google Search Console", d: "How to connect Google Search Console to Campaignly for SEO data.", kw: "connect Search Console" },
  { c: "integrations", s: "connecting-meta", t: "Connecting Meta (Facebook & Instagram)", d: "How to connect your Meta Business account to Campaignly for Facebook and Instagram Ads.", kw: "connect Facebook Ads marketing platform" },
  { c: "integrations", s: "connecting-linkedin", t: "Connecting LinkedIn", d: "How to connect your LinkedIn Ads account to Campaignly.", kw: "connect LinkedIn Ads" },
  { c: "integrations", s: "managing-connections", t: "Managing Your Connections", d: "How to view, update, and manage your connected platform accounts in Campaignly.", kw: "" },
  { c: "integrations", s: "disconnecting-a-platform", t: "Disconnecting a Platform", d: "How to disconnect a platform from Campaignly when you no longer need it.", kw: "" },
  { c: "integrations", s: "troubleshooting-integrations", t: "Troubleshooting Integration Errors", d: "How to fix common connection errors in Campaignly — OAuth failures, expired tokens, and permission issues.", kw: "OAuth connection failed fix" },
  { c: "integrations", s: "token-refresh-and-expiry", t: "Understanding Token Refresh and Expiry", d: "Why platform connections expire and how Campaignly handles automatic token refresh.", kw: "" },
  // benchmarks
  { c: "benchmarks", s: "what-are-benchmarks", t: "What Are Benchmarks?", d: "What benchmarks are in Campaignly and why setting KPI targets before a campaign launches matters.", kw: "marketing benchmarks explained" },
  { c: "benchmarks", s: "setting-campaign-kpi-targets", t: "Setting Campaign KPI Targets", d: "How to set KPI targets for your campaigns in Campaignly — by platform and metric.", kw: "how to set marketing KPI targets" },
  { c: "benchmarks", s: "understanding-kpi-grades", t: "Understanding KPI Grades (A–F)", d: "How Campaignly grades campaign KPIs from A to F and what each grade means for your campaign.", kw: "marketing KPI grading system" },
  { c: "benchmarks", s: "industry-benchmark-reference", t: "Industry Benchmark Reference", d: "Reference guide to typical performance benchmarks for Google Ads, Meta Ads, SEO, and local marketing.", kw: "digital marketing industry benchmarks" },
  { c: "benchmarks", s: "editing-kpi-targets", t: "Editing KPI Targets", d: "How to update your KPI targets after a campaign has been created.", kw: "" },
  { c: "benchmarks", s: "benchmarks-vs-goals", t: "Benchmarks vs Goals: What's the Difference?", d: "Understanding the difference between benchmarks (expected performance) and goals (targets you set).", kw: "marketing benchmarks vs goals" },
  // proposals
  { c: "proposals", s: "creating-proposals", t: "Creating Proposals", d: "How to create a client proposal in Campaignly from your campaign data.", kw: "marketing proposal template" },
  { c: "proposals", s: "customizing-your-proposal", t: "Customizing Your Proposal", d: "How to customize your proposal with your branding, logo, and color scheme.", kw: "custom marketing proposal" },
  { c: "proposals", s: "exporting-proposals-pdf", t: "Exporting Proposals as PDF", d: "How to export your Campaignly proposal as a PDF to share with clients.", kw: "export marketing proposal PDF" },
  { c: "proposals", s: "saving-to-google-drive", t: "Saving Proposals to Google Drive", d: "How to save your exported proposal directly to Google Drive from Campaignly.", kw: "" },
  { c: "proposals", s: "white-label-proposals", t: "White-Label Proposal Settings", d: "How to configure white-label settings so proposals show your brand, not Campaignly's.", kw: "white label marketing proposals" },
  // team
  { c: "team", s: "inviting-team-members", t: "Inviting Team Members", d: "How to invite colleagues to your Campaignly organization.", kw: "" },
  { c: "team", s: "roles-and-permissions", t: "Roles and Permissions", d: "What the Owner, Admin, and Member roles mean in Campaignly and what each can do.", kw: "marketing platform user roles" },
  { c: "team", s: "managing-your-organization", t: "Managing Your Organization", d: "How to manage your organization settings, name, and member list in Campaignly.", kw: "" },
  // account
  { c: "account", s: "account-settings", t: "Account Settings", d: "How to update your Campaignly account settings — name, email, and profile.", kw: "" },
  { c: "account", s: "data-privacy-and-security", t: "Data Privacy and Security", d: "How Campaignly handles your data, what's stored, and how to request data deletion.", kw: "marketing platform data security" },
];

for (const a of helpArticles) {
  write("help", a.c, a.s, { title: a.t, description: a.d, tags: [a.c, "campaignly"], seoKeyword: a.kw, readTime: 5 });
}

// ─── GUIDES ──────────────────────────────────────────────────────────────────

const guidesArticles = [
  // local-marketing
  { c: "local-marketing", s: "what-is-local-marketing", t: "What Is Local Marketing?", d: "A complete introduction to local marketing — what it is, who it's for, and which channels matter most.", kw: "what is local marketing" },
  { c: "local-marketing", s: "local-seo-complete-guide", t: "Local SEO: The Complete Guide", d: "Everything you need to know about local SEO — from Google Business Profile to citations to reviews.", kw: "local SEO guide" },
  { c: "local-marketing", s: "google-business-profile-optimization", t: "Google Business Profile Optimization Guide", d: "How to fully optimize your Google Business Profile to rank higher in local search and the Map Pack.", kw: "Google Business Profile optimization" },
  { c: "local-marketing", s: "local-search-ranking-factors", t: "Local Search Ranking Factors Explained", d: "The key factors that determine how your business ranks in local search results on Google.", kw: "local search ranking factors" },
  { c: "local-marketing", s: "nap-consistency-guide", t: "NAP Consistency: Why It Matters", d: "What NAP (Name, Address, Phone) consistency is, why it affects local SEO, and how to fix inconsistencies.", kw: "NAP consistency local SEO" },
  { c: "local-marketing", s: "online-reviews-strategy", t: "Online Reviews Strategy for Local Businesses", d: "How to get more reviews, respond to negative feedback, and use reviews as a local marketing asset.", kw: "local business review strategy" },
  { c: "local-marketing", s: "local-citations-guide", t: "Local Citations: What They Are and How to Build Them", d: "What local citations are, which directories matter, and how to build and maintain your citation profile.", kw: "local citations guide" },
  { c: "local-marketing", s: "local-link-building", t: "Local Link Building Strategies", d: "How to build local backlinks that improve your local search rankings — practical strategies that work.", kw: "local link building" },
  { c: "local-marketing", s: "multi-location-marketing", t: "Multi-Location Marketing: How to Scale Locally", d: "Strategies for managing marketing across multiple business locations without doubling your workload.", kw: "multi-location marketing strategy" },
  // google-ads
  { c: "google-ads", s: "google-ads-campaign-types", t: "Google Ads Campaign Types Explained", d: "An overview of every Google Ads campaign type — Search, Display, Shopping, Video, Performance Max, and Smart.", kw: "Google Ads campaign types" },
  { c: "google-ads", s: "understanding-quality-score", t: "Understanding Google Ads Quality Score", d: "What Quality Score is, how it's calculated, and why it matters for your ad cost and position.", kw: "Google Ads quality score" },
  { c: "google-ads", s: "google-ads-conversion-tracking", t: "Setting Up Conversion Tracking in Google Ads", d: "A step-by-step guide to setting up conversion tracking in Google Ads — calls, forms, and purchases.", kw: "Google Ads conversion tracking setup" },
  { c: "google-ads", s: "google-ads-budgeting-guide", t: "Google Ads Budgeting: How Much to Spend", d: "How to set a realistic Google Ads budget, understand how budget pacing works, and avoid overspending.", kw: "Google Ads budget guide" },
  { c: "google-ads", s: "responsive-search-ads-guide", t: "Responsive Search Ads: Best Practices", d: "How to write effective Responsive Search Ads (RSAs) — headlines, descriptions, and testing strategies.", kw: "responsive search ads guide" },
  { c: "google-ads", s: "google-ads-for-local-businesses", t: "Google Ads for Local Businesses", d: "How to set up and run Google Ads specifically for local businesses — location targeting, call ads, and local extensions.", kw: "Google Ads local business" },
  { c: "google-ads", s: "smart-campaigns-vs-standard", t: "Smart Campaigns vs Standard Campaigns", d: "The difference between Google Smart Campaigns and Standard campaigns — which to use and when.", kw: "Google Smart Campaigns vs Standard" },
  // meta-ads
  { c: "meta-ads", s: "facebook-ads-local-businesses", t: "Facebook Ads for Local Businesses", d: "How to use Facebook Ads to reach local customers — targeting, ad formats, and budget strategies.", kw: "Facebook Ads local business guide" },
  { c: "meta-ads", s: "instagram-ads-guide", t: "Instagram Ads: Getting Started", d: "A beginner's guide to Instagram advertising — formats, targeting, and creative best practices.", kw: "Instagram Ads guide" },
  { c: "meta-ads", s: "meta-ads-campaign-structure", t: "Meta Ads Campaign Structure Explained", d: "How Meta Ads campaigns are structured — campaigns, ad sets, and ads — and how to organize them effectively.", kw: "Meta Ads campaign structure" },
  { c: "meta-ads", s: "targeting-local-audiences-meta", t: "Targeting Local Audiences on Meta", d: "How to use Meta's location targeting to reach customers in a specific city, radius, or neighborhood.", kw: "Facebook Ads local audience targeting" },
  { c: "meta-ads", s: "meta-pixel-setup-guide", t: "Meta Pixel Setup Guide", d: "How to install and configure the Meta Pixel for tracking conversions from your Facebook and Instagram ads.", kw: "Meta Pixel setup" },
  { c: "meta-ads", s: "meta-ads-vs-google-ads", t: "Meta Ads vs Google Ads: Which Is Right for You?", d: "Comparing Meta Ads and Google Ads — when to use each, how they differ, and how to decide on budget allocation.", kw: "Meta Ads vs Google Ads" },
  // analytics
  { c: "analytics", s: "ga4-beginners-guide", t: "GA4 for Beginners: The Complete Guide", d: "A beginner's guide to Google Analytics 4 — how it works, what's different from Universal Analytics, and where to start.", kw: "GA4 beginners guide" },
  { c: "analytics", s: "ga4-vs-universal-analytics", t: "GA4 vs Universal Analytics: Key Differences", d: "What changed in the move from Universal Analytics to GA4 — and what you need to know to work with GA4 effectively.", kw: "GA4 vs Universal Analytics" },
  { c: "analytics", s: "setting-up-ga4-goals", t: "Setting Up Goals in GA4", d: "How to create conversion events in GA4 — the GA4 equivalent of goals in Universal Analytics.", kw: "GA4 goals setup" },
  { c: "analytics", s: "understanding-ga4-reports", t: "Understanding GA4 Reports", d: "A guide to the key GA4 reports — Traffic Acquisition, Engagement, Conversions — and how to read them.", kw: "how to read GA4 reports" },
  { c: "analytics", s: "google-tag-manager-setup", t: "Google Tag Manager Setup Guide", d: "How to set up Google Tag Manager and use it to install GA4, Google Ads, and Meta Pixel without code.", kw: "Google Tag Manager setup guide" },
  { c: "analytics", s: "core-web-vitals-explained", t: "Core Web Vitals Explained", d: "What Core Web Vitals are, why they matter for SEO, and how to check and improve your scores.", kw: "Core Web Vitals guide" },
  { c: "analytics", s: "ga4-for-local-businesses", t: "GA4 for Local Businesses", d: "How to set up and use GA4 specifically for local business websites — the most important reports and events to track.", kw: "GA4 local business analytics" },
  // seo
  { c: "seo", s: "on-page-seo-checklist", t: "On-Page SEO Checklist (2025)", d: "A complete on-page SEO checklist — title tags, meta descriptions, headers, internal links, images, and more.", kw: "on-page SEO checklist" },
  { c: "seo", s: "google-search-console-guide", t: "Google Search Console: Complete Guide", d: "How to use Google Search Console to monitor your site's SEO performance, fix errors, and identify opportunities.", kw: "Google Search Console guide" },
  { c: "seo", s: "keyword-research-local-business", t: "Keyword Research for Local Businesses", d: "How to find the right keywords to target for a local business — tools, strategies, and search intent.", kw: "keyword research local business" },
  { c: "seo", s: "schema-markup-local-business", t: "Schema Markup for Local Businesses", d: "What schema markup is, why it matters for local SEO, and how to add it to a local business website.", kw: "schema markup local business" },
  { c: "seo", s: "technical-seo-checklist", t: "Technical SEO Checklist", d: "A technical SEO checklist covering crawlability, indexing, page speed, HTTPS, canonical tags, and structured data.", kw: "technical SEO checklist" },
  { c: "seo", s: "seo-for-beginners", t: "SEO for Beginners: Where to Start", d: "A plain-English introduction to SEO for local businesses — what it is, how it works, and where to start.", kw: "SEO for beginners" },
  { c: "seo", s: "tracking-seo-progress", t: "How to Track SEO Progress", d: "How to measure and track SEO results over time — the right metrics, tools, and reporting cadence.", kw: "how to track SEO results" },
  // reporting
  { c: "reporting", s: "marketing-reporting-guide", t: "Marketing Reporting: A Guide for Agencies", d: "How to build effective marketing reports for clients — what to include, how often to report, and how to communicate results.", kw: "marketing reporting guide" },
  { c: "reporting", s: "kpis-for-local-marketing", t: "KPIs for Local Marketing Campaigns", d: "The most important KPIs to track for local marketing campaigns across Google Ads, SEO, and Meta Ads.", kw: "local marketing KPIs" },
  { c: "reporting", s: "how-to-measure-marketing-roi", t: "How to Measure Marketing ROI", d: "How to calculate and communicate marketing ROI to clients — formulas, benchmarks, and common pitfalls.", kw: "how to measure marketing ROI" },
  { c: "reporting", s: "client-reporting-best-practices", t: "Client Reporting Best Practices", d: "Best practices for marketing agency client reports — frequency, format, what to highlight, and how to frame results.", kw: "client reporting marketing agency" },
  { c: "reporting", s: "creating-a-marketing-dashboard", t: "Creating a Marketing Dashboard", d: "How to build a marketing dashboard that gives clients clear visibility into campaign performance.", kw: "marketing dashboard guide" },
];

for (const a of guidesArticles) {
  write("guides", a.c, a.s, { title: a.t, description: a.d, tags: [a.c, "marketing", "guide"], seoKeyword: a.kw, readTime: 7 });
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────

const blogPosts = [
  { s: "how-to-use-audit-tool", t: "How to Use Campaignly's Audit Tool to Find Campaign Gaps", d: "A walkthrough of Campaignly's audit tool — how it works, what it checks, and how to act on the results.", cat: "guides" },
  { s: "set-realistic-marketing-goals", t: "How to Set Realistic Marketing Goals for Local Business Clients", d: "A practical framework for setting and communicating marketing goals that clients will understand and trust.", cat: "guides" },
  { s: "agency-guide-google-ads-reporting", t: "The Agency's Guide to Google Ads Reporting", d: "What to include in your Google Ads reports, how often to send them, and how to explain results to non-technical clients.", cat: "guides" },
  { s: "ga4-google-ads-numbers-dont-match", t: "Why Your GA4 Numbers Don't Match Google Ads", d: "The most common reasons GA4 and Google Ads show different conversion numbers — and how to reconcile them.", cat: "tips" },
  { s: "presenting-marketing-results", t: "How to Present Marketing Results to Non-Technical Clients", d: "How to explain marketing performance clearly to business owners who aren't familiar with digital marketing metrics.", cat: "tips" },
  { s: "local-seo-checklist-new-campaigns", t: "Local SEO Checklist for New Campaigns", d: "A complete checklist for local SEO setup when launching a new campaign for a local business client.", cat: "guides" },
  { s: "impressions-clicks-conversions", t: "Understanding the Difference Between Impressions, Clicks, and Conversions", d: "A plain-English explanation of impressions, clicks, and conversions — and why all three matter for your campaign.", cat: "tips" },
  { s: "winning-marketing-proposal", t: "How to Build a Marketing Proposal That Wins Local Business Clients", d: "What to include in a local marketing proposal, how to structure it, and how to make it compelling.", cat: "guides" },
  { s: "google-business-profile-agencies", t: "The Complete Guide to Google Business Profile for Agencies", d: "Everything agencies need to know about managing Google Business Profiles for local business clients.", cat: "guides" },
];

for (const a of blogPosts) {
  write("blog", "blog", a.s, { title: a.t, description: a.d, tags: ["blog", a.cat], seoKeyword: "", readTime: 6, category: a.cat });
}

console.log("\nDone! Stub files created.");
