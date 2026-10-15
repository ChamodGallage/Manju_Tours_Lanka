"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Share2,
} from "lucide-react";
import type { SiteSettings } from "@/types/database.types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/queries/site-settings";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencyInput, setCurrencyInput] = useState("");

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
      setActionError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (isMounted && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Initial load settings error:", err);
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
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (data.success || data.settings) {
        setActionSuccess("Business settings updated and saved to Supabase!");
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(data.error || "Failed to save settings");
      }
    } catch {
      setActionError("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCurrency = () => {
    const val = currencyInput.toUpperCase().trim();
    if (val && !settings.supported_currencies.includes(val)) {
      setSettings({
        ...settings,
        supported_currencies: [...settings.supported_currencies, val],
      });
      setCurrencyInput("");
    }
  };

  const handleRemoveCurrency = (curr: string) => {
    setSettings({
      ...settings,
      supported_currencies: settings.supported_currencies.filter((c) => c !== curr),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Business Contact & Site Settings
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#0C5A70]/40 text-[#4EB5D1] border border-[#0C5A70]">
              Global Configuration
            </span>
          </div>
          <p className="text-sm text-[#8E9CA6] mt-1">
            Update your official phone numbers, WhatsApp welcome templates, office address, and social channels.
          </p>
        </div>

        <button
          onClick={fetchSettings}
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
          <p className="text-sm">Loading current settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Business Identity & Profile */}
          <div className="bg-[#141C24] p-6 rounded-xl border border-[#232F3E] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#4EB5D1]" />
              Business Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Official Company Name *</label>
                <input
                  type="text"
                  required
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Business Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Physical Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Operating Hours
                </label>
                <input
                  type="text"
                  value={settings.opening_hours}
                  onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Numbers & WhatsApp Flow */}
          <div className="bg-[#141C24] p-6 rounded-xl border border-[#232F3E] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Direct Communication & WhatsApp
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Primary Phone
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold flex items-center gap-1 text-emerald-400">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp Number (Include Country Code)
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Official Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-[#8E9CA6] block mb-1 font-semibold">
                WhatsApp Pre-filled Welcome Message
              </label>
              <textarea
                rows={2}
                value={settings.whatsapp_welcome_message}
                onChange={(e) => setSettings({ ...settings, whatsapp_welcome_message: e.target.value })}
                className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-[#5B6770]">
                <span>This text pre-fills automatically when a guest taps the floating WhatsApp button on your website.</span>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    settings.whatsapp_welcome_message
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Social Media Channels */}
          <div className="bg-[#141C24] p-6 rounded-xl border border-[#232F3E] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              Social Media Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">TripAdvisor Profile</label>
                <input
                  type="text"
                  value={settings.social_tripadvisor}
                  onChange={(e) => setSettings({ ...settings, social_tripadvisor: e.target.value })}
                  placeholder="https://tripadvisor.com/..."
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Instagram Page</label>
                <input
                  type="text"
                  value={settings.social_instagram}
                  onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Facebook Page</label>
                <input
                  type="text"
                  value={settings.social_facebook}
                  onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">YouTube Channel (Optional)</label>
                <input
                  type="text"
                  value={settings.social_youtube}
                  onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Currencies & Assets */}
          <div className="bg-[#141C24] p-6 rounded-xl border border-[#232F3E] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Currency & Visual Assets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Default Display Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="LKR">LKR (Rs)</option>
                </select>
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Supported Currencies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currencyInput}
                    onChange={(e) => setCurrencyInput(e.target.value)}
                    placeholder="e.g. CAD, CHF"
                    className="flex-1 p-2 bg-[#0C1015] border border-[#232F3E] rounded text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCurrency}
                    className="px-3 py-1 bg-[#232F3E] hover:bg-[#2F3E50] rounded text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {settings.supported_currencies.map((curr) => (
                    <span
                      key={curr}
                      className="px-2 py-0.5 rounded bg-[#0C1015] border border-[#232F3E] text-white text-xs flex items-center gap-1.5"
                    >
                      <span>{curr}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCurrency(curr)}
                        className="text-[#8E9CA6] hover:text-red-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Logo URL</label>
                <input
                  type="text"
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Favicon URL</label>
                <input
                  type="text"
                  value={settings.favicon_url}
                  onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white shadow-xl transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Business Settings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
