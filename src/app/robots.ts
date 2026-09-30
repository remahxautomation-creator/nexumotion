import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Crawlers that answer questions rather than return links.
 *
 * They are already covered by the `*` rule below, but they are named
 * explicitly for one reason: silence is not consent everywhere. Google-Extended
 * in particular governs whether Gemini and AI Overviews may *use* the pages
 * they crawled, separately from whether Googlebot may index them, and several
 * of these agents document that they honour a named rule ahead of `*`. Naming
 * them states the decision once, in the file that is actually consulted, so a
 * later blanket tightening of `*` cannot quietly cut the site out of AI answers.
 *
 * This is a catalogue of public part numbers and specifications. Being quoted
 * by an assistant that a buyer asked "who sells Siemens 6ES7214-1AG40-0XB0 in
 * Egypt" is the entire point of publishing it.
 */
const ANSWER_ENGINES = [
  "GPTBot",            // OpenAI crawler
  "OAI-SearchBot",     // ChatGPT search index
  "ChatGPT-User",      // fetched live when a user asks
  "Google-Extended",   // Gemini + AI Overviews grounding
  "ClaudeBot",         // Anthropic crawler
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",          // Siri / Spotlight
  "Applebot-Extended",
  "Bingbot",           // also backs Copilot and ChatGPT search
  "DuckAssistBot",
  "meta-externalagent", // Meta AI
  "Amazonbot",
  "YouBot",
  "cohere-ai",
];

// Never crawlable, whoever is asking: private, transactional, or a raw data
// endpoint that says nothing useful out of context.
const PRIVATE = ["/admin", "/account", "/api", "/checkout", "/cart", "/orders", "/projects"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
        // /assistant and /systems are intentionally indexable
      },
      // The catalogue mirror is JSON the site serves to itself. It is the same
      // data as the product pages with none of the context, so an answer engine
      // quoting it would strip the part from its specs, price and datasheet.
      ...ANSWER_ENGINES.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: [...PRIVATE, "/catalog/"],
      })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
