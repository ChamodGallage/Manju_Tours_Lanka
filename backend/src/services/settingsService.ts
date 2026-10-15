import { getBackendFirestore } from "../config/firebase.js";
import { doc, getDoc, setDoc } from "../config/firestore.js";
import type { SiteSettings } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

const DEFAULT_SETTINGS: SiteSettings = {
  id: "global",
  company_name: "MANJU TOURS LANKA",
  tagline: "Your Personal Sri Lanka Travel Planner",
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
  social_youtube: "",
  whatsapp_welcome_message: "Hello Manju Tours Lanka! I am planning a holiday to Sri Lanka and would like some advice on an itinerary.",
  logo_url: "/images/logo.png",
  favicon_url: "/favicon.ico",
  seo_title_default: "Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide",
  seo_description_default: "Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.",
  seo_keywords_default: "Sri Lanka tours, private driver Sri Lanka, chauffeur guide Sri Lanka, Hikkaduwa tours, Sri Lanka holiday packages",
  seo_og_image: "/images/hero.webp",
  canonical_url: "https://manjutourslanka.com",
  updated_at: new Date().toISOString(),
};

let runtimeSettings: SiteSettings = { ...DEFAULT_SETTINGS };

export const settingsService = {
  async get(): Promise<SiteSettings> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const docRef = doc(db, "siteSettings", "default");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          runtimeSettings = {
            ...DEFAULT_SETTINGS,
            ...(snap.data() as Partial<SiteSettings>),
          };
          return runtimeSettings;
        }
      } catch (err) {
        logger.warn("Firestore settings notice, using default settings:", err);
      }
    }
    return runtimeSettings;
  },

  async update(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    runtimeSettings = {
      ...runtimeSettings,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "siteSettings", "default"), runtimeSettings, { merge: true });
      } catch (err) {
        logger.warn("Firestore settings update notice:", err);
      }
    }

    return runtimeSettings;
  },
};
