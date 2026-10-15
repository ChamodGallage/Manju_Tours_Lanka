import crypto from "crypto";
import { getBackendFirestore } from "../config/firebase.js";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import type { TourEnquiryRow } from "../types/database.types.js";
import { logger } from "../utils/logger.js";
import { sanitizeString } from "../utils/sanitize.js";

function computeIpHash(ip: string): string {
  return crypto.createHash("sha256").update(ip || "127.0.0.1").digest("hex");
}

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
    ip_hash: computeIpHash("127.0.0.1"),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const enquiriesService = {
  async getAll(): Promise<TourEnquiryRow[]> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const q = query(collection(db, "inquiries"), orderBy("created_at", "desc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TourEnquiryRow));
        }
      } catch (err) {
        logger.warn("Firestore enquiries fetch notice, using runtime dataset:", err);
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
  }, ip = "127.0.0.1"): Promise<TourEnquiryRow> {
    const id = `enq-${Date.now()}`;
    const record: TourEnquiryRow = {
      id,
      tour_id: data.tourId || null,
      tour_title: data.tourTitle ? sanitizeString(data.tourTitle) : null,
      name: sanitizeString(data.name),
      email: data.email.trim().toLowerCase(),
      phone: sanitizeString(data.phone || "+94771234567"),
      country: sanitizeString(data.country || "International"),
      travel_start_date: data.travelStartDate || null,
      travel_end_date: data.travelEndDate || null,
      flexible_month: data.flexibleMonth || null,
      number_of_adults: Math.max(1, Math.min(30, Number(data.numberOfAdults) || 2)),
      number_of_children: Math.max(0, Math.min(20, Number(data.numberOfChildren) || 0)),
      travel_style: sanitizeString(data.travelStyle || "Private Chauffeur Guide"),
      message: sanitizeString(data.message),
      status: "NEW",
      source: data.tourTitle ? "Tour Details Page" : "Custom Itinerary Planner",
      admin_notes: "",
      ip_hash: computeIpHash(ip),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "inquiries", id), record);
      } catch (err) {
        logger.warn("Firestore enquiry insert notice, saving in runtime store:", err);
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
  }, ip = "127.0.0.1"): Promise<TourEnquiryRow> {
    return this.create({
      tourId: null,
      tourTitle: `Contact Desk: ${data.subject}`,
      name: data.name,
      email: data.email,
      phone: data.phone || "+94771234567",
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
    const db = getBackendFirestore();
    const item = runtimeEnquiries.find((e) => e.id === id);

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    if (db) {
      try {
        await setDoc(doc(db, "inquiries", id), updates, { merge: true });
      } catch (err) {
        logger.warn("Firestore enquiry update notice:", err);
      }
    }

    if (item) {
      item.status = status;
      if (adminNotes !== undefined) item.admin_notes = adminNotes;
      item.updated_at = new Date().toISOString();
      return item;
    }

    return null;
  },

  async delete(id: string): Promise<boolean> {
    const db = getBackendFirestore();
    if (db) {
      try {
        await deleteDoc(doc(db, "inquiries", id));
      } catch (err) {
        logger.warn("Firestore enquiry delete notice:", err);
      }
    }
    const beforeLen = runtimeEnquiries.length;
    runtimeEnquiries = runtimeEnquiries.filter((e) => e.id !== id);
    return runtimeEnquiries.length < beforeLen;
  },
};
