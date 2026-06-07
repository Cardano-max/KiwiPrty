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
