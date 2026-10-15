import React from "react";
import { UserCheck, Sliders, ShieldCheck, HeartHandshake } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { PageSectionItem } from "@/types/database.types";

interface WhyUsSectionProps {
  content?: PageSectionItem;
}

export const WhyUsSection: React.FC<WhyUsSectionProps> = ({ content }) => {
  const pillars = [
    {
      icon: UserCheck,
      title: "Your Dedicated Chauffeur-Guide",
      description:
        "Travel with a licensed, English-speaking local driver who knows the safest mountain roads, avoids traffic bottlenecks, and reveals secret viewpoints unknown to tourist buses.",
      color: "bg-[#0C5A70]/10 text-[#0C5A70]",
    },
    {
      icon: Sliders,
      title: "100% Flexible Island Pacing",
      description:
        "Want to spend an extra hour at a waterfall? Stop for fresh king coconuts by the roadside? Sleep in late? It's your vacation—we adapt completely to your rhythm.",
      color: "bg-[#2B5829]/10 text-[#2B5829]",
    },
    {
      icon: ShieldCheck,
      title: "Transparent & Zero Tourist Traps",
      description:
        "We never force commission stops at overpriced souvenir shops or staged spice gardens. We give you honest local guidance and genuine fair quotes.",
      color: "bg-[#E06D53]/10 text-[#E06D53]",
    },
    {
      icon: HeartHandshake,
      title: "Proudly Based in Hikkaduwa",
      description:
        "We are not an anonymous overseas agency. We are Sri Lankan locals based on the southern coast who welcome you with real warmth and 24/7 personal WhatsApp care.",
      color: "bg-[#0C5A70]/10 text-[#0C5A70]",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F4EFE6]/60 border-y border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-3">
            {content?.badge || "The Local Difference"}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
            {content?.title || "Why Travel With Manju Tours Lanka?"}
          </h2>
          <p className="text-base text-[#5B6770] mt-3">
            {content?.subtitle || content?.content || "“Your Personal Sri Lanka Travel Planner” isn't a slogan—it's how we design and host every single day of your trip."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-[#E8E2D2] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${pillar.color} flex items-center justify-center mb-6 shrink-0`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#17202A] mb-3 leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#5B6770] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default WhyUsSection;
