"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Bed, Utensils } from "lucide-react";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
}

interface ItineraryAccordionProps {
  itinerary: ItineraryDay[];
}

export const ItineraryAccordion: React.FC<ItineraryAccordionProps> = ({
  itinerary,
}) => {
  // Start with Day 1 open
  const [openDays, setOpenDays] = useState<number[]>([1]);

  const toggleDay = (dayNum: number) => {
    if (openDays.includes(dayNum)) {
      setOpenDays(openDays.filter((d) => d !== dayNum));
    } else {
      setOpenDays([...openDays, dayNum]);
    }
  };

  const expandAll = () => {
    setOpenDays(itinerary.map((item) => item.day));
  };

  const collapseAll = () => {
    setOpenDays([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D2]">
        <h3 className="text-xl font-bold text-[#17202A]">
          Day-by-Day Journey Itinerary
        </h3>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#0C5A70]">
          <button onClick={expandAll} className="hover:underline">
            Expand All
          </button>
          <span>•</span>
          <button onClick={collapseAll} className="hover:underline">
            Collapse All
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {itinerary.map((dayItem) => {
          const isOpen = openDays.includes(dayItem.day);

          return (
            <div
              key={dayItem.day}
              className="bg-white rounded-2xl border border-[#E8E2D2] overflow-hidden transition-all shadow-xs"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleDay(dayItem.day)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#FBF9F4] transition-colors"
              >
                <div className="flex items-center gap-3.5 pr-4">
                  <div className="w-8 h-8 rounded-full bg-[#0C5A70] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                    D{dayItem.day}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-[#17202A] leading-snug">
                    {dayItem.title}
                  </span>
                </div>

                <div className="p-1 rounded-full text-[#5B6770] shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#0C5A70]" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#17202A] space-y-4 border-t border-[#E8E2D2]/40 bg-[#FBF9F4]/40">
                  <p className="leading-relaxed text-[#5B6770] pt-2">
                    {dayItem.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {dayItem.accommodation && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#E8E2D2]">
                        <Bed className="w-4 h-4 text-[#0C5A70] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#5B6770] block">
                            Accommodation
                          </span>
                          <span className="text-xs font-semibold text-[#17202A]">
                            {dayItem.accommodation}
                          </span>
                        </div>
                      </div>
                    )}

                    {dayItem.meals && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#E8E2D2]">
                        <Utensils className="w-4 h-4 text-[#2B5829] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#5B6770] block">
                            Meal Plan
                          </span>
                          <span className="text-xs font-semibold text-[#17202A]">
                            {dayItem.meals}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ItineraryAccordion;
