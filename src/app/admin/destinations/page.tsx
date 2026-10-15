"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Star,
  Check,
  ExternalLink,
  RefreshCw,
  EyeOff,
  Clock,
  Calendar,
} from "lucide-react";
import type { SiteImage, DestinationItem } from "@/types/database.types";
import { formatDestination, type FormattedDestination } from "@/lib/queries/destinations";

const REGIONS = [
  "Cultural Triangle",
  "Central Highlands",
  "South Coast",
  "East Coast",
  "Southern Wilderness",
  "West Coast",
];

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<FormattedDestination[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Edit / Add Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Partial<DestinationItem> | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "media" | "highlights" | "seo">("info");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete Confirmation
  const [deleteConfirmDest, setDeleteConfirmDest] = useState<FormattedDestination | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Image Picker
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<"hero" | "gallery">("hero");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [destRes, imgRes] = await Promise.all([
        fetch("/api/admin/destinations"),
        fetch("/api/admin/photos"),
      ]);
      const destData = await destRes.json();
      const imgData = await imgRes.json();

      if (destData.destinations) {
        setDestinations(destData.destinations.map((d: DestinationItem) => formatDestination(d)));
      }
      if (imgData.photos) {
        setSiteImages(imgData.photos);
      }
    } catch (err) {
      console.error("Failed fetching destinations:", err);
      showToast("Failed to load destinations", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetch("/api/admin/destinations"), fetch("/api/admin/photos")])
      .then(async ([destRes, imgRes]) => {
        const destData = await destRes.json();
        const imgData = await imgRes.json();
        if (isMounted) {
          if (destData.destinations) {
            setDestinations(destData.destinations.map((d: DestinationItem) => formatDestination(d)));
          }
          if (imgData.photos) {
            setSiteImages(imgData.photos);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed fetching destinations:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDestinations = useMemo(() => {
    let result = [...destinations];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.slug.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.summary.toLowerCase().includes(q)
      );
    }
    if (selectedRegion !== "all") {
      result = result.filter((d) => d.region === selectedRegion);
    }
    if (selectedStatus === "published") {
      result = result.filter((d) => d.isPublished);
    } else if (selectedStatus === "draft") {
      result = result.filter((d) => !d.isPublished);
    }
    return result.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [destinations, searchTerm, selectedRegion, selectedStatus]);

  const handleTogglePublish = async (dest: FormattedDestination) => {
    try {
      const newStatus = !dest.isPublished;
      const res = await fetch("/api/admin/destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dest, is_published: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setDestinations((prev) =>
        prev.map((d) => (d.id === dest.id ? { ...d, isPublished: newStatus } : d))
      );
      showToast(`"${dest.name}" is now ${newStatus ? "Published" : "Draft"}.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  const handleToggleFeatured = async (dest: FormattedDestination) => {
    try {
      const newFeatured = !dest.isFeatured;
      const res = await fetch("/api/admin/destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dest, is_featured: newFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update featured status");

      setDestinations((prev) =>
        prev.map((d) => (d.id === dest.id ? { ...d, isFeatured: newFeatured } : d))
      );
      showToast(`"${dest.name}" ${newFeatured ? "featured on homepage" : "unfeatured"}.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  const handleOpenAdd = () => {
    setEditingDest({
      name: "",
      slug: "",
      tagline: "",
      region: "Cultural Triangle",
      summary: "",
      content: "",
      hero_image: "/images/destinations/sigiriya/hero.webp",
      gallery_images: [],
      highlights: [
        "UNESCO World Heritage Site exploration",
        "Panoramic sunrise viewpoint vistas",
        "Authentic local village food experiences",
      ],
      best_time_to_visit: "December to April",
      ideal_duration: "2 - 3 Days",
      travel_tips: "Start excursions pre-dawn to beat crowds and tropical heat.",
      display_order: destinations.length + 1,
      is_featured: false,
      is_published: true,
      seo_title: "",
      seo_description: "",
    });
    setActiveTab("info");
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (dest: FormattedDestination) => {
    setEditingDest({
      id: dest.id,
      name: dest.name,
      slug: dest.slug,
      tagline: dest.tagline,
      region: dest.region,
      summary: dest.summary,
      content: dest.content,
      hero_image: dest.heroImage.src,
      hero_image_metadata: dest.heroImage,
      gallery_images: dest.galleryImages,
      highlights: dest.highlights,
      best_time_to_visit: dest.bestTimeToVisit,
      ideal_duration: dest.idealDuration,
      travel_tips: dest.travelTips,
      latitude: dest.latitude ?? 0,
      longitude: dest.longitude ?? 0,
      display_order: dest.displayOrder,
      is_featured: dest.isFeatured,
      is_published: dest.isPublished,
      seo_title: dest.seoTitle,
      seo_description: dest.seoDescription,
    });
    setActiveTab("info");
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDest) return;
    if (!editingDest.name?.trim()) {
      setFormError("Destination name is required.");
      return;
    }

    setFormSaving(true);
    setFormError("");

    try {
      const isUpdating = Boolean(editingDest.id && !editingDest.id.startsWith("dest-new-"));
      const method = isUpdating ? "PUT" : "POST";

      const res = await fetch("/api/admin/destinations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDest),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save destination");

      showToast(`Destination "${editingDest.name}" saved successfully!`);
      setModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmDest) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/destinations?id=${encodeURIComponent(deleteConfirmDest.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete destination");

      showToast(data.message || `Destination "${deleteConfirmDest.name}" deleted.`);
      setDeleteConfirmDest(null);
      await fetchData();
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingDest) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `${editingDest.name || "Destination"} Photo`);
      formData.append("page_key", "destinations");
      formData.append("section_key", editingDest.slug || "hero");
      formData.append("category", "destination");
      formData.append("destination", editingDest.slug || "");
      formData.append("is_active", "true");

      const res = await fetch("/api/admin/photos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const imgUrl = data.photo.image_url;

      if (imagePickerTarget === "hero") {
        setEditingDest((prev) => (prev ? { ...prev, hero_image: imgUrl } : null));
        showToast("Cover photo uploaded and assigned!");
      } else {
        const newGallery = [
          ...(editingDest.gallery_images || []),
          { src: imgUrl, alt: editingDest.name, caption: data.photo.title },
        ];
        setEditingDest((prev) => (prev ? { ...prev, gallery_images: newGallery } : null));
        showToast("Photo uploaded and added to gallery!");
      }
      setImagePickerOpen(false);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all ${
            toastMessage.type === "success"
              ? "bg-[#0C5A70] text-white border border-[#0C5A70]/20"
              : "bg-red-600 text-white border border-red-700"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> : <AlertCircle className="w-4 h-4 text-white" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0C5A70] to-[#083B4A] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>Destination Guides CMS</span>
            </span>
            <span className="text-xs text-[#FBF9F4]/70">• Live Database Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Destination Management
          </h1>
          <p className="text-xs sm:text-sm text-[#FBF9F4]/80 mt-1 max-w-xl">
            Manage Sri Lanka destination guides, insider chauffeur tips, photography, highlights, best visiting seasons, and travel advice without code edits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh destinations"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E06D53] hover:bg-[#C8573D] text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E2D2] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5B6770] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search destination name, region, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-medium focus:outline-none focus:border-[#0C5A70]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="py-2.5 px-3 rounded-2xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-bold text-[#17202A]"
          >
            <option value="all">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2.5 px-3 rounded-2xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-bold text-[#17202A]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-gray-100 animate-pulse border border-[#E8E2D2]" />
          ))}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D2]">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#17202A]">No destinations found</h3>
          <p className="text-xs text-[#5B6770] mt-1">Try adjusting your search query or region filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <article
              key={dest.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={dest.heroImage.src}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={dest.heroImage.src.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <button
                      onClick={() => handleTogglePublish(dest)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1 ${
                        dest.isPublished
                          ? "bg-[#2B5829]/90 text-white"
                          : "bg-gray-800/90 text-gray-200"
                      }`}
                    >
                      {dest.isPublished ? <Check className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{dest.isPublished ? "Published" : "Draft"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleFeatured(dest)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1 ${
                        dest.isFeatured
                          ? "bg-[#E06D53] text-white"
                          : "bg-black/50 text-white/80"
                      }`}
                    >
                      <Star className={`w-3 h-3 ${dest.isFeatured ? "fill-white" : ""}`} />
                      <span>{dest.isFeatured ? "Featured" : "Standard"}</span>
                    </button>
                  </div>

                  {/* Bottom Vignette Title */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-[#17202A]/70 px-2 py-0.5 rounded-full inline-block mb-1">
                      {dest.region}
                    </span>
                    <h3 className="text-xl font-extrabold text-white leading-snug drop-shadow-md">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-[#5B6770] line-clamp-2 leading-relaxed">
                    {dest.tagline || dest.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#E8E2D2]/60">
                    <div className="flex items-center gap-1 text-[#5B6770]">
                      <Calendar className="w-3 h-3 text-[#0C5A70]" />
                      <span className="truncate">{dest.bestTimeToVisit || "Year-round"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#5B6770]">
                      <Clock className="w-3 h-3 text-[#0C5A70]" />
                      <span className="truncate">{dest.idealDuration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="p-4 bg-[#FBF9F4] border-t border-[#E8E2D2] flex items-center justify-between">
                <Link
                  href={`/destinations/${dest.slug}`}
                  target="_blank"
                  className="text-xs font-bold text-[#0C5A70] hover:underline flex items-center gap-1"
                >
                  <span>View Guide</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(dest)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] flex items-center gap-1 shadow-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmDest(dest)}
                    className="p-1.5 rounded-xl text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Destination Modal */}
      {modalOpen && editingDest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E8E2D2] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-[#0C5A70] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-[#E06D53]" />
                <div>
                  <h2 className="text-lg font-extrabold">
                    {editingDest.id ? `Edit: ${editingDest.name}` : "Create New Destination"}
                  </h2>
                  <span className="text-xs text-[#FBF9F4]/80">Updates live destination guides instantly.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-[#E8E2D2] bg-[#FBF9F4] px-6 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`py-3 px-4 text-xs font-bold border-b-2 ${
                  activeTab === "info" ? "border-[#0C5A70] text-[#0C5A70]" : "border-transparent text-[#5B6770]"
                }`}
              >
                1. General Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`py-3 px-4 text-xs font-bold border-b-2 ${
                  activeTab === "media" ? "border-[#0C5A70] text-[#0C5A70]" : "border-transparent text-[#5B6770]"
                }`}
              >
                2. Cover & Gallery
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("highlights")}
                className={`py-3 px-4 text-xs font-bold border-b-2 ${
                  activeTab === "highlights" ? "border-[#0C5A70] text-[#0C5A70]" : "border-transparent text-[#5B6770]"
                }`}
              >
                3. Highlights & Tips
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`py-3 px-4 text-xs font-bold border-b-2 ${
                  activeTab === "seo" ? "border-[#0C5A70] text-[#0C5A70]" : "border-transparent text-[#5B6770]"
                }`}
              >
                4. SEO Metadata
              </button>
            </div>

            {formError && (
              <div className="m-6 mb-0 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1">
                        Destination Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingDest.name || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingDest((prev) => ({
                            ...prev,
                            name: val,
                            slug: prev?.id
                              ? prev.slug
                              : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
                          }));
                        }}
                        className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingDest.slug || ""}
                        onChange={(e) =>
                          setEditingDest((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))
                        }
                        className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1">Region</label>
                      <select
                        value={editingDest.region || "Cultural Triangle"}
                        onChange={(e) => setEditingDest((prev) => ({ ...prev, region: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs font-semibold"
                      >
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1">Recommended Duration</label>
                      <input
                        type="text"
                        value={editingDest.ideal_duration || "2 - 3 Days"}
                        onChange={(e) => setEditingDest((prev) => ({ ...prev, ideal_duration: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1">Tagline</label>
                    <input
                      type="text"
                      value={editingDest.tagline || ""}
                      onChange={(e) => setEditingDest((prev) => ({ ...prev, tagline: e.target.value }))}
                      placeholder="e.g. Ancient 5th-Century Sky Citadel & Royal Water Gardens"
                      className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1">Summary Description</label>
                    <textarea
                      rows={3}
                      value={editingDest.summary || ""}
                      onChange={(e) => setEditingDest((prev) => ({ ...prev, summary: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1">Comprehensive Travel Guide Content</label>
                    <textarea
                      rows={5}
                      value={editingDest.content || ""}
                      onChange={(e) => setEditingDest((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="Detailed history, local secrets, topography, and travel advice..."
                      className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDest.is_published ?? true}
                        onChange={(e) => setEditingDest((prev) => ({ ...prev, is_published: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#0C5A70]"
                      />
                      <span className="text-xs font-bold text-[#17202A]">Published</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDest.is_featured ?? false}
                        onChange={(e) => setEditingDest((prev) => ({ ...prev, is_featured: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#E06D53]"
                      />
                      <span className="text-xs font-bold text-[#17202A]">Featured on Homepage</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#17202A]">Cover Photo (Hero Banner)</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget("hero");
                            setImagePickerOpen(true);
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-[#0C5A70] bg-white border border-[#E8E2D2]"
                        >
                          Pick From Photos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget("hero");
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-[#E06D53]"
                        >
                          Upload New
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="relative w-36 aspect-16/10 rounded-xl overflow-hidden bg-gray-100 border border-[#E8E2D2] shrink-0">
                        {editingDest.hero_image ? (
                          <Image
                            src={editingDest.hero_image}
                            alt="Cover"
                            fill
                            className="object-cover"
                            unoptimized={editingDest.hero_image.startsWith("http")}
                          />
                        ) : null}
                      </div>
                      <input
                        type="text"
                        value={editingDest.hero_image || ""}
                        onChange={(e) => setEditingDest((prev) => ({ ...prev, hero_image: e.target.value }))}
                        className="flex-1 p-2 rounded-xl border border-[#E8E2D2] text-xs font-mono"
                        placeholder="Image URL..."
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17202A]">
                        Gallery Images ({editingDest.gallery_images?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePickerTarget("gallery");
                          setImagePickerOpen(true);
                        }}
                        className="px-3 py-1 rounded-xl text-xs font-bold text-[#0C5A70] bg-white border border-[#E8E2D2]"
                      >
                        + Add To Gallery
                      </button>
                    </div>

                    {editingDest.gallery_images && editingDest.gallery_images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {editingDest.gallery_images.map((g, idx) => (
                          <div key={idx} className="relative aspect-4/3 rounded-xl overflow-hidden group border border-[#E8E2D2]">
                            <Image
                              src={g.src}
                              alt={g.alt || "Gallery"}
                              fill
                              className="object-cover"
                              unoptimized={g.src.startsWith("http")}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(editingDest.gallery_images || [])];
                                updated.splice(idx, 1);
                                setEditingDest((prev) => ({ ...prev, gallery_images: updated }));
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#5B6770] text-center py-4">No extra gallery photos yet.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "highlights" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-[#17202A]">Key Highlights</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingDest.highlights || [];
                          setEditingDest((prev) => ({ ...prev, highlights: [...current, "New highlight"] }));
                        }}
                        className="px-3 py-1 text-xs font-bold text-[#0C5A70] bg-white border border-[#E8E2D2] rounded-xl"
                      >
                        + Add Highlight
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editingDest.highlights?.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => {
                              const updated = [...(editingDest.highlights || [])];
                              updated[i] = e.target.value;
                              setEditingDest((prev) => ({ ...prev, highlights: updated }));
                            }}
                            className="flex-1 p-2 rounded-xl border border-[#E8E2D2] text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(editingDest.highlights || [])];
                              updated.splice(i, 1);
                              setEditingDest((prev) => ({ ...prev, highlights: updated }));
                            }}
                            className="p-1 text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1">Best Time To Visit</label>
                      <input
                        type="text"
                        value={editingDest.best_time_to_visit || ""}
                        onChange={(e) => setEditingDest((prev) => ({ ...prev, best_time_to_visit: e.target.value }))}
                        placeholder="e.g. November to April (Dry season)"
                        className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1">Display Order</label>
                      <input
                        type="number"
                        value={editingDest.display_order ?? 0}
                        onChange={(e) => setEditingDest((prev) => ({ ...prev, display_order: parseInt(e.target.value, 10) || 0 }))}
                        className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1">Manju&apos;s Local Chauffeur Advice / Tips</label>
                    <textarea
                      rows={3}
                      value={editingDest.travel_tips || ""}
                      onChange={(e) => setEditingDest((prev) => ({ ...prev, travel_tips: e.target.value }))}
                      placeholder="Local tips for avoiding crowds, scenic viewpoints, or local dining..."
                      className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs"
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={editingDest.seo_title || ""}
                      onChange={(e) => setEditingDest((prev) => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="Default: [Destination Name] Travel Guide | Sri Lanka Destinations"
                      className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      value={editingDest.seo_description || ""}
                      onChange={(e) => setEditingDest((prev) => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="160 characters summary for Google search results..."
                      className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#E8E2D2] flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#5B6770] border border-[#E8E2D2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] shadow-md flex items-center gap-2"
                >
                  {formSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Destination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-[#E8E2D2] overflow-hidden">
            <div className="p-4 bg-[#0C5A70] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Pick Destination Photo</h3>
                {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              </div>
              <button onClick={() => setImagePickerOpen(false)}><X className="w-4 h-4 text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
              {siteImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    if (imagePickerTarget === "hero") {
                      setEditingDest((prev) => (prev ? { ...prev, hero_image: img.image_url } : null));
                    } else {
                      const updated = [...(editingDest?.gallery_images || []), { src: img.image_url, alt: img.title }];
                      setEditingDest((prev) => (prev ? { ...prev, gallery_images: updated } : null));
                    }
                    setImagePickerOpen(false);
                  }}
                  className="relative aspect-4/3 rounded-xl overflow-hidden border border-[#E8E2D2] hover:ring-2 hover:ring-[#0C5A70]"
                >
                  <Image src={img.image_url} alt={img.title} fill className="object-cover" unoptimized={img.image_url.startsWith("http")} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />

      {/* Delete Confirmation */}
      {deleteConfirmDest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#17202A] mb-1">Delete {deleteConfirmDest.name}?</h3>
            <p className="text-xs text-[#5B6770] mb-6">Are you sure you want to permanently delete this destination?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirmDest(null)} className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E8E2D2]">Cancel</button>
              <button onClick={handleConfirmDelete} disabled={deleteLoading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600">
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
