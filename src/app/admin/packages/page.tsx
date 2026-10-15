"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  MapPin,
  ImageIcon,
  Upload,
  Check,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { SiteImage, TourPackage, ItineraryDay, PackageGalleryImage } from "@/types/database.types";
import { formatTourPackage, type FormattedTour } from "@/lib/queries/tours";

const AVAILABLE_DESTINATIONS = [
  "Sigiriya",
  "Kandy",
  "Nuwara Eliya",
  "Ella",
  "Mirissa",
  "Galle Fort",
  "Yala National Park",
  "Polonnaruwa",
  "Haputale",
  "Trincomalee",
  "Hikkaduwa",
  "Bentota",
  "Colombo",
  "Negombo",
  "Wilpattu",
  "Dambulla",
];

const TRAVEL_STYLES = [
  "Private Chauffeur",
  "Cultural & Heritage",
  "Wildlife & Safari",
  "Honeymoon & Luxury",
  "Family Adventure",
  "Scenic Rail & Nature",
  "Beach & Relaxation",
  "Custom Itinerary",
];

const CURRENCIES = ["USD", "LKR", "EUR", "GBP", "AUD"];

const TRAVELLER_TYPES = [
  "Couples & Honeymooners",
  "Families with Kids",
  "Solo Travelers",
  "Small Groups & Friends",
  "Seniors & Relaxed Paced",
  "Photography Enthusiasts",
  "Wildlife & Nature Lovers",
  "Culture & History Buffs",
];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<FormattedTour[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // all, published, draft
  const [selectedFeatured, setSelectedFeatured] = useState("all"); // all, featured, standard
  const [sortBy, setSortBy] = useState("order"); // order, title, duration, price, date

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<TourPackage> | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "destinations" | "itinerary" | "content">("basic");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Preview Modal
  const [previewPackage, setPreviewPackage] = useState<FormattedTour | null>(null);

  // Delete Modal
  const [deleteConfirmPackage, setDeleteConfirmPackage] = useState<FormattedTour | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Image Picker Modal
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<"hero" | "gallery">("hero");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Packages & Site Images
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [pkgRes, imgRes] = await Promise.all([
        fetch("/api/admin/packages"),
        fetch("/api/admin/photos"),
      ]);

      const pkgData = await pkgRes.json();
      const imgData = await imgRes.json();

      if (pkgData.packages) {
        setPackages(pkgData.packages.map((p: TourPackage) => formatTourPackage(p)));
      }
      if (imgData.photos) {
        setSiteImages(imgData.photos);
      }
    } catch (err) {
      console.error("Failed fetching tour packages data:", err);
      showToast("Failed to load packages. Please check connection.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetch("/api/admin/packages"), fetch("/api/admin/photos")])
      .then(async ([pkgRes, imgRes]) => {
        const pkgData = await pkgRes.json();
        const imgData = await imgRes.json();
        if (isMounted) {
          if (pkgData.packages) {
            setPackages(pkgData.packages.map((p: TourPackage) => formatTourPackage(p)));
          }
          if (imgData.photos) {
            setSiteImages(imgData.photos);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed fetching tour packages data:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered & Sorted Packages
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q)
      );
    }

    if (selectedStyle !== "all") {
      result = result.filter((p) => p.travelStyle.toLowerCase().includes(selectedStyle.toLowerCase()));
    }

    if (selectedDestination !== "all") {
      result = result.filter((p) =>
        p.destinations.some((d) => d.toLowerCase().includes(selectedDestination.toLowerCase()))
      );
    }

    if (selectedStatus === "published") {
      result = result.filter((p) => p.isPublished);
    } else if (selectedStatus === "draft") {
      result = result.filter((p) => !p.isPublished);
    }

    if (selectedFeatured === "featured") {
      result = result.filter((p) => p.isFeatured);
    } else if (selectedFeatured === "standard") {
      result = result.filter((p) => !p.isFeatured);
    }

    // Sort
    if (sortBy === "order") {
      result.sort((a, b) => a.displayOrder - b.displayOrder);
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "duration-asc") {
      result.sort((a, b) => a.durationDays - b.durationDays);
    } else if (sortBy === "duration-desc") {
      result.sort((a, b) => b.durationDays - a.durationDays);
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [packages, searchTerm, selectedStyle, selectedDestination, selectedStatus, selectedFeatured, sortBy]);

  // Statistics
  const totalCount = packages.length;
  const publishedCount = packages.filter((p) => p.isPublished).length;
  const draftCount = packages.filter((p) => !p.isPublished).length;
  const featuredCount = packages.filter((p) => p.isFeatured).length;

  // Toggle publish
  const handleTogglePublish = async (pkg: FormattedTour) => {
    try {
      const newStatus = !pkg.isPublished;
      const res = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pkg,
          id: pkg.id,
          is_published: newStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update package");
      }

      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isPublished: newStatus, is_published: newStatus } : p))
      );
      showToast(`"${pkg.title}" is now ${newStatus ? "Published" : "saved as Draft"}.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (pkg: FormattedTour) => {
    try {
      const newFeatured = !pkg.isFeatured;
      const res = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pkg,
          id: pkg.id,
          is_featured: newFeatured,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update package");
      }

      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isFeatured: newFeatured, is_featured: newFeatured } : p))
      );
      showToast(`"${pkg.title}" ${newFeatured ? "marked as Featured" : "removed from Featured"}.`);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  // Duplicate Package
  const handleDuplicate = async (pkg: FormattedTour) => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/packages/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pkg.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to duplicate package");
      }

      showToast(`Package duplicated as "${data.package.title}" (Draft).`);
      await fetchData();
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
      setRefreshing(false);
    }
  };

  // Quick Reorder Up / Down
  const handleReorder = async (pkg: FormattedTour, direction: "up" | "down") => {
    const currentIndex = filteredPackages.findIndex((p) => p.id === pkg.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredPackages.length) return;

    const targetPkg = filteredPackages[targetIndex];
    const newItems = [
      { id: pkg.id, display_order: targetPkg.displayOrder },
      { id: targetPkg.id, display_order: pkg.displayOrder },
    ];

    try {
      const res = await fetch("/api/admin/packages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newItems }),
      });

      if (!res.ok) throw new Error("Failed to reorder packages");

      setPackages((prev) =>
        prev.map((p) => {
          if (p.id === pkg.id) return { ...p, displayOrder: targetPkg.displayOrder, display_order: targetPkg.displayOrder };
          if (p.id === targetPkg.id) return { ...p, displayOrder: pkg.displayOrder, display_order: pkg.displayOrder };
          return p;
        })
      );
      showToast("Package display order updated.");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  // Open Form to Add New Package
  const handleOpenAdd = () => {
    setEditingPackage({
      title: "",
      slug: "",
      tagline: "",
      overview: "",
      hero_image: "/images/destinations/sigiriya/hero.webp",
      gallery_images: [],
      travel_style: "Private Chauffeur",
      destinations: ["Sigiriya", "Kandy"],
      duration_days: 7,
      duration_nights: 6,
      starting_price: "Request a Quote",
      currency: "USD",
      price_type: "custom_quote",
      min_travelers: 1,
      max_travelers: 12,
      inclusions: [
        "Private air-conditioned luxury vehicle for the entire itinerary",
        "Dedicated professional English-speaking chauffeur-guide",
        "All fuel, highway toll charges, driver lodging & meals included",
        "Airport pick-up and airport drop-off transfers",
      ],
      exclusions: [
        "International flights and Sri Lanka tourist visa",
        "Entrance tickets to monuments and national parks",
        "Personal expenses, drinks and discretionary tips",
      ],
      itinerary: [
        {
          day: 1,
          title: "Airport Welcome & Scenic Transfer",
          description: "Ayubowan! Meet your private chauffeur-guide upon arrival and transfer to your initial destination.",
          accommodation: "Handpicked 4-star boutique hotel",
          meals: "Dinner included",
          activities: "Welcome reception and leisurely evening",
        },
        {
          day: 2,
          title: "Historic Exploration & Scenic Landscapes",
          description: "Morning guided exploration of ancient monuments followed by scenic afternoon drives.",
          accommodation: "Scenic valley resort",
          meals: "Breakfast & Dinner",
          activities: "Temple and cultural monument visit",
        },
      ],
      accommodation_details: "3-star to 5-star handpicked boutique hotels and star resorts matching your style",
      transport_details: "Private air-conditioned vehicle with dedicated English-speaking chauffeur-guide, fuel, highway tolls & parking fees included",
      meals_included: "Daily breakfast at all accommodation stops, selected dinners",
      activities: ["Ancient UNESCO Ruins", "Tea Plantation Tasting", "Scenic Mountain Rail", "Wildlife Safari"],
      optional_activities: ["Hot Air Balloon Ride", "Whale Watching Cruise", "Ayurvedic Spa Treatment"],
      suitable_for: ["Couples & Honeymooners", "Families with Kids", "Culture & History Buffs"],
      booking_conditions: "Flexible dates and bespoke pacing. Itinerary can be customized around your flights.",
      cancellation_policy: "Free cancellation up to 14 days before tour arrival date.",
      faqs: [
        {
          question: "Can we modify the hotels and pacing of this tour?",
          answer: "Yes, absolutely! Every package by Manju Tours Lanka is completely bespoke. You can change hotel categories, add extra days in Ella or Mirissa, or adjust daily start times.",
        },
        {
          question: "Is our private vehicle and chauffeur with us for the entire tour?",
          answer: "Yes. Your chauffeur-guide and private air-conditioned vehicle remain dedicated solely to your group for the entirety of the trip.",
        },
      ],
      seo_title: "",
      seo_description: "",
      display_order: packages.length + 1,
      is_featured: false,
      is_published: true,
    });
    setActiveTab("basic");
    setFormError("");
    setModalOpen(true);
  };

  // Open Form to Edit Package
  const handleOpenEdit = (pkg: FormattedTour) => {
    setEditingPackage({
      id: pkg.id,
      title: pkg.title,
      slug: pkg.slug,
      tagline: pkg.tagline,
      overview: pkg.overview,
      hero_image: pkg.heroImage,
      hero_image_metadata: pkg.heroImageMetadata,
      gallery_images: pkg.galleryImages,
      travel_style: pkg.travelStyle,
      destinations: pkg.destinations || [],
      duration_days: pkg.durationDays,
      duration_nights: pkg.durationNights,
      starting_price: pkg.startingPrice,
      currency: pkg.currency || "USD",
      price_type: pkg.priceType || "custom_quote",
      min_travelers: pkg.minTravelers || 1,
      max_travelers: pkg.maxTravelers || 12,
      inclusions: pkg.inclusions || [],
      exclusions: pkg.exclusions || [],
      itinerary: pkg.itinerary || [],
      accommodation_details: pkg.accommodationDetails || "",
      transport_details: pkg.transportDetails || "",
      meals_included: pkg.mealsIncluded || "",
      activities: pkg.activities || [],
      optional_activities: pkg.optionalActivities || [],
      suitable_for: pkg.suitableFor || [],
      booking_conditions: pkg.bookingConditions || "",
      cancellation_policy: pkg.cancellationPolicy || "",
      faqs: pkg.faqs || [],
      seo_title: pkg.seoTitle || "",
      seo_description: pkg.seoDescription || "",
      display_order: pkg.displayOrder,
      is_featured: pkg.isFeatured,
      is_published: pkg.isPublished,
    });
    setActiveTab("basic");
    setFormError("");
    setModalOpen(true);
  };

  // Save Form (Create or Update)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    if (!editingPackage.title?.trim()) {
      setFormError("Package title is required.");
      return;
    }
    if (!editingPackage.slug?.trim()) {
      setFormError("URL slug is required.");
      return;
    }

    setFormSaving(true);
    setFormError("");

    try {
      const isUpdating = Boolean(editingPackage.id && !editingPackage.id.startsWith("tour-new-"));
      const endpoint = "/api/admin/packages";
      const method = isUpdating ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPackage),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save tour package.");
      }

      showToast(`Package "${data.package.title}" saved successfully!`);
      setModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setFormSaving(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmPackage) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/packages?id=${encodeURIComponent(deleteConfirmPackage.id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete package.");
      }

      showToast(data.message || `Package "${deleteConfirmPackage.title}" removed.`);
      setDeleteConfirmPackage(null);
      await fetchData();
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Direct File Upload for Cover Photo or Gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPackage) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `${editingPackage.title || "Tour"} Photo`);
      formData.append("page_key", "tours");
      formData.append("section_key", editingPackage.slug || "cards");
      formData.append("category", "tour");
      formData.append("destination", editingPackage.destinations?.[0]?.toLowerCase() || "");
      formData.append("is_active", "true");

      const res = await fetch("/api/admin/photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo to Supabase Storage");
      }

      const imageUrl = data.photo.image_url;

      if (imagePickerTarget === "hero") {
        setEditingPackage((prev) => (prev ? { ...prev, hero_image: imageUrl } : null));
        showToast("Cover photo uploaded and assigned!");
      } else {
        const newGallery: PackageGalleryImage[] = [
          ...(editingPackage.gallery_images || []),
          { src: imageUrl, alt: editingPackage.title, caption: data.photo.title },
        ];
        setEditingPackage((prev) => (prev ? { ...prev, gallery_images: newGallery } : null));
        showToast("Photo uploaded and added to tour gallery!");
      }

      setImagePickerOpen(false);
      // Refresh site images in background
      fetch("/api/admin/photos")
        .then((r) => r.json())
        .then((d) => d.photos && setSiteImages(d.photos));
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
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all animate-bounce ${
            toastMessage.type === "success"
              ? "bg-[#0C5A70] text-white border border-[#0C5A70]/20"
              : "bg-red-600 text-white border border-red-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & KPI Counts */}
      <div className="bg-gradient-to-r from-[#0C5A70] to-[#083B4A] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white">
              <Compass className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>Tour Packages CMS</span>
            </span>
            <span className="text-xs text-[#FBF9F4]/70">• Real-Time Website Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tour Package Management
          </h1>
          <p className="text-xs sm:text-sm text-[#FBF9F4]/80 mt-1 max-w-xl">
            Add new tours, edit itineraries, manage daily accommodation, pricing, highlights, and publish status without touching source code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh package data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E06D53] hover:bg-[#C8573D] text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D2] shadow-xs">
          <span className="text-xs font-bold text-[#5B6770] uppercase tracking-wider block mb-1">
            Total Packages
          </span>
          <span className="text-3xl font-extrabold text-[#17202A]">
            {loading ? "..." : totalCount}
          </span>
          <p className="text-[11px] text-[#5B6770] mt-1 font-medium">All tour blueprints</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D2] shadow-xs">
          <span className="text-xs font-bold text-[#2B5829] uppercase tracking-wider block mb-1">
            Published Live
          </span>
          <span className="text-3xl font-extrabold text-[#2B5829]">
            {loading ? "..." : publishedCount}
          </span>
          <p className="text-[11px] text-[#5B6770] mt-1 font-medium">Visible to website travelers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D2] shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Draft Packages
          </span>
          <span className="text-3xl font-extrabold text-amber-700">
            {loading ? "..." : draftCount}
          </span>
          <p className="text-[11px] text-[#5B6770] mt-1 font-medium">Unpublished & hidden</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D2] shadow-xs">
          <span className="text-xs font-bold text-[#E06D53] uppercase tracking-wider block mb-1">
            Featured Packages
          </span>
          <span className="text-3xl font-extrabold text-[#E06D53]">
            {loading ? "..." : featuredCount}
          </span>
          <p className="text-[11px] text-[#5B6770] mt-1 font-medium">Showcased on homepage</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E2D2] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5B6770] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by package name, slug, or destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-medium focus:outline-none focus:border-[#0C5A70] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-[#5B6770]" />
            <span className="text-xs font-bold text-[#5B6770]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 rounded-2xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-bold text-[#17202A] focus:outline-none focus:border-[#0C5A70]"
            >
              <option value="order">Display Order</option>
              <option value="title">Title (A-Z)</option>
              <option value="duration-asc">Duration (Short to Long)</option>
              <option value="duration-desc">Duration (Long to Short)</option>
              <option value="date">Date Created (Newest)</option>
            </select>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E8E2D2]/60">
          <div>
            <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Travel Style</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-semibold text-[#17202A]"
            >
              <option value="all">All Travel Styles</option>
              {TRAVEL_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Destination</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-semibold text-[#17202A]"
            >
              <option value="all">All Destinations</option>
              {AVAILABLE_DESTINATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Publish Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-semibold text-[#17202A]"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Homepage Feature</label>
            <select
              value={selectedFeatured}
              onChange={(e) => setSelectedFeatured(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#E8E2D2] bg-[#FBF9F4] text-xs font-semibold text-[#17202A]"
            >
              <option value="all">All Packages</option>
              <option value="featured">Featured Only</option>
              <option value="standard">Standard Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-gray-100 animate-pulse border border-[#E8E2D2]" />
          ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D2] shadow-xs">
          <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#17202A] mb-1">No tour packages match your filters</h3>
          <p className="text-xs text-[#5B6770] max-w-sm mx-auto mb-4">
            Try adjusting your search query, travel style, or publication filter, or create a new package.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStyle("all");
              setSelectedDestination("all");
              setSelectedStatus("all");
              setSelectedFeatured("all");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0C5A70] border border-[#0C5A70] hover:bg-[#0C5A70]/10"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg, index) => (
            <article
              key={pkg.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Container */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={pkg.heroImage || "/images/destinations/sigiriya/hero.webp"}
                    alt={pkg.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={typeof pkg.heroImage === "string" && pkg.heroImage.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePublish(pkg)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs transition-all flex items-center gap-1 ${
                          pkg.isPublished
                            ? "bg-[#2B5829]/90 text-white hover:bg-[#2B5829]"
                            : "bg-gray-800/90 text-gray-200 hover:bg-gray-800"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {pkg.isPublished ? <Check className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{pkg.isPublished ? "Published" : "Draft"}</span>
                      </button>

                      <button
                        onClick={() => handleToggleFeatured(pkg)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs transition-all flex items-center gap-1 ${
                          pkg.isFeatured
                            ? "bg-[#E06D53] text-white hover:bg-[#C8573D]"
                            : "bg-black/50 text-white/80 hover:bg-black/70"
                        }`}
                        title="Click to toggle homepage featured status"
                      >
                        <Star className={`w-3 h-3 ${pkg.isFeatured ? "fill-white" : ""}`} />
                        <span>{pkg.isFeatured ? "Featured" : "Standard"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-[#E06D53]" />
                      <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                    </div>
                  </div>

                  {/* Bottom Vignette Info */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-[#17202A]/70 px-2 py-0.5 rounded-full inline-block mb-1">
                      {pkg.travelStyle}
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-snug drop-shadow-md line-clamp-1">
                      {pkg.title}
                    </h3>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-[#5B6770] line-clamp-2 leading-relaxed">
                    {pkg.tagline || pkg.overview}
                  </p>

                  {/* Destinations Chips */}
                  {pkg.destinations && pkg.destinations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pkg.destinations.slice(0, 4).map((d) => (
                        <span
                          key={d}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FBF9F4] text-[#0C5A70] border border-[#E8E2D2]"
                        >
                          {d}
                        </span>
                      ))}
                      {pkg.destinations.length > 4 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-[#5B6770]">
                          +{pkg.destinations.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price & Slug details */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E8E2D2]/60">
                    <div>
                      <span className="text-[10px] text-[#5B6770] block font-semibold uppercase">Pricing</span>
                      <span className="font-extrabold text-[#0C5A70] text-sm">
                        {pkg.startingPrice || "Request a Quote"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#5B6770] block font-semibold uppercase">Itinerary</span>
                      <span className="font-bold text-[#17202A] text-xs">
                        {pkg.itinerary.length} Daily Stops
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="p-4 bg-[#FBF9F4] border-t border-[#E8E2D2] flex items-center justify-between gap-2">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorder(pkg, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-[#E8E2D2] bg-white hover:bg-gray-100 disabled:opacity-30 text-[#5B6770]"
                    title="Move up in display order"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(pkg, "down")}
                    disabled={index === filteredPackages.length - 1}
                    className="p-1.5 rounded-lg border border-[#E8E2D2] bg-white hover:bg-gray-100 disabled:opacity-30 text-[#5B6770]"
                    title="Move down in display order"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewPackage(pkg)}
                    className="p-2 rounded-xl text-xs font-bold text-[#0C5A70] bg-white border border-[#E8E2D2] hover:bg-[#0C5A70]/10 transition-colors"
                    title="Preview Package"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(pkg)}
                    className="p-2 rounded-xl text-xs font-bold text-[#5B6770] bg-white border border-[#E8E2D2] hover:bg-gray-100 transition-colors"
                    title="Duplicate as Draft"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmPackage(pkg)}
                    className="p-2 rounded-xl text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PACKAGE MODAL (Comprehensive Multi-Tab Editor)               */}
      {/* ========================================================================= */}
      {modalOpen && editingPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E8E2D2] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-[#0C5A70] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">
                    {editingPackage.id ? `Edit: ${editingPackage.title}` : "Create New Tour Package"}
                  </h2>
                  <span className="text-xs text-[#FBF9F4]/80">
                    All fields update the public website and booking flows in real-time.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-[#E8E2D2] bg-[#FBF9F4] px-6 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "basic"
                    ? "border-[#0C5A70] text-[#0C5A70]"
                    : "border-transparent text-[#5B6770] hover:text-[#17202A]"
                }`}
              >
                1. Basic Info & SEO
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "pricing"
                    ? "border-[#0C5A70] text-[#0C5A70]"
                    : "border-transparent text-[#5B6770] hover:text-[#17202A]"
                }`}
              >
                2. Pricing & Logistics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("destinations")}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "destinations"
                    ? "border-[#0C5A70] text-[#0C5A70]"
                    : "border-transparent text-[#5B6770] hover:text-[#17202A]"
                }`}
              >
                3. Destinations & Photos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("itinerary")}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "itinerary"
                    ? "border-[#0C5A70] text-[#0C5A70]"
                    : "border-transparent text-[#5B6770] hover:text-[#17202A]"
                }`}
              >
                4. Day-by-Day Itinerary ({editingPackage.itinerary?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "content"
                    ? "border-[#0C5A70] text-[#0C5A70]"
                    : "border-transparent text-[#5B6770] hover:text-[#17202A]"
                }`}
              >
                5. Inclusions, FAQs & Highlights
              </button>
            </div>

            {/* Error Notice */}
            {formError && (
              <div className="m-6 mb-0 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSavePackage} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: BASIC INFO & SEO */}
              {activeTab === "basic" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                        Package Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPackage.title || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPackage((prev) => ({
                            ...prev,
                            title: val,
                            // Auto-generate slug if new package
                            slug: prev?.id
                              ? prev.slug
                              : val
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-+|-+$/g, ""),
                          }));
                        }}
                        placeholder="e.g. Grand Sri Lanka Odyssey"
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-semibold focus:outline-none focus:border-[#0C5A70]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-[#17202A]">
                          URL Slug <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-[#5B6770]">URL: /tours/{editingPackage.slug}</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={editingPackage.slug || ""}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({
                            ...prev,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                          }))
                        }
                        placeholder="e.g. grand-sri-lanka-odyssey"
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-mono focus:outline-none focus:border-[#0C5A70]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                      Short Tagline / Teaser
                    </label>
                    <input
                      type="text"
                      value={editingPackage.tagline || ""}
                      onChange={(e) => setEditingPackage((prev) => ({ ...prev, tagline: e.target.value }))}
                      placeholder="e.g. The Definitive 10-Day Journey Across Ancient Citadels & Misty Highlands"
                      className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs focus:outline-none focus:border-[#0C5A70]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                      Full Tour Overview Description
                    </label>
                    <textarea
                      rows={4}
                      value={editingPackage.overview || ""}
                      onChange={(e) => setEditingPackage((prev) => ({ ...prev, overview: e.target.value }))}
                      placeholder="Provide a compelling overview describing this route, experiences, and highlights..."
                      className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs leading-relaxed focus:outline-none focus:border-[#0C5A70]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Travel Style</label>
                      <select
                        value={editingPackage.travel_style || "Private Chauffeur"}
                        onChange={(e) => setEditingPackage((prev) => ({ ...prev, travel_style: e.target.value }))}
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-semibold"
                      >
                        {TRAVEL_STYLES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Display Order</label>
                      <input
                        type="number"
                        value={editingPackage.display_order ?? 0}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({ ...prev, display_order: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPackage.is_published ?? true}
                          onChange={(e) => setEditingPackage((prev) => ({ ...prev, is_published: e.target.checked }))}
                          className="w-4 h-4 rounded text-[#0C5A70] focus:ring-0"
                        />
                        <span className="text-xs font-bold text-[#17202A]">Published</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPackage.is_featured ?? false}
                          onChange={(e) => setEditingPackage((prev) => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-4 h-4 rounded text-[#E06D53] focus:ring-0"
                        />
                        <span className="text-xs font-bold text-[#17202A]">Featured on Home</span>
                      </label>
                    </div>
                  </div>

                  {/* SEO Fields */}
                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-3">
                    <span className="text-xs font-bold text-[#0C5A70] uppercase tracking-wider block">
                      Search Engine Optimization (SEO)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5B6770] mb-1">SEO Page Title</label>
                        <input
                          type="text"
                          value={editingPackage.seo_title || ""}
                          onChange={(e) => setEditingPackage((prev) => ({ ...prev, seo_title: e.target.value }))}
                          placeholder="Default: [Tour Title] | Manju Tours Lanka"
                          className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Meta Description</label>
                        <input
                          type="text"
                          value={editingPackage.seo_description || ""}
                          onChange={(e) => setEditingPackage((prev) => ({ ...prev, seo_description: e.target.value }))}
                          placeholder="Compelling 160-character summary for Google..."
                          className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & LOGISTICS */}
              {activeTab === "pricing" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Days</label>
                      <input
                        type="number"
                        min="1"
                        value={editingPackage.duration_days ?? 7}
                        onChange={(e) => {
                          const days = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setEditingPackage((prev) => ({
                            ...prev,
                            duration_days: days,
                            duration_nights: Math.max(0, days - 1),
                          }));
                        }}
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Nights</label>
                      <input
                        type="number"
                        min="0"
                        value={editingPackage.duration_nights ?? 6}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({
                            ...prev,
                            duration_nights: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Currency</label>
                      <select
                        value={editingPackage.currency || "USD"}
                        onChange={(e) => setEditingPackage((prev) => ({ ...prev, currency: e.target.value }))}
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-bold"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Price Model</label>
                      <select
                        value={editingPackage.price_type || "custom_quote"}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({
                            ...prev,
                            price_type: e.target.value as "per_person" | "per_group" | "custom_quote",
                          }))
                        }
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-semibold"
                      >
                        <option value="custom_quote">Custom Quotation</option>
                        <option value="per_person">Per Person</option>
                        <option value="per_group">Per Group</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Starting Price Label</label>
                      <input
                        type="text"
                        value={editingPackage.starting_price || ""}
                        onChange={(e) => setEditingPackage((prev) => ({ ...prev, starting_price: e.target.value }))}
                        placeholder="e.g. $850 or Request a Quote"
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs font-bold text-[#0C5A70]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Min Travelers</label>
                      <input
                        type="number"
                        min="1"
                        value={editingPackage.min_travelers ?? 1}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({
                            ...prev,
                            min_travelers: parseInt(e.target.value, 10) || 1,
                          }))
                        }
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Max Travelers</label>
                      <input
                        type="number"
                        min="1"
                        value={editingPackage.max_travelers ?? 12}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({
                            ...prev,
                            max_travelers: parseInt(e.target.value, 10) || 12,
                          }))
                        }
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                      Private Vehicle & Chauffeur Details
                    </label>
                    <input
                      type="text"
                      value={editingPackage.transport_details || ""}
                      onChange={(e) =>
                        setEditingPackage((prev) => ({ ...prev, transport_details: e.target.value }))
                      }
                      placeholder="e.g. Private air-conditioned vehicle with dedicated English-speaking chauffeur-guide, fuel, highway tolls & parking fees included"
                      className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                      Accommodation Standard Description
                    </label>
                    <input
                      type="text"
                      value={editingPackage.accommodation_details || ""}
                      onChange={(e) =>
                        setEditingPackage((prev) => ({ ...prev, accommodation_details: e.target.value }))
                      }
                      placeholder="e.g. Handpicked 4-star boutique hotels and beach resorts matching your comfort level"
                      className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1.5">Meals Plan Included</label>
                    <input
                      type="text"
                      value={editingPackage.meals_included || ""}
                      onChange={(e) => setEditingPackage((prev) => ({ ...prev, meals_included: e.target.value }))}
                      placeholder="e.g. Daily breakfast at all hotels, selected traditional lunches and dinners"
                      className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Booking Terms</label>
                      <textarea
                        rows={2}
                        value={editingPackage.booking_conditions || ""}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({ ...prev, booking_conditions: e.target.value }))
                        }
                        placeholder="e.g. 100% customisable, zero booking fees, pay upon arrival option."
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#17202A] mb-1.5">Cancellation Policy</label>
                      <textarea
                        rows={2}
                        value={editingPackage.cancellation_policy || ""}
                        onChange={(e) =>
                          setEditingPackage((prev) => ({ ...prev, cancellation_policy: e.target.value }))
                        }
                        placeholder="e.g. Free cancellation up to 14 days before your arrival date."
                        className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DESTINATIONS & PHOTOS */}
              {activeTab === "destinations" && (
                <div className="space-y-6">
                  {/* Destinations Chips Checklist */}
                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-2">
                      Included Destinations ({editingPackage.destinations?.length || 0} selected)
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]">
                      {AVAILABLE_DESTINATIONS.map((dest) => {
                        const isSelected = editingPackage.destinations?.includes(dest);
                        return (
                          <button
                            key={dest}
                            type="button"
                            onClick={() => {
                              const current = editingPackage.destinations || [];
                              const updated = isSelected
                                ? current.filter((d) => d !== dest)
                                : [...current, dest];
                              setEditingPackage((prev) => (prev ? { ...prev, destinations: updated } : null));
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#0C5A70] text-white shadow-xs"
                                : "bg-white text-[#5B6770] border border-[#E8E2D2] hover:bg-gray-100"
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{dest}</span>
                            {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cover Photo */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E2D2] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#17202A]">
                        Cover Photo (Hero Banner & Cards) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget("hero");
                            setImagePickerOpen(true);
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-[#0C5A70] bg-[#0C5A70]/10 hover:bg-[#0C5A70]/20 transition-all flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Pick from Site Photos</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget("hero");
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-[#E06D53] hover:bg-[#C8573D] transition-all flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative w-full sm:w-48 aspect-16/10 rounded-2xl overflow-hidden bg-gray-100 border border-[#E8E2D2] shrink-0">
                        {editingPackage.hero_image ? (
                          <Image
                            src={editingPackage.hero_image}
                            alt="Cover preview"
                            fill
                            className="object-cover"
                            unoptimized={editingPackage.hero_image.startsWith("http")}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          required
                          value={editingPackage.hero_image || ""}
                          onChange={(e) =>
                            setEditingPackage((prev) => (prev ? { ...prev, hero_image: e.target.value } : null))
                          }
                          placeholder="Image URL or storage path..."
                          className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs font-mono"
                        />
                        <p className="text-[11px] text-[#5B6770]">
                          Pick an existing photo from the centralized gallery or upload directly to Supabase Storage.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Gallery Photos */}
                  <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#17202A] block">
                          Visual Journey Gallery ({editingPackage.gallery_images?.length || 0} photos)
                        </span>
                        <span className="text-[11px] text-[#5B6770]">
                          Additional route photos displayed in the lightbox on the tour detail page.
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget("gallery");
                            setImagePickerOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#0C5A70] bg-white border border-[#E8E2D2] hover:bg-gray-100 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add From Site Photos</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget("gallery");
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload To Gallery</span>
                        </button>
                      </div>
                    </div>

                    {editingPackage.gallery_images && editingPackage.gallery_images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {editingPackage.gallery_images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-2xl overflow-hidden border border-[#E8E2D2] bg-white shadow-xs"
                          >
                            <div className="relative aspect-4/3 w-full bg-gray-100">
                              <Image
                                src={img.src}
                                alt={img.alt || "Tour gallery"}
                                fill
                                className="object-cover"
                                unoptimized={img.src.startsWith("http")}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(editingPackage.gallery_images || [])];
                                  updated.splice(idx, 1);
                                  setEditingPackage((prev) => (prev ? { ...prev, gallery_images: updated } : null));
                                }}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="p-2">
                              <input
                                type="text"
                                value={img.caption || ""}
                                onChange={(e) => {
                                  const updated = [...(editingPackage.gallery_images || [])];
                                  updated[idx] = { ...updated[idx], caption: e.target.value };
                                  setEditingPackage((prev) => (prev ? { ...prev, gallery_images: updated } : null));
                                }}
                                placeholder="Photo caption..."
                                className="w-full text-[10px] p-1 rounded border border-[#E8E2D2]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-[#5B6770] text-xs border border-dashed border-[#E8E2D2] rounded-2xl bg-white">
                        No additional gallery photos added yet. Use the buttons above to select or upload images.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: DAY-BY-DAY ITINERARY */}
              {activeTab === "itinerary" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#17202A]">Daily Itinerary Stops</h4>
                      <p className="text-[11px] text-[#5B6770]">
                        Each day is displayed as an interactive accordion item on the tour detail page.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const current = editingPackage.itinerary || [];
                        const nextDayNumber = current.length + 1;
                        const newDay: ItineraryDay = {
                          day: nextDayNumber,
                          title: `Day ${nextDayNumber} Exploration`,
                          description: "Detailed description of activities and travels for this day...",
                          accommodation: "Hotel / Resort",
                          meals: "Breakfast included",
                          activities: "Guided exploration",
                        };
                        setEditingPackage((prev) => (prev ? { ...prev, itinerary: [...current, newDay] } : null));
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Day {((editingPackage.itinerary?.length || 0) + 1)}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingPackage.itinerary?.map((dayItem, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-[#0C5A70] text-white text-xs font-extrabold flex items-center justify-center">
                              {dayItem.day || idx + 1}
                            </span>
                            <span className="text-xs font-extrabold text-[#17202A]">
                              Day {dayItem.day || idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === 0) return;
                                const updated = [...(editingPackage.itinerary || [])];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                // re-assign day numbers
                                updated.forEach((d, i) => (d.day = i + 1));
                                setEditingPackage((prev) => (prev ? { ...prev, itinerary: updated } : null));
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded-lg border border-[#E8E2D2] bg-white disabled:opacity-30"
                              title="Move Day Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === (editingPackage.itinerary?.length || 0) - 1) return;
                                const updated = [...(editingPackage.itinerary || [])];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                updated.forEach((d, i) => (d.day = i + 1));
                                setEditingPackage((prev) => (prev ? { ...prev, itinerary: updated } : null));
                              }}
                              disabled={idx === (editingPackage.itinerary?.length || 0) - 1}
                              className="p-1 rounded-lg border border-[#E8E2D2] bg-white disabled:opacity-30"
                              title="Move Day Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(editingPackage.itinerary || [])];
                                updated.splice(idx, 1);
                                updated.forEach((d, i) => (d.day = i + 1));
                                setEditingPackage((prev) => (prev ? { ...prev, itinerary: updated } : null));
                              }}
                              className="p-1 rounded-lg text-red-600 bg-white border border-red-200 hover:bg-red-50 ml-1"
                              title="Delete Day"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Day Title</label>
                          <input
                            type="text"
                            value={dayItem.title || ""}
                            onChange={(e) => {
                              const updated = [...(editingPackage.itinerary || [])];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setEditingPackage((prev) => (prev ? { ...prev, itinerary: updated } : null));
                            }}
                            placeholder="e.g. Sigiriya Rock Fortress Ascent & Elephant Safari"
                            className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs font-semibold bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#5B6770] mb-1">
                            Day Description & Activities
                          </label>
                          <textarea
                            rows={3}
                            value={dayItem.description || ""}
                            onChange={(e) => {
                              const updated = [...(editingPackage.itinerary || [])];
                              updated[idx] = { ...updated[idx], description: e.target.value };
                              setEditingPackage((prev) => (prev ? { ...prev, itinerary: updated } : null));
                            }}
                            placeholder="Describe the route, sightseeing stops, and experiences for this day..."
                            className="w-full p-2.5 rounded-xl border border-[#E8E2D2] text-xs bg-white leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Accommodation</label>
                            <input
                              type="text"
                              value={dayItem.accommodation || ""}
                              onChange={(e) => {
                                const updated = [...(editingPackage.itinerary || [])];
                                updated[idx] = { ...updated[idx], accommodation: e.target.value };
                                setEditingPackage((prev) => (prev ? { ...prev, itinerary: updated } : null));
                              }}
                              placeholder="e.g. Aliya Resort & Spa / Cinnamon Lodge"
                              className="w-full p-2 rounded-xl border border-[#E8E2D2] text-xs bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#5B6770] mb-1">Meals Plan</label>
                            <input
                              type="text"
                              value={dayItem.meals || ""}
                              onChange={(e) => {
                                const updated = [...(editingPackage.itinerary || [])];
                                updated[idx] = { ...updated[idx], meals: e.target.value };
                                setEditingPackage((prev) => (prev ? { ...prev, itinerary: updated } : null));
                              }}
                              placeholder="e.g. Breakfast & Dinner included"
                              className="w-full p-2 rounded-xl border border-[#E8E2D2] text-xs bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: INCLUSIONS, EXCLUSIONS, FAQS & HIGHLIGHTS */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  {/* Included Services (Repeatable) */}
                  <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2B5829] flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Included Services ({editingPackage.inclusions?.length || 0})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingPackage.inclusions || [];
                          setEditingPackage((prev) =>
                            prev ? { ...prev, inclusions: [...current, "New included item"] } : null
                          );
                        }}
                        className="px-3 py-1 rounded-xl text-xs font-bold text-[#2B5829] bg-white border border-[#2B5829]/30 hover:bg-[#2B5829]/10"
                      >
                        + Add Inclusion
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingPackage.inclusions?.map((inc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={inc}
                            onChange={(e) => {
                              const updated = [...(editingPackage.inclusions || [])];
                              updated[i] = e.target.value;
                              setEditingPackage((prev) => (prev ? { ...prev, inclusions: updated } : null));
                            }}
                            className="flex-1 p-2 rounded-xl border border-[#E8E2D2] text-xs bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(editingPackage.inclusions || [])];
                              updated.splice(i, 1);
                              setEditingPackage((prev) => (prev ? { ...prev, inclusions: updated } : null));
                            }}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Excluded Services (Repeatable) */}
                  <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4" />
                        <span>Excluded Services ({editingPackage.exclusions?.length || 0})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingPackage.exclusions || [];
                          setEditingPackage((prev) =>
                            prev ? { ...prev, exclusions: [...current, "New exclusion item"] } : null
                          );
                        }}
                        className="px-3 py-1 rounded-xl text-xs font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50"
                      >
                        + Add Exclusion
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingPackage.exclusions?.map((exc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={exc}
                            onChange={(e) => {
                              const updated = [...(editingPackage.exclusions || [])];
                              updated[i] = e.target.value;
                              setEditingPackage((prev) => (prev ? { ...prev, exclusions: updated } : null));
                            }}
                            className="flex-1 p-2 rounded-xl border border-[#E8E2D2] text-xs bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(editingPackage.exclusions || [])];
                              updated.splice(i, 1);
                              setEditingPackage((prev) => (prev ? { ...prev, exclusions: updated } : null));
                            }}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequently Asked Questions (Repeatable) */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E8E2D2] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0C5A70] flex items-center gap-1.5 uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4" />
                        <span>Frequently Asked Questions ({editingPackage.faqs?.length || 0})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingPackage.faqs || [];
                          setEditingPackage((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  faqs: [
                                    ...current,
                                    {
                                      question: "Can we customize this itinerary?",
                                      answer: "Yes, every tour is 100% customisable to your pace and flight times.",
                                    },
                                  ],
                                }
                              : null
                          );
                        }}
                        className="px-3 py-1 rounded-xl text-xs font-bold text-[#0C5A70] bg-[#0C5A70]/10 hover:bg-[#0C5A70]/20"
                      >
                        + Add FAQ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editingPackage.faqs?.map((faq, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#17202A]">Q{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(editingPackage.faqs || [])];
                                updated.splice(idx, 1);
                                setEditingPackage((prev) => (prev ? { ...prev, faqs: updated } : null));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...(editingPackage.faqs || [])];
                              updated[idx] = { ...updated[idx], question: e.target.value };
                              setEditingPackage((prev) => (prev ? { ...prev, faqs: updated } : null));
                            }}
                            placeholder="Question..."
                            className="w-full p-2 rounded-lg border border-[#E8E2D2] text-xs font-bold bg-white"
                          />
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...(editingPackage.faqs || [])];
                              updated[idx] = { ...updated[idx], answer: e.target.value };
                              setEditingPackage((prev) => (prev ? { ...prev, faqs: updated } : null));
                            }}
                            placeholder="Answer..."
                            className="w-full p-2 rounded-lg border border-[#E8E2D2] text-xs bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights / Activities list */}
                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1.5">
                      Signature Highlights (comma-separated)
                    </label>
                    <textarea
                      rows={2}
                      value={Array.isArray(editingPackage.activities) ? editingPackage.activities.join(", ") : ""}
                      onChange={(e) =>
                        setEditingPackage((prev) => ({
                          ...prev,
                          activities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                      placeholder="e.g. Sigiriya Rock Fortress, Kandy Scenic Train, Yala Leopard Safari, Mirissa Whale Cruise"
                      className="w-full p-3 rounded-2xl border border-[#E8E2D2] text-xs"
                    />
                  </div>

                  {/* Suitable Traveller Types */}
                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-2">
                      Suitable Traveller Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TRAVELLER_TYPES.map((type) => {
                        const isSelected = editingPackage.suitable_for?.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              const current = editingPackage.suitable_for || [];
                              const updated = isSelected
                                ? current.filter((t) => t !== type)
                                : [...current, type];
                              setEditingPackage((prev) => (prev ? { ...prev, suitable_for: updated } : null));
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-[#0C5A70] text-white shadow-xs"
                                : "bg-[#FBF9F4] text-[#5B6770] border border-[#E8E2D2] hover:bg-gray-100"
                            }`}
                          >
                            <span>{type}</span>
                            {isSelected && <Check className="w-3 h-3 inline-block ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-6 border-t border-[#E8E2D2] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5B6770] border border-[#E8E2D2] hover:bg-gray-100"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  {activeTab !== "content" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "basic") setActiveTab("pricing");
                        else if (activeTab === "pricing") setActiveTab("destinations");
                        else if (activeTab === "destinations") setActiveTab("itinerary");
                        else if (activeTab === "itinerary") setActiveTab("content");
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0C5A70] border border-[#0C5A70] hover:bg-[#0C5A70]/10"
                    >
                      Next Step &rarr;
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={formSaving}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {formSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{editingPackage.id ? "Save & Update Package" : "Create Package"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMAGE PICKER MODAL (Requirement C: Pick from site_images or upload)      */}
      {/* ========================================================================= */}
      {imagePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-[#E8E2D2] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-[#0C5A70] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5" />
                <h3 className="text-base font-extrabold">
                  Select Photo for {imagePickerTarget === "hero" ? "Cover Photo" : "Tour Gallery"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImagePickerOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Upload Shortcut */}
            <div className="p-4 bg-[#FBF9F4] border-b border-[#E8E2D2] flex items-center justify-between">
              <span className="text-xs text-[#5B6770]">
                Or upload a new photo directly to Supabase Storage:
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#E06D53] hover:bg-[#C8573D] flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload New File</span>
              </button>
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {siteImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    if (imagePickerTarget === "hero") {
                      setEditingPackage((prev) => (prev ? { ...prev, hero_image: img.image_url } : null));
                      showToast(`Selected "${img.title}" as cover photo!`);
                    } else {
                      const newGallery: PackageGalleryImage[] = [
                        ...(editingPackage?.gallery_images || []),
                        { src: img.image_url, alt: img.title, caption: img.description || img.title },
                      ];
                      setEditingPackage((prev) => (prev ? { ...prev, gallery_images: newGallery } : null));
                      showToast(`Added "${img.title}" to gallery!`);
                    }
                    setImagePickerOpen(false);
                  }}
                  className="group relative rounded-2xl overflow-hidden border border-[#E8E2D2] bg-gray-100 aspect-4/3 text-left focus:outline-none hover:ring-2 hover:ring-[#0C5A70] transition-all"
                >
                  <Image
                    src={img.image_url}
                    alt={img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={img.image_url.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                    <span className="text-[10px] font-bold line-clamp-1">{img.title}</span>
                    <span className="text-[9px] text-white/80 capitalize">{img.destination || img.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Direct Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* PREVIEW MODAL                                                             */}
      {/* ========================================================================= */}
      {previewPackage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E8E2D2] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#0C5A70] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#E06D53]" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Live Preview: {previewPackage.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPackage(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Hero Banner Mock */}
              <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-gray-900 shadow-md">
                <Image
                  src={previewPackage.heroImage}
                  alt={previewPackage.title}
                  fill
                  className="object-cover"
                  unoptimized={previewPackage.heroImage.startsWith("http")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E06D53] text-white">
                      {previewPackage.durationDays} Days / {previewPackage.durationNights} Nights
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                      {previewPackage.travelStyle}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">{previewPackage.title}</h2>
                  <p className="text-xs text-white/90 mt-1 max-w-xl">{previewPackage.tagline}</p>
                </div>
              </div>

              {/* Overview */}
              <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]">
                <h4 className="text-xs font-extrabold text-[#17202A] uppercase mb-2">Tour Overview</h4>
                <p className="text-xs text-[#5B6770] leading-relaxed">{previewPackage.overview}</p>
              </div>

              {/* Day-by-Day Itinerary Preview */}
              <div>
                <h4 className="text-xs font-extrabold text-[#17202A] uppercase mb-3">
                  Day-by-Day Itinerary ({previewPackage.itinerary.length} Days)
                </h4>
                <div className="space-y-2">
                  {previewPackage.itinerary.map((day) => (
                    <div key={day.day} className="p-3.5 rounded-xl border border-[#E8E2D2] bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-[#0C5A70]">
                          Day {day.day}: {day.title}
                        </span>
                        {day.accommodation && (
                          <span className="text-[10px] text-[#5B6770] font-semibold">
                            Stay: {day.accommodation}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5B6770] leading-relaxed">{day.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#2B5829]/5 border border-[#2B5829]/20">
                  <span className="text-xs font-bold text-[#2B5829] uppercase block mb-2">Included</span>
                  <ul className="text-xs text-[#5B6770] space-y-1.5 list-disc pl-4">
                    {previewPackage.inclusions.map((inc, i) => (
                      <li key={i}>{inc}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/60">
                  <span className="text-xs font-bold text-red-700 uppercase block mb-2">Excluded</span>
                  <ul className="text-xs text-[#5B6770] space-y-1.5 list-disc pl-4">
                    {previewPackage.exclusions.map((exc, i) => (
                      <li key={i}>{exc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FBF9F4] border-t border-[#E8E2D2] flex justify-between items-center shrink-0">
              <Link
                href={`/tours/${previewPackage.slug}`}
                target="_blank"
                className="text-xs font-bold text-[#0C5A70] hover:underline flex items-center gap-1"
              >
                <span>Open Live Public URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setPreviewPackage(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0C5A70] text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG (With Customer Enquiry Protection Warning)      */}
      {/* ========================================================================= */}
      {deleteConfirmPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-red-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-[#17202A] mb-2">
              Delete Tour Package?
            </h3>

            <p className="text-xs text-[#5B6770] leading-relaxed mb-4">
              Are you sure you want to permanently delete{" "}
              <strong>&ldquo;{deleteConfirmPackage.title}&rdquo;</strong>?
            </p>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left text-[11px] text-amber-800 mb-6 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Historical Enquiry Safety:</strong> All customer bookings and enquiries linked to this package will remain safely preserved in the database.
              </span>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteConfirmPackage(null)}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5B6770] border border-[#E8E2D2] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
