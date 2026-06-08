// AI seam. Uses Claude (Anthropic) when ANTHROPIC_API_KEY is configured, and a
// deterministic fallback otherwise — so the feature always works and "upgrades"
// to real LLM output when a key is present. This is the pattern from
// docs/02 §6 (AI behind a task-based service interface).

export interface ProductDescInput {
  name: string;
  category?: string;
  material?: string;
  color?: string;
  unitLabel?: string;
}

/** Deterministic, no-network description used when no API key is configured. */
export function fallbackDescription(i: ProductDescInput): string {
  const attrs = [i.color, i.material].filter(Boolean).join(" ");
  const parts: string[] = [];
  parts.push(
    `${i.name}${i.category ? ` is a ${i.category.toLowerCase()} essential` : " is a party essential"} for birthdays, baby showers and events.`,
  );
  if (attrs) parts.push(`Finished in ${attrs}.`);
  parts.push(
    `Built for bulk buyers — party shops, decorators and event planners${i.unitLabel ? `, sold by the ${i.unitLabel.toLowerCase()}` : ""}.`,
  );
  return parts.join(" ");
}

// --- AI search: natural-language query -> structured filters ---

export interface ParsedSearch {
  terms: string;
  priceMaxPaise?: number;
  categorySlug?: string;
  city?: string;
  tag?: string;
  source: "ai" | "fallback";
}

export interface NamedCategory {
  name: string;
  slug: string;
}

/** Deterministic NL parse: price ceilings, category, city, and tag keywords. */
export function fallbackParseSearch(
  q: string,
  categories: NamedCategory[],
  cities: string[],
): ParsedSearch {
  let terms = ` ${q} `;
  const ql = q.toLowerCase();
  let priceMaxPaise: number | undefined;
  let categorySlug: string | undefined;
  let city: string | undefined;
  let tag: string | undefined;

  // "under 5000", "below ₹5,000", "upto 5000", "less than 5000", "< 5000"
  const priceMatch = q.match(/(?:under|below|upto|up to|less than|within|<)\s*₹?\s*([\d,]+)/i);
  if (priceMatch) {
    const n = parseInt(priceMatch[1].replace(/,/g, ""), 10);
    if (!Number.isNaN(n)) priceMaxPaise = n * 100;
    terms = terms.replace(new RegExp(priceMatch[0], "i"), " ");
  }

  for (const c of categories) {
    const nameLc = c.name.toLowerCase();
    const slugWords = c.slug.replace(/-/g, " ");
    if (ql.includes(nameLc) || ql.includes(slugWords)) {
      categorySlug = c.slug;
      terms = terms.replace(new RegExp(nameLc, "i"), " ");
      break;
    }
  }

  for (const ct of cities) {
    if (ql.includes(ct.toLowerCase())) {
      city = ct;
      terms = terms.replace(new RegExp(ct, "i"), " ");
      break;
    }
  }

  if (/clearance|dead\s*stock|liquidation/i.test(q)) tag = "clearance";
  else if (/new\s*arrival|newest|latest/i.test(q)) tag = "new_arrival";

  // strip filler words left behind
  terms = terms.replace(/\b(for|under|below|in|the|a|party|decoration|items?)\b/gi, " ");
  terms = terms.replace(/\s+/g, " ").trim();

  return { terms, priceMaxPaise, categorySlug, city, tag, source: "fallback" };
}

