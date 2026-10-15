/**
 * WhatsApp Deep-Link Builder
 * Never hardcodes phone numbers or messages; pulls clean number from environment.
 */

export function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+94771234567";
  return raw.replace(/[^0-9]/g, "");
}

export function buildWhatsAppLink(customMessage?: string): string {
  const number = getWhatsAppNumber();
  const defaultText =
    "Hello Manju Tours Lanka! I am planning a holiday to Sri Lanka and would like some advice on an itinerary.";
  const text = customMessage ? customMessage.trim() : defaultText;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildTourWhatsAppLink(tourTitle: string, durationDays: number): string {
  const msg = `Hello Manju Tours Lanka! I am interested in the "${tourTitle}" (${durationDays} Days) itinerary. Could you please share more details and a quote?`;
  return buildWhatsAppLink(msg);
}

export function buildCustomTourWhatsAppLink(details: {
  destinations?: string[];
  travelStyle?: string;
  durationDays?: number | string;
  adults?: number;
}): string {
  const destStr = details.destinations && details.destinations.length > 0
    ? `Destinations: ${details.destinations.join(", ")}`
    : "";
  const styleStr = details.travelStyle ? `Travel Style: ${details.travelStyle}` : "";
  const durationStr = details.durationDays ? `Duration: approx ${details.durationDays} days` : "";
  const guestsStr = details.adults ? `Travelers: ${details.adults} adults` : "";

  const parts = [
    "Hello Manju Tours Lanka! I used your website trip planner with these preferences:",
    destStr,
    styleStr,
    durationStr,
    guestsStr,
    "Could you please help me plan this personalized trip?",
  ].filter(Boolean);

  return buildWhatsAppLink(parts.join("\n"));
}
