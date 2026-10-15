import { apiClient } from "./apiClient";
import type { SiteImage } from "@/types/database.types";

export const mediaService = {
  async getAll(filter?: { category?: string; destination?: string }): Promise<SiteImage[]> {
    const params = new URLSearchParams();
    if (filter?.category) params.set("category", filter.category);
    if (filter?.destination) params.set("destination", filter.destination);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient<{ photos: SiteImage[] }>(`/photos${query}`);
    return res.photos;
  },

  async upload(formData: FormData, token?: string): Promise<SiteImage> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
    const res = await fetch(`${baseUrl}/photos/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Upload failed: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.photo;
  },

  async delete(id: string, token?: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean }>(`/photos/${id}`, {
      method: "DELETE",
      token,
    });
    return res.success;
  },
};
