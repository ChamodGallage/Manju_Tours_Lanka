"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Sparkles,
  Layers,
  Settings,
  Image as ImageIcon,
  Save,
  Send,
  HelpCircle,
  ExternalLink,
  Search,
  X,
  ShieldAlert,
} from "lucide-react";
import type { PageRecord, PageSectionItem, SectionType, SiteImage } from "@/types/database.types";
import { DEFAULT_SITE_IMAGES } from "@/lib/queries/site-images";

const SECTION_TYPE_LABELS: Record<SectionType, { label: string; icon: string; desc: string }> = {
  hero: { label: "Hero / Banner", icon: "🌅", desc: "Top headline, subtitle, badge & CTA buttons" },
  "text-image": { label: "Text & Image Story", icon: "📖", desc: "Two-column editorial story with photo" },
  gallery: { label: "Photo Gallery Grid", icon: "📸", desc: "Responsive photo grid with lightbox captions" },
  "destination-cards": { label: "Destination Cards", icon: "🗺️", desc: "Cards showcasing island travel hubs" },
  "tour-cards": { label: "Tour Package Cards", icon: "🧭", desc: "Curated itineraries with pricing & days" },
  itinerary: { label: "Day-by-Day Itinerary", icon: "📅", desc: "Accordion daily schedule for tours" },
  testimonials: { label: "Guest Reviews & Ratings", icon: "⭐", desc: "TripAdvisor & guest feedback cards" },
  faqs: { label: "FAQs Accordion", icon: "❓", desc: "Collapsible questions & answers" },
  "contact-info": { label: "Contact & WhatsApp Desk", icon: "📞", desc: "Quick chat, phone, office & hours" },
  cta: { label: "Call-to-Action Banner", icon: "🚀", desc: "High-conversion banner with contact buttons" },
  "video-animation": { label: "Video / Animation Banner", icon: "🎥", desc: "Ken-burns zoom animation or video embed" },
  pillars: { label: "8 Island Travel Pillars", icon: "✨", desc: "Big visual category tiles" },
  "quick-links": { label: "Quick Essentials Strip", icon: "⚡", desc: "Visa, planning, and tips shortcuts" },
  "why-us": { label: "Why Travel With Manju", icon: "🛡️", desc: "Trust pillars & driver credentials" },
  custom: { label: "Custom Content Block", icon: "🧩", desc: "Flexible content with customizable background" },
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [activePageKey, setActivePageKey] = useState<string>("home");
  const [activePageMeta, setActivePageMeta] = useState<PageRecord | null>(null);
  const [sections, setSections] = useState<PageSectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'sections' (visual builder) | 'settings' (SEO & Navigation)
  const [activeTab, setActiveTab] = useState<"sections" | "settings">("sections");

  // Preview Mode: 'desktop' | 'mobile'
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [hasUnpublishedDraft, setHasUnpublishedDraft] = useState<boolean>(false);

  // Section Modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [currentSection, setCurrentSection] = useState<Partial<PageSectionItem>>({});
  const [savingSection, setSavingSection] = useState(false);

  // Add Page Modal state
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageData, setNewPageData] = useState({ title: "", slug: "", page_key: "", navigation_label: "" });

  // Duplicate Page Modal state
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateData, setDuplicateData] = useState({ newTitle: "", newSlug: "", newKey: "" });

  // Media Library Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<"image_url" | "secondary_image_url" | "seo_og_image">("image_url");
  const [mediaQuery, setMediaQuery] = useState("");
  const [availableImages, setAvailableImages] = useState<SiteImage[]>(DEFAULT_SITE_IMAGES);

  // Delete Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: "section" | "page"; id: string; name: string } | null>(null);

  const showFeedback = useCallback((message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  }, []);

  // Fetch all pages
  const loadPages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pages?mode=pages");
      const data = await res.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error("Load pages error:", err);
    }
  }, []);

  // Fetch active page sections and metadata
  const loadActivePageContent = useCallback(async (pageKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages?page=${pageKey}`);
      const data = await res.json();
      if (data.page) {
        setActivePageMeta(data.page);
      }
      if (data.sections) {
        setSections(data.sections);
      }
    } catch (err) {
      console.error("Load active page error:", err);
      showFeedback("Failed to load page content.", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    let ignore = false;
    const fetchInitialData = async () => {
      try {
        const res = await fetch("/api/admin/pages?mode=pages");
        const data = await res.json();
        if (!ignore && data.pages) {
          setPages(data.pages);
        }
      } catch (err) {
        console.error("Load pages error:", err);
      }

      try {
        const photoRes = await fetch("/api/admin/photos?limit=100");
        const photoData = await photoRes.json();
        if (!ignore && photoData.photos && photoData.photos.length > 0) {
          setAvailableImages(photoData.photos);
        }
      } catch {
        // ignore
      }
    };

    fetchInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchPageContent = async () => {
      try {
        const res = await fetch(`/api/admin/pages?page=${activePageKey}`);
        const data = await res.json();
        if (!ignore) {
          if (data.page) {
            setActivePageMeta(data.page);
          }
          if (data.sections) {
            setSections(data.sections);
          }
          setHasUnpublishedDraft(false);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Load active page error:", err);
          showFeedback("Failed to load page content.", "error");
          setLoading(false);
        }
      }
    };

    fetchPageContent();
    return () => {
      ignore = true;
    };
  }, [activePageKey, showFeedback]);

  // Switch active page
  const handleSelectPage = (key: string) => {
    setLoading(true);
    setActivePageKey(key);
  };

  // ================= SECTION ACTIONS =================
  const handleOpenAddSection = () => {
    setCurrentSection({
      page_key: activePageKey,
      section_key: `sec-${Date.now().toString().slice(-6)}`,
      section_type: "text-image",
      title: "",
      subtitle: "",
      badge: "",
      content: "",
      button_text: "",
      button_url: "",
      secondary_button_text: "",
      secondary_button_url: "",
      image_url: "",
      image_alt: "",
      background_style: "default",
      background_color: "",
      text_align: "left",
      is_visible: true,
      display_order: sections.length + 1,
      status: "draft",
    });
    setIsEditingSection(false);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: PageSectionItem) => {
    setCurrentSection({ ...sec });
    setIsEditingSection(true);
    setIsSectionModalOpen(true);
  };

  const handleSaveSectionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSection.title) {
      showFeedback("Section title is required.", "error");
      return;
    }
    setSavingSection(true);

    try {
      const res = await fetch("/api/admin/pages", {
        method: isEditingSection ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "section",
          ...currentSection,
          page_key: activePageKey,
        }),
      });
      const data = await res.json();
      if (data.success || data.section) {
        showFeedback(isEditingSection ? "Section updated (Draft saved)!" : "New section added!");
        setHasUnpublishedDraft(true);
        setIsSectionModalOpen(false);
        loadActivePageContent(activePageKey);
      } else {
        showFeedback(data.error || "Failed to save section", "error");
      }
    } catch {
      showFeedback("Network error saving section", "error");
    } finally {
      setSavingSection(false);
    }
  };

  const handleToggleSectionVisibility = async (sec: PageSectionItem) => {
    const updated = !sec.is_visible;
    setSections((prev) => prev.map((s) => (s.id === sec.id ? { ...s, is_visible: updated } : s)));
    try {
      await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "section", id: sec.id, is_visible: updated, page_key: activePageKey }),
      });
      showFeedback(`Section is now ${updated ? "Visible" : "Hidden"}`);
      setHasUnpublishedDraft(true);
    } catch {
      showFeedback("Failed to update visibility", "error");
    }
  };

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const orderedIds = newSections.map((s) => s.id);
    setSections(newSections);

    try {
      const res = await fetch("/api/admin/pages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: activePageKey, ordered_ids: orderedIds }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback("Section order updated!");
        setHasUnpublishedDraft(true);
      }
    } catch {
      showFeedback("Failed to reorder sections", "error");
    }
  };

  const handleDeleteSectionConfirmed = async () => {
    if (!deleteConfirmation || deleteConfirmation.type !== "section") return;
    try {
      const res = await fetch(`/api/admin/pages?id=${deleteConfirmation.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showFeedback("Section removed successfully!");
        setDeleteConfirmation(null);
        loadActivePageContent(activePageKey);
      } else {
        showFeedback(data.error || "Failed to delete section", "error");
      }
    } catch {
      showFeedback("Error deleting section", "error");
    }
  };

  // ================= PAGE SETTINGS & PUBLISHING =================
  const handleSavePageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePageMeta) return;

    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "page",
          ...activePageMeta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback("Page settings & SEO saved!");
        loadPages();
      } else {
        showFeedback(data.error || "Failed to update page settings", "error");
      }
    } catch {
      showFeedback("Error updating page settings", "error");
    }
  };

  const handlePublishPage = async () => {
    try {
      const res = await fetch("/api/admin/pages/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: activePageKey }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback("Page changes PUBLISHED LIVE to public website!", "success");
        setHasUnpublishedDraft(false);
        loadPages();
        loadActivePageContent(activePageKey);
      } else {
        showFeedback(data.error || "Failed to publish page", "error");
      }
    } catch {
      showFeedback("Network error publishing page", "error");
    }
  };

  const handleUnpublishPage = async () => {
    if (activePageKey === "home") {
      showFeedback("Home page cannot be unpublished.", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/pages/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: activePageKey, unpublish: true }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback("Page unpublished safely. Hidden from public.", "success");
        loadPages();
        loadActivePageContent(activePageKey);
      }
    } catch {
      showFeedback("Error unpublishing page", "error");
    }
  };

  // ================= NEW PAGE & DUPLICATE =================
  const handleCreateNewPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "page",
          ...newPageData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`New page "${newPageData.title}" created!`);
        setIsNewPageModalOpen(false);
        await loadPages();
        setActivePageKey(newPageData.page_key);
      } else {
        showFeedback(data.error || "Failed to create page", "error");
      }
    } catch {
      showFeedback("Network error creating page", "error");
    }
  };

  const handleDuplicatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/pages/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKey: activePageKey,
          ...duplicateData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Page duplicated into "${duplicateData.newTitle}"!`);
        setIsDuplicateModalOpen(false);
        await loadPages();
        setActivePageKey(duplicateData.newKey);
      } else {
        showFeedback(data.error || "Failed to duplicate page", "error");
      }
    } catch {
      showFeedback("Network error duplicating page", "error");
    }
  };

  // ================= MEDIA PICKER HANDLER =================
  const handleSelectMedia = (img: SiteImage) => {
    if (mediaTargetField === "seo_og_image") {
      if (activePageMeta) {
        setActivePageMeta({ ...activePageMeta, seo_og_image: img.image_url });
      }
    } else {
      setCurrentSection((prev) => ({
        ...prev,
        [mediaTargetField]: img.image_url,
        image_alt: prev.image_alt || img.alt_text || img.title,
      }));
    }
    setIsMediaPickerOpen(false);
  };

  const filteredMedia = availableImages.filter((img) => {
    if (!mediaQuery) return true;
    const q = mediaQuery.toLowerCase();
    return (
      img.title.toLowerCase().includes(q) ||
      img.category.toLowerCase().includes(q) ||
      img.destination.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#232F3E]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0C5A70]/30 border border-[#0C5A70] flex items-center justify-center text-[#4EB5D1]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-serif flex items-center gap-2">
                <span>Website Pages & Live Layout Builder</span>
                {hasUnpublishedDraft && (
                  <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Draft Changes Pending
                  </span>
                )}
              </h1>
              <p className="text-xs text-[#8E9CA6] mt-0.5">
                Manage, edit, reorder, preview and publish content across every public website page.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activePageMeta && (
            <a
              href={activePageMeta.slug}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#141C24] text-[#4EB5D1] border border-[#232F3E] hover:border-[#0C5A70] hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Page ({activePageMeta.slug})</span>
            </a>
          )}

          <button
            onClick={() => {
              setDuplicateData({
                newTitle: `${activePageMeta?.title || "Page"} (Copy)`,
                newSlug: `${activePageMeta?.slug || "/page"}-copy`,
                newKey: `${activePageKey}-copy`,
              });
              setIsDuplicateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#141C24] text-[#8E9CA6] border border-[#232F3E] hover:text-white hover:border-[#38485B] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate Page</span>
          </button>

          <button
            onClick={() => setIsNewPageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1E293B] text-white border border-[#334155] hover:bg-[#334155] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Page</span>
          </button>

          <button
            onClick={handlePublishPage}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white shadow-lg transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-3.5 text-xs font-semibold rounded-xl border animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. All 13 Public Pages Navigation Pill Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#8E9CA6]">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#4EB5D1]">
            Select Page to Edit ({pages.length} Pages Audited):
          </span>
          <span className="text-[11px]">Click any page to switch layout editor</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {pages.map((p) => {
            const isActive = activePageKey === p.page_key;
            return (
              <button
                key={p.page_key}
                onClick={() => handleSelectPage(p.page_key)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? "bg-[#0C5A70] text-white border-[#0C5A70] shadow-md"
                    : "bg-[#141C24] text-[#8E9CA6] border-[#232F3E] hover:text-white hover:border-[#38485B]"
                }`}
              >
                <span>{p.title}</span>
                {p.is_template ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Template
                  </span>
                ) : !p.is_published ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Draft
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-Navigation (Sections Visual Editor vs Page SEO & Settings) */}
      <div className="flex items-center justify-between border-b border-[#232F3E] pt-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("sections")}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-2 relative ${
              activeTab === "sections" ? "text-[#4EB5D1]" : "text-[#8E9CA6] hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sections & Visual Layout ({sections.length})</span>
            {activeTab === "sections" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EB5D1] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-2 relative ${
              activeTab === "settings" ? "text-[#4EB5D1]" : "text-[#8E9CA6] hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Page SEO, Slug & Navigation</span>
            {activeTab === "settings" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EB5D1] rounded-full" />
            )}
          </button>
        </div>

        {activeTab === "sections" && (
          <div className="flex items-center gap-3 pb-3">
            {/* View Mode controls */}
            <div className="flex items-center bg-[#141C24] p-1 rounded-lg border border-[#232F3E]">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                  previewDevice === "desktop" ? "bg-[#0C5A70] text-white" : "text-[#8E9CA6] hover:text-white"
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                  previewDevice === "mobile" ? "bg-[#0C5A70] text-white" : "text-[#8E9CA6] hover:text-white"
                }`}
                title="Mobile Phone View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                showLivePreview
                  ? "bg-[#0C5A70]/20 text-[#4EB5D1] border-[#0C5A70]"
                  : "bg-[#141C24] text-[#8E9CA6] border-[#232F3E] hover:text-white"
              }`}
            >
              {showLivePreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>
        )}
      </div>

      {/* 4. Tab 1: SECTIONS & VISUAL LAYOUT BUILDER */}
      {activeTab === "sections" && (
        <div className={`grid gap-6 ${showLivePreview ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
          {/* Left Column: Sections List & Controls */}
          <div className={showLivePreview ? "lg:col-span-6 space-y-4" : "space-y-4 max-w-4xl mx-auto"}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Sections on {activePageMeta?.title}
                </h3>
                <p className="text-[11px] text-[#8E9CA6]">
                  Reorder using arrows. Edit content, backgrounds, or photos.
                </p>
              </div>

              <button
                onClick={handleOpenAddSection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white shadow transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-[#8E9CA6] bg-[#141C24] rounded-2xl border border-[#232F3E]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0C5A70] mb-2" />
                <span className="text-xs">Loading page sections...</span>
              </div>
            ) : sections.length === 0 ? (
              <div className="py-16 text-center bg-[#141C24] rounded-2xl border border-[#232F3E] p-6 space-y-3">
                <Layers className="w-10 h-10 text-[#5B6770] mx-auto" />
                <h4 className="text-sm font-semibold text-white">No sections added yet</h4>
                <p className="text-xs text-[#8E9CA6] max-w-xs mx-auto">
                  Click &quot;Add Section&quot; to build this page&apos;s layout with headings, photos, or cards.
                </p>
                <button
                  onClick={handleOpenAddSection}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0C5A70] text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Section</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((sec, idx) => {
                  const typeMeta = SECTION_TYPE_LABELS[sec.section_type || "hero"] || SECTION_TYPE_LABELS.hero;
                  return (
                    <div
                      key={sec.id}
                      className={`bg-[#141C24] rounded-xl border p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        sec.is_visible
                          ? "border-[#232F3E] hover:border-[#38485B]"
                          : "border-[#232F3E]/40 opacity-60 bg-[#0C1015]"
                      }`}
                    >
                      {/* Section Info & Drag/Up-Down Controls */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Order Number & Reorder arrows */}
                        <div className="flex flex-col items-center bg-[#0C1015] rounded-lg p-1 border border-[#232F3E] shrink-0">
                          <button
                            onClick={() => handleMoveSection(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-[#8E9CA6] hover:text-white disabled:opacity-20 transition-colors"
                            title="Move section up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-mono font-bold text-[#4EB5D1] leading-none my-0.5">
                            {idx + 1}
                          </span>
                          <button
                            onClick={() => handleMoveSection(idx, "down")}
                            disabled={idx === sections.length - 1}
                            className="p-1 text-[#8E9CA6] hover:text-white disabled:opacity-20 transition-colors"
                            title="Move section down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Thumbnail if present */}
                        {sec.image_url ? (
                          <div className="relative w-14 h-12 rounded-lg bg-[#0C1015] border border-[#232F3E] overflow-hidden shrink-0">
                            <Image
                              src={sec.image_url}
                              alt={sec.title || "Section thumbnail"}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#0C1015] border border-[#232F3E] flex items-center justify-center text-lg shrink-0">
                            {typeMeta.icon}
                          </div>
                        )}

                        {/* Title & Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="px-2 py-0.5 text-[9px] font-semibold rounded bg-[#0C5A70]/30 text-[#4EB5D1]">
                              {typeMeta.label}
                            </span>
                            <span className="text-[10px] font-mono text-[#8E9CA6]">
                              [{sec.section_key}]
                            </span>
                            {!sec.is_visible && (
                              <span className="text-[9px] px-1.5 rounded bg-red-500/20 text-red-300">
                                Hidden
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">
                            {sec.title || "(Untitled Section)"}
                          </h4>
                          {sec.subtitle && (
                            <p className="text-[11px] text-[#8E9CA6] truncate">{sec.subtitle}</p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleToggleSectionVisibility(sec)}
                          className={`p-1.5 rounded-lg text-xs border transition-colors ${
                            sec.is_visible
                              ? "bg-[#0C1015] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              : "bg-[#0C1015] text-[#8E9CA6] border-[#232F3E] hover:text-white"
                          }`}
                          title={sec.is_visible ? "Visible. Click to hide." : "Hidden. Click to show."}
                        >
                          {sec.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenEditSection(sec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#232F3E] hover:bg-[#2F3E50] text-white transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeleteConfirmation({ type: "section", id: sec.id, name: sec.title })}
                          className="p-1.5 rounded-lg text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Live Preview (Desktop or Mobile Phone Frame) */}
          {showLivePreview && (
            <div className="lg:col-span-6 bg-[#0C1015] rounded-2xl border border-[#232F3E] p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#232F3E] mb-4 text-xs">
                <div className="flex items-center gap-2 text-[#4EB5D1] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Preview Mode — {previewDevice === "mobile" ? "Mobile Phone (375px)" : "Desktop"}</span>
                </div>
                <span className="text-[10px] text-[#8E9CA6]">Renders active layout sections</span>
              </div>

              {/* The Preview Viewport */}
              <div className="flex-1 flex justify-center items-start overflow-y-auto max-h-[750px] p-2 bg-[#080B0E] rounded-xl border border-[#1A232E]">
                {previewDevice === "mobile" ? (
                  /* Phone Frame (375px width) */
                  <div className="w-[375px] bg-[#FBF9F4] text-[#17202A] rounded-[40px] shadow-2xl border-[10px] border-[#2A3441] overflow-hidden flex flex-col my-2">
                    {/* Phone Notch */}
                    <div className="bg-[#2A3441] h-6 w-full flex items-center justify-center relative">
                      <div className="w-24 h-3.5 bg-[#141C24] rounded-full" />
                    </div>

                    {/* Mock Mobile Header */}
                    <div className="bg-[#FBF9F4] px-4 py-3 border-b border-[#E8E2D2] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#0C5A70] text-white text-[9px] font-bold flex items-center justify-center">
                          MT
                        </div>
                        <span className="text-xs font-extrabold text-[#17202A]">MANJU TOURS</span>
                      </div>
                      <span className="text-[10px] text-[#0C5A70] font-bold">MENU</span>
                    </div>

                    {/* Scrollable Page Sections */}
                    <div className="p-3 space-y-4 max-h-[600px] overflow-y-auto">
                      {sections.filter((s) => s.is_visible).map((sec) => (
                        <div
                          key={sec.id}
                          className={`rounded-2xl p-4 shadow-xs border ${
                            sec.background_style === "ocean"
                              ? "bg-[#0C5A70] text-white border-[#083B4A]"
                              : sec.background_style === "sand"
                              ? "bg-[#F4EFE6] text-[#17202A] border-[#E8E2D2]"
                              : "bg-white text-[#17202A] border-[#E8E2D2]"
                          }`}
                        >
                          {sec.badge && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E06D53] text-white mb-1.5">
                              {sec.badge}
                            </span>
                          )}
                          <h4 className="text-sm font-extrabold leading-snug">{sec.title}</h4>
                          {sec.subtitle && (
                            <p className="text-[11px] opacity-80 mt-1 leading-snug">{sec.subtitle}</p>
                          )}
                          {sec.image_url && (
                            <div className="relative h-28 w-full rounded-xl overflow-hidden my-2.5 bg-black/10">
                              <Image src={sec.image_url} alt={sec.title} fill className="object-cover" />
                            </div>
                          )}
                          {sec.content && (
                            <p className="text-[10px] opacity-75 mt-1 line-clamp-3 leading-relaxed">
                              {sec.content}
                            </p>
                          )}
                          {sec.button_text && (
                            <div className="mt-2.5">
                              <span className="inline-block text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#E06D53] text-white shadow-xs">
                                {sec.button_text}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mock Mobile Bottom Nav */}
                    <div className="bg-white border-t border-[#E8E2D2] p-2 flex justify-around text-[9px] text-[#5B6770] font-bold">
                      <span>Tours</span>
                      <span>WhatsApp</span>
                      <span>Plan Trip</span>
                    </div>
                  </div>
                ) : (
                  /* Desktop Preview Container */
                  <div className="w-full bg-[#FBF9F4] text-[#17202A] rounded-xl overflow-hidden shadow-xl border border-[#E8E2D2]">
                    {/* Mock Desktop Browser Chrome */}
                    <div className="bg-[#E8E2D2]/60 px-4 py-2 border-b border-[#E8E2D2] flex items-center gap-2 text-xs text-[#5B6770]">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="font-mono text-[11px] ml-2 text-[#17202A]">
                        https://manjutourslanka.com{activePageMeta?.slug}
                      </span>
                    </div>

                    {/* Desktop Sections */}
                    <div className="p-6 space-y-6 max-h-[660px] overflow-y-auto">
                      {sections.filter((s) => s.is_visible).map((sec) => (
                        <section
                          key={sec.id}
                          className={`rounded-2xl p-6 border transition-all ${
                            sec.background_style === "ocean"
                              ? "bg-[#0C5A70] text-white border-[#083B4A]"
                              : sec.background_style === "sand"
                              ? "bg-[#F4EFE6] text-[#17202A] border-[#E8E2D2]"
                              : "bg-white text-[#17202A] border-[#E8E2D2]"
                          }`}
                        >
                          <div className={`space-y-2 ${sec.text_align === "center" ? "text-center" : ""}`}>
                            {sec.badge && (
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E06D53] text-white">
                                {sec.badge}
                              </span>
                            )}
                            <h3 className="text-xl font-extrabold tracking-tight">{sec.title}</h3>
                            {sec.subtitle && (
                              <p className="text-xs opacity-80 max-w-xl mx-auto">{sec.subtitle}</p>
                            )}

                            {sec.image_url && (
                              <div className="relative h-44 w-full rounded-xl overflow-hidden my-3 bg-black/10">
                                <Image src={sec.image_url} alt={sec.title} fill className="object-cover" />
                              </div>
                            )}

                            {sec.content && (
                              <p className="text-xs opacity-75 max-w-2xl leading-relaxed mt-2">
                                {sec.content}
                              </p>
                            )}

                            {(sec.button_text || sec.secondary_button_text) && (
                              <div className="pt-2 flex items-center gap-2">
                                {sec.button_text && (
                                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#E06D53] text-white shadow-xs">
                                    {sec.button_text}
                                  </span>
                                )}
                                {sec.secondary_button_text && (
                                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#2B5829] text-white">
                                    {sec.secondary_button_text}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: PAGE SETTINGS, SEO & NAVIGATION ASSIGNMENT */}
      {activeTab === "settings" && activePageMeta && (
        <div className="bg-[#141C24] rounded-2xl border border-[#232F3E] p-6 max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#232F3E]">
            <div>
              <h3 className="text-base font-bold text-white font-serif">
                Page Metadata, SEO & Navigation Links
              </h3>
              <p className="text-xs text-[#8E9CA6] mt-0.5">
                Configure URL slug, navigation menus, social share banners and search metadata.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activePageMeta.page_key !== "home" && (
                <button
                  type="button"
                  onClick={activePageMeta.is_published ? handleUnpublishPage : handlePublishPage}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                    activePageMeta.is_published
                      ? "border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                      : "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                  }`}
                >
                  {activePageMeta.is_published ? "Unpublish Page" : "Publish Page"}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSavePageSettings} className="space-y-5 text-xs">
            {/* Row 1: Page Title & URL Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Page Title</label>
                <input
                  type="text"
                  value={activePageMeta.title}
                  onChange={(e) => setActivePageMeta({ ...activePageMeta, title: e.target.value })}
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                  required
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">URL Slug (Route Path)</label>
                <input
                  type="text"
                  value={activePageMeta.slug}
                  disabled={activePageMeta.page_key === "home"}
                  onChange={(e) => setActivePageMeta({ ...activePageMeta, slug: e.target.value })}
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white disabled:opacity-50 focus:outline-none focus:border-[#0C5A70]"
                  required
                />
              </div>
            </div>

            {/* Row 2: Navigation Label & Menu Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Navigation Menu Label</label>
                <input
                  type="text"
                  value={activePageMeta.navigation_label || ""}
                  onChange={(e) => setActivePageMeta({ ...activePageMeta, navigation_label: e.target.value })}
                  placeholder="e.g. About Manju, Tours"
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Assigned Menu Location</label>
                <select
                  value={activePageMeta.nav_location || "none"}
                  onChange={(e) =>
                    setActivePageMeta({
                      ...activePageMeta,
                      nav_location: e.target.value as "header" | "footer_quick_links" | "footer_legal" | "none",
                    })
                  }
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                >
                  <option value="none">None (Direct Link Only)</option>
                  <option value="header">Main Header Navigation Menu</option>
                  <option value="footer_quick_links">Footer Quick Links Column</option>
                  <option value="footer_legal">Footer Legal & Policies</option>
                </select>
              </div>
            </div>

            {/* Row 3: SEO Meta Title */}
            <div>
              <label className="text-[#8E9CA6] block mb-1 font-semibold">
                SEO Meta Title (Browser Tab & Google Search Result)
              </label>
              <input
                type="text"
                value={activePageMeta.seo_title || ""}
                onChange={(e) => setActivePageMeta({ ...activePageMeta, seo_title: e.target.value })}
                placeholder="e.g. Handcrafted Private Tours in Sri Lanka | Manju Tours Lanka"
                className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
              />
            </div>

            {/* Row 4: SEO Meta Description */}
            <div>
              <label className="text-[#8E9CA6] block mb-1 font-semibold">
                SEO Meta Description (150–160 chars recommended)
              </label>
              <textarea
                rows={3}
                value={activePageMeta.seo_description || ""}
                onChange={(e) => setActivePageMeta({ ...activePageMeta, seo_description: e.target.value })}
                placeholder="Brief summary of this page for search results and social snippets..."
                className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
              />
            </div>

            {/* Row 5: Social Sharing Image (OG Image) with Media Library Picker */}
            <div>
              <label className="text-[#8E9CA6] block mb-1 font-semibold">
                Social Sharing Banner Image (og:image)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={activePageMeta.seo_og_image || ""}
                  onChange={(e) => setActivePageMeta({ ...activePageMeta, seo_og_image: e.target.value })}
                  placeholder="/images/hero.webp"
                  className="flex-1 bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaTargetField("seo_og_image");
                    setIsMediaPickerOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-[#232F3E] hover:bg-[#2F3E50] text-[#4EB5D1] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </button>
              </div>
            </div>

            {/* Dynamic Template Notice */}
            {activePageMeta.is_template && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Shared Dynamic Layout Template</span>
                  <span className="text-[11px] opacity-80">
                    This template controls the layout structure for all matching individual items.
                    To modify individual records, please visit their dedicated manager:
                    {activePageMeta.page_key.includes("tour") && (
                      <Link href="/admin/packages" className="underline ml-1 font-bold text-white">
                        Tour Packages CMS
                      </Link>
                    )}
                    {activePageMeta.page_key.includes("dest") && (
                      <Link href="/admin/destinations" className="underline ml-1 font-bold text-white">
                        Destinations CMS
                      </Link>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white shadow transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Page Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SECTION ================= */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#232F3E]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0C5A70]/30 text-[#4EB5D1] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white font-serif">
                  {isEditingSection ? `Edit Section: ${currentSection.title || currentSection.section_key}` : "Add New Page Section"}
                </h3>
              </div>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8E9CA6] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSectionForm} className="space-y-4 text-xs">
              {/* Section Type Selector */}
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Section Type</label>
                <select
                  value={currentSection.section_type || "hero"}
                  onChange={(e) => setCurrentSection({ ...currentSection, section_type: e.target.value as SectionType })}
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                >
                  {Object.entries(SECTION_TYPE_LABELS).map(([val, info]) => (
                    <option key={val} value={val}>
                      {info.icon} {info.label} — {info.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Section Heading / Title</label>
                  <input
                    type="text"
                    value={currentSection.title || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, title: e.target.value })}
                    placeholder="e.g. Signature Chauffeured Tour Packages"
                    className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Top Badge (Optional)</label>
                  <input
                    type="text"
                    value={currentSection.badge || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, badge: e.target.value })}
                    placeholder="e.g. Popular Itineraries"
                    className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={currentSection.subtitle || ""}
                  onChange={(e) => setCurrentSection({ ...currentSection, subtitle: e.target.value })}
                  placeholder="e.g. Fully escorted, flexible pacing, and transparent quotes"
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              {/* Content / Paragraph */}
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Main Body Paragraph</label>
                <textarea
                  rows={3}
                  value={currentSection.content || ""}
                  onChange={(e) => setCurrentSection({ ...currentSection, content: e.target.value })}
                  placeholder="Descriptive copy for this section..."
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              {/* Primary Image & Media Library Picker */}
              <div className="space-y-1">
                <label className="text-[#8E9CA6] block mb-1 font-semibold">
                  Section Image (Hero, Background or Feature Photo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSection.image_url || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, image_url: e.target.value })}
                    placeholder="/images/hero.webp"
                    className="flex-1 bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTargetField("image_url");
                      setIsMediaPickerOpen(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-[#232F3E] hover:bg-[#2F3E50] text-[#4EB5D1] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Browse Media Library</span>
                  </button>
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    value={currentSection.image_alt || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, image_alt: e.target.value })}
                    placeholder="Image Alt Text (for accessibility & SEO)"
                    className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-1.5 text-white text-[11px] focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>
              </div>

              {/* Buttons Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#0C1015] border border-[#232F3E]">
                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Primary Button Text</label>
                  <input
                    type="text"
                    value={currentSection.button_text || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, button_text: e.target.value })}
                    placeholder="e.g. Explore Signature Tours"
                    className="w-full bg-[#141C24] border border-[#232F3E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Primary Button Link URL</label>
                  <input
                    type="text"
                    value={currentSection.button_url || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, button_url: e.target.value })}
                    placeholder="/tours or https://wa.me/..."
                    className="w-full bg-[#141C24] border border-[#232F3E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Secondary Button Text (Optional)</label>
                  <input
                    type="text"
                    value={currentSection.secondary_button_text || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, secondary_button_text: e.target.value })}
                    placeholder="e.g. Plan Custom Trip"
                    className="w-full bg-[#141C24] border border-[#232F3E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Secondary Button Link URL</label>
                  <input
                    type="text"
                    value={currentSection.secondary_button_url || ""}
                    onChange={(e) => setCurrentSection({ ...currentSection, secondary_button_url: e.target.value })}
                    placeholder="/custom-tour"
                    className="w-full bg-[#141C24] border border-[#232F3E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>
              </div>

              {/* Background Style & Text Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Background Theme</label>
                  <select
                    value={currentSection.background_style || "default"}
                    onChange={(e) =>
                      setCurrentSection({
                        ...currentSection,
                        background_style: e.target.value as "default" | "sand" | "ocean" | "white" | "dark" | "image",
                      })
                    }
                    className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                  >
                    <option value="default">Default Sand (#FBF9F4)</option>
                    <option value="white">Pure White (#FFFFFF)</option>
                    <option value="ocean">Ocean Teal (#0C5A70, Dark)</option>
                    <option value="sand">Warm Sand Tint (#F4EFE6)</option>
                    <option value="dark">Dark Slate (#17202A)</option>
                    <option value="image">Background Image</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Text Alignment</label>
                  <select
                    value={currentSection.text_align || "left"}
                    onChange={(e) =>
                      setCurrentSection({
                        ...currentSection,
                        text_align: e.target.value as "left" | "center" | "right",
                      })
                    }
                    className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0C5A70]"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#232F3E]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="section-visible"
                    checked={currentSection.is_visible ?? true}
                    onChange={(e) => setCurrentSection({ ...currentSection, is_visible: e.target.checked })}
                    className="rounded bg-[#0C1015] border-[#232F3E]"
                  />
                  <label htmlFor="section-visible" className="text-white cursor-pointer select-none">
                    Visible on live website
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="px-3 py-2 rounded-lg text-[#8E9CA6] hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingSection}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white font-bold transition-colors disabled:opacity-50"
                  >
                    {savingSection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Section</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CENTRAL MEDIA LIBRARY PICKER ================= */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#232F3E]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#4EB5D1]" />
                <h3 className="text-base font-bold text-white font-serif">
                  Select Photo from Central Media Library
                </h3>
              </div>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-1 rounded-lg text-[#8E9CA6] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8E9CA6] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search photos by destination, title or category (e.g. Sigiriya, Ella, beach, safari)..."
                value={mediaQuery}
                onChange={(e) => setMediaQuery(e.target.value)}
                className="w-full bg-[#0C1015] border border-[#232F3E] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#0C5A70]"
              />
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {filteredMedia.map((img) => (
                <div
                  key={img.id}
                  onClick={() => handleSelectMedia(img)}
                  className="group bg-[#0C1015] border border-[#232F3E] hover:border-[#0C5A70] rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] flex flex-col"
                >
                  <div className="relative h-28 w-full bg-black/20">
                    <Image src={img.image_url} alt={img.title} fill sizes="200px" className="object-cover" />
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] text-[#4EB5D1] font-mono block uppercase">
                      {img.category}
                    </span>
                    <h5 className="text-xs font-bold text-white truncate group-hover:text-[#4EB5D1]">
                      {img.title}
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW PAGE ================= */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-serif">Create New Website Page</h3>
            <form onSubmit={handleCreateNewPage} className="space-y-3 text-xs">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Page Title</label>
                <input
                  type="text"
                  value={newPageData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = `/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                    setNewPageData({
                      ...newPageData,
                      title,
                      slug,
                      page_key: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      navigation_label: title,
                    });
                  }}
                  placeholder="e.g. Island Wildlife Safaris"
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">URL Route Slug</label>
                <input
                  type="text"
                  value={newPageData.slug}
                  onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value })}
                  placeholder="/wildlife-safaris"
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Navigation Menu Label</label>
                <input
                  type="text"
                  value={newPageData.navigation_label}
                  onChange={(e) => setNewPageData({ ...newPageData, navigation_label: e.target.value })}
                  placeholder="e.g. Wildlife"
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewPageModalOpen(false)}
                  className="px-3 py-2 text-[#8E9CA6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0C5A70] text-white font-bold rounded-lg shadow"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DUPLICATE PAGE ================= */}
      {isDuplicateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-serif">
              Duplicate Page: {activePageMeta?.title}
            </h3>
            <p className="text-xs text-[#8E9CA6]">
              Creates a new draft page duplicating all existing sections and styling.
            </p>
            <form onSubmit={handleDuplicatePage} className="space-y-3 text-xs">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">New Page Title</label>
                <input
                  type="text"
                  value={duplicateData.newTitle}
                  onChange={(e) => setDuplicateData({ ...duplicateData, newTitle: e.target.value })}
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">New Route Slug</label>
                <input
                  type="text"
                  value={duplicateData.newSlug}
                  onChange={(e) => setDuplicateData({ ...duplicateData, newSlug: e.target.value })}
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">New Page Key</label>
                <input
                  type="text"
                  value={duplicateData.newKey}
                  onChange={(e) => setDuplicateData({ ...duplicateData, newKey: e.target.value })}
                  className="w-full bg-[#0C1015] border border-[#232F3E] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="px-3 py-2 text-[#8E9CA6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0C5A70] text-white font-bold rounded-lg shadow"
                >
                  Confirm Duplicate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-white">Confirm Removal</h4>
              <p className="text-xs text-[#8E9CA6]">
                Are you sure you want to delete &quot;{deleteConfirmation.name}&quot;? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#8E9CA6] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSectionConfirmed}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
