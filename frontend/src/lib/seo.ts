/**
 * SEO & Structured Data (JSON-LD) Generators
 */

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "MANJU TOURS LANKA",
    description:
      "Your Personal Sri Lanka Travel Planner. Authentic chauffeured private tours, wildlife safaris, scenic rail journeys, and custom holiday planning based in Hikkaduwa.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://manjutourslanka.com",
    telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+94771234567",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@manjutourslanka.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Galle Road",
      addressLocality: "Hikkaduwa",
      addressRegion: "Southern Province",
      addressCountry: "LK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "6.1408",
      longitude: "80.1037",
    },
    priceRange: "$$",
    sameAs: [
      "https://www.tripadvisor.com",
      "https://www.instagram.com",
      "https://www.facebook.com",
    ],
  };
}

export function generateTourSchema(tour: {
  title: string;
  tagline: string;
  overview: string;
  durationDays: number;
  slug: string;
  heroImage: string | { src: string } | unknown;
  startingPrice?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.overview,
    touristType: ["Family", "Couples", "Solo Travelers", "Wildlife Enthusiasts"],
    offers: {
      "@type": "Offer",
      price: tour.startingPrice && tour.startingPrice.includes("$") ? tour.startingPrice.replace(/[^0-9]/g, "") : "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://manjutourslanka.com"}/tours/${tour.slug}`,
    },
    provider: {
      "@type": "TravelAgency",
      name: "MANJU TOURS LANKA",
    },
  };
}

export function generateDestinationSchema(dest: {
  name: string;
  summary: string;
  region: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: dest.name,
    description: dest.summary,
    containedInPlace: {
      "@type": "Place",
      name: dest.region,
    },
    ...(dest.latitude && dest.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: dest.latitude,
            longitude: dest.longitude,
          },
        }
      : {}),
  };
}
