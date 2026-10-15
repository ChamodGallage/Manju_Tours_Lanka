import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Car, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import CtaBanner from "@/components/home/CtaBanner";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";

export async function generateMetadata(): Promise<Metadata> {
  const pageRecord = await getPageByKey("about");
  const title = pageRecord?.seo_title || "About Manju Tours Lanka | Local Travel Planner in Hikkaduwa";
  const description =
    pageRecord?.seo_description ||
    "Meet Manju and the team behind Manju Tours Lanka. Local Sri Lankan chauffeur-guides based in Hikkaduwa offering authentic, unhurried, tailor-made private tours.";
  const ogImage = pageRecord?.seo_og_image || "/images/hero-beach.webp";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
    },
  };
}

export default async function AboutPage() {
  const sections = await getPublishedPageSections("about");
  const hero = getSection(sections, "hero");
  const founder = getSection(sections, "founder_story");
  const fleet = getSection(sections, "fleet");
  const cta = getSection(sections, "cta_banner");

  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju! I am reading your About page and would love to connect about planning a trip."
  );

  return (
    <>
      {/* Hero Banner */}
      {hero?.is_visible !== false && (
        <section className="bg-[#0C5A70] text-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <Badge variant="accent" className="mb-4">
              {hero?.badge || "Our Story & Heritage"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {hero?.title || "Warm, Authentic Sri Lankan Hospitality"}
            </h1>
            <p className="text-base sm:text-lg text-[#FBF9F4]/90 leading-relaxed">
              {hero?.subtitle || "Founded in Hikkaduwa on the southern coast, Manju Tours Lanka was created with a simple purpose: to show international travelers the real Sri Lanka through the eyes of a caring local friend."}
            </p>
          </div>
        </section>
      )}

      {/* Founder Story & Philosophy */}
      {founder?.is_visible !== false && (
        <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Brand Seal & Photo Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-[#E8E2D2] p-8 shadow-sm text-center flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4">
                  <Image
                    src="/images/logo.png"
                    alt="Official Manju Tours Lanka Seal"
                    width={224}
                    height={224}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <span className="font-extrabold text-[#0C5A70] text-sm uppercase tracking-wider">
                  Official Registered Brand Seal
                </span>
                <p className="text-xs text-[#5B6770] mt-1 font-medium">
                  Your Trusted Travel Partner in Sri Lanka • Based in Hikkaduwa
                </p>
              </div>

              {/* Founder Portrait Card */}
              <div className="bg-white rounded-3xl border border-[#E8E2D2] overflow-hidden shadow-sm">
                <div className="relative h-64 sm:h-72 w-full bg-[#F7F5EF]">
                  <SafeImage
                    src={founder?.image_url || "/images/team/manju.webp"}
                    alt={founder?.image_alt || "Founder & Lead Chauffeur-Guide Manju welcoming guests in Hikkaduwa"}
                    fill
                    slotLabel="Founder Manju Portrait"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-extrabold text-[#17202A] text-lg">
                    Manju
                  </h3>
                  <p className="text-xs font-bold text-[#0C5A70] mt-0.5">
                    Founder & Senior Chauffeur-Guide
                  </p>
                  <p className="text-xs text-[#5B6770] mt-2 max-w-md mx-auto leading-relaxed">
                    Born and raised on the sunny Hikkaduwa coastline. Passionate about revealing Sri Lanka&apos;s hidden beauty, tranquil temples, and warm village hospitality.
                  </p>
                </div>
              </div>
            </div>

            {/* Text Story */}
            <div className="space-y-6">
              <Badge variant="secondary">
                {founder?.badge || "The Chauffeur-Guide Ethos"}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17202A] leading-tight">
                {founder?.title || "“You Arrive as Our Guests, You Depart as Our Family.”"}
              </h2>
              <p className="text-sm text-[#5B6770] leading-relaxed">
                {founder?.content || "For over a decade, we have welcomed travelers from the UK, Europe, Australia, and across the globe. We believe Sri Lanka is too beautiful, layered, and diverse to be rushed through on fixed bus schedules or impersonal package tours."}
              </p>
              <p className="text-sm text-[#5B6770] leading-relaxed">
                Having your own private vehicle and local driver means you travel at your own pace. If your children want to stop to watch wild elephants grazing beside the reservoir, we stop. If you want to taste fresh roti at a quiet village wayside stall away from tourist coaches, we take you there.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href={founder?.button_url || whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{founder?.button_text || "Message Manju on WhatsApp"}</span>
                </a>
                <Button href="/custom-tour" variant="accent" size="md">
                  Plan Your Journey
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fleet & Safety */}
      {fleet?.is_visible !== false && (
        <section className="py-16 bg-[#F4EFE6]/60 border-y border-[#E8E2D2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="primary" className="mb-3">
                {fleet?.badge || "Fleet & Road Safety"}
              </Badge>
              <h2 className="text-3xl font-extrabold text-[#17202A]">
                {fleet?.title || "Comfortable, Modern Private Vehicles"}
              </h2>
              <p className="text-sm text-[#5B6770] mt-2">
                {fleet?.subtitle || fleet?.content || "All tours are operated in fully air-conditioned, licensed tourist vehicles maintained to the highest safety standards."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-6 border border-[#E8E2D2] shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#0C5A70]/10 text-[#0C5A70] flex items-center justify-center mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#17202A] mb-1">
                    Air-Conditioned Sedan (1-3 Guests)
                  </h3>
                  <p className="text-xs text-[#0C5A70] font-semibold mb-3">
                    Toyota Prius / Axio or Premium Hybrid Sedan
                  </p>
                  <p className="text-xs text-[#5B6770] leading-relaxed">
                    Ideal for solo travelers and couples. Quiet, comfortable, and fuel-efficient with generous boot capacity for 2 large suitcases.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8E2D2] flex items-center gap-2 text-xs text-[#2B5829] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Licensed Passenger Insurance</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E8E2D2] shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#2B5829]/10 text-[#2B5829] flex items-center justify-center mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#17202A] mb-1">
                    Luxury Mini-Coach (6-12 Guests)
                  </h3>
                  <p className="text-xs text-[#2B5829] font-semibold mb-3">
                    Toyota Coaster / Mitsubishi Rosa
                  </p>
                  <p className="text-xs text-[#5B6770] leading-relaxed">
                    Designed for multi-generational families and travel groups. High ceilings, large scenic panoramic windows, and dedicated rear luggage compartment.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8E2D2] flex items-center gap-2 text-xs text-[#2B5829] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dual Air-Conditioning & Mic System</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E8E2D2] shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#E06D53]/10 text-[#E06D53] flex items-center justify-center mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#17202A] mb-1">
                    KDH High-Roof Van (3-6 Guests)
                  </h3>
                  <p className="text-xs text-[#E06D53] font-semibold mb-3">
                    Toyota KDH Super GL / Grand Cabin
                  </p>
                  <p className="text-xs text-[#5B6770] leading-relaxed">
                    The golden standard for family travel in Sri Lanka. Elevated seating for panoramic hill country views and ample space for 4-6 suitcases.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8E2D2] flex items-center gap-2 text-xs text-[#2B5829] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Seatbelts on All Reclining Seats</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      {cta?.is_visible !== false && (
        <CtaBanner content={cta} />
      )}
    </>
  );
}