export async function parseSearchQuery(
  q: string,
  categories: NamedCategory[],
  cities: string[],
): Promise<ParsedSearch> {
  const fb = fallbackParseSearch(q, categories, cities);
  if (!process.env.ANTHROPIC_API_KEY) return fb;
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic();
    const prompt =
      "Extract search filters from a party-supplies B2B marketplace query. Reply with ONLY a JSON " +
      'object: {"terms": string, "priceMaxRupees": number|null, "categorySlug": string|null, ' +
      '"city": string|null, "tag": "clearance"|"new_arrival"|null}. ' +
      `categorySlug must be one of: ${categories.map((c) => c.slug).join(", ")}. ` +
      `city must be one of: ${cities.join(", ")}.\nQuery: "${q}"`;
    const res = await client.messages.create({
      model: process.env.KIWI_AI_MODEL || "claude-opus-4-8",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const block = res.content.find((b) => b.type === "text") as { text?: string } | undefined;
    const raw = (block?.text ?? "").replace(/```json?|```/g, "").trim();
    const j = JSON.parse(raw);
    return {
      terms: typeof j.terms === "string" && j.terms.trim() ? j.terms.trim() : fb.terms,
      priceMaxPaise:
        typeof j.priceMaxRupees === "number" ? Math.round(j.priceMaxRupees * 100) : fb.priceMaxPaise,
      categorySlug: categories.some((c) => c.slug === j.categorySlug) ? j.categorySlug : fb.categorySlug,
      city: cities.includes(j.city) ? j.city : fb.city,
      tag: j.tag === "clearance" || j.tag === "new_arrival" ? j.tag : fb.tag,
      source: "ai",
    };
  } catch {
    return fb;
  }
}

// --- AI sales assistant ---

export interface AssistantProduct {
  name: string;
  slug: string;
  pricePaise: number;
  unitLabel: string;
  supplier: string;
}

export async function assistantReply(
  message: string,
  products: AssistantProduct[],
): Promise<{ text: string; source: "ai" | "fallback" }> {
  const list = products
    .slice(0, 5)
    .map((p) => `- ${p.name} (₹${(p.pricePaise / 100).toFixed(0)}/${p.unitLabel}, ${p.supplier})`)
    .join("\n");

  const fallback = products.length
    ? `Here are some matching products on Kiwi Party:\n${list}\n\nShare your quantity and city and I'll help you get the best price.`
    : `I couldn't find a direct match. Try terms like "balloons", "baby shower", "birthday" or "Diwali decoration".`;

  if (!process.env.ANTHROPIC_API_KEY) return { text: fallback, source: "fallback" };
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic();
    const res = await client.messages.create({
      model: process.env.KIWI_AI_MODEL || "claude-opus-4-8",
      max_tokens: 600,
      system:
        "You are Kiwi Party's AI sourcing assistant for a B2B party-supplies marketplace in India. " +
        "Help bulk buyers (party shops, decorators, event planners) find products. Be concise and " +
        "practical. Only recommend from the provided product list; if nothing fits, say so and " +
        "suggest search terms. Never invent products or prices.",
      messages: [
        {
          role: "user",
          content: `Buyer asks: "${message}"\n\nMatching products:\n${list || "(none)"}\n\nReply helpfully.`,
        },
      ],
    });
    const block = res.content.find((b) => b.type === "text") as { text?: string } | undefined;
    const text = block?.text?.trim();
    return text ? { text, source: "ai" } : { text: fallback, source: "fallback" };
  } catch {
    return { text: fallback, source: "fallback" };
  }
}

export async function generateProductDescription(
  i: ProductDescInput,
): Promise<{ text: string; source: "ai" | "fallback" }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { text: fallbackDescription(i), source: "fallback" };
  }
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic();
    const prompt =
      "Write a concise, factual 2–3 sentence B2B product description for a party-supplies " +
      "wholesale marketplace. No markdown, no price, no emojis.\n\n" +
      `Product: ${i.name}\nCategory: ${i.category ?? "party supplies"}\n` +
      `Colour: ${i.color ?? "-"}\nMaterial: ${i.material ?? "-"}\n` +
      `Sold as: ${i.unitLabel ?? "unit"}\n` +
      "Audience: bulk buyers (party shops, decorators, event planners).";

    const res = await client.messages.create({
      model: process.env.KIWI_AI_MODEL || "claude-opus-4-8",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const block = res.content.find((b) => b.type === "text") as { text?: string } | undefined;
    const text = block?.text?.trim();
    return text ? { text, source: "ai" } : { text: fallbackDescription(i), source: "fallback" };
  } catch {
    return { text: fallbackDescription(i), source: "fallback" };
  }
}
