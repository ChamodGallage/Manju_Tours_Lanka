import { apiClient } from "./apiClient";
import type { TourPackage } from "@/types/database.types";

export const packagesService = {
  async getAll(): Promise<TourPackage[]> {
    const res = await apiClient<{ packages: TourPackage[] }>("/packages");
    return res.packages;
  },

  async getBySlug(slug: string): Promise<TourPackage> {
    const res = await apiClient<{ package: TourPackage }>(`/packages/${slug}`);
    return res.package;
  },

  async create(data: Partial<TourPackage>, token?: string): Promise<TourPackage> {
    const res = await apiClient<{ package: TourPackage }>("/packages", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
    return res.package;
  },

  async update(id: string, data: Partial<TourPackage>, token?: string): Promise<TourPackage> {
    const res = await apiClient<{ package: TourPackage }>(`/packages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    });
    return res.package;
  },

  async delete(id: string, token?: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean }>(`/packages/${id}`, {
      method: "DELETE",
      token,
    });
    return res.success;
  },
};
