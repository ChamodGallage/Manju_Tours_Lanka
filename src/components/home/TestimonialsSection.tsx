import React from "react";
import { Star } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface ReviewItem {
  id: string;
  authorName: string;
  authorCountry: string;
  rating: number;
  travelMonth: string;
  title: string;
  comment: string;
  source: string;
}

interface TestimonialsSectionProps {
  reviews: ReviewItem[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  reviews,
}) => {
  return (
    <section className="py-20 lg:py-28 bg-[#F4EFE6]/50 border-t border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="primary" className="mb-3">
            Guest Trust & Feedback
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
            Loved By Independent Travelers
          </h2>
          <p className="text-sm text-[#5B6770] mt-2">
            Read what guests say about traveling with our personal chauffeur-guides.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E06D53]/10 text-[#C8573D] text-[11px] font-bold">
            <span>[REAL REVIEW HERE - Authentic Traveler Verification Placeholder]</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-[#E8E2D2] shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-3 text-[#D48B38]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <h3 className="text-sm font-bold text-[#17202A] mb-2 leading-snug">
                  {rev.title}
                </h3>

                <p className="text-xs text-[#5B6770] leading-relaxed italic mb-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8E2D2]/60 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#17202A] block">
                      {rev.authorName}
                    </span>
                    <span className="text-[11px] text-[#5B6770]">
                      {rev.authorCountry} • {rev.travelMonth}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0C5A70] bg-[#0C5A70]/10 px-2 py-0.5 rounded-full">
                    {rev.source}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default TestimonialsSection;
