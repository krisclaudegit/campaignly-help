#!/usr/bin/env node
/**
 * Batch content generator for all stub articles.
 * Finds every MDX file containing "coming soon", generates real content
 * via Claude API, and writes it back. Runs section by section.
 *
 * Usage:
 *   node scripts/batch-generate.js               # all stubs
 *   node scripts/batch-generate.js --section help # help only
 *   node scripts/batch-generate.js --section guides
 *   node scripts/batch-generate.js --section blog
 *   node scripts/batch-generate.js --limit 5      # first N stubs only
 */

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");

const args = process.argv.slice(2);
const sectionFilter = args.includes("--section") ? args[args.indexOf("--section") + 1] : null;
const limit = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1]) : Infinity;

function findStubs(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findStubs(full));
    else if (entry.name.endsWith(".mdx")) {
      const content = fs.readFileSync(full, "utf8");
      if (content.includes("coming soon")) results.push(full);
    }
  }
  return results;
}

const SYSTEM_HELP = `You are a technical writer for Campaignly, a local marketing platform for agencies and freelance marketers.

Write clear, practical help documentation. Tone: direct and friendly — like a knowledgeable colleague explaining how something works. Short sentences. Active voice. No marketing fluff.

Format: Markdown. No H1 (the title comes from frontmatter). Use H2 for main sections, H3 for sub-steps. Use numbered lists for step-by-step instructions, bullet lists for options or requirements. Bold key terms on first use.

Length: 300–600 words depending on topic complexity. Help articles are concise — users are trying to get something done.`;

const SYSTEM_GUIDES = `You are a content writer for Campaignly's marketing guides — long-form, SEO-targeted articles for local marketing agencies and freelance marketers.

Audience: marketing professionals who run Google Ads, Meta Ads, SEO, and local campaigns for local business clients. Practical, results-focused, time-pressed.

Voice: Expert but accessible. Direct, no fluff. Concrete examples over abstract claims. Short paragraphs. Bold sparingly.

Avoid: "In conclusion", "In today's fast-paced world", "game-changer", "leverage" (use "use").

End each guide with a natural CTA paragraph linking to a relevant Campaignly feature — no "Conclusion" heading.

Format: Markdown. No H1. H2 subheadings (3–5). Tables where helpful.

Length: 800–1200 words.`;

const SYSTEM_BLOG = `You are a content writer for Campaignly's blog — practical articles for local marketing agencies and freelance marketers.

Audience: agencies and freelancers who manage Google Ads, Meta Ads, SEO, and local campaigns for local business clients.

Voice: Expert but conversational. Direct, useful, no fluff. Concrete examples. Short paragraphs.

Avoid: "In conclusion", "In today's fast-paced world", "game-changer", "leverage".

End with a natural CTA linking to Campaignly — no "Conclusion" heading.

Format: Markdown. No H1. H2 subheadings (3–5).

Length: 800–1100 words.`;

function getSystemPrompt(section) {
  if (section === "help") return SYSTEM_HELP;
  if (section === "guides") return SYSTEM_GUIDES;
  return SYSTEM_BLOG;
}

function getUserPrompt(fm, section) {
  if (section === "help") {
    return `Write a Campaignly help article: "${fm.title}"
Description: ${fm.description}
Category: ${fm.category}

This is product documentation for Campaignly users. Cover what it is, how to use it, and any important notes or gotchas. Include numbered steps where applicable.

Return ONLY the article body in Markdown — no frontmatter, no H1 title.`;
  }
  return `Write a ${section === "blog" ? "blog post" : "marketing guide"}: "${fm.title}"
Target keyword: ${fm.seoKeyword || fm.title}
Description/angle: ${fm.description}
Category: ${fm.category}

${section === "guides" ? "Include the target keyword in the first 100 words and at least one H2." : ""}

Return ONLY the article body in Markdown — no frontmatter, no H1 title.`;
}

async function generateContent(fm, section) {
  const client = new Anthropic();
  const model = section === "help" ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";
  const maxTokens = section === "help" ? 1200 : 2500;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: getSystemPrompt(section),
    messages: [{ role: "user", content: getUserPrompt(fm, section) }],
  });
  return response.content[0].text.trim();
}

function detectSection(filePath) {
  if (filePath.includes("/content/help/") || filePath.includes("\\content\\help\\")) return "help";
  if (filePath.includes("/content/guides/") || filePath.includes("\\content\\guides\\")) return "guides";
  return "blog";
}

async function main() {
  const allStubs = findStubs(CONTENT);
  const filtered = sectionFilter
    ? allStubs.filter((f) => detectSection(f) === sectionFilter)
    : allStubs;
  const toProcess = filtered.slice(0, limit);

  console.log(`\nFound ${allStubs.length} stubs total. Processing ${toProcess.length}${sectionFilter ? ` (${sectionFilter} only)` : ""}.\n`);

  let done = 0;
  let failed = 0;

  for (const filePath of toProcess) {
    const section = detectSection(filePath);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data: fm } = matter(raw);
    const rel = path.relative(CONTENT, filePath).replace(/\\/g, "/");

    process.stdout.write(`[${done + 1}/${toProcess.length}] ${rel} ... `);

    try {
      const body = await generateContent(fm, section);
      // Rebuild file: keep original frontmatter, replace body
      const frontmatterBlock = raw.slice(0, raw.indexOf("---", 3) + 3);
      const newContent = frontmatterBlock + "\n\n" + body + "\n";
      fs.writeFileSync(filePath, newContent);
      console.log("done");
      done++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate limits
    if (done % 10 === 0 && done < toProcess.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\nComplete: ${done} generated, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
