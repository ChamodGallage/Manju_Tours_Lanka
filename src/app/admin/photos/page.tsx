"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ZoomIn,
  MapPin,
} from "lucide-react";
import type { SiteImage } from "@/types/database.types";

const PAGE_OPTIONS = [
  { value: "all", label: "All Pages" },
  { value: "home", label: "Home Page" },
  { value: "destinations", label: "Destinations Page & Details" },
  { value: "tours", label: "Tour Packages & Itineraries" },
  { value: "experiences", label: "Island Experiences & Safaris" },
  { value: "global", label: "Global Site Media (Logo, Branding)" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "hero", label: "Hero Banner" },
  { value: "pillar", label: "Experience Pillar" },
  { value: "destination", label: "Destination Photo" },
  { value: "tour", label: "Tour Package Photo" },
  { value: "experience", label: "Activity / Safari Photo" },
  { value: "gallery", label: "Gallery Photo" },
  { value: "general", label: "General Content" },
];

const DESTINATION_OPTIONS = [
  { value: "all", label: "All Destinations" },
  { value: "sigiriya", label: "Sigiriya" },
  { value: "kandy", label: "Kandy" },
  { value: "nuwara-eliya", label: "Nuwara Eliya" },
  { value: "ella", label: "Ella" },
  { value: "hikkaduwa", label: "Hikkaduwa (Beach Base)" },
  { value: "mirissa", label: "Mirissa (Whale & Beach)" },
  { value: "haputale", label: "Haputale (Lipton's Seat)" },
  { value: "galle-fort", label: "Galle Fort (Dutch Ramparts)" },
  { value: "yala", label: "Yala National Park" },
  { value: "polonnaruwa", label: "Polonnaruwa" },
  { value: "trincomalee", label: "Trincomalee" },
  { value: "bentota", label: "Bentota" },
  { value: "colombo", label: "Colombo" },
];

