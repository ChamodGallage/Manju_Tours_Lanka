import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, ChevronRight, MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { getExperienceBySlug } from "@/lib/queries/experiences";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CtaBanner from "@/components/home/CtaBanner";
import SafeImage from "@/components/ui/SafeImage";
import PhotoGallery from "@/components/ui/PhotoGallery";
import { normalizeImageMedia, normalizeGallery } from "@/lib/images";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { experiencesSeed } = await import("@/lib/data/seed-dataset");
  return experiencesSeed.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);

  if (!exp) {
    return { title: "Experience Not Found" };
  }

  return {
    title: `${exp.title} | Sri Lanka Experiences`,
    description: exp.summary.slice(0, 160),
    openGraph: {
      title: `${exp.title} | Manju Tours Lanka`,
      description: exp.summary,
      type: "website",
    },
  };
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);

  if (!exp) {
    notFound();
  }

  const heroImage = normalizeImageMedia((exp as typeof exp & { heroImageMetadata?: unknown }).heroImageMetadata ?? exp.heroImage, exp.title, exp.summary);
  const galleryImages = normalizeGallery(exp.galleryImages, exp.title);

  const whatsappUrl = buildWhatsAppLink(
    `Hello Manju Tours Lanka! I'd like to include the "${exp.title}" in my Sri Lanka holiday. Can you help me organize it?`
  );

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-[#F4EFE6]/70 border-b border-[#E8E2D2] py-3 text-xs text-[#5B6770]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#0C5A70]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/experiences" className="hover:text-[#0C5A70]">Experiences</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#17202A] font-semibold truncate max-w-xs">{exp.title}</span>
        </div>
      </div>

      {/* Natural Photo Hero Section */}
      <section className="bg-white pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full rounded-3xl sm:rounded-4xl overflow-hidden shadow-xl border border-[#E8E2D2] bg-[#0C5A70] aspect-[16/9] sm:aspect-[2.2/1] max-h-[500px]">
            <SafeImage
              src={heroImage.src}
              alt={heroImage.alt}
              fallbackTitle={exp.title}
              fallbackCategory="experience"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
              focalPoint={heroImage.focalPoint}
            />

            {/* Light bottom vignette preserving natural photography brilliance */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="accent">{exp.category}</Badge>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-white">
                    <Clock className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Duration: {exp.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#E06D53]" />
                    <span>{exp.location}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-md">
                  {exp.title}
                </h1>

                <p className="text-sm sm:text-lg text-[#FBF9F4]/95 font-medium leading-relaxed drop-shadow-xs mb-6 max-w-2xl">
                  {exp.summary}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    href={`/custom-tour?experience=${encodeURIComponent(exp.title)}`}
                    variant="accent"
                    size="md"
                    className="font-bold shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Add This Activity to My Tour</span>
                  </Button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#1E3F1D] bg-[#25D366] hover:bg-[#1EBE5D] hover:text-white transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Chat About This on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Experience Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Left Content */}
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
              <h2 className="text-xl font-bold text-[#17202A] mb-4">
                Experience Overview
              </h2>
              <p className="text-sm text-[#5B6770] leading-relaxed mb-6">
                {exp.description}
              </p>
            </section>

            {/* Photo Gallery with Lightbox */}
            {galleryImages.length > 0 && (
              <PhotoGallery
                title={`${exp.title} Photo Moments`}
                subtitle={`Authentic photos captured during the ${exp.title}.`}
                images={galleryImages}
                category="experience"
              />
            )}

            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
              <h2 className="text-xl font-bold text-[#17202A] mb-4">
                How Manju Tours Lanka Arranges This
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                  <CheckCircle2 className="w-5 h-5 text-[#2B5829] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-[#17202A] block">
                      Private Chauffeur Pickup & Drop-Off
                    </span>
                    <span className="text-xs text-[#5B6770]">
                      No waiting for group shuttles. Your dedicated driver coordinates timing and drops you right at the boarding point or trailhead.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                  <CheckCircle2 className="w-5 h-5 text-[#2B5829] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-[#17202A] block">
                      Advance Permit & Reserved Ticket Management
                    </span>
                    <span className="text-xs text-[#5B6770]">
                      We arrange train tickets, national park safari jeeps, and tracking permits in advance so you avoid on-the-spot ticket counter queues.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                  <CheckCircle2 className="w-5 h-5 text-[#2B5829] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-[#17202A] block">
                      Ethical & Safety Vetted Standards
                    </span>
                    <span className="text-xs text-[#5B6770]">
                      We only partner with ethical boat operators, certified park wildlife spotters, and licensed local family culinary hosts.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm sticky top-24 space-y-6">
              <h3 className="text-base font-bold text-[#17202A]">
                Activity Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                  <span className="text-[#5B6770]">Category:</span>
                  <span className="font-bold text-[#17202A]">{exp.category}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                  <span className="text-[#5B6770]">Duration:</span>
                  <span className="font-bold text-[#17202A]">{exp.duration}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                  <span className="text-[#5B6770]">Location:</span>
                  <span className="font-bold text-[#17202A]">{exp.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E2D2] space-y-3">
                <Button
                  href={`/custom-tour?experience=${encodeURIComponent(exp.title)}`}
                  variant="accent"
                  size="md"
                  className="w-full justify-center shadow-md font-bold text-xs"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Build Itinerary with This</span>
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Instant WhatsApp Question</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CtaBanner />
    </>
  );
}
