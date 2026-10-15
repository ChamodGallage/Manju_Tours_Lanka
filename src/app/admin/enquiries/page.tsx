"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Inbox,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Trash2,
  Edit3,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { TourEnquiryRow } from "@/types/database.types";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  NEW: {
    label: "New Enquiry",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: Sparkles,
  },
  CONTACTED: {
    label: "Contacted",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    icon: RefreshCw,
  },
  CONFIRMED: {
    label: "Confirmed Booking",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled / Declined",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: XCircle,
  },
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<TourEnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  // Active modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState<TourEnquiryRow | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<TourEnquiryRow | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      const data = await res.json();
      if (data.enquiries) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
      setActionError("Failed to fetch enquiries from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/enquiries");
        const data = await res.json();
        if (isMounted && data.enquiries) {
          setEnquiries(data.enquiries);
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

  // Update status handler
  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    startTransition(async () => {
      // Optimistic update
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus, updated_at: new Date().toISOString() } : e))
      );

      try {
        const res = await fetch("/api/admin/enquiries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: enquiryId, status: newStatus }),
        });
        const data = await res.json();
        if (data.success) {
          setActionSuccess(`Updated status to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
          setTimeout(() => setActionSuccess(null), 3000);
        } else {
          setActionError(data.error || "Failed to update status");
        }
      } catch (err) {
        console.error("Status update error:", err);
        setActionError("Network error while updating status");
      }
    });
  };

  // Save notes handler
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEnquiry.id, admin_notes: notesText }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? { ...e, admin_notes: notesText } : e))
        );
        setActionSuccess("Staff notes saved successfully.");
        setTimeout(() => setActionSuccess(null), 3000);
        setNotesModalOpen(false);
      } else {
        setActionError(data.error || "Failed to save notes");
      }
    } catch {
      setActionError("Failed to save notes.");
    }
  };

  // Safe delete handler
  const handleConfirmDelete = async () => {
    if (!enquiryToDelete) return;
    try {
      const res = await fetch(`/api/admin/enquiries?id=${enquiryToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) => prev.filter((e) => e.id !== enquiryToDelete.id));
        setActionSuccess("Enquiry removed from records.");
        setTimeout(() => setActionSuccess(null), 3000);
        setDeleteModalOpen(false);
        setEnquiryToDelete(null);
      } else {
        setActionError(data.error || "Failed to delete enquiry");
      }
    } catch {
      setActionError("Failed to delete enquiry.");
    }
  };

  // Helper for generating clean WhatsApp link
  const getWhatsAppLink = (enquiry: TourEnquiryRow) => {
    const rawNumber = enquiry.phone.replace(/[^0-9]/g, "");
    const greeting = `Hi ${enquiry.name}, this is Manju from Manju Tours Lanka! Thank you for inquiring about ${enquiry.tour_title || "your customized holiday in Sri Lanka"}. I would be delighted to help craft your perfect itinerary.`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(greeting)}`;
  };

  // Counts for KPI cards
  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "NEW").length;
  const inProgressCount = enquiries.filter((e) => e.status === "IN_PROGRESS" || e.status === "CONTACTED").length;
  const confirmedCount = enquiries.filter((e) => e.status === "CONFIRMED").length;

  // Filtered list
  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = e.name.toLowerCase().includes(q);
      const matchEmail = e.email.toLowerCase().includes(q);
      const matchPhone = e.phone.toLowerCase().includes(q);
      const matchTour = e.tour_title ? e.tour_title.toLowerCase().includes(q) : false;
      const matchCountry = e.country.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchTour || matchCountry;
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
              Customer Enquiries & Bookings
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#0C5A70]/40 text-[#4EB5D1] border border-[#0C5A70]">
              {totalCount} Total
            </span>
          </div>
          <p className="text-sm text-[#8E9CA6] mt-1">
            Review incoming tour requests, chat with guests directly on WhatsApp, and update booking progress.
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          disabled={loading || isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#141C24] text-white border border-[#232F3E] hover:border-[#0C5A70] hover:text-[#4EB5D1] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
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

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141C24] p-4 rounded-xl border border-[#232F3E]">
          <div className="text-xs font-medium text-[#8E9CA6]">New Inquiries</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">{newCount}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Needs Contact</span>
          </div>
        </div>

        <div className="bg-[#141C24] p-4 rounded-xl border border-[#232F3E]">
          <div className="text-xs font-medium text-[#8E9CA6]">In Discussion</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-400">{inProgressCount}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Active</span>
          </div>
        </div>

        <div className="bg-[#141C24] p-4 rounded-xl border border-[#232F3E]">
          <div className="text-xs font-medium text-[#8E9CA6]">Confirmed Tours</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400">{confirmedCount}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Booked</span>
          </div>
        </div>

        <div className="bg-[#141C24] p-4 rounded-xl border border-[#232F3E]">
          <div className="text-xs font-medium text-[#8E9CA6]">Total Database Leads</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{totalCount}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#8E9CA6]">All Time</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#141C24] p-4 rounded-xl border border-[#232F3E] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6770]" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, country, or tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#0C1015] border border-[#232F3E] rounded-lg text-white placeholder-[#5B6770] focus:outline-none focus:border-[#0C5A70] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-[#5B6770] shrink-0" />
          <span className="text-xs text-[#8E9CA6] shrink-0">Status:</span>
          {(["all", "NEW", "CONTACTED", "IN_PROGRESS", "CONFIRMED", "CANCELLED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-[#0C5A70] text-white"
                  : "bg-[#0C1015] text-[#8E9CA6] border border-[#232F3E] hover:text-white"
              }`}
            >
              {status === "all" ? "All" : STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="py-20 text-center text-[#8E9CA6]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0C5A70] mb-3" />
          <p className="text-sm">Loading guest enquiries from database...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="py-20 text-center bg-[#141C24] rounded-2xl border border-[#232F3E] p-8">
          <Inbox className="w-12 h-12 text-[#5B6770] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No enquiries found</h3>
          <p className="text-xs text-[#8E9CA6] mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all"
              ? "No booking enquiries match your current search or status filter."
              : "When visitors submit the tour enquiry form on your website, they will appear here instantly."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => {
            const statusInfo = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.NEW;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={enquiry.id}
                className="bg-[#141C24] rounded-xl border border-[#232F3E] hover:border-[#2F3E50] transition-all p-5 flex flex-col gap-4"
              >
                {/* Header row: Customer name, country, status badge, dates */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{enquiry.name}</h3>
                      <span className="px-2 py-0.5 text-xs rounded bg-[#0C1015] text-[#8E9CA6] border border-[#232F3E]">
                        {enquiry.country}
                      </span>
                      {enquiry.source && (
                        <span className="text-[10px] text-[#5B6770] uppercase font-semibold">
                          via {enquiry.source}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8E9CA6] mt-1">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#5B6770]" />
                        <a
                          href={`mailto:${enquiry.email}?subject=Your%20Tour%20Enquiry%20with%20Manju%20Tours%20Lanka`}
                          className="hover:text-[#4EB5D1] transition-colors"
                        >
                          {enquiry.email}
                        </a>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#5B6770]" />
                        <span>{enquiry.phone}</span>
                      </span>
                      <span className="text-[#5B6770]">
                        Received: {new Date(enquiry.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <select
                        value={enquiry.status}
                        onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                        className="bg-transparent text-xs font-semibold cursor-pointer focus:outline-none pr-1"
                      >
                        <option value="NEW" className="bg-[#141C24] text-white">New Enquiry</option>
                        <option value="CONTACTED" className="bg-[#141C24] text-white">Contacted</option>
                        <option value="IN_PROGRESS" className="bg-[#141C24] text-white">In Progress</option>
                        <option value="CONFIRMED" className="bg-[#141C24] text-white">Confirmed Booking</option>
                        <option value="CANCELLED" className="bg-[#141C24] text-white">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tour & Guest logistics bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#0C1015] rounded-lg border border-[#232F3E]/60 text-xs">
                  <div>
                    <span className="text-[#5B6770] block font-medium">Selected Tour / Request</span>
                    <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                      {enquiry.tour_title || "Custom Sri Lanka Tour Plan"}
                      {enquiry.tour_id && (
                        <a
                          href={`/tours/${enquiry.tour_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#4EB5D1] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3 inline ml-1" />
                        </a>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5B6770] block font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Travel Dates
                    </span>
                    <span className="text-[#E0E6ED] mt-0.5 block">
                      {enquiry.travel_start_date
                        ? `${enquiry.travel_start_date} ${enquiry.travel_end_date ? `to ${enquiry.travel_end_date}` : ""}`
                        : enquiry.flexible_month
                        ? `Month: ${enquiry.flexible_month}`
                        : "Flexible / To be planned"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#5B6770] block font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" /> Party & Travel Style
                    </span>
                    <span className="text-[#E0E6ED] mt-0.5 block">
                      {enquiry.number_of_adults} Adult{enquiry.number_of_adults > 1 ? "s" : ""}
                      {enquiry.number_of_children > 0 ? `, ${enquiry.number_of_children} Child` : ""}
                      {enquiry.travel_style ? ` • ${enquiry.travel_style}` : ""}
                    </span>
                  </div>
                </div>

                {/* Customer Message */}
                <div className="text-xs text-[#C5D0D9] leading-relaxed bg-[#19222C] p-3 rounded-lg border border-[#263546]">
                  <span className="text-[#8E9CA6] font-semibold block mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-[#4EB5D1]" /> Guest Message:
                  </span>
                  <p className="whitespace-pre-line">{enquiry.message}</p>
                </div>

                {/* Staff Admin Notes */}
                {enquiry.admin_notes && (
                  <div className="text-xs text-amber-200/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    <span className="font-semibold block text-amber-400 mb-0.5">Staff Internal Notes:</span>
                    <p>{enquiry.admin_notes}</p>
                  </div>
                )}

                {/* Action buttons row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#232F3E]/60">
                  <div className="flex items-center gap-2">
                    {/* Quick WhatsApp button */}
                    <a
                      href={getWhatsAppLink(enquiry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    >
                      <Phone className="w-3 h-3" /> Chat on WhatsApp
                    </a>

                    {/* Email button */}
                    <a
                      href={`mailto:${enquiry.email}?subject=Your%20Tour%20Enquiry%20with%20Manju%20Tours%20Lanka`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#232F3E] hover:bg-[#2F3E50] text-[#E0E6ED] transition-colors"
                    >
                      <Mail className="w-3 h-3" /> Email Guest
                    </a>

                    {/* Edit Staff Notes */}
                    <button
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setNotesText(enquiry.admin_notes || "");
                        setNotesModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0C1015] hover:bg-[#1C2530] text-[#8E9CA6] border border-[#232F3E] transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> {enquiry.admin_notes ? "Edit Notes" : "Add Notes"}
                    </button>
                  </div>

                  {/* Safe Delete with warning */}
                  <button
                    onClick={() => {
                      setEnquiryToDelete(enquiry);
                      setDeleteModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove enquiry safely"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Notes Modal */}
      {notesModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-[#232F3E] rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Internal Staff Notes — {selectedEnquiry.name}
            </h3>
            <p className="text-xs text-[#8E9CA6]">
              Keep track of private quotes, hotel confirmations, chauffeur assignments, or payment receipts.
              (These notes are strictly private and never visible to the customer).
            </p>
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Quoted $1,450 USD. Offered private hybrid SUV with English driver Manju. Customer paid 20% advance via bank transfer."
              className="w-full p-3 text-xs bg-[#0C1015] border border-[#232F3E] rounded-lg text-white focus:outline-none focus:border-[#0C5A70]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNotesModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8E9CA6] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Confirmation Dialog */}
      {deleteModalOpen && enquiryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C24] border border-red-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Booking Enquiry?</h3>
                <p className="text-xs text-[#8E9CA6] mt-0.5">
                  Are you sure you want to remove the record for {enquiryToDelete.name}?
                </p>
              </div>
            </div>
            <div className="text-xs text-[#8E9CA6] bg-[#0C1015] p-3 rounded-lg border border-[#232F3E]">
              Tip: If the customer decided not to travel, it is best practice to mark their status as{" "}
              <strong className="text-white">Cancelled</strong> rather than deleting, so your historical records are preserved.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setEnquiryToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#8E9CA6] hover:text-white"
              >
                Keep Record
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
