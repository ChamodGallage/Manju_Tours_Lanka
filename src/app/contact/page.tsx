import React from "react";
import type { Metadata } from "next";
import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import Badge from "@/components/ui/Badge";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";

export async function generateMetadata(): Promise<Metadata> {
  const pageRecord = await getPageByKey("contact");
  const title = pageRecord?.seo_title || "Contact Us & WhatsApp | Manju Tours Lanka";
  const description =
    pageRecord?.seo_description ||
    "Get in touch with Manju Tours Lanka in Hikkaduwa. Fast WhatsApp replies, customized trip quotes, and private driver arrangements across Sri Lanka.";
  const ogImage = pageRecord?.seo_og_image || "/images/hero-sigiriya.webp";

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

export default async function ContactPage() {
  const [settings, sections] = await Promise.all([getSiteSettings(), getPublishedPageSections("contact")]);
  const hero = getSection(sections, "hero");
  const address = settings.address || process.env.NEXT_PUBLIC_COMPANY_LOCATION || "Galle Road, Hikkaduwa, Southern Province, Sri Lanka";
  const phone = settings.phone || process.env.NEXT_PUBLIC_CONTACT_PHONE || "+94771234567";
  const email = settings.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@manjutourslanka.com";
  const whatsappUrl = buildWhatsAppLink("Hello Manju Tours Lanka! I am visiting your contact page and have an inquiry.");

  return (
    <>
      {hero?.is_visible !== false && (
        <section className="bg-[#0C5A70] text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <Badge variant="accent" className="mb-4">
            {hero?.badge || "Direct Local Support"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
            {hero?.title || "Let&apos;s Plan Your Sri Lanka Journey"}
          </h1>
          <p className="text-base sm:text-lg text-[#FBF9F4]/90 leading-relaxed">
            {hero?.subtitle || "Message us on WhatsApp for rapid responses, or submit the contact form below. We are based on the south coast in Hikkaduwa and assist guests 7 days a week."}
          </p>
        </div>
      </section>
      )}

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Details Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick WhatsApp Box */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageCircle className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#17202A] leading-tight">
                    Instant WhatsApp Chat
                  </h2>
                  <span className="text-xs text-[#1E3F1D] font-semibold">
                    Fastest Response (Under 1 hour)
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#5B6770] leading-relaxed">
                Connect directly with Manju to discuss itineraries, check car availability, or ask advice on weather and train tickets.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md transition-all text-center"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp Now</span>
              </a>
            </div>

            {/* Office & Direct Channels */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm space-y-5">
              <h3 className="text-base font-bold text-[#17202A] pb-3 border-b border-[#E8E2D2]">
                Company Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E06D53] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#17202A] block">Office Location</span>
                    <span className="text-[#5B6770]">{address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#0C5A70] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#17202A] block">Phone / Mobile</span>
                    <a href={`tel:${phone}`} className="text-[#0C5A70] hover:underline font-semibold">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#0C5A70] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#17202A] block">Email Support</span>
                    <a href={`mailto:${email}`} className="text-[#0C5A70] hover:underline font-semibold">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#2B5829] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#17202A] block">Working Hours</span>
                    <span className="text-[#5B6770]">Monday – Sunday: 7:00 AM – 10:00 PM (Sri Lanka Time)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Right Column */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-[#17202A] mb-4">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
