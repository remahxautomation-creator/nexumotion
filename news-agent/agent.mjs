#!/usr/bin/env node
// World News Digest agent: Claude (with live web search) -> WhatsApp (Twilio).
// Zero dependencies. Node 20+.
//
// Env:
//   ANTHROPIC_API_KEY        required
//   TWILIO_ACCOUNT_SID       required unless --dry-run
//   TWILIO_AUTH_TOKEN        required unless --dry-run
//   TWILIO_WHATSAPP_FROM     default "whatsapp:+14155238886" (Twilio sandbox number)
//   WHATSAPP_TO              default "+201555980202"
//   NEWS_MODEL               default "claude-sonnet-5-5"
//   NEWS_TOPICS              optional focus, e.g. "Middle East, economy, technology"
//   NEWS_COUNT               default 7
//
// Usage: node agent.mjs [--dry-run]

const DRY = process.argv.includes("--dry-run");
const MODEL = process.env.NEWS_MODEL || "claude-sonnet-5-5";
const TO = process.env.WHATSAPP_TO || "+201555980202";
const FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
const COUNT = Number(process.env.NEWS_COUNT || 7);
const TOPICS = process.env.NEWS_TOPICS || "world politics, conflicts, economy & markets, energy, technology, Middle East & Egypt";

function need(name) {
  if (!process.env[name]) {
    console.error(`Missing env var ${name}`);
    process.exit(1);
  }
  return process.env[name];
}

async function compileDigest() {
  const key = need("ANTHROPIC_API_KEY");
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Today is ${today}. Use web search to find the ${COUNT} most important world news stories of the last 24 hours (focus areas: ${TOPICS}). Prefer reputable, diverse sources (Reuters, AP, BBC, Al Jazeera, FT, Bloomberg, etc.) and verify key facts across at least two sources when possible.

Write a WhatsApp-ready digest. Plain text, WhatsApp formatting only (*bold*, _italic_), no markdown headers, no tables. For each story use exactly:

*N. Headline*
📌 Brief: 1-2 sentences, facts only.
⚠️ Consequences: likely implications / what it could trigger.
✅ Results so far: what has actually happened / outcome to date (or "Developing" if unresolved).
🔗 Sources: Outlet name + full URL (1-3).

Start with a one-line title "🌍 World News Digest — ${today}". End with a single "Bottom line" sentence. Be neutral, do not speculate beyond sources, and clearly mark anything unconfirmed. Output only the digest.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 6000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 12 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // The final answer follows the search blocks; take text blocks after the last tool result.
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!text) throw new Error("Empty digest returned");
  return text;
}

// WhatsApp (Twilio) caps a message at 1600 chars: split on story boundaries.
function chunk(text, max = 1500) {
  const parts = text.split(/\n(?=\*\d+\.)/);
  const out = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + "\n" + p).length > max && cur) {
      out.push(cur.trim());
      cur = p;
    } else cur = cur ? cur + "\n" + p : p;
  }
  if (cur) out.push(cur.trim());
  // hard-split anything still too long
  return out.flatMap((c) => (c.length <= 1600 ? [c] : c.match(/[\s\S]{1,1500}/g)));
}

async function sendWhatsApp(body) {
  const sid = need("TWILIO_ACCOUNT_SID");
  const token = need("TWILIO_AUTH_TOKEN");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: FROM, To: `whatsapp:${TO}`, Body: body }),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${await res.text()}`);
}

const digest = await compileDigest();
const messages = chunk(digest);
if (DRY) {
  console.log(messages.join("\n\n----- (next WhatsApp message) -----\n\n"));
  process.exit(0);
}
for (let i = 0; i < messages.length; i++) {
  await sendWhatsApp(messages[i]);
  await new Promise((r) => setTimeout(r, 1200)); // keep ordering
}
console.log(`Sent ${messages.length} WhatsApp message(s) to ${TO}`);
