import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import SafeImage from "@/components/ui/SafeImage";
import CtaBanner from "@/components/home/CtaBanner";
import { islandStories } from "@/lib/data/stories-dataset";
import { buildWhatsAppLink } from "@/lib/whatsapp";

import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByKey("stories");
  return {
    title: page?.seo_title || "Island Stories & Travel Guides | Manju Tours Lanka",
    description:
      page?.seo_description ||
      "Expert travel advice, scenic railway booking tips, realistic drive times, and ethical safari recommendations from local Sri Lankan chauffeur-guides.",
    openGraph: {
      title: page?.seo_title || "Island Stories & Travel Guides",
      description: page?.seo_description,
      images: [{ url: page?.seo_og_image || "/images/hero-tea.webp" }],
    },
  };
}

export default async function StoriesPage() {
  const sections = await getPublishedPageSections("stories");
  const hero = getSection(sections, "hero");

  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours Lanka! I am reading your Island Stories guides and would like advice on planning my trip."
  );

  return (
    <>
      {/* Header Banner */}
      {hero?.is_visible !== false && (
        <section className="bg-[#0C5A70] text-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <Badge variant="accent" className="mb-4">
              {hero?.badge || "From the Driver's Seat"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {hero?.title || "Island Stories & Local Travel Guides"}
            </h1>
            <p className="text-base sm:text-lg text-[#FBF9F4]/90 leading-relaxed">
              {hero?.subtitle ||
                hero?.content ||
                "Insider secrets, route planning tips, and practical logistics written by our Hikkaduwa chauffeur-guide team to ensure your Sri Lankan journey is seamless and unforgettable."}
            </p>
          </div>
        </section>
      )}

      {/* Stories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {islandStories.map((story) => (
            <article
              key={story.slug}
              className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-56 w-full bg-[#F7F5EF] overflow-hidden">
                  <SafeImage
                    src={story.heroImage.src}
                    alt={story.heroImage.alt}
                    fill
                    slotLabel={`${story.title} Cover`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C5A70] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-xs">
                      {story.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-xs text-white font-medium drop-shadow-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E06D53]" />
                      <span>{story.readTime}</span>
                    </div>
                    <span>{story.publishedDate}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#17202A] group-hover:text-[#0C5A70] transition-colors leading-snug mb-2.5">
                    {story.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#5B6770] leading-relaxed line-clamp-3 mb-4">
                    {story.excerpt}
                  </p>

                  <div className="text-xs font-semibold text-[#2B5829]">
                    By {story.author.name} • {story.author.role}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 border-t border-[#E8E2D2]/60 mt-auto flex items-center justify-between">
                <Link
                  href={`/stories/${story.slug}`}
                  className="text-xs font-bold text-[#0C5A70] hover:text-[#083B4A] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read Complete Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#1E3F1D] transition-colors"
                  aria-label="Ask questions on WhatsApp"
                  title="Ask questions on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
