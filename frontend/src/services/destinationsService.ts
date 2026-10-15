import { apiClient } from "./apiClient";
import type { DestinationItem } from "@/types/database.types";

export const destinationsService = {
  async getAll(): Promise<DestinationItem[]> {
    const res = await apiClient<{ destinations: DestinationItem[] }>("/destinations");
    return res.destinations;
  },

  async getBySlug(slug: string): Promise<DestinationItem> {
    const res = await apiClient<{ destination: DestinationItem }>(`/destinations/${slug}`);
    return res.destination;
  },

  async create(data: Partial<DestinationItem>, token?: string): Promise<DestinationItem> {
    const res = await apiClient<{ destination: DestinationItem }>("/destinations", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
    return res.destination;
  },

  async update(id: string, data: Partial<DestinationItem>, token?: string): Promise<DestinationItem> {
    const res = await apiClient<{ destination: DestinationItem }>(`/destinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    });
    return res.destination;
  },

  async delete(id: string, token?: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean }>(`/destinations/${id}`, {
      method: "DELETE",
      token,
    });
    return res.success;
  },
};
