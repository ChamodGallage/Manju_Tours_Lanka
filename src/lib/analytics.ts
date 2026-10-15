/**
 * Analytics Event Hooks for High-Conversion Actions
 * Dispatches structured custom events for Google Analytics / Tag Manager
 */

export type ConversionEvent =
  | { name: "whatsapp_click"; location: string; tourSlug?: string }
  | { name: "plan_trip_click"; source: string }
  | { name: "custom_tour_submit"; destinationsCount: number; duration: string }
  | { name: "tour_enquiry_submit"; tourSlug?: string };

export function trackConversion(event: ConversionEvent) {
  if (typeof window !== "undefined") {
    // Standard dataLayer push
    const win = window as unknown as { dataLayer?: Record<string, unknown>[] };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({
      event: event.name,
      ...event,
      timestamp: new Date().toISOString(),
    });

    // Custom browser event for debug or custom listeners
    const customEvent = new CustomEvent("manju_conversion", { detail: event });
    window.dispatchEvent(customEvent);
  }
}
