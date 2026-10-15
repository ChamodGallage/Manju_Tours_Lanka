"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit,
  RefreshCw,
  AlertCircle,
  Quote,
} from "lucide-react";
import type { ReviewItem } from "@/types/database.types";

const INITIAL_FORM_STATE = {
  id: "",
  author_name: "",
  author_country: "United Kingdom",
  rating: 5,
  review_date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  travel_month: "",
  title: "Outstanding Sri Lanka Experience",
  comment: "",
  source: "TripAdvisor",
  tour_title: "10-Day Sri Lanka Classic Discovery",
  is_verified: true,
  is_featured: true,
  is_published: true,
  display_order: 0,
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("all"); // "all", "true", "false"

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  // Status feedback
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (featuredFilter !== "all") params.set("featured", featuredFilter);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Fetch reviews error:", err);
      setActionError("Failed to fetch reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/reviews");
        const data = await res.json();
        if (isMounted && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("Initial load reviews error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      ...INITIAL_FORM_STATE,
      display_order: reviews.length + 1,
    });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (review: ReviewItem) => {
    setFormData({
      id: review.id,
      author_name: review.author_name,
      author_country: review.author_country,
      rating: review.rating,
      review_date: review.review_date,
      travel_month: review.travel_month || "",
      title: review.title,
      comment: review.comment,
      source: review.source,
      tour_title: review.tour_title || "",
      is_verified: review.is_verified,
      is_featured: review.is_featured,
      is_published: review.is_published ?? true,
      display_order: review.display_order,
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    try {
      const url = "/api/admin/reviews";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success || data.review) {
        setActionSuccess(isEditing ? "Review updated successfully!" : "Review added successfully!");
        setTimeout(() => setActionSuccess(null), 3000);
        setIsFormOpen(false);
        fetchReviews();
      } else {
        setActionError(data.error || "Failed to save review");
      }
    } catch {
      setActionError("Network error while saving review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (review: ReviewItem) => {
    const updatedStatus = !review.is_featured;
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, is_featured: updatedStatus } : r))
    );

    try {
      await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review.id, is_featured: updatedStatus }),
      });
      setActionSuccess(`Review ${updatedStatus ? "featured on homepage" : "unfeatured"}`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch {
      setActionError("Failed to update featured status");
    }
  };

  const handleTogglePublished = async (review: ReviewItem) => {
    const is_published = !(review.is_published ?? true);
    const response = await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, is_published }),
    });
    if (!response.ok) {
      setActionError("Failed to update review publication status.");
      return;
    }
    setReviews((previous) => previous.map((item) => item.id === review.id ? { ...item, is_published } : item));
    setActionSuccess(is_published ? "Review published." : "Review hidden from the website.");
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
        setActionSuccess("Review removed successfully.");
        setTimeout(() => setActionSuccess(null), 3000);
        setDeleteModalOpen(false);
        setReviewToDelete(null);
      } else {
        setActionError(data.error || "Failed to delete review");
      }
    } catch {
      setActionError("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (featuredFilter === "true" && !r.is_featured) return false;
    if (featuredFilter === "false" && r.is_featured) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.author_name.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.author_country.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Guest Reviews & Testimonials
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#0C5A70]/40 text-[#4EB5D1] border border-[#0C5A70]">
              {reviews.length} Total
            </span>
          </div>
          <p className="text-sm text-[#8E9CA6] mt-1">
            Manage authentic guest stories and TripAdvisor testimonials displayed across the public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#141C24] text-white border border-[#232F3E] hover:border-[#0C5A70] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Review
          </button>
        </div>
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

      {/* Filter toolbar */}
      <div className="bg-[#141C24] p-4 rounded-xl border border-[#232F3E] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6770]" />
          <input
            type="text"
            placeholder="Search reviews by guest name, country, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#0C1015] border border-[#232F3E] rounded-lg text-white placeholder-[#5B6770] focus:outline-none focus:border-[#0C5A70] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6770] shrink-0" />
          <span className="text-xs text-[#8E9CA6] shrink-0">Show:</span>
          {(["all", "true", "false"] as const).map((filterVal) => (
            <button
              key={filterVal}
              onClick={() => setFeaturedFilter(filterVal)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                featuredFilter === filterVal
                  ? "bg-[#0C5A70] text-white"
                  : "bg-[#0C1015] text-[#8E9CA6] border border-[#232F3E] hover:text-white"
              }`}
            >
              {filterVal === "all" ? "All Reviews" : filterVal === "true" ? "Featured on Home" : "Standard"}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#8E9CA6]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0C5A70] mb-3" />
          <p className="text-sm">Loading reviews from database...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center bg-[#141C24] rounded-2xl border border-[#232F3E] p-8">
          <Star className="w-12 h-12 text-[#5B6770] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No reviews found</h3>
          <p className="text-xs text-[#8E9CA6] mt-1 max-w-sm mx-auto">
            Click &quot;Add Review&quot; above to publish your first guest testimonial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#141C24] rounded-xl border border-[#232F3E] hover:border-[#2F3E50] p-5 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header: Rating & Source badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "text-amber-400 fill-amber-400" : "text-[#232F3E]"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-white ml-1.5">{review.rating}.0</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#0C1015] text-[#8E9CA6] border border-[#232F3E]">
                      {review.source}
                    </span>
                    {review.is_featured && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${review.is_published === false ? "bg-slate-500/10 text-slate-300 border-slate-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>
                      {review.is_published === false ? "Draft" : "Published"}
                    </span>
                  </div>
                </div>

                {/* Title & Comment */}
                {review.title && (
                  <h4 className="text-sm font-bold text-white mb-1.5">{review.title}</h4>
                )}
                <p className="text-xs text-[#C5D0D9] leading-relaxed line-clamp-4 relative pl-4 italic">
                  <Quote className="w-3 h-3 absolute left-0 top-0.5 text-[#0C5A70]" />
                  &quot;{review.comment}&quot;
                </p>

                {/* Tour relation if any */}
                {review.tour_title && (
                  <div className="mt-3 text-[11px] text-[#4EB5D1] bg-[#0C1015] px-2.5 py-1 rounded border border-[#232F3E]">
                    Tour: {review.tour_title}
                  </div>
                )}
              </div>

              {/* Footer: Author details & action buttons */}
              <div className="mt-4 pt-3 border-t border-[#232F3E]/60 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white">{review.author_name}</div>
                  <div className="text-[10px] text-[#8E9CA6]">
                    {review.author_country} • {review.review_date}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePublished(review)}
                    className="px-2.5 py-1 text-xs rounded font-medium bg-[#0C1015] text-[#8E9CA6] hover:text-white border border-[#232F3E]"
                    title={review.is_published === false ? "Publish review" : "Hide review from public website"}
                  >
                    {review.is_published === false ? "Publish" : "Hide"}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(review)}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      review.is_featured
                        ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                        : "bg-[#0C1015] text-[#8E9CA6] hover:text-white border border-[#232F3E]"
                    }`}
                    title="Toggle featured on homepage"
                  >
                    {review.is_featured ? "Featured" : "Feature"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(review)}
                    className="p-1.5 text-xs text-[#8E9CA6] hover:text-white bg-[#0C1015] hover:bg-[#1C2530] border border-[#232F3E] rounded transition-colors"
                    title="Edit review"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setReviewToDelete(review);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 rounded transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-xl max-w-xl w-full p-6 space-y-4 my-8">
            <h3 className="text-base font-bold text-white font-serif">
              {isEditing ? "Edit Guest Review" : "Add New Guest Review"}
            </h3>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Author / Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Country / Origin *</label>
                  <input
                    type="text"
                    required
                    value={formData.author_country}
                    onChange={(e) => setFormData({ ...formData, author_country: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Star Rating (1 - 5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Review Date / Year</label>
                  <input
                    type="text"
                    value={formData.review_date}
                    onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Platform Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  >
                    <option value="TripAdvisor">TripAdvisor</option>
                    <option value="Google Reviews">Google Reviews</option>
                    <option value="Direct Guest Feedback">Direct Guest Feedback</option>
                    <option value="WhatsApp Testimonial">WhatsApp Testimonial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Associated Tour (Optional)</label>
                <input
                  type="text"
                  value={formData.tour_title}
                  onChange={(e) => setFormData({ ...formData, tour_title: e.target.value })}
                  placeholder="e.g. 10-Day Sri Lanka Classic Discovery"
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Review Headline / Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unforgettable 10 days with Manju!"
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Testimonial Comment *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Paste the guest's detailed review here..."
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded bg-[#0C1015] border-[#232F3E] text-[#0C5A70] focus:ring-0"
                  />
                  <span className="text-[#E0E6ED]">Feature on Homepage Carousel</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="rounded bg-[#0C1015] border-[#232F3E] text-[#0C5A70] focus:ring-0"
                  />
                  <span className="text-[#E0E6ED]">Verified Booking Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#232F3E]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#8E9CA6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white"
                >
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Guest Review?</h3>
                <p className="text-xs text-[#8E9CA6] mt-0.5">
                  Are you sure you want to delete the review by {reviewToDelete.author_name}?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setReviewToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#8E9CA6] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
