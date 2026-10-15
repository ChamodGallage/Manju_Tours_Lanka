"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle, Send, ArrowRight, Loader2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { buildCustomTourWhatsAppLink } from "@/lib/whatsapp";
import { trackConversion } from "@/lib/analytics";

function CustomTourPlannerContent() {
  const searchParams = useSearchParams();

  const urlDuration = searchParams.get("duration");
  const urlStyle = searchParams.get("style");
  const urlPlaces = searchParams.get("places");
  const urlExp = searchParams.get("experience");

  const [step, setStep] = useState(1);
  const [pageCopy, setPageCopy] = useState({
    badge: "100% Tailor-Made Itinerary Builder",
    title: "Plan Your Custom Sri Lanka Holiday",
    subtitle:
      "No rigid set dates. Choose where you want to go and what you love. We build your personalized private chauffeured itinerary.",
  });

  React.useEffect(() => {
    fetch("/api/pages?page=custom-tour")
      .then((r) => r.json())
      .then((d) => {
        const hero = d.sections?.find((s: { section_key: string }) => s.section_key === "hero");
        if (hero) {
          setPageCopy({
            badge: hero.badge || "100% Tailor-Made Itinerary Builder",
            title: hero.title || "Plan Your Custom Sri Lanka Holiday",
            subtitle:
              hero.subtitle ||
              hero.content ||
              "No rigid set dates. Choose where you want to go and what you love. We build your personalized private chauffeured itinerary.",
          });
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    durationDays: urlDuration || "7",
    travelStyle: urlStyle || "Private Chauffeur Escorted",
    destinations: (urlPlaces ? urlPlaces.split(",") : ["Sigiriya", "Kandy", "Ella", "Mirissa"]) as string[],
    hotelCategory: "4-Star Comfort & Boutique",
    startDate: "",
    numberOfAdults: 2,
    numberOfChildren: 0,
    name: "",
    email: "",
    phone: "",
    country: "",
    message: urlExp ? `Interested in experience: ${urlExp}` : "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const allDestinations = [
    "Sigiriya (Rock Fortress & Minneriya)",
    "Kandy (Temple of Tooth & Botanical Gardens)",
    "Nuwara Eliya (Tea Plantations & Waterfalls)",
    "Haputale (Lipton's Seat)",
    "Ella (Nine Arch Bridge & Hikes)",
    "Yala National Park (Leopard Safari)",
    "Mirissa (Blue Whale Safaris)",
    "Galle Fort (UNESCO Colonial Ramparts)",
    "Hikkaduwa (Beach & Sea Turtles)",
    "Polonnaruwa (Ancient Ruins)",
    "Trincomalee / Nilaveli Beach",
  ];

  const travelStyles = [
    "Private Chauffeur Escorted",
    "Cultural & Heritage Focused",
    "Wildlife & Nature Safaris",
    "Relaxed Beach & Scenic",
    "Romantic Honeymoon",
    "Family with Children",
  ];

  const hotelTiers = [
    "I have already booked my hotels (Driver & Tours only)",
    "3-Star Authentic Clean Guesthouses",
    "4-Star Comfort & Boutique Lodges (Recommended)",
    "5-Star Luxury Resorts & Tea Bungalows",
  ];

  const toggleDestination = (dest: string) => {
    const isSelected = formData.destinations.some((d) => dest.includes(d) || d.includes(dest));
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        destinations: prev.destinations.filter((d) => !dest.includes(d) && !d.includes(dest)),
      }));
    } else {
      const shortName = dest.split(" (")[0];
      setFormData((prev) => ({
        ...prev,
        destinations: [...prev.destinations, shortName],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        travelStartDate: formData.startDate || null,
        numberOfAdults: Number(formData.numberOfAdults),
        numberOfChildren: Number(formData.numberOfChildren),
        travelStyle: formData.travelStyle,
        message: `Custom Tour Request:
Duration: ${formData.durationDays} Days
Destinations: ${formData.destinations.join(", ")}
Hotel Preference: ${formData.hotelCategory}
Additional Notes: ${formData.message || "None"}`,
      };

      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit custom trip enquiry.");

      setSubmitted(true);
      trackConversion({
        name: "custom_tour_submit",
        destinationsCount: formData.destinations.length,
        duration: `${formData.durationDays} days`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred. Please message us on WhatsApp.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = buildCustomTourWhatsAppLink({
    destinations: formData.destinations,
    travelStyle: formData.travelStyle,
    durationDays: formData.durationDays,
    adults: Number(formData.numberOfAdults),
  });

  if (submitted) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl p-10 border border-[#E8E2D2] shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#2B5829]/15 text-[#2B5829] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-[#17202A]">
            Custom Tour Request Received!
          </h2>

          <p className="text-sm text-[#5B6770] leading-relaxed">
            Thank you, <strong>{formData.name}</strong>. Manju and our team will review your chosen route across <strong>{formData.destinations.join(", ")}</strong> and create a personalized day-by-day plan with a transparent quote within 24 hours.
          </p>

          <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] text-xs text-[#17202A] text-left space-y-1">
            <p><strong>Duration:</strong> {formData.durationDays} Days</p>
            <p><strong>Travelers:</strong> {formData.numberOfAdults} Adults, {formData.numberOfChildren} Children</p>
            <p><strong>Hotels:</strong> {formData.hotelCategory}</p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Connect on WhatsApp Instantly</span>
            </a>

            <Button href="/tours" variant="outline" size="md">
              Browse More Itineraries
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Wizard Header */}
      <div className="text-center mb-10">
        <Badge variant="accent" className="mb-3">
          {pageCopy.badge}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
          {pageCopy.title}
        </h1>
        <p className="text-sm text-[#5B6770] mt-2 max-w-xl mx-auto">
          {pageCopy.subtitle}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                step === s
                  ? "bg-[#0C5A70] text-white shadow-sm"
                  : step > s
                  ? "bg-[#2B5829]/15 text-[#2B5829]"
                  : "bg-[#E8E2D2]/50 text-[#5B6770]"
              }`}
            >
              <span>{s === 1 ? "1. Route & Places" : s === 2 ? "2. Style & Pacing" : "3. Contact & Quote"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D2] shadow-xl">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Places & Wishlist */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-[#17202A] mb-1">
                Select Your Wishlist Destinations
              </h2>
              <p className="text-xs text-[#5B6770] mb-4">
                Click all the places you are excited to see. We will sequence them logically to avoid unnecessary driving.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allDestinations.map((dest) => {
                  const isSelected = formData.destinations.some((d) => dest.includes(d) || d.includes(dest));
                  return (
                    <button
                      type="button"
                      key={dest}
                      onClick={() => toggleDestination(dest)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-[#2B5829] bg-[#2B5829]/10 text-[#1E3F1D] ring-1 ring-[#2B5829]"
                          : "border-[#E8E2D2] text-[#5B6770] hover:border-[#2B5829]/40 bg-white"
                      }`}
                    >
                      <span>{dest}</span>
                      <span className="font-bold text-sm">{isSelected ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17202A] mb-2">
                Trip Duration (Days)
              </label>
              <div className="flex flex-wrap gap-2">
                {["4", "7", "10", "12", "14", "18"].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setFormData((prev) => ({ ...prev, durationDays: d }))}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      formData.durationDays === d
                        ? "bg-[#0C5A70] text-white shadow-xs"
                        : "bg-[#FBF9F4] text-[#5B6770] border border-[#E8E2D2]"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-8 py-3.5 rounded-full text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] shadow-md flex items-center gap-2"
              >
                <span>Continue: Style & Hotels</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Style & Pacing */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-[#17202A] mb-1">
                Travel Style & Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {travelStyles.map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setFormData((prev) => ({ ...prev, travelStyle: style }))}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
                      formData.travelStyle === style
                        ? "border-[#0C5A70] bg-[#0C5A70]/10 text-[#0C5A70] ring-1 ring-[#0C5A70]"
                        : "border-[#E8E2D2] text-[#5B6770] bg-white hover:border-[#0C5A70]/40"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#17202A] mb-1">
                Hotel Accommodation Preference
              </h2>
              <div className="space-y-2.5 mt-3">
                {hotelTiers.map((tier) => (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => setFormData((prev) => ({ ...prev, hotelCategory: tier }))}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
                      formData.hotelCategory === tier
                        ? "border-[#2B5829] bg-[#2B5829]/10 text-[#1E3F1D] ring-1 ring-[#2B5829]"
                        : "border-[#E8E2D2] text-[#5B6770] bg-white hover:border-[#2B5829]/40"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#5B6770] hover:text-[#17202A]"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-8 py-3.5 rounded-full text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] shadow-md flex items-center gap-2"
              >
                <span>Continue: Dates & Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact & Submit */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#17202A] mb-1">
                Where Should We Send Your Itinerary & Quote?
              </h2>
              <p className="text-xs text-[#5B6770]">
                We reply with a fully itemized route, recommended hotel list, and clear price breakdown.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emma Watson"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. emma@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+44 7700 900077"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Home Country *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Germany"
                  value={formData.country}
                  onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Estimated Arrival
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Adults (12+)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.numberOfAdults}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numberOfAdults: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Children (0-11)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={formData.numberOfChildren}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numberOfChildren: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17202A] mb-1">
                Any Special Wishes, Experiences, or Questions?
              </label>
              <textarea
                rows={3}
                placeholder="e.g. We love vegetarian food, want to hike Ella Rock, and prefer ocean-view balconies..."
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8E2D2]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-[#5B6770] hover:text-[#17202A]"
              >
                ← Back
              </button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Send via WhatsApp</span>
                </a>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 rounded-full text-xs font-bold text-white bg-[#E06D53] hover:bg-[#C8573D] shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Custom Itinerary Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CustomTourPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading Trip Planner...</div>}>
      <CustomTourPlannerContent />
    </Suspense>
  );
}
