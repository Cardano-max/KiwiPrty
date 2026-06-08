import { config, isConfigured, toMsisdn } from "@/server/config";
import type { SendResult } from "@/server/integrations/whatsapp";

/** Send an OTP via MSG91. No-ops when not configured (dev OTP is used instead). */
export async function sendOtpSms(phone: string, code: string): Promise<SendResult> {
  if (!isConfigured.sms()) return { sent: false, skipped: true };
  try {
    const mobile = toMsisdn(phone, config.sms.countryCode);
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("otp", code);
    if (config.sms.otpTemplateId) url.searchParams.set("template_id", config.sms.otpTemplateId);
    if (config.sms.senderId) url.searchParams.set("sender", config.sms.senderId);
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { authkey: config.sms.authKey as string, "Content-Type": "application/json" },
    });
    if (!res.ok) return { sent: false, error: `SMS HTTP ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "error" };
  }
}

/** Send a transactional SMS via MSG91 flow. No-ops when not configured. */
export async function sendSms(phone: string, message: string): Promise<SendResult> {
  if (!isConfigured.sms()) return { sent: false, skipped: true };
  try {
    const mobile = toMsisdn(phone, config.sms.countryCode);
    const res = await fetch("https://control.msg91.com/api/v5/flow", {
      method: "POST",
      headers: { authkey: config.sms.authKey as string, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: config.sms.senderId,
        mobiles: mobile,
        message,
      }),
    });
    if (!res.ok) return { sent: false, error: `SMS HTTP ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "error" };
  }
}
