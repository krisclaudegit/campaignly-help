#!/usr/bin/env node
/**
 * Campaignly Help — Slack Blog Approval Manager
 *
 * Modes:
 *   --post   Post full blog content to Slack, save pending-approval.json
 *   --check  Check thread for approve/reject reply, write approval-result.json
 *   --reply  Post a reply to the pending thread
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const PENDING_PATH = path.join(__dirname, "pending-approval.json");
const CONTENT_PATH = path.join(__dirname, "slack-content.json");
const RESULT_PATH = path.join(__dirname, "approval-result.json");

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

function slackRequest(method, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: "slack.com",
      path: `/api/${method}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid JSON from Slack: " + data));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function chunkText(text, maxLen = 2800) {
  const chunks = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf("\n\n", maxLen);
    if (cut < 500) cut = remaining.lastIndexOf(". ", maxLen);
    if (cut < 500) cut = maxLen;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  return chunks;
}

async function postToSlack() {
  const prNumber = process.env.PR_NUMBER;
  const prUrl = process.env.PR_URL || "";

  if (!fs.existsSync(CONTENT_PATH)) {
    throw new Error("slack-content.json not found. Run generate-article.js first.");
  }

  const content = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
  const chunks = chunkText(content.plain_text);

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "📝 New Blog Post Ready for Review", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Title*\n${content.title}` },
        { type: "mrkdwn", text: `*Category*\n${content.category}` },
        { type: "mrkdwn", text: `*Read time*\n${content.read_time} min` },
        { type: "mrkdwn", text: `*Date*\n${content.date}` },
      ],
    },
    { type: "divider" },
  ];

  for (const chunk of chunks) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: chunk } });
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: [
        "Reply `approve` to publish or `reject` to discard.",
        prUrl ? `_<${prUrl}|View PR on GitHub>_` : "",
      ]
        .filter(Boolean)
        .join("  |  "),
    },
  });

  const response = await slackRequest("chat.postMessage", {
    channel: SLACK_CHANNEL_ID,
    blocks,
    text: `New blog post ready for review: ${content.title}`,
  });

  if (!response.ok) throw new Error(`Slack error: ${response.error}`);

  const threadTs = response.message.ts;
  console.log(`Posted to Slack. Thread TS: ${threadTs}`);

  fs.writeFileSync(
    PENDING_PATH,
    JSON.stringify(
      {
        thread_ts: threadTs,
        pr_number: parseInt(prNumber),
        slug: content.slug,
        title: content.title,
        created_at: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`Saved: scripts/pending-approval.json`);
}

async function checkApproval() {
  if (!fs.existsSync(PENDING_PATH)) {
    const result = { status: "NO_PENDING" };
    fs.writeFileSync(RESULT_PATH, JSON.stringify(result));
    console.log("NO_PENDING — no post awaiting approval.");
    return;
  }

  const pending = JSON.parse(fs.readFileSync(PENDING_PATH, "utf8"));
  const response = await slackRequest("conversations.replies", {
    channel: SLACK_CHANNEL_ID,
    ts: pending.thread_ts,
  });

  if (!response.ok) throw new Error(`Slack error: ${response.error}`);

  const replies = (response.messages || []).slice(1);
  for (const reply of replies) {
    const text = (reply.text || "").toLowerCase().trim();
    if (text.startsWith("approve")) {
      const result = {
        status: "APPROVE",
        pr_number: pending.pr_number,
        slug: pending.slug,
        title: pending.title,
        thread_ts: pending.thread_ts,
      };
      fs.writeFileSync(RESULT_PATH, JSON.stringify(result));
      console.log(`APPROVE — PR #${pending.pr_number} (${pending.slug})`);
      return;
    }
    if (text.startsWith("reject")) {
      const result = {
        status: "REJECT",
        pr_number: pending.pr_number,
        slug: pending.slug,
        title: pending.title,
        thread_ts: pending.thread_ts,
      };
      fs.writeFileSync(RESULT_PATH, JSON.stringify(result));
      console.log(`REJECT — PR #${pending.pr_number} (${pending.slug})`);
      return;
    }
  }

  const result = { status: "PENDING", pr_number: pending.pr_number, slug: pending.slug };
  fs.writeFileSync(RESULT_PATH, JSON.stringify(result));
  console.log(`PENDING — no approval reply yet for "${pending.title}"`);
}

async function postReply(message, threadTs) {
  const ts =
    threadTs ||
    (fs.existsSync(PENDING_PATH)
      ? JSON.parse(fs.readFileSync(PENDING_PATH, "utf8")).thread_ts
      : null);
  if (!ts) {
    console.log("No thread TS — skipping reply.");
    return;
  }

  const response = await slackRequest("chat.postMessage", {
    channel: SLACK_CHANNEL_ID,
    thread_ts: ts,
    text: message,
  });

  if (!response.ok) throw new Error(`Slack error: ${response.error}`);
  console.log(`Reply posted to thread ${ts}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--post")) {
    await postToSlack();
  } else if (args.includes("--check")) {
    await checkApproval();
  } else if (args.includes("--reply")) {
    const msgIdx = args.indexOf("--reply");
    const message = args[msgIdx + 1] || "Done.";
    const tsIdx = args.indexOf("--thread-ts");
    const threadTs = tsIdx >= 0 ? args[tsIdx + 1] : undefined;
    await postReply(message, threadTs);
  } else {
    console.error('Usage: node slack-approve.js --post | --check | --reply "message"');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
