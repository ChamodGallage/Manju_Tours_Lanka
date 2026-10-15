"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Link as LinkIcon,
} from "lucide-react";
import type { NavigationItem } from "@/types/database.types";

const LOCATIONS = [
  { key: "header", label: "Main Header Menu" },
  { key: "footer_quick_links", label: "Footer Quick Links" },
  { key: "footer_legal", label: "Footer Legal & Policies" },
];

const INITIAL_FORM: Partial<NavigationItem> = {
  id: "",
  menu_location: "header",
  label: "",
  url: "/",
  display_order: 1,
  is_external: false,
  is_active: true,
};

export default function AdminNavigationPage() {
  const [activeLocation, setActiveLocation] = useState<"header" | "footer_quick_links" | "footer_legal">("header");
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NavigationItem | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async (loc: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/navigation?location=${loc}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Fetch navigation error:", err);
      setActionError("Failed to load navigation links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/navigation?location=${activeLocation}`);
        const data = await res.json();
        if (isMounted && data.items) {
          setItems(data.items);
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
  }, [activeLocation]);

  const handleOpenAdd = () => {
    setFormData({
      ...INITIAL_FORM,
      menu_location: activeLocation,
      display_order: items.length + 1,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setFormData(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    try {
      const url = "/api/admin/navigation";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success || data.item) {
        setActionSuccess(isEditing ? "Navigation link updated!" : "New menu link added!");
        setTimeout(() => setActionSuccess(null), 3000);
        setIsModalOpen(false);
        fetchItems(activeLocation);
      } else {
        setActionError(data.error || "Failed to save navigation link");
      }
    } catch {
      setActionError("Network error while saving link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: NavigationItem) => {
    const updatedStatus = !item.is_active;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_active: updatedStatus } : i))
    );

    try {
      await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: updatedStatus }),
      });
      setActionSuccess(`Link is now ${updatedStatus ? "Active" : "Disabled"}`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch {
      setActionError("Failed to update status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/admin/navigation?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        setActionSuccess("Navigation link removed.");
        setTimeout(() => setActionSuccess(null), 3000);
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        setActionError(data.error || "Failed to delete item");
      }
    } catch {
      setActionError("Failed to delete item");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Website Navigation & Menus
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#0C5A70]/40 text-[#4EB5D1] border border-[#0C5A70]">
              {items.length} Links
            </span>
          </div>
          <p className="text-sm text-[#8E9CA6] mt-1">
            Customize header navigation buttons, footer links, and external social or partner destinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchItems(activeLocation)}
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
            Add Menu Link
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

      {/* Location Tabs */}
      <div className="flex border-b border-[#232F3E] gap-2 overflow-x-auto">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.key}
            onClick={() => setActiveLocation(loc.key as "header" | "footer_quick_links" | "footer_legal")}
            className={`pb-3 px-4 text-xs font-semibold transition-colors relative whitespace-nowrap ${
              activeLocation === loc.key
                ? "text-white"
                : "text-[#8E9CA6] hover:text-white"
            }`}
          >
            {loc.label}
            {activeLocation === loc.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EB5D1] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="py-20 text-center text-[#8E9CA6]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0C5A70] mb-3" />
          <p className="text-sm">Loading navigation items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-[#141C24] rounded-2xl border border-[#232F3E] p-8">
          <LinkIcon className="w-12 h-12 text-[#5B6770] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No menu links in this location</h3>
          <p className="text-xs text-[#8E9CA6] mt-1 max-w-sm mx-auto">
            Click &quot;Add Menu Link&quot; above to insert a navigation link.
          </p>
        </div>
      ) : (
        <div className="bg-[#141C24] rounded-xl border border-[#232F3E] divide-y divide-[#232F3E]">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-[#1A232E]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-mono font-bold text-[#4EB5D1]">
                  #{idx + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.label}</span>
                    {item.is_external && (
                      <span className="px-1.5 py-0.5 text-[9px] rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        External
                      </span>
                    )}
                    {!item.is_active && (
                      <span className="px-1.5 py-0.5 text-[9px] rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8E9CA6] font-mono mt-0.5 flex items-center gap-1">
                    <span>{item.url}</span>
                    {item.is_external && <ExternalLink className="w-3 h-3 text-[#5B6770]" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    item.is_active
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : "text-[#5B6770] hover:text-white"
                  }`}
                  title={item.is_active ? "Click to disable link" : "Click to activate link"}
                >
                  {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-xs text-[#8E9CA6] hover:text-white bg-[#0C1015] hover:bg-[#1C2530] border border-[#232F3E] rounded transition-colors"
                  title="Edit link"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setItemToDelete(item);
                    setDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 rounded transition-colors"
                  title="Delete link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-serif">
              {isEditing ? "Edit Navigation Link" : "Add Navigation Link"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Menu Location</label>
                <select
                  value={formData.menu_location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      menu_location: e.target.value as "header" | "footer_quick_links" | "footer_legal",
                    })
                  }
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                >
                  <option value="header">Main Header Menu</option>
                  <option value="footer_quick_links">Footer Quick Links</option>
                  <option value="footer_legal">Footer Legal & Policies</option>
                </select>
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Link Label *</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Tour Packages"
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div>
                <label className="text-[#8E9CA6] block mb-1 font-semibold">Destination URL / Path *</label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="e.g. /tours or https://..."
                  className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E9CA6] block mb-1 font-semibold">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_external}
                      onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
                      className="rounded bg-[#0C1015] border-[#232F3E] text-[#0C5A70] focus:ring-0"
                    />
                    <span className="text-[#E0E6ED]">Open in new tab</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded bg-[#0C1015] border-[#232F3E] text-[#0C5A70] focus:ring-0"
                    />
                    <span className="text-[#E0E6ED]">Active / Visible</span>
                  </label>
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
                  {submitting ? "Saving..." : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Menu Link?</h3>
                <p className="text-xs text-[#8E9CA6] mt-0.5">
                  Are you sure you want to remove &quot;{itemToDelete.label}&quot;?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
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
