import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface TourInclusionsProps {
  inclusions: string[];
  exclusions: string[];
}

export const TourInclusions: React.FC<TourInclusionsProps> = ({
  inclusions,
  exclusions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
      {/* Inclusions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#2B5829]/15 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#2B5829]" />
          </div>
          <h3 className="text-base font-bold text-[#17202A]">What is Included</h3>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-[#17202A]">
          {inclusions.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2B5829] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exclusions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-base font-bold text-[#17202A]">What is Excluded</h3>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-[#5B6770]">
          {exclusions.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default TourInclusions;
