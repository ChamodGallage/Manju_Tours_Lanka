import type { SiteSettings } from "@/types/database.types";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "global",
  company_name: "MANJU TOURS LANKA",
  tagline: "Your Personal Sri Lanka Travel Planner & Chauffeur-Guide",
  phone: "+94 77 123 4567",
  whatsapp: "+94 77 123 4567",
  email: "info@manjutourslanka.com",
  address: "Galle Road, Hikkaduwa, Southern Province, Sri Lanka",
  opening_hours: "Daily: 7:00 AM – 10:00 PM (Sri Lanka Time GMT+5:30)",
  currency: "USD",
  supported_currencies: ["USD", "EUR", "GBP", "AUD", "LKR"],
  social_facebook: "https://facebook.com",
  social_instagram: "https://instagram.com",
  social_tripadvisor: "https://tripadvisor.com",
  social_youtube: "https://youtube.com",
  whatsapp_welcome_message:
    "Hello Manju Tours Lanka! I am planning a holiday to Sri Lanka and would like some advice on an itinerary.",
  logo_url: "/images/logo.png",
  favicon_url: "/favicon.ico",
  seo_title_default: "Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide",
  seo_description_default:
    "Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.",
  seo_keywords_default:
    "Sri Lanka tours, private driver Sri Lanka, chauffeur guide Sri Lanka, Hikkaduwa tours, Sri Lanka holiday packages",
  seo_og_image: "/images/hero.webp",
  canonical_url: "https://manjutourslanka.com/",
  google_analytics_id: "",
  updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const docRef = doc(db, "siteSettings", "default");
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        return {
          ...DEFAULT_SITE_SETTINGS,
          ...(data as Partial<SiteSettings>),
          company_name: data.company_name || DEFAULT_SITE_SETTINGS.company_name,
          tagline: data.tagline || DEFAULT_SITE_SETTINGS.tagline,
          phone: data.contact_phone || data.phone || DEFAULT_SITE_SETTINGS.phone,
          whatsapp: data.whatsapp_number || data.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
          email: data.contact_email || data.email || DEFAULT_SITE_SETTINGS.email,
          address: data.location || data.address || DEFAULT_SITE_SETTINGS.address,
          supported_currencies: Array.isArray(data.supported_currencies)
            ? (data.supported_currencies as string[])
            : DEFAULT_SITE_SETTINGS.supported_currencies,
        };
      }
    } catch (err) {
      console.warn("Firestore siteSettings fetch notice, using default settings:", err);
    }
  }

  return DEFAULT_SITE_SETTINGS;
}
