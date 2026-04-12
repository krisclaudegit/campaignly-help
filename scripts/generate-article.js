#!/usr/bin/env node
/**
 * Campaignly Help — Blog Article Generator
 *
 * Picks the next unpublished topic from topic-queue.json,
 * calls Claude API to generate MDX article content, saves the
 * MDX file to content/blog/, and updates topic-queue.json.
 *
 * Usage:
 *   node scripts/generate-article.js
 *   node scripts/generate-article.js --slug specific-slug-from-queue
 */

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const QUEUE_PATH = path.join(__dirname, "topic-queue.json");
const BLOG_DIR = path.join(ROOT, "content", "blog");

const TODAY = new Date().toISOString().split("T")[0];

function estimateReadTime(markdown) {
  const wordCount = markdown.replace(/[#*`_\[\]()>-]/g, "").split(/\s+/).length;
  return Math.max(4, Math.ceil(wordCount / 200));
}

function buildFrontmatter({ topic, readTime }) {
  return `---
title: "${topic.title.replace(/"/g, '\\"')}"
description: "${topic.description.replace(/"/g, '\\"')}"
section: blog
category: ${topic.category}
tags: []
seoKeyword: "${topic.seoKeyword || ""}"
lastUpdated: ${TODAY}
author: Campaignly Team
readTime: ${readTime}
featured: false
schema: article
---

`;
}

async function generateContent(topic) {
  const client = new Anthropic();

  const systemPrompt = `You are a content writer for Campaignly, a local marketing platform for agencies, freelance marketers, and small business owners.

Audience: Marketing agencies and freelance marketers who run Google Ads, Meta Ads, SEO, and local campaigns for local business clients. They are practical, results-focused, and pressed for time.

Voice: Expert but accessible. Direct, useful, no fluff. Concrete examples over abstract claims. Short paragraphs. Use bold for emphasis sparingly. No jargon unless explained.

Avoid: "In conclusion", "In today's fast-paced world", "game-changer", "revolutionize", "leverage" (use "use" instead), "unlock", hollow phrases like "The good news is...".

CTAs: Each article should end with a short paragraph linking back to Campaignly (e.g. "Campaignly's audit tool surfaces issues like this automatically — [run a free audit](https://campaignly.net)"). Keep it natural, not pushy.

Format: Markdown only. H2 subheadings (3–5), H3 for sub-points. No H1 (the frontmatter title handles that). Tables where helpful. Numbered lists for steps, bullet lists for options.`;

  const userPrompt = `Write a blog post for help.campaignly.net about: "${topic.title}"
Category: ${topic.category}
Target keyword: ${topic.seoKeyword}
Description/angle: ${topic.description}

Requirements:
- 900–1300 words of body content (not counting the H1 title)
- Start with a hook paragraph that frames the problem — no heading above it
- 3–5 H2 sections with practical, specific content
- End naturally with a paragraph linking to Campaignly (no "Conclusion" heading)
- Include the target keyword in the first 100 words and in at least one H2
- Return ONLY the article body in Markdown — no frontmatter, no title heading (H1)`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content[0].text.trim();
}

async function main() {
  const args = process.argv.slice(2);
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));

  let topic;
  if (args.includes("--slug")) {
    const idx = args.indexOf("--slug");
    const targetSlug = args[idx + 1];
    topic = queue.find((t) => t.slug === targetSlug);
    if (!topic) {
      console.error(`No topic found with slug: ${targetSlug}`);
      process.exit(1);
    }
  } else {
    topic = queue.find((t) => !t.published);
    if (!topic) {
      console.log("All topics published. Add more to topic-queue.json.");
      process.exit(0);
    }
  }

  console.log(`\nGenerating: "${topic.title}"`);
  console.log(`  Category: ${topic.category}`);
  console.log(`  Slug:     ${topic.slug}\n`);

  const body = await generateContent(topic);
  const readTime = estimateReadTime(body);
  const frontmatter = buildFrontmatter({ topic, readTime });
  const mdx = frontmatter + body + "\n";

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const filePath = path.join(BLOG_DIR, `${topic.slug}.mdx`);
  fs.writeFileSync(filePath, mdx);
  console.log(`Saved: content/blog/${topic.slug}.mdx (${readTime} min read)`);

  // Mark published in queue
  const entry = queue.find((t) => t.slug === topic.slug);
  if (entry) {
    entry.published = true;
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
    console.log(`Updated: scripts/topic-queue.json`);
  }

  // Write slack-content.json for the Slack approval step
  const slackContent = {
    title: topic.title,
    category: topic.category,
    read_time: readTime,
    date: TODAY,
    slug: topic.slug,
    plain_text: body,
  };
  fs.writeFileSync(
    path.join(__dirname, "slack-content.json"),
    JSON.stringify(slackContent, null, 2)
  );
  console.log(`Saved: scripts/slack-content.json`);

  console.log(`\nPost ready at: content/blog/${topic.slug}.mdx`);
}

main().catch((err) => {
  console.error("Error generating article:", err.message);
  process.exit(1);
});
