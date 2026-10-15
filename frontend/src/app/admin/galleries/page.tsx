"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Images,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import type { GalleryCollectionItem } from "@/types/database.types";

interface GalleryImageItem {
  src: string;
  alt?: string;
  caption?: string;
}

const INITIAL_FORM: Partial<GalleryCollectionItem> & { images: GalleryImageItem[] } = {
  id: "",
  title: "",
  slug: "",
  description: "",
  category: "scenic",
  cover_image: "/images/hero.webp",
  images: [],
  display_order: 0,
  is_published: true,
};

export default function AdminGalleriesPage() {
  const [collections, setCollections] = useState<GalleryCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [newImgSrc, setNewImgSrc] = useState("");
  const [newImgAlt, setNewImgAlt] = useState("");
  const [newImgCaption, setNewImgCaption] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<GalleryCollectionItem | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/galleries");
      const data = await res.json();
      if (data.collections) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error("Fetch galleries error:", err);
      setActionError("Failed to load gallery collections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/galleries");
        const data = await res.json();
        if (isMounted && data.collections) {
          setCollections(data.collections);
        }
      } catch (err) {
        console.error("Initial load error:", err);
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
      ...INITIAL_FORM,
      display_order: collections.length + 1,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: GalleryCollectionItem) => {
    setFormData({
      id: col.id,
      title: col.title,
      slug: col.slug,
      description: col.description || "",
      category: col.category,
      cover_image: col.cover_image,
      images: Array.isArray(col.images) ? col.images : [],
      display_order: col.display_order,
      is_published: col.is_published,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAddImage = () => {
    if (!newImgSrc.trim()) return;
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        {
          src: newImgSrc.trim(),
          alt: newImgAlt.trim() || formData.title,
          caption: newImgCaption.trim(),
        },
      ],
    });
    setNewImgSrc("");
    setNewImgAlt("");
    setNewImgCaption("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    try {
      const url = "/api/admin/galleries";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success || data.collection) {
        setActionSuccess(isEditing ? "Gallery updated!" : "New gallery collection created!");
        setTimeout(() => setActionSuccess(null), 3000);
        setIsModalOpen(false);
        fetchGalleries();
      } else {
        setActionError(data.error || "Failed to save gallery");
      }
    } catch {
      setActionError("Network error while saving gallery");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublished = async (col: GalleryCollectionItem) => {
    const updatedStatus = !col.is_published;
    setCollections((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, is_published: updatedStatus } : c))
    );

    try {
      await fetch("/api/admin/galleries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: col.id, is_published: updatedStatus }),
      });
      setActionSuccess(`Gallery status changed to ${updatedStatus ? "Published" : "Draft"}`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch {
      setActionError("Failed to update status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;
    try {
      const res = await fetch(`/api/admin/galleries?id=${collectionToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCollections((prev) => prev.filter((c) => c.id !== collectionToDelete.id));
        setActionSuccess("Gallery collection removed.");
        setTimeout(() => setActionSuccess(null), 3000);
        setDeleteModalOpen(false);
        setCollectionToDelete(null);
      } else {
        setActionError(data.error || "Failed to delete gallery");
      }
    } catch {
      setActionError("Failed to delete gallery");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Visual Galleries & Photo Collections
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#0C5A70]/40 text-[#4EB5D1] border border-[#0C5A70]">
              {collections.length} Collections
            </span>
          </div>
          <p className="text-sm text-[#8E9CA6] mt-1">
            Curate thematic photo collections of Sri Lankan wildlife, coastal lagoons, and heritage landmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchGalleries}
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
            Add Collection
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

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#8E9CA6]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0C5A70] mb-3" />
          <p className="text-sm">Loading visual collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="py-20 text-center bg-[#141C24] rounded-2xl border border-[#232F3E] p-8">
          <Images className="w-12 h-12 text-[#5B6770] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No gallery collections created</h3>
          <p className="text-xs text-[#8E9CA6] mt-1 max-w-sm mx-auto">
            Click &quot;Add Collection&quot; to organize photos into curated themes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => {
            const photoCount = Array.isArray(col.images) ? col.images.length : 0;

            return (
              <div
                key={col.id}
                className="bg-[#141C24] rounded-xl border border-[#232F3E] hover:border-[#2F3E50] overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Cover Photo */}
                  <div className="h-44 bg-[#0C1015] relative overflow-hidden">
                    {col.cover_image ? (
                      <Image
                        src={col.cover_image}
                        alt={col.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5B6770]">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-black/60 backdrop-blur-md text-white border border-white/20 capitalize">
                        {col.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded backdrop-blur-md border ${
                          col.is_published
                            ? "bg-emerald-500/80 text-white border-emerald-400"
                            : "bg-amber-500/80 text-white border-amber-400"
                        }`}
                      >
                        {col.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] text-white backdrop-blur-sm">
                      {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{col.title}</h3>
                    <p className="text-xs text-[#8E9CA6] line-clamp-2 leading-relaxed">
                      {col.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-2 border-t border-[#232F3E]/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePublished(col)}
                    className="text-xs text-[#8E9CA6] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {col.is_published ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(col)}
                      className="p-1.5 text-xs text-[#8E9CA6] hover:text-white bg-[#0C1015] hover:bg-[#1C2530] border border-[#232F3E] rounded transition-colors"
                      title="Edit collection"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCollectionToDelete(col);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 rounded transition-colors"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-xl max-w-2xl w-full p-6 space-y-4 my-8">
            <h3 className="text-base font-bold text-white font-serif">
              {isEditing ? "Edit Gallery Collection" : "Add New Gallery Collection"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Collection Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setFormData({ ...formData, title, slug: isEditing ? formData.slug : slug });
                    }}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  >
                    <option value="beaches">Beaches & Coastlines</option>
                    <option value="scenic">Scenic Highlands & Tea Estates</option>
                    <option value="wildlife">Wildlife Safaris & Nature</option>
                    <option value="heritage">Ancient Heritage & Temples</option>
                    <option value="island-life">Authentic Island Life</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Cover Image URL *</label>
                  <input
                    type="text"
                    required
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="/images/hero.webp"
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of this photo story..."
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              {/* Photos in this collection */}
              <div className="border border-[#232F3E] rounded-lg p-3 bg-[#0C1015] space-y-3">
                <span className="font-semibold text-white block">
                  Collection Photos ({formData.images.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Photo URL (/images/... or Supabase)"
                    value={newImgSrc}
                    onChange={(e) => setNewImgSrc(e.target.value)}
                    className="p-2 bg-[#141C24] border border-[#232F3E] rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={newImgAlt}
                    onChange={(e) => setNewImgAlt(e.target.value)}
                    className="p-2 bg-[#141C24] border border-[#232F3E] rounded text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Caption"
                      value={newImgCaption}
                      onChange={(e) => setNewImgCaption(e.target.value)}
                      className="flex-1 p-2 bg-[#141C24] border border-[#232F3E] rounded text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-3 py-1 bg-[#0C5A70] hover:bg-[#0E6C86] rounded text-white font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-[#141C24] border border-[#232F3E] text-[11px]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#5B6770] font-mono">#{idx + 1}</span>
                        <span className="text-white truncate">{img.src}</span>
                        {img.caption && <span className="text-[#8E9CA6] italic">({img.caption})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded bg-[#0C1015] border-[#232F3E] text-[#0C5A70] focus:ring-0"
                  />
                  <span className="text-[#E0E6ED]">Publish on Website</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[#8E9CA6]">Display Order:</span>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-16 p-1.5 bg-[#0C1015] border border-[#232F3E] rounded text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#232F3E]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#8E9CA6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white"
                >
                  {submitting ? "Saving..." : "Save Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteModalOpen && collectionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Gallery Collection?</h3>
                <p className="text-xs text-[#8E9CA6] mt-0.5">
                  Are you sure you want to remove &quot;{collectionToDelete.title}&quot;?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCollectionToDelete(null);
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
