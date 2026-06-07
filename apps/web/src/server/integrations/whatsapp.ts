import { config, isConfigured, toMsisdn } from "@/server/config";

export interface SendResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * Send a WhatsApp text via the official Cloud API. Free-form text only works
 * within a 24h customer-service window; business-initiated messages require an
 * approved template (use sendWhatsAppTemplate). No-ops when not configured.
 */
export async function sendWhatsAppText(phone: string, text: string): Promise<SendResult> {
  if (!isConfigured.whatsapp()) return { sent: false, skipped: true };
  try {
    const to = toMsisdn(phone, config.whatsapp.countryCode);
    const res = await fetch(`${config.whatsapp.apiBase}/${config.whatsapp.phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.whatsapp.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    if (!res.ok) return { sent: false, error: `WhatsApp HTTP ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "error" };
  }
}

export async function sendWhatsAppTemplate(
  phone: string,
  template: string,
  languageCode: string,
  bodyParams: string[],
): Promise<SendResult> {
  if (!isConfigured.whatsapp()) return { sent: false, skipped: true };
  try {
    const to = toMsisdn(phone, config.whatsapp.countryCode);
    const res = await fetch(`${config.whatsapp.apiBase}/${config.whatsapp.phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.whatsapp.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: languageCode },
          components: bodyParams.length
            ? [{ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: t })) }]
            : [],
        },
      }),
    });
    if (!res.ok) return { sent: false, error: `WhatsApp HTTP ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "error" };
  }
}
