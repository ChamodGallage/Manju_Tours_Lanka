import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  User,
  MapPin,
  ChevronRight,
  Lightbulb,
  MessageCircle,
  Compass,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import CtaBanner from "@/components/home/CtaBanner";
import { islandStories } from "@/lib/data/stories-dataset";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return islandStories.map((story) => ({
    slug: story.slug,
  }));
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = islandStories.find((s) => s.slug === slug);

  if (!story) {
    return {
      title: "Story Not Found | Manju Tours Lanka",
    };
  }

  return {
    title: `${story.title} | Manju Tours Lanka`,
    description: story.subtitle,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      images: [story.heroImage.src],
    },
  };
}

export default async function StoryDetailPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = islandStories.find((s) => s.slug === slug);

  if (!story) {
    notFound();
  }

  const whatsappUrl = buildWhatsAppLink(
    `Hello Manju! I am reading your guide "${story.title}" and would love to ask some travel planning questions.`
  );

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav className="bg-[#F4EFE6] border-b border-[#E8E2D2] py-3 text-xs text-[#5B6770]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#0C5A70] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#5B6770]/60" />
          <Link href="/stories" className="hover:text-[#0C5A70] transition-colors">
            Island Stories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#5B6770]/60" />
          <span className="text-[#17202A] font-semibold truncate max-w-[200px] sm:max-w-none">
            {story.title}
          </span>
        </div>
      </nav>

      {/* Article Header & Hero */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <Badge variant="accent" className="mb-4">
            {story.category}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17202A] tracking-tight leading-tight mb-4">
            {story.title}
          </h1>
          <p className="text-base sm:text-lg text-[#5B6770] leading-relaxed mb-6 font-medium">
            {story.subtitle}
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-[#5B6770] flex-wrap border-y border-[#E8E2D2] py-3">
            <div className="flex items-center gap-1 font-semibold text-[#17202A]">
              <User className="w-3.5 h-3.5 text-[#0C5A70]" />
              <span>{story.author.name}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>{story.author.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0C5A70]" />
              <span>{story.readTime}</span>
            </div>
            <span>•</span>
            <span>{story.publishedDate}</span>
          </div>
        </header>

        {/* Hero Photo Banner */}
        <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-[#F7F5EF] border border-[#E8E2D2] shadow-sm mb-12">
          <SafeImage
            src={story.heroImage.src}
            alt={story.heroImage.alt}
            fill
            priority
            slotLabel={`${story.title} Banner`}
            className="object-cover"
          />
          {story.heroImage.caption && (
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="text-[11px] text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full shadow-xs">
                {story.heroImage.caption}
              </span>
            </div>
          )}
        </div>

        {/* Article Body */}
        <div className="prose prose-slate max-w-none space-y-8 text-[#17202A] leading-relaxed text-sm sm:text-base">
          {/* Excerpt Lead */}
          <div className="p-6 rounded-2xl bg-[#0C5A70]/5 border-l-4 border-[#0C5A70] text-[#0C5A70] font-medium text-base sm:text-lg italic leading-relaxed">
            &ldquo;{story.excerpt}&rdquo;
          </div>

          <p className="text-base text-[#17202A] font-normal leading-relaxed">
            {story.content.intro}
          </p>

          {/* Sections with Chauffeur Tips */}
          {story.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4 pt-4 border-t border-[#E8E2D2]/60">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#17202A] tracking-tight">
                {section.heading}
              </h2>
              <p className="text-[#5B6770] leading-relaxed">
                {section.body}
              </p>

              {section.localTip && (
                <div className="bg-[#FBF9F4] p-4 sm:p-5 rounded-2xl border border-[#E8E2D2] flex items-start gap-3 mt-4">
                  <div className="w-8 h-8 rounded-xl bg-[#E06D53]/15 text-[#E06D53] flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0C5A70] mb-0.5">
                      Local Chauffeur Secret
                    </h3>
                    <p className="text-xs text-[#5B6770] leading-relaxed">
                      {section.localTip}
                    </p>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Conclusion */}
          <div className="pt-6 border-t border-[#E8E2D2]">
            <p className="text-base font-medium text-[#17202A] leading-relaxed">
              {story.content.conclusion}
            </p>
          </div>
        </div>

        {/* Bottom Conversion Callout */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#083B4A] to-[#0C5A70] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-white">
              Have Questions About This Itinerary?
            </h3>
            <p className="text-xs text-[#FBF9F4]/80 max-w-md">
              Ask Manju directly on WhatsApp. We provide free travel advice, hotel suggestions, and customized quotes with zero obligation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-[#1E3F1D] bg-[#25D366] hover:bg-[#1EBE5D] transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-[#1E3F1D]" />
              <span>Ask on WhatsApp</span>
            </a>

            {story.relatedTourSlug && (
              <Button
                href={`/tours/${story.relatedTourSlug}`}
                variant="accent"
                size="md"
                className="text-xs font-bold"
              >
                <Compass className="w-4 h-4" />
                <span>View Related Tour</span>
              </Button>
            )}
          </div>
        </div>
      </article>

      <CtaBanner />
    </>
  );
}
