import type { SiteImage } from "../types/database.types.js";

/**
 * DEFAULT / SEED INVENTORY OF ALL WEBSITE CONTENT IMAGES
 * Used as reliable fallback if database is offline or not yet seeded.
 */
export const DEFAULT_SITE_IMAGES: SiteImage[] = [
  // 1. HOME HERO SLIDES
  {
    id: "hero-1-sigiriya",
    title: "Sigiriya Lion Rock Citadel",
    description: "Sigiriya 5th-century UNESCO citadel rising above morning mist",
    storage_path: "destinations/sigiriya/hero.webp",
    image_url: "/images/destinations/sigiriya/hero.webp",
    page_key: "home",
    section_key: "hero",
    category: "hero",
    destination: "sigiriya",
    alt_text: "Sigiriya Lion Rock citadel rising above morning jungle mist",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "hero-2-ella",
    title: "Nine Arch Bridge Red Train",
    description: "Red train crossing Nine Arch Bridge viaduct in Ella tea country",
    storage_path: "destinations/ella/hero.webp",
    image_url: "/images/destinations/ella/hero.webp",
    page_key: "home",
    section_key: "hero",
    category: "hero",
    destination: "ella",
    alt_text: "Red train crossing Nine Arch Bridge in Ella tea country",
    display_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "hero-3-hikkaduwa",
    title: "Golden Sunset Hikkaduwa Beach",
    description: "Golden sunset over palm-lined Hikkaduwa beach on Sri Lanka coast",
    storage_path: "hero/hikkaduwa.webp",
    image_url: "/images/hero/hikkaduwa.webp",
    page_key: "home",
    section_key: "hero",
    category: "hero",
    destination: "hikkaduwa",
    alt_text: "Golden sunset over palm-lined Hikkaduwa beach on Sri Lanka coast",
    display_order: 3,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "hero-4-minneriya",
    title: "Minneriya Wild Elephant Gathering",
    description: "Wild Asian elephant gathering at Minneriya National Park reservoir",
    storage_path: "experiences/minneriya-elephants.webp",
    image_url: "/images/experiences/minneriya-elephants.webp",
    page_key: "home",
    section_key: "hero",
    category: "hero",
    destination: "sigiriya",
    alt_text: "Wild Asian elephants gathering in Minneriya National Park",
    display_order: 4,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // 2. 8 ISLAND EXPERIENCE PILLARS (HOMEPAGE)
  {
    id: "pillar-wild-yala",
    title: "Pillar 1: Wild (Yala Safari)",
    description: "Elusive Sri Lankan leopard resting on sun-warmed granite boulder",
    storage_path: "destinations/yala-national-park/hero.webp",
    image_url: "/images/destinations/yala-national-park/hero.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "yala",
    alt_text: "Yala Sri Lankan leopard resting on boulder",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "pillar-pristine-mirissa",
    title: "Pillar 2: Pristine (Mirissa Marine Life)",
    description: "Blue whale fluke in deep Indian Ocean swells off Mirissa",
    storage_path: "experiences/mirissa-whale.webp",
    image_url: "/images/experiences/mirissa-whale.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "mirissa",
    alt_text: "Blue whale fluke in Indian Ocean swell off Mirissa",
    display_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "pillar-bliss-nuwaraeliya",
    title: "Pillar 3: Bliss (Nuwara Eliya Tea Country)",
    description: "High-altitude rolling tea estates in Nuwara Eliya misty hills",
    storage_path: "destinations/nuwara-eliya/hero.webp",
    image_url: "/images/destinations/nuwara-eliya/hero.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "nuwara-eliya",
    alt_text: "High-altitude rolling tea estates in Nuwara Eliya",
    display_order: 3,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "pillar-scenic-ella",
    title: "Pillar 4: Scenic (Ella Mountain Railway)",
    description: "Nine Arch Bridge viaduct rail journey through Ella mountains",
    storage_path: "destinations/ella/hero.webp",
    image_url: "/images/destinations/ella/hero.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "ella",
    alt_text: "Nine Arch Bridge viaduct rail journey",
    display_order: 4,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "pillar-thrills-pidurangala",
    title: "Pillar 5: Thrills (Sigiriya Sunrise Climb)",
    description: "Sunrise expedition on Pidurangala overlooking Sigiriya rock citadel",
    storage_path: "experiences/sigiriya-sunrise-climb/hero.webp",
    image_url: "/images/experiences/sigiriya-sunrise-climb/hero.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "sigiriya",
    alt_text: "Sunrise expedition on Pidurangala overlooking Sigiriya",
    display_order: 5,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "pillar-festive-kandy",
    title: "Pillar 6: Festive (Kandy Sacred Temple)",
    description: "Temple of the Sacred Tooth Relic sacred architecture in Kandy",
    storage_path: "destinations/kandy/gallery-1.webp",
    image_url: "/images/destinations/kandy/gallery-1.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "kandy",
    alt_text: "Temple of the Sacred Tooth Relic, Kandy",
    display_order: 6,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "pillar-heritage-polonnaruwa",
    title: "Pillar 7: Heritage (Polonnaruwa Citadel)",
    description: "Ancient UNESCO medieval kingdom stone ruins of Polonnaruwa",
    storage_path: "destinations/polonnaruwa/hero.webp",
    image_url: "/images/destinations/polonnaruwa/hero.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "polonnaruwa",
    alt_text: "Ancient UNESCO medieval ruins of Polonnaruwa",
    display_order: 7,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "pillar-essence-gallefort",
    title: "Pillar 8: Essence (Galle Dutch Fort)",
    description: "Galle Dutch Fort ocean ramparts, white lighthouse, and palm trees",
    storage_path: "destinations/galle-fort/hero.webp",
    image_url: "/images/destinations/galle-fort/hero.webp",
    page_key: "home",
    section_key: "pillars",
    category: "pillar",
    destination: "galle-fort",
    alt_text: "Galle Dutch Fort ocean ramparts & lighthouse",
    display_order: 8,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // 3. DESTINATIONS (HEROES & GALLERIES)
  // Sigiriya
  {
    id: "dest-sigiriya-hero",
    title: "Sigiriya Lion Rock Hero",
    description: "Citadel view from ancient water gardens",
    storage_path: "destinations/sigiriya/hero.webp",
    image_url: "/images/destinations/sigiriya/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "sigiriya",
    alt_text: "Sigiriya Lion Rock monolith view from water gardens",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dest-sigiriya-g1",
    title: "Sigiriya Dawn from Pidurangala",
    description: "Sunrise vista of Sigiriya from Pidurangala summit",
    storage_path: "destinations/sigiriya/gallery-1.webp",
    image_url: "/images/destinations/sigiriya/gallery-1.webp",
    page_key: "destinations",
    section_key: "gallery",
    category: "gallery",
    destination: "sigiriya",
    alt_text: "Dawn vista of Sigiriya from Pidurangala summit",
    display_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dest-sigiriya-g2",
    title: "Sigiriya Elephants at Minneriya",
    description: "Wild Asian elephant gathering corridor near Minneriya",
    storage_path: "destinations/sigiriya/gallery-2.webp",
    image_url: "/images/destinations/sigiriya/gallery-2.webp",
    page_key: "destinations",
    section_key: "gallery",
    category: "gallery",
    destination: "sigiriya",
    alt_text: "Wild Asian elephant gathering corridor at Minneriya",
    display_order: 3,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dest-sigiriya-g3",
    title: "Sigiriya Medieval Polonnaruwa Ruins",
    description: "Historic kingdom ruins of Polonnaruwa",
    storage_path: "destinations/sigiriya/gallery-3.webp",
    image_url: "/images/destinations/sigiriya/gallery-3.webp",
    page_key: "destinations",
    section_key: "gallery",
    category: "gallery",
    destination: "sigiriya",
    alt_text: "Historic kingdom ruins of Polonnaruwa",
    display_order: 4,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Kandy
  {
    id: "dest-kandy-hero",
    title: "Kandy Peradeniya Royal Palms",
    description: "Royal palm avenue at Peradeniya Botanical Gardens",
    storage_path: "destinations/kandy/hero.webp",
    image_url: "/images/destinations/kandy/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "kandy",
    alt_text: "Royal palm avenue at Peradeniya Botanical Gardens, Kandy",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dest-kandy-g1",
    title: "Kandy Temple of the Tooth",
    description: "Temple of the Sacred Tooth Relic",
    storage_path: "destinations/kandy/gallery-1.webp",
    image_url: "/images/destinations/kandy/gallery-1.webp",
    page_key: "destinations",
    section_key: "gallery",
    category: "gallery",
    destination: "kandy",
    alt_text: "Temple of the Sacred Tooth Relic, Kandy",
    display_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Nuwara Eliya
  {
    id: "dest-nuwara-eliya-hero",
    title: "Nuwara Eliya Tea Highlands",
    description: "Lush tea fields and plantations near Nanuoya",
    storage_path: "destinations/nuwara-eliya/hero.webp",
    image_url: "/images/destinations/nuwara-eliya/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "nuwara-eliya",
    alt_text: "Lush tea fields near Nanuoya, Nuwara Eliya",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Ella
  {
    id: "dest-ella-hero",
    title: "Ella Nine Arch Bridge",
    description: "Nine Arch Bridge with red train in Ella",
    storage_path: "destinations/ella/hero.webp",
    image_url: "/images/destinations/ella/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "ella",
    alt_text: "Nine Arch Bridge with red train in Ella",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Mirissa
  {
    id: "dest-mirissa-hero",
    title: "Mirissa Blue Whale Cruise",
    description: "Blue whale fluke off the coast of Mirissa",
    storage_path: "destinations/mirissa/hero.webp",
    image_url: "/images/destinations/mirissa/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "mirissa",
    alt_text: "Blue whale fluke off Mirissa southern coast",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "dest-mirissa-g1",
    title: "Mirissa Golden Beach Coast",
    description: "Golden sand palm beach and surf in Mirissa",
    storage_path: "destinations/mirissa/gallery-1.webp",
    image_url: "/images/destinations/mirissa/gallery-1.webp",
    page_key: "destinations",
    section_key: "gallery",
    category: "gallery",
    destination: "mirissa",
    alt_text: "Golden sand palm beach and surf in Mirissa",
    display_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Galle Fort
  {
    id: "dest-galle-fort-hero",
    title: "Galle Fort Lighthouse",
    description: "White lighthouse & palm trees at Galle Fort ramparts",
    storage_path: "destinations/galle-fort/hero.webp",
    image_url: "/images/destinations/galle-fort/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "galle-fort",
    alt_text: "Galle Fort white lighthouse and palm trees",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Yala National Park
  {
    id: "dest-yala-hero",
    title: "Yala National Park Leopard",
    description: "Leopard on sun-warmed rock in Yala",
    storage_path: "destinations/yala-national-park/hero.webp",
    image_url: "/images/destinations/yala-national-park/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "yala",
    alt_text: "Yala National Park leopard on rock",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Polonnaruwa
  {
    id: "dest-polonnaruwa-hero",
    title: "Polonnaruwa Ancient Citadel",
    description: "Ancient stone pillars and royal pavilions in Polonnaruwa",
    storage_path: "destinations/polonnaruwa/hero.webp",
    image_url: "/images/destinations/polonnaruwa/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "polonnaruwa",
    alt_text: "Ancient stone pillars and royal pavilions in Polonnaruwa",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Trincomalee
  {
    id: "dest-trincomalee-hero",
    title: "Trincomalee Nilaveli Waters",
    description: "Nilaveli turquoise coastal waters in Trincomalee",
    storage_path: "destinations/trincomalee/hero.webp",
    image_url: "/images/destinations/trincomalee/hero.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "trincomalee",
    alt_text: "Nilaveli turquoise coastal waters in Trincomalee",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // Hikkaduwa Beach
  {
    id: "dest-hikkaduwa-hero",
    title: "Hikkaduwa Palm Coast",
    description: "Hikkaduwa palm coastline and golden beach at sunset",
    storage_path: "hero/hikkaduwa.webp",
    image_url: "/images/hero/hikkaduwa.webp",
    page_key: "destinations",
    section_key: "hero",
    category: "destination",
    destination: "hikkaduwa",
    alt_text: "Golden sunset over palm-lined Hikkaduwa beach",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },

  // 4. TOURS
  {
    id: "tour-grand-odyssey",
    title: "Grand Sri Lanka Odyssey",
    description: "Signature Citadel & Complete Island Journey",
    storage_path: "destinations/sigiriya/hero.webp",
    image_url: "/images/destinations/sigiriya/hero.webp",
    page_key: "tours",
    section_key: "cards",
    category: "tour",
    destination: "sigiriya",
    alt_text: "Grand Sri Lanka Odyssey tour signature citadel",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "tour-cultural-triangle",
    title: "Cultural Triangle & Hill Country Classic",
    description: "Ancient UNESCO kingdom ruins & heritage tour",
    storage_path: "destinations/polonnaruwa/hero.webp",
    image_url: "/images/destinations/polonnaruwa/hero.webp",
    page_key: "tours",
    section_key: "cards",
    category: "tour",
    destination: "polonnaruwa",
    alt_text: "Cultural Triangle tour medieval ruins",
    display_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "tour-southern-coast",
    title: "Southern Coast & Marine Wildlife",
    description: "Blue whale & marine wildlife southern coast tour",
    storage_path: "destinations/mirissa/hero.webp",
    image_url: "/images/destinations/mirissa/hero.webp",
    page_key: "tours",
    section_key: "cards",
    category: "tour",
    destination: "mirissa",
    alt_text: "Southern Coast tour blue whale and marine wildlife",
    display_order: 3,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "tour-highlights-express",
    title: "Ceylon Highlights Express",
    description: "Nine Arch Bridge highland railway express tour",
    storage_path: "destinations/ella/hero.webp",
    image_url: "/images/destinations/ella/hero.webp",
    page_key: "tours",
    section_key: "cards",
    category: "tour",
    destination: "ella",
    alt_text: "Ceylon Highlights Express tour Ella train journey",
    display_order: 4,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "tour-wild-lanka",
    title: "Wild Lanka Safari Expedition",
    description: "Yala National Park leopard & safari expedition",
    storage_path: "destinations/yala-national-park/hero.webp",
    image_url: "/images/destinations/yala-national-park/hero.webp",
    page_key: "tours",
    section_key: "cards",
    category: "tour",
    destination: "yala",
    alt_text: "Wild Lanka Safari Expedition tour leopard",
    display_order: 5,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "tour-tea-trails",
    title: "Ceylon Tea Trails & Scenic Train",
    description: "Romantic colonial tea estate and misty mountain rail",
    storage_path: "destinations/nuwara-eliya/hero.webp",
    image_url: "/images/destinations/nuwara-eliya/hero.webp",
    page_key: "tours",
    section_key: "cards",
    category: "tour",
    destination: "nuwara-eliya",
    alt_text: "Ceylon Tea Trails tour lush tea estates",
    display_order: 6,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

/**
 * Filter criteria for querying site images
 */
export interface SiteImageFilter {
  pageKey?: string;
  sectionKey?: string;
  destination?: string;
  category?: string;
  includeInactive?: boolean;
}

/**
 * Fetches site images from Supabase, seamlessly falling back to default seed images
 * if Supabase is offline or if no custom photos exist yet.
 */
export async function getSiteImages(filter?: SiteImageFilter): Promise<SiteImage[]> {
  // In-memory static inventory
  let results = [...DEFAULT_SITE_IMAGES];
  if (!filter?.includeInactive) {
    results = results.filter((img) => img.is_active);
  }
  if (filter?.pageKey) {
    results = results.filter((img) => img.page_key === filter.pageKey);
  }
  if (filter?.sectionKey) {
    results = results.filter((img) => img.section_key === filter.sectionKey);
  }
  if (filter?.destination) {
    results = results.filter((img) => img.destination === filter.destination);
  }
  if (filter?.category) {
    results = results.filter((img) => img.category === filter.category);
  }

  return results.sort((a, b) => a.display_order - b.display_order);
}

/**
 * Fetches hero slides for the Homepage hero section
 */
export async function getHeroSlides(): Promise<Array<{ src: string; alt: string; focalPoint?: string }>> {
  const images = await getSiteImages({ pageKey: "home", sectionKey: "hero" });
  if (images.length > 0) {
    return images.map((img) => ({
      src: img.image_url,
      alt: img.alt_text || img.title,
      focalPoint: img.focal_point || "center 35%",
    }));
  }

  return [
    {
      src: "/images/destinations/sigiriya/hero.webp",
      alt: "Sigiriya Lion Rock citadel rising above morning jungle mist",
      focalPoint: "center 30%",
    },
    {
      src: "/images/destinations/ella/hero.webp",
      alt: "Red train crossing Nine Arch Bridge in Ella tea country",
      focalPoint: "center 40%",
    },
    {
      src: "/images/hero/hikkaduwa.webp",
      alt: "Golden sunset over palm-lined Hikkaduwa beach on Sri Lanka coast",
      focalPoint: "center",
    },
    {
      src: "/images/experiences/minneriya-elephants.webp",
      alt: "Wild Asian elephants gathering in Minneriya National Park",
      focalPoint: "center",
    },
  ];
}

/**
 * Fetches destination hero and gallery photos
 */
export async function getDestinationImages(slug: string): Promise<{
  heroImage: { src: string; alt: string; caption?: string };
  gallery: Array<{ src: string; alt: string; caption?: string }>;
}> {
  const images = await getSiteImages({ destination: slug });

  const heroImageRecord = images.find((i) => i.section_key === "hero" || i.category === "hero" || i.category === "destination");
  const galleryRecords = images.filter((i) => i.section_key === "gallery" || i.category === "gallery");

  return {
    heroImage: {
      src: heroImageRecord?.image_url || `/images/destinations/${slug}/hero.webp`,
      alt: heroImageRecord?.alt_text || `${slug} Sri Lanka`,
      caption: heroImageRecord?.description || heroImageRecord?.title,
    },
    gallery: galleryRecords.map((g) => ({
      src: g.image_url,
      alt: g.alt_text || g.title,
      caption: g.description || g.title,
    })),
  };
}

/**
 * Fetches 8 experience pillar photos for the homepage
 */
export async function getPillarImages(): Promise<Record<string, { image: string; alt: string; focalPoint?: string }>> {
  const images = await getSiteImages({ pageKey: "home", sectionKey: "pillars" });
  const map: Record<string, { image: string; alt: string; focalPoint?: string }> = {};

  images.forEach((img) => {
    // Map by pillar slug or destination
    const key = img.id.replace("pillar-", "").split("-")[0]; // e.g. "wild", "pristine", "bliss", "scenic"
    map[key] = {
      image: img.image_url,
      alt: img.alt_text || img.title,
      focalPoint: img.focal_point || "center",
    };
  });

  return map;
}
