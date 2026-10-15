import { apiClient } from "./apiClient";
import type { TourEnquiryRow } from "@/types/database.types";

export const enquiriesService = {
  async submitEnquiry(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>("/enquiry", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async submitContact(data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAll(token?: string): Promise<TourEnquiryRow[]> {
    const res = await apiClient<{ enquiries: TourEnquiryRow[] }>("/admin/enquiries", {
      token,
    });
    return res.enquiries;
  },

  async updateStatus(id: string, status: string, adminNotes?: string, token?: string): Promise<TourEnquiryRow> {
    const res = await apiClient<{ success: boolean; enquiry: TourEnquiryRow }>(`/admin/enquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, admin_notes: adminNotes }),
      token,
    });
    return res.enquiry;
  },

  async delete(id: string, token?: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean }>(`/admin/enquiries/${id}`, {
      method: "DELETE",
      token,
    });
    return res.success;
  },
};
