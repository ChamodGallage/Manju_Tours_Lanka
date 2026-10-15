"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Globe,
  Search,
  Share2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react";

export default function AdminSeoPage() {
  const [formData, setFormData] = useState({
    seo_title_default: "Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide",
    seo_description_default:
      "Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.",
    seo_keywords_default:
      "Sri Lanka tours, private driver Sri Lanka, chauffeur guide Sri Lanka, Hikkaduwa tours, Sri Lanka holiday packages",
    seo_og_image: "/images/hero.webp",
    canonical_url: "https://manjutourslanka.com/",
    google_analytics_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchSeo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      if (data.seo) {
        setFormData({
          seo_title_default: data.seo.seo_title_default || "",
          seo_description_default: data.seo.seo_description_default || "",
          seo_keywords_default: data.seo.seo_keywords_default || "",
          seo_og_image: data.seo.seo_og_image || "/images/hero.webp",
          canonical_url: data.seo.canonical_url || "https://manjutourslanka.com/",
          google_analytics_id: data.seo.google_analytics_id || "",
        });
      }
    } catch (err) {
      console.error("Fetch SEO error:", err);
      setActionError("Failed to load SEO configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/seo");
        const data = await res.json();
        if (isMounted && data.seo) {
          setFormData({
            seo_title_default: data.seo.seo_title_default || "",
            seo_description_default: data.seo.seo_description_default || "",
            seo_keywords_default: data.seo.seo_keywords_default || "",
            seo_og_image: data.seo.seo_og_image || "/images/hero.webp",
            canonical_url: data.seo.canonical_url || "https://manjutourslanka.com/",
            google_analytics_id: data.seo.google_analytics_id || "",
          });
        }
      } catch (err) {
        console.error("Initial load SEO error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success || data.seo) {
        setActionSuccess("Global SEO configuration saved to Supabase!");
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(data.error || "Failed to save SEO settings");
      }
    } catch {
      setActionError("Network error while saving SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  const titleLength = formData.seo_title_default.length;
  const descLength = formData.seo_description_default.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Global SEO & Social Metadata
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#0C5A70]/40 text-[#4EB5D1] border border-[#0C5A70]">
              Search Engine Visibility
            </span>
          </div>
          <p className="text-sm text-[#8E9CA6] mt-1">
            Configure titles, meta descriptions, OpenGraph social cards, and Google Analytics tracking.
          </p>
        </div>

        <button
          onClick={fetchSeo}
          disabled={loading || saving}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#141C24] text-white border border-[#232F3E] hover:border-[#0C5A70] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[#8E9CA6]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0C5A70] mb-3" />
          <p className="text-sm">Loading SEO configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Form Fields (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Meta Tags */}
              <div className="bg-[#141C24] p-6 rounded-xl border border-[#232F3E] space-y-4 text-xs">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#4EB5D1]" />
                  Search Engine Meta Information
                </h3>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#8E9CA6] font-semibold">Default Meta Title *</label>
                    <span className={`text-[10px] font-mono ${titleLength > 60 ? "text-amber-400" : "text-[#5B6770]"}`}>
                      {titleLength} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.seo_title_default}
                    onChange={(e) => setFormData({ ...formData, seo_title_default: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                  <p className="text-[11px] text-[#5B6770] mt-1">
                    Displayed as the clickable headline in Google search results and browser tab titles.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#8E9CA6] font-semibold">Default Meta Description *</label>
                    <span className={`text-[10px] font-mono ${descLength > 160 ? "text-amber-400" : "text-[#5B6770]"}`}>
                      {descLength} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={formData.seo_description_default}
                    onChange={(e) => setFormData({ ...formData, seo_description_default: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                  <p className="text-[11px] text-[#5B6770] mt-1">
                    The snippet summary shown beneath your website title on Google.
                  </p>
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.seo_keywords_default}
                    onChange={(e) => setFormData({ ...formData, seo_keywords_default: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                  <p className="text-[11px] text-[#5B6770] mt-1">Comma-separated target keywords.</p>
                </div>
              </div>

              {/* Social Sharing & Tracking */}
              <div className="bg-[#141C24] p-6 rounded-xl border border-[#232F3E] space-y-4 text-xs">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  Social Share & Analytics
                </h3>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Homepage canonical URL</label>
                  <input
                    type="url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://manjutourslanka.com/"
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                  <p className="text-[11px] text-[#5B6770] mt-1">Used for the homepage canonical link. Use your verified site domain.</p>
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">OpenGraph Share Image URL</label>
                  <input
                    type="text"
                    value={formData.seo_og_image}
                    onChange={(e) => setFormData({ ...formData, seo_og_image: e.target.value })}
                    placeholder="/images/hero.webp"
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                  <p className="text-[11px] text-[#5B6770] mt-1">
                    Image displayed when your website link is shared on WhatsApp, Facebook, iMessage, and Twitter (1200x630px recommended).
                  </p>
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    Google Analytics 4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={formData.google_analytics_id}
                    onChange={(e) => setFormData({ ...formData, google_analytics_id: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white font-mono focus:outline-none focus:border-[#0C5A70]"
                  />
                  <p className="text-[11px] text-[#5B6770] mt-1">
                    Leave blank if not currently using Google Analytics tracking.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white shadow-xl transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save SEO Settings"}</span>
              </button>
            </form>
          </div>

          {/* Right: Live Visual Previews (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Google Search Result Preview */}
            <div className="bg-[#141C24] p-5 rounded-xl border border-[#232F3E] space-y-3">
              <span className="text-[11px] font-bold text-[#8E9CA6] uppercase tracking-wider block">
                Google Search Snippet Preview
              </span>
              <div className="bg-[#202124] p-4 rounded-xl border border-[#303134] space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-[#BDC1C6]">
                  <Globe className="w-3.5 h-3.5 text-[#8AB4F8]" />
                  <span>manjutourslanka.com</span>
                  <span className="text-[#9AA0A6]">&rsaquo;</span>
                </div>
                <h4 className="text-base font-medium text-[#8AB4F8] hover:underline cursor-pointer leading-snug line-clamp-2">
                  {formData.seo_title_default || "Manju Tours Lanka"}
                </h4>
                <p className="text-xs text-[#BDC1C6] leading-relaxed line-clamp-3">
                  {formData.seo_description_default || "No meta description specified."}
                </p>
              </div>
            </div>

            {/* Social / WhatsApp Share Card Preview */}
            <div className="bg-[#141C24] p-5 rounded-xl border border-[#232F3E] space-y-3">
              <span className="text-[11px] font-bold text-[#8E9CA6] uppercase tracking-wider block">
                Social / WhatsApp Link Card Preview
              </span>
              <div className="bg-[#0C1015] rounded-xl border border-[#232F3E] overflow-hidden">
                <div className="h-36 bg-[#1A232E] relative overflow-hidden">
                  {formData.seo_og_image ? (
                    <Image
                      src={formData.seo_og_image}
                      alt="OpenGraph Preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 384px"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5B6770] text-xs">
                      No Preview Image
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#5B6770]">
                    manjutourslanka.com
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {formData.seo_title_default}
                  </h4>
                  <p className="text-[11px] text-[#8E9CA6] line-clamp-2">
                    {formData.seo_description_default}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