const SECTION_BY_PAGE: Record<string, Array<{ value: string; label: string }>> = {
  home: [
    { value: "hero", label: "Hero Banner Slideshow" },
    { value: "pillars", label: "8 Island Travel Pillars" },
    { value: "destinations-preview", label: "Destinations Preview Cards" },
    { value: "featured-tours", label: "Featured Signature Tours" },
    { value: "experiences", label: "Curated Experiences Showcase" },
    { value: "banner", label: "Final Call to Action Banner" },
  ],
  destinations: [
    { value: "hero", label: "Destination Hero Banner" },
    { value: "gallery", label: "Destination Photo Gallery (1, 2, 3)" },
    { value: "cards", label: "Regional Directory Cards" },
  ],
  tours: [
    { value: "cards", label: "Tour Package Card Cover" },
    { value: "hero", label: "Tour Itinerary Hero Banner" },
    { value: "gallery", label: "Tour Highlights Gallery" },
  ],
  experiences: [
    { value: "hero", label: "Experience Hero Banner" },
    { value: "cards", label: "Experience Grid Card" },
  ],
  global: [
    { value: "branding", label: "Branding & Logo Emblem" },
    { value: "team", label: "Chauffeur & Fleet Photos" },
  ],
};

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryWarning, setInventoryWarning] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [pageFilter, setPageFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"order" | "title" | "newest">("order");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<SiteImage | null>(null);
  const [replacingPhoto, setReplacingPhoto] = useState<SiteImage | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<SiteImage | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<SiteImage | null>(null);

  // Form states for Add Photo
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addFilePreview, setAddFilePreview] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    alt_text: "",
    page_key: "home",
    section_key: "hero",
    category: "hero",
    destination: "sigiriya",
    display_order: 1,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replacement file state
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/admin/photos");
      const data = await res.json();
      if (data.photos) {
        setPhotos(data.photos);
      }
      setInventoryWarning(data.warning || null);
    } catch (err) {
      console.error("Failed to fetch photos:", err);
      showToast("Failed to load photos. Please check database connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/photos")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.photos) setPhotos(data.photos);
          setInventoryWarning(data.warning || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch photos:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Add File Selection & Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        showToast("File is larger than 12MB. Please choose a smaller photo.", "error");
        return;
      }
      setAddFile(file);
      setAddFilePreview(URL.createObjectURL(file));
      if (!addForm.title) {
        // Auto-suggest title from filename
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setAddForm((prev) => ({
          ...prev,
          title: cleanName,
          alt_text: `${cleanName} - Manju Tours Lanka`,
        }));
      }
    }
  };

  // Submit Add Photo
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFile) {
      showToast("Please choose an image file to upload.", "error");
      return;
    }
    if (!addForm.title.trim()) {
      showToast("Please enter a photo title.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", addFile);
      fd.append("title", addForm.title.trim());
      fd.append("description", addForm.description.trim());
      fd.append("alt_text", addForm.alt_text.trim() || addForm.title.trim());
      fd.append("page_key", addForm.page_key);
      fd.append("section_key", addForm.section_key);
      fd.append("category", addForm.category);
      fd.append("destination", addForm.destination);
      fd.append("display_order", addForm.display_order.toString());
      fd.append("is_active", addForm.is_active ? "true" : "false");

      const res = await fetch("/api/admin/photos", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      showToast("Photo uploaded and assigned successfully!");
      setIsAddModalOpen(false);
      setAddFile(null);
      setAddFilePreview(null);
      setAddForm({
        title: "",
        description: "",
        alt_text: "",
        page_key: "home",
        section_key: "hero",
        category: "hero",
        destination: "sigiriya",
        display_order: 1,
        is_active: true,
      });
      fetchPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving photo";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (photo: SiteImage) => {
    try {
      const updatedStatus = !photo.is_active;
      // Optimistic update
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_active: updatedStatus } : p))
      );

      const res = await fetch("/api/admin/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: photo.id,
          is_active: updatedStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      showToast(
        updatedStatus ? `"${photo.title}" is now visible on website.` : `"${photo.title}" is now hidden.`
      );
    } catch (err: unknown) {
      fetchPhotos(); // Revert on failure
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      showToast(msg, "error");
    }
  };

  // Submit Edit Details
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPhoto),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update photo details");
      }

      showToast("Photo details updated successfully!");
      setEditingPhoto(null);
      fetchPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating photo";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Replace File
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingPhoto || !replaceFile) {
      showToast("Please choose a replacement image file.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("id", replacingPhoto.id);
      fd.append("file", replaceFile);

      const res = await fetch("/api/admin/photos/replace", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to replace photo file");
      }

      showToast("Photo replaced successfully! Website updated.");
      setReplacingPhoto(null);
      setReplaceFile(null);
      setReplacePreview(null);
      fetchPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error replacing photo";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Photo Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingPhoto) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/photos?id=${deletingPhoto.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete photo");
      }

      showToast("Photo deleted successfully from database and storage.");
      setDeletingPhoto(null);
      fetchPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting photo";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search Photos
  const filteredPhotos = photos
    .filter((photo) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          photo.title.toLowerCase().includes(q) ||
          photo.alt_text.toLowerCase().includes(q) ||
          photo.destination.toLowerCase().includes(q) ||
          photo.page_key.toLowerCase().includes(q) ||
          photo.section_key.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Page filter
      if (pageFilter !== "all" && photo.page_key !== pageFilter) return false;
      // Category filter
      if (categoryFilter !== "all" && photo.category !== categoryFilter) return false;
      // Destination filter
      if (destinationFilter !== "all" && photo.destination !== destinationFilter) return false;
      // Status filter
      if (statusFilter === "active" && !photo.is_active) return false;
      if (statusFilter === "inactive" && photo.is_active) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "order") return a.display_order - b.display_order;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-[#2B5829] text-white"
              : "bg-red-700 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E2D2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#17202A] tracking-tight">
              Media Library
            </h1>
            <span className="text-xs font-bold bg-[#0C5A70]/10 text-[#0C5A70] px-2.5 py-0.5 rounded-full">
              {photos.length} Total
            </span>
          </div>
          <p className="text-xs text-[#5B6770]">
            Manage, replace, reorder, or upload photos across every page of Manju Tours Lanka
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPhotos}
            disabled={loading}
            className="p-2.5 rounded-full border border-[#E8E2D2] text-[#5B6770] hover:text-[#17202A] hover:bg-[#F4EFE6] transition-colors"
            title="Reload photos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#E06D53] hover:bg-[#C8573D] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Photo</span>
          </button>
        </div>
      </div>

      {inventoryWarning && (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          {inventoryWarning}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E2D2] shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#5B6770] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, location (e.g. 'Sigiriya', 'Ella'), section, or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] focus:border-transparent outline-none bg-[#FBF9F4] text-[#17202A]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-[#E8E2D2]">
          {/* Page */}
          <div>
            <label className="block text-[10px] font-bold text-[#5B6770] uppercase tracking-wider mb-1">
              Website Page
            </label>
            <select
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] text-[#17202A] outline-none"
            >
              {PAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-[#5B6770] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] text-[#17202A] outline-none"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-[10px] font-bold text-[#5B6770] uppercase tracking-wider mb-1">
              Destination
            </label>
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] text-[#17202A] outline-none"
            >
              {DESTINATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-[#5B6770] uppercase tracking-wider mb-1">
              Visibility
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] text-[#17202A] outline-none"
            >
              <option value="all">All Photos</option>
              <option value="active">Active Only</option>
              <option value="inactive">Hidden Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-[#5B6770] uppercase tracking-wider mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "order" | "title" | "newest")}
              className="w-full py-2 px-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] text-[#17202A] outline-none"
            >
              <option value="order">Display Order (1, 2, 3)</option>
              <option value="title">Title (A to Z)</option>
              <option value="newest">Recently Uploaded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Photos Grid Header */}
      <div className="flex items-center justify-between text-xs text-[#5B6770] px-1 font-semibold">
        <span>
          Showing <strong>{filteredPhotos.length}</strong> of {photos.length} photos
        </span>
        {(pageFilter !== "all" || categoryFilter !== "all" || destinationFilter !== "all" || statusFilter !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setPageFilter("all");
              setCategoryFilter("all");
              setDestinationFilter("all");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="text-[#0C5A70] hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 border border-[#E8E2D2] space-y-3">
              <div className="aspect-4/3 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-4 bg-gray-100 rounded-md animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded-md animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D2] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0C5A70]/10 text-[#0C5A70] flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#17202A]">No Photos Match Your Filters</h3>
            <p className="text-xs text-[#5B6770] mt-1 max-w-sm mx-auto">
              Try adjusting your search terms, changing the page filter, or add a new photo.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0C5A70] text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl ${
                photo.is_active ? "border-[#E8E2D2]" : "border-gray-300 opacity-70 bg-gray-50/50"
              }`}
            >
              {/* Photo Thumbnail Container */}
              <div className="relative aspect-4/3 bg-gray-100 overflow-hidden select-none">
                <Image
                  src={photo.image_url}
                  alt={photo.alt_text || photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  style={{ objectPosition: photo.focal_point || "center" }}
                  unoptimized={photo.image_url.startsWith("http")}
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  {/* Active / Hidden Badge */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs pointer-events-auto ${
                      photo.is_active
                        ? "bg-[#2B5829] text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {photo.is_active ? "Active" : "Hidden"}
                  </span>

                  {/* Order Badge */}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#17202A] border border-[#E8E2D2] shadow-xs">
                    #{photo.display_order}
                  </span>
                </div>

                {/* Hover Quick Zoom Button */}
                <button
                  onClick={() => setZoomPhoto(photo)}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title="View full size photo"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Photo Metadata Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-extrabold text-xs text-[#17202A] line-clamp-1 leading-snug" title={photo.title}>
                    {photo.title}
                  </h3>
                  <p className="text-[10px] text-[#5B6770] mt-1 truncate" title={photo.original_filename || photo.storage_path}>
                    {photo.original_filename || photo.storage_path.split("/").pop() || photo.image_url.split("/").pop()?.split("?")[0] || "Local asset"}
                    {photo.width && photo.height ? ` · ${photo.width} × ${photo.height}` : ""}
                    {photo.mime_type ? ` · ${photo.mime_type}` : ""}
                    {photo.size_bytes ? ` · ${(photo.size_bytes / (1024 * 1024)).toFixed(2)} MB` : ""}
                  </p>
                  <p className="text-[11px] text-[#5B6770] line-clamp-1 mt-0.5" title={photo.alt_text}>
                    {photo.alt_text || photo.description || "No alt description"}
                  </p>
                </div>

                {/* Location Tags */}
                <div className="space-y-1.5 pt-2 border-t border-[#E8E2D2]/60">
                  <div className="flex items-center justify-between text-[10px] text-[#5B6770]">
                    <span className="font-semibold text-[#0C5A70] uppercase tracking-wider">
                      {photo.page_key}
                    </span>
                    <span className="bg-[#F4EFE6] px-2 py-0.5 rounded-md font-medium text-[#17202A]">
                      {photo.section_key}
                    </span>
                  </div>

                  {(photo.referenced_sections?.length || 0) > 0 && (
                    <p className="text-[10px] text-[#5B6770]" title={photo.referenced_sections?.join(", ")}>
                      References: {photo.referenced_sections?.join(", ")}
                    </p>
                  )}

                  {photo.destination && (
                    <div className="flex items-center gap-1 text-[10px] text-[#5B6770]">
                      <MapPin className="w-3 h-3 text-[#E06D53]" />
                      <span className="capitalize font-medium">{photo.destination}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons Toolbar */}
                <div className="pt-2 border-t border-[#E8E2D2] flex items-center justify-between gap-1.5">
                  {/* Hide/Show Toggle */}
                  <button
                    onClick={() => handleToggleActive(photo)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                      photo.is_active
                        ? "border-[#E8E2D2] text-[#5B6770] hover:text-[#17202A] hover:bg-[#F4EFE6]"
                        : "border-[#2B5829]/30 bg-[#2B5829]/10 text-[#2B5829]"
                    }`}
                    title={photo.is_active ? "Hide from website" : "Make visible on website"}
                  >
                    {photo.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Replace Photo File */}
                  <button
                    onClick={() => {
                      setReplacingPhoto(photo);
                      setReplaceFile(null);
                      setReplacePreview(null);
                    }}
                    className="p-2 rounded-xl border border-[#E8E2D2] text-[#0C5A70] hover:bg-[#0C5A70]/10 transition-colors"
                    title="Replace with new photo file"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Details */}
                  <button
                    onClick={() => setEditingPhoto({ ...photo })}
                    className="p-2 rounded-xl border border-[#E8E2D2] text-[#0C5A70] hover:bg-[#0C5A70]/10 transition-colors"
                    title="Edit title, page, section or tags"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingPhoto(photo)}
                    className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 1: ADD NEW PHOTO */}
      {/* ============================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2D2] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D2] mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#17202A]">
                  Add & Assign New Website Photo
                </h3>
                <p className="text-xs text-[#5B6770]">
                  Upload to Supabase Storage and assign directly to any website section
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                  Photo File (JPG, PNG, WebP, AVIF) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E8E2D2] hover:border-[#0C5A70] rounded-2xl p-6 text-center cursor-pointer bg-[#FBF9F4] transition-colors relative"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {addFilePreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/5">
                        <Image
                          src={addFilePreview}
                          alt="Upload preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#0C5A70] block">
                        Selected: {addFile?.name} ({(addFile!.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                      <span className="text-[11px] text-[#5B6770] block">
                        Click to choose another photo
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-[#0C5A70]/10 text-[#0C5A70] flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="block text-xs font-bold text-[#17202A]">
                        Click or drag a photo here to upload
                      </span>
                      <span className="block text-[11px] text-[#5B6770]">
                        Maximum file size: 12MB. Recommended resolution: ~1600px wide.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Alt Text */}
              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Over Mirissa Coast"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Alt Text (SEO & Accessibility) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden palm-fringed Mirissa bay in southern Sri Lanka"
                  value={addForm.alt_text}
                  onChange={(e) => setAddForm({ ...addForm, alt_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              {/* Page & Section Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Website Page *
                  </label>
                  <select
                    value={addForm.page_key}
                    onChange={(e) => {
                      const newPage = e.target.value;
                      const defaultSection = SECTION_BY_PAGE[newPage]?.[0]?.value || "general";
                      setAddForm({
                        ...addForm,
                        page_key: newPage,
                        section_key: defaultSection,
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    {PAGE_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Page Section *
                  </label>
                  <select
                    value={addForm.section_key}
                    onChange={(e) => setAddForm({ ...addForm, section_key: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    {(SECTION_BY_PAGE[addForm.page_key] || [{ value: "general", label: "General" }]).map((sec) => (
                      <option key={sec.value} value={sec.value}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Category
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    {CATEGORY_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Destination Association
                  </label>
                  <select
                    value={addForm.destination}
                    onChange={(e) => setAddForm({ ...addForm, destination: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    <option value="">None / Islandwide</option>
                    {DESTINATION_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Display Order (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={addForm.display_order}
                    onChange={(e) => setAddForm({ ...addForm, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addForm.is_active}
                      onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0C5A70] focus:ring-[#0C5A70]"
                    />
                    <span className="text-xs font-bold text-[#17202A]">Publish Immediately</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E8E2D2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E8E2D2] text-xs font-bold text-[#5B6770] hover:bg-[#F4EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !addFile}
                  className="px-6 py-2.5 rounded-full bg-[#E06D53] hover:bg-[#C8573D] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Assign Photo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 2: EDIT PHOTO DETAILS */}
      {/* ============================================================================== */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2D2] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D2] mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#17202A]">
                  Edit Photo Placement & Details
                </h3>
                <p className="text-xs text-[#5B6770]">
                  Change section assignment, title, SEO alt text, or display order
                </p>
              </div>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Photo Thumbnail Header */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={editingPhoto.image_url}
                    alt={editingPhoto.title}
                    fill
                    className="object-cover"
                    unoptimized={editingPhoto.image_url.startsWith("http")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-[#17202A] truncate">
                    {editingPhoto.title}
                  </span>
                  <span className="block text-[11px] text-[#5B6770] truncate">
                    Storage: {editingPhoto.storage_path || "Local asset"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Alt Text (SEO & Accessibility) *
                </label>
                <input
                  type="text"
                  required
                  value={editingPhoto.alt_text}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, alt_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">
                  Description / Caption
                </label>
                <textarea
                  rows={2}
                  value={editingPhoto.description}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs focus:ring-2 focus:ring-[#0C5A70] outline-none bg-[#FBF9F4]"
                />
              </div>

              {/* Page & Section Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Website Page *
                  </label>
                  <select
                    value={editingPhoto.page_key}
                    onChange={(e) => {
                      const newPage = e.target.value;
                      const defaultSection = SECTION_BY_PAGE[newPage]?.[0]?.value || "general";
                      setEditingPhoto({
                        ...editingPhoto,
                        page_key: newPage,
                        section_key: defaultSection,
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    {PAGE_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Page Section *
                  </label>
                  <select
                    value={editingPhoto.section_key}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, section_key: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    {(SECTION_BY_PAGE[editingPhoto.page_key] || [{ value: "general", label: "General" }]).map((sec) => (
                      <option key={sec.value} value={sec.value}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Category
                  </label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    {CATEGORY_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Destination
                  </label>
                  <select
                    value={editingPhoto.destination}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, destination: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  >
                    <option value="">None / Islandwide</option>
                    {DESTINATION_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={editingPhoto.display_order}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, display_order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPhoto.is_active}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0C5A70] focus:ring-[#0C5A70]"
                    />
                    <span className="text-xs font-bold text-[#17202A]">Visible on Website</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17202A] mb-1">Image focal point</label>
                <select
                  value={editingPhoto.focal_point || "center"}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, focal_point: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-[#FBF9F4] outline-none"
                >
                  <option value="center">Center</option>
                  <option value="center 30%">Center, upper</option>
                  <option value="center 40%">Center, slightly upper</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E8E2D2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2.5 rounded-full border border-[#E8E2D2] text-xs font-bold text-[#5B6770] hover:bg-[#F4EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#0C5A70] hover:bg-[#083B4A] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 3: REPLACE PHOTO FILE */}
      {/* ============================================================================== */}
      {replacingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2D2]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D2] mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#17202A]">
                  Replace Photo File
                </h3>
                <p className="text-xs text-[#5B6770]">
                  Preserves the title, section, and placement while swapping the photo file
                </p>
              </div>
              <button
                onClick={() => setReplacingPhoto(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <span className="block text-[11px] font-bold text-[#5B6770] mb-1">
                    Current Image
                  </span>
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 border border-[#E8E2D2]">
                    <Image
                      src={replacingPhoto.image_url}
                      alt={replacingPhoto.title}
                      fill
                      className="object-cover"
                      unoptimized={replacingPhoto.image_url.startsWith("http")}
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#0C5A70] mb-1">
                    New Replacement
                  </span>
                  <div
                    onClick={() => replaceFileInputRef.current?.click()}
                    className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#FBF9F4] border-2 border-dashed border-[#E8E2D2] hover:border-[#0C5A70] cursor-pointer flex flex-col items-center justify-center p-2 text-center"
                  >
                    <input
                      ref={replaceFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setReplaceFile(file);
                          setReplacePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />

                    {replacePreview ? (
                      <Image
                        src={replacePreview}
                        alt="Replacement Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#0C5A70] mb-1" />
                        <span className="text-[10px] font-bold text-[#0C5A70]">
                          Click to select new image
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800">
                <strong>Replacement preview:</strong> The current image and your selected image are shown above. Managed references: {replacingPhoto.referenced_sections?.join(", ") || `${replacingPhoto.page_key} › ${replacingPhoto.section_key}`}. This replaces this media record; any other records that reference the previous Storage file are left intact. Its focal point and animation timing are kept, and the old file remains available for rollback.
              </div>

              <div className="pt-4 border-t border-[#E8E2D2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplacingPhoto(null)}
                  className="px-4 py-2.5 rounded-full border border-[#E8E2D2] text-xs font-bold text-[#5B6770] hover:bg-[#F4EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replaceFile}
                  className="px-6 py-2.5 rounded-full bg-[#0C5A70] hover:bg-[#083B4A] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Replacing File...</span>
                    </>
                  ) : (
                    <span>Confirm & Replace Photo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ============================================================================== */}
      {deletingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#17202A]">
                Hide Photo From Website?
              </h3>
              <p className="text-xs text-[#5B6770] mt-1">
                Are you sure you want to remove <strong>&quot;{deletingPhoto.title}&quot;</strong> from <strong>{deletingPhoto.page_key} &gt; {deletingPhoto.section_key}</strong>?
              </p>
            </div>

            <div className="p-3 bg-red-50 text-red-700 text-[11px] rounded-2xl text-left border border-red-100">
              This hides the photo from public pages. The media record and Storage file are preserved. Managed references: {deletingPhoto.referenced_sections?.join(", ") || `${deletingPhoto.page_key} › ${deletingPhoto.section_key}`}. Source-code references are listed in ASSET_INVENTORY.md and must be checked before any manual cleanup.
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingPhoto(null)}
                className="px-5 py-2.5 rounded-full border border-[#E8E2D2] text-xs font-bold text-[#5B6770] hover:bg-[#F4EFE6]"
              >
                Keep Photo
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Hide Photo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 5: FULL-SIZE ZOOM PREVIEW */}
      {/* ============================================================================== */}
      {zoomPhoto && (
        <div
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-black/40 rounded-3xl overflow-hidden border border-white/20 p-2"
          >
            <button
              onClick={() => setZoomPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden">
              <Image
                src={zoomPhoto.image_url}
                alt={zoomPhoto.title}
                fill
                className="object-contain"
                unoptimized={zoomPhoto.image_url.startsWith("http")}
              />
            </div>

            <div className="p-4 text-white">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">{zoomPhoto.title}</h4>
                <span className="text-xs text-white/70">
                  {zoomPhoto.page_key} &gt; {zoomPhoto.section_key}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1">{zoomPhoto.alt_text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
