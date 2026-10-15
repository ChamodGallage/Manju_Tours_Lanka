"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    botField: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message.");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        botField: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message. Please contact us on WhatsApp.";
      setStatus("error");
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-[#2B5829]/10 border border-[#2B5829]/30 rounded-3xl p-8 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-[#2B5829] mx-auto" />
        <h3 className="text-xl font-bold text-[#17202A]">Message Sent Successfully!</h3>
        <p className="text-sm text-[#5B6770] max-w-md mx-auto">
          Thank you for reaching out to Manju Tours Lanka. A member of our local team in Hikkaduwa will reply to your email or WhatsApp shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
      {status === "error" && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Honeypot field */}
      <input
        type="text"
        name="botField"
        value={formData.botField}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1.5">
            Your Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. David Miller"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs sm:text-sm focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="e.g. david@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs sm:text-sm focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1.5">
            WhatsApp or Phone (Optional)
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+44 7911 123456"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs sm:text-sm focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#17202A] mb-1.5">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            required
            placeholder="e.g. Question about 7-day tour"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs sm:text-sm focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#17202A] mb-1.5">
          Your Message *
        </label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Tell us what you'd like to ask or discuss regarding your upcoming Sri Lanka travels..."
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-[#E8E2D2] text-xs sm:text-sm focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Direct Message</span>
          </>
        )}
      </button>
    </form>
  );
};
export default ContactForm;
