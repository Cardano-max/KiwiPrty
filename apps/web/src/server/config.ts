// Central integration config. Every integration is OPTIONAL: when its env vars
// are set the real API is used; otherwise the app falls back to a working dev
// behaviour (mock payment, dev OTP, in-app-only notifications). Fill the keys in
// .env to go live — see .env.example for the full list.

export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  devOtp: process.env.DEV_OTP ?? "123456",
  anthropic: {
    key: process.env.ANTHROPIC_API_KEY,
    model: process.env.KIWI_AI_MODEL || "claude-opus-4-8",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiBase: process.env.WHATSAPP_API_BASE || "https://graph.facebook.com/v21.0",
    countryCode: process.env.WHATSAPP_COUNTRY_CODE || "91",
  },
  sms: {
    authKey: process.env.MSG91_AUTH_KEY,
    senderId: process.env.MSG91_SENDER_ID,
    otpTemplateId: process.env.MSG91_OTP_TEMPLATE_ID,
    countryCode: process.env.SMS_COUNTRY_CODE || "91",
  },
};

export const isConfigured = {
  anthropic: () => !!config.anthropic.key,
  razorpay: () => !!(config.razorpay.keyId && config.razorpay.keySecret),
  whatsapp: () => !!(config.whatsapp.token && config.whatsapp.phoneId),
  sms: () => !!config.sms.authKey,
};

/** Normalise an Indian mobile number to digits with country code. */
export function toMsisdn(phone: string, countryCode: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `${countryCode}${digits}`;
  return digits;
}
