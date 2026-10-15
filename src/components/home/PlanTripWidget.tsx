"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Compass, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { trackConversion } from "@/lib/analytics";

export const PlanTripWidget: React.FC = () => {
  const router = useRouter();

  const [selectedDuration, setSelectedDuration] = useState("7");
  const [selectedStyle, setSelectedStyle] = useState("Private Chauffeur Escorted");
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([
    "Sigiriya",
    "Kandy",
    "Ella",
    "Mirissa",
  ]);

  const places = [
    "Sigiriya",
    "Kandy",
    "Nuwara Eliya",
    "Haputale",
    "Ella",
    "Yala Safari",
    "Mirissa",
    "Galle Fort",
  ];

  const durations = [
    { value: "5", label: "3 - 5 Days", desc: "Short Escapade" },
    { value: "7", label: "6 - 8 Days", desc: "Classic Circuit" },
    { value: "10", label: "9 - 12 Days", desc: "Island In-Depth" },
    { value: "14", label: "13+ Days", desc: "Complete Sri Lanka" },
  ];

  const styles = [
    "Private Chauffeur Escorted",
    "Cultural & Heritage",
    "Wildlife & Safari",
    "Romantic Honeymoon",
    "Family Friendly",
  ];

  const togglePlace = (place: string) => {
    if (selectedPlaces.includes(place)) {
      setSelectedPlaces(selectedPlaces.filter((p) => p !== place));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    trackConversion({
      name: "plan_trip_click",
      source: "homepage_widget",
    });

    const params = new URLSearchParams({
      duration: selectedDuration,
      style: selectedStyle,
      places: selectedPlaces.join(","),
    });

    router.push(`/custom-tour?${params.toString()}`);
  };

  return (
    <section className="relative mt-8 sm:mt-12 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-xl border border-[#E8E2D2] p-6 sm:p-8 lg:p-10">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E06D53]/10 text-[#C8573D] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Planner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17202A]">
            Design Your Dream Sri Lanka Journey
          </h2>
          <p className="text-sm text-[#5B6770] mt-1">
            Choose your duration, travel style, and must-see stops. We&apos;ll craft your customized route with a free quote.
          </p>
        </div>

        <form onSubmit={handleContinue} className="space-y-6">
          {/* 1. Duration Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#0C5A70] uppercase mb-3">
              <Calendar className="w-4 h-4" />
              <span>1. How many days are you visiting?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {durations.map((d) => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => setSelectedDuration(d.value)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedDuration === d.value
                      ? "border-[#0C5A70] bg-[#0C5A70]/5 ring-2 ring-[#0C5A70]/20 shadow-sm"
                      : "border-[#E8E2D2] hover:border-[#0C5A70]/40 bg-white"
                  }`}
                >
                  <span className="block text-sm font-bold text-[#17202A]">
                    {d.label}
                  </span>
                  <span className="block text-xs text-[#5B6770] mt-0.5">
                    {d.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Travel Style */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#0C5A70] uppercase mb-3">
              <Compass className="w-4 h-4" />
              <span>2. What is your preferred trip style?</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {styles.map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    selectedStyle === style
                      ? "bg-[#0C5A70] text-white shadow-sm"
                      : "bg-[#FBF9F4] text-[#17202A] border border-[#E8E2D2] hover:bg-[#E8E2D2]/50"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Must-See Places */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#0C5A70] uppercase mb-3">
              <MapPin className="w-4 h-4" />
              <span>3. Which destinations are on your wishlist?</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {places.map((place) => {
                const isSelected = selectedPlaces.includes(place);
                return (
                  <button
                    type="button"
                    key={place}
                    onClick={() => togglePlace(place)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#2B5829] text-white font-semibold shadow-xs"
                        : "bg-white text-[#5B6770] border border-[#E8E2D2] hover:border-[#2B5829]/50"
                    }`}
                  >
                    <span>{isSelected ? "✓" : "+"}</span>
                    <span>{place}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8E2D2]">
            <p className="text-xs text-[#5B6770]">
              ✨ 100% free consultation. No commitment required.
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#E06D53] hover:bg-[#C8573D] shadow-lg hover:shadow-xl active:scale-98 transition-all"
            >
              <span>Build My Custom Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
export default PlanTripWidget;
