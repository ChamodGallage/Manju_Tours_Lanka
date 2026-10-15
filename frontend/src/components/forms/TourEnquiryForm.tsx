"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { trackConversion } from "@/lib/analytics";

interface TourEnquiryFormProps {
  tourId?: string | null;
  tourTitle?: string | null;
  defaultStyle?: string;
  onSuccess?: () => void;
}

export const TourEnquiryForm: React.FC<TourEnquiryFormProps> = ({
  tourId,
  tourTitle,
  defaultStyle,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    travelStartDate: "",
    numberOfAdults: 2,
    numberOfChildren: 0,
    travelStyle: defaultStyle || "Private Chauffeur",
    message: "",
    botField: "", // Honeypot
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tourId: tourId || null,
          tourTitle: tourTitle || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      setStatus("success");
      trackConversion({
        name: "tour_enquiry_submit",
        tourSlug: tourTitle || "general",
      });
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please contact us via WhatsApp.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-[#2B5829]/10 border border-[#2B5829]/30 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-[#2B5829] mx-auto mb-3" />
        <h4 className="text-lg font-bold text-[#17202A] mb-1">
          Thank you! Enquiry Received
        </h4>
        <p className="text-xs text-[#5B6770] leading-relaxed">
          We have received your trip details for <strong>{tourTitle || "your Sri Lanka tour"}</strong>. Manju will review your preferences and message you within 12–24 hours with a custom quote.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Honeypot hidden input */}
      <input
        type="text"
        name="botField"
        value={formData.botField}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div>
        <label className="block text-xs font-bold text-[#17202A] mb-1">
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. John Smith"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1">
            WhatsApp / Phone *
          </label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="+44 7700 900077"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1">
            Country of Residence *
          </label>
          <input
            type="text"
            name="country"
            required
            placeholder="e.g. United Kingdom"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1">
            Estimated Arrival Date
          </label>
          <input
            type="date"
            name="travelStartDate"
            value={formData.travelStartDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1">
            Adults (12+ yrs)
          </label>
          <input
            type="number"
            name="numberOfAdults"
            min={1}
            max={30}
            value={formData.numberOfAdults}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1">
            Children (0-11 yrs)
          </label>
          <input
            type="number"
            name="numberOfChildren"
            min={0}
            max={20}
            value={formData.numberOfChildren}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#17202A] mb-1">
          Trip Notes / Special Requests *
        </label>
        <textarea
          name="message"
          required
          rows={3}
          placeholder="Tell us about hotel preferences, must-see places, or questions..."
          value={formData.message}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-full text-xs font-bold text-white bg-[#E06D53] hover:bg-[#C8573D] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Enquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Request Free Custom Quote</span>
          </>
        )}
      </button>
    </form>
  );
};
export default TourEnquiryForm;
