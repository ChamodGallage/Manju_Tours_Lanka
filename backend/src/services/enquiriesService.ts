import { getAdminSupabaseClient } from "../config/supabase.js";
import type { TourEnquiryRow } from "../types/database.types.js";
import { logger } from "../utils/logger.js";
import { sanitizeString } from "../utils/sanitize.js";

let runtimeEnquiries: TourEnquiryRow[] = [
  {
    id: "enq-1",
    tour_id: "tour-1",
    tour_title: "Grand Sri Lanka Odyssey",
    name: "Emma & James Wilson",
    email: "emma.wilson@example.co.uk",
    phone: "+44 7911 123456",
    country: "United Kingdom",
    travel_start_date: "2026-11-15",
    travel_end_date: "2026-11-28",
    flexible_month: "November 2026",
    number_of_adults: 2,
    number_of_children: 0,
    travel_style: "Private Chauffeur Guide",
    message: "Interested in the 14-day tour with luxury boutique hotels and tea plantation train ride.",
    status: "NEW",
    source: "Website Tour Enquiry",
    admin_notes: "",
    ip_hash: "127.0.0.1",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const enquiriesService = {
  async getAll(): Promise<TourEnquiryRow[]> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("tour_enquiries")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          return data as TourEnquiryRow[];
        }
      } catch (err) {
        logger.warn("Supabase enquiries fetch error:", err);
      }
    }
    return [...runtimeEnquiries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async create(data: {
    tourId?: string | null;
    tourTitle?: string | null;
    name: string;
    email: string;
    phone: string;
    country: string;
    travelStartDate?: string | null;
    travelEndDate?: string | null;
    flexibleMonth?: string | null;
    numberOfAdults?: number;
    numberOfChildren?: number;
    travelStyle?: string | null;
    message: string;
  }, ip = "anonymous"): Promise<TourEnquiryRow> {
    const record: TourEnquiryRow = {
      id: `enq-${Date.now()}`,
      tour_id: data.tourId || null,
      tour_title: data.tourTitle ? sanitizeString(data.tourTitle) : null,
      name: sanitizeString(data.name),
      email: data.email.trim().toLowerCase(),
      phone: sanitizeString(data.phone),
      country: sanitizeString(data.country),
      travel_start_date: data.travelStartDate || null,
      travel_end_date: data.travelEndDate || null,
      flexible_month: data.flexibleMonth || null,
      number_of_adults: data.numberOfAdults || 2,
      number_of_children: data.numberOfChildren || 0,
      travel_style: data.travelStyle || "Private Chauffeur Guide",
      message: sanitizeString(data.message),
      status: "NEW",
      source: data.tourTitle ? "Tour Details Page" : "Custom Itinerary Planner",
      admin_notes: "",
      ip_hash: ip,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const { data: inserted, error } = await client
          .from("tour_enquiries")
          .insert(record)
          .select()
          .single();
        if (!error && inserted) {
          runtimeEnquiries.unshift(inserted as TourEnquiryRow);
          return inserted as TourEnquiryRow;
        }
      } catch (err) {
        logger.warn("Supabase enquiry insert error, keeping in runtime store:", err);
      }
    }

    runtimeEnquiries.unshift(record);
    return record;
  },

  async createContact(data: {
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
  }, ip = "anonymous"): Promise<TourEnquiryRow> {
    return this.create({
      tourId: null,
      tourTitle: `Contact Desk: ${data.subject}`,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      country: "Direct Message",
      travelStartDate: null,
      travelEndDate: null,
      flexibleMonth: null,
      numberOfAdults: 1,
      numberOfChildren: 0,
      travelStyle: "General Enquiry",
      message: data.message,
    }, ip);
  },

  async updateStatus(id: string, status: string, adminNotes?: string): Promise<TourEnquiryRow | null> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const updates: Record<string, unknown> = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (adminNotes !== undefined) updates.admin_notes = adminNotes;

        const { data, error } = await client
          .from("tour_enquiries")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) {
          const idx = runtimeEnquiries.findIndex((e) => e.id === id);
          if (idx !== -1) runtimeEnquiries[idx] = data as TourEnquiryRow;
          return data as TourEnquiryRow;
        }
      } catch (err) {
        logger.warn("Supabase enquiry update error:", err);
      }
    }

    const item = runtimeEnquiries.find((e) => e.id === id);
    if (!item) return null;

    item.status = status;
    if (adminNotes !== undefined) item.admin_notes = adminNotes;
    item.updated_at = new Date().toISOString();
    return item;
  },

  async delete(id: string): Promise<boolean> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        await client.from("tour_enquiries").delete().eq("id", id);
      } catch (err) {
        logger.warn("Supabase enquiry delete error:", err);
      }
    }
    const beforeLen = runtimeEnquiries.length;
    runtimeEnquiries = runtimeEnquiries.filter((e) => e.id !== id);
    return runtimeEnquiries.length < beforeLen;
  },
};
