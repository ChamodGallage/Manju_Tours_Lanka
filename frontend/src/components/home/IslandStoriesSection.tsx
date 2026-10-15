"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { FadeIn } from "@/components/ui/Motion";
import { islandStories } from "@/lib/data/stories-dataset";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const IslandStoriesSection: React.FC = () => {
  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours! I was reading your Island Stories guides and would like advice on planning my trip."
  );

  return (
    <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="secondary" className="mb-3">
              From the Driver&apos;s Seat
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
              Island Stories & Local Travel Guides
            </h2>
            <p className="text-base text-[#5B6770] mt-2 max-w-2xl">
              Honest logistics advice, scenic train secrets, and ethical wildlife tips written by Manju and our chauffeur team to help you travel smarter.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              href="/stories"
              variant="outline"
              size="md"
              className="font-bold text-xs"
            >
              <span>View All Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {islandStories.slice(0, 4).map((story, index) => (
          <FadeIn key={story.slug} delay={index * 0.08}>
            <article className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full">
              <div>
                {/* Photo Header */}
                <div className="relative h-48 w-full bg-[#F7F5EF] overflow-hidden">
                  <SafeImage
                    src={story.heroImage.src}
                    alt={story.heroImage.alt}
                    fill
                    slotLabel={`${story.title} Cover`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C5A70] bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs">
                      {story.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[11px] text-white font-medium drop-shadow-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E06D53]" />
                      <span>{story.readTime}</span>
                    </div>
                    <span>{story.publishedDate}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#17202A] group-hover:text-[#0C5A70] transition-colors leading-snug mb-2 line-clamp-2">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#5B6770] leading-relaxed line-clamp-3 mb-4">
                    {story.excerpt}
                  </p>

                  <div className="text-[11px] font-semibold text-[#2B5829]">
                    {story.author.name} • {story.author.role}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 border-t border-[#E8E2D2]/60 mt-auto flex items-center justify-between">
                <Link
                  href={`/stories/${story.slug}`}
                  className="text-xs font-bold text-[#0C5A70] hover:text-[#083B4A] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Guide</span>
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#1E3F1D] transition-colors"
                  aria-label="Ask questions on WhatsApp"
                  title="Ask questions on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                </a>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

export default IslandStoriesSection;
