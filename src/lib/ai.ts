// Optional LLM layer.
//
// DESIGN RULE: the model may only *interpret the question*. It never produces
// product data. Extraction returns structured filters; the database returns the
// products. In a parts business a hallucinated part number becomes a wrong part
// on a machine, so the model is kept away from the answer entirely.
//
// With no key configured everything below returns null and the caller falls
// back to the deterministic parser in lib/spec-parser.ts — the assistant works
// fully without AI, just with slightly blunter language understanding.

type Provider = "anthropic" | "openai" | "groq" | "openrouter";

function resolveProvider(): { provider: Provider; key: string; model: string; url: string } | null {
  const pick = (p: Provider, key: string | undefined, model: string, url: string) =>
    key ? { provider: p, key, model, url } : null;

  return (
    pick("anthropic", process.env.ANTHROPIC_API_KEY,
      process.env.AI_MODEL ?? "claude-sonnet-5", "https://api.anthropic.com/v1/messages") ??
    pick("groq", process.env.GROQ_API_KEY,
      process.env.AI_MODEL ?? "llama-3.3-70b-versatile", "https://api.groq.com/openai/v1/chat/completions") ??
    pick("openai", process.env.OPENAI_API_KEY,
      process.env.AI_MODEL ?? "gpt-4o-mini", "https://api.openai.com/v1/chat/completions") ??
    pick("openrouter", process.env.OPENROUTER_API_KEY,
      process.env.AI_MODEL ?? "meta-llama/llama-3.3-70b-instruct", "https://openrouter.ai/api/v1/chat/completions")
  );
}

export function aiEnabled(): boolean {
  return resolveProvider() !== null;
}

async function complete(system: string, user: string, maxTokens = 500): Promise<string | null> {
  const cfg = resolveProvider();
  if (!cfg) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    let res: Response;
    if (cfg.provider === "anthropic") {
      res = await fetch(cfg.url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-api-key": cfg.key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
    } else {
      res = await fetch(cfg.url, {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${cfg.key}` },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
    }
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    if (cfg.provider === "anthropic") {
      return data?.content?.[0]?.text ?? null;
    }
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null; // any failure → deterministic fallback
  }
}

// Turn a free-text requirement into structured filters. Returns null when AI is
// unavailable or the response can't be trusted, so the caller uses the parser.
export async function extractFilters(
  query: string,
  categories: { slug: string; name: string }[],
  brands: string[],
  specKeys: string[]
): Promise<{
  categorySlugs?: string[];
  brands?: string[];
  specs?: { key: string; value: string }[];
  ranges?: { key: string; min?: number; max?: number }[];
  inStockOnly?: boolean;
  keywords?: string[];
} | null> {
  const system = [
    "You convert industrial automation part requirements into catalogue filters.",
    "Respond with ONLY a JSON object. No prose, no code fences.",
    "Never invent part numbers, products, prices or stock — you only produce filters.",
    "",
    `Valid category slugs: ${categories.map((c) => c.slug).join(", ")}`,
    `Valid brands: ${brands.join(", ")}`,
    `Valid spec keys: ${specKeys.join(", ")}`,
    "",
    "Shape:",
    '{"categorySlugs":[],"brands":[],"specs":[{"key":"","value":""}],',
    '"ranges":[{"key":"","min":0,"max":0}],"inStockOnly":false,"keywords":[]}',
    "",
    "Omit anything the user did not imply. For an approximate figure give a range of roughly ±25%.",
  ].join("\n");

  const raw = await complete(system, query, 400);
  if (!raw) return null;

  try {
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json);

    // Allow-list everything the model returned; drop anything unknown.
    const validSlugs = new Set(categories.map((c) => c.slug));
    const validBrands = new Set(brands.map((b) => b.toLowerCase()));
    const validKeys = new Set(specKeys);

    return {
      categorySlugs: (parsed.categorySlugs ?? []).filter((s: unknown) => typeof s === "string" && validSlugs.has(s)),
      brands: (parsed.brands ?? []).filter((b: unknown) => typeof b === "string" && validBrands.has(b.toLowerCase())),
      specs: (parsed.specs ?? []).filter(
        (s: unknown) =>
          typeof s === "object" && s !== null &&
          typeof (s as { key?: unknown }).key === "string" &&
          validKeys.has((s as { key: string }).key) &&
          typeof (s as { value?: unknown }).value === "string"
      ),
      ranges: (parsed.ranges ?? []).filter(
        (r: unknown) =>
          typeof r === "object" && r !== null &&
          typeof (r as { key?: unknown }).key === "string" &&
          validKeys.has((r as { key: string }).key)
      ),
      inStockOnly: parsed.inStockOnly === true,
      keywords: (parsed.keywords ?? []).filter((k: unknown) => typeof k === "string").slice(0, 6),
    };
  } catch {
    return null;
  }
}
