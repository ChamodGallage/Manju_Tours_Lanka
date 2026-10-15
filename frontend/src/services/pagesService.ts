import { apiClient } from "./apiClient";
import type { PageRecord, PageSectionItem } from "@/types/database.types";

export const pagesService = {
  async getPages(): Promise<PageRecord[]> {
    const res = await apiClient<{ pages: PageRecord[] }>("/pages?mode=pages");
    return res.pages;
  },

  async getPage(pageKey: string): Promise<{ page: PageRecord; sections: PageSectionItem[] }> {
    return apiClient<{ page: PageRecord; sections: PageSectionItem[] }>(`/pages?page=${pageKey}`);
  },

  async getPublishedPage(pageKey: string): Promise<{ page: PageRecord; sections: PageSectionItem[] }> {
    return apiClient<{ page: PageRecord; sections: PageSectionItem[] }>(`/pages/${pageKey}`);
  },

  async saveSection(section: Partial<PageSectionItem>, token?: string): Promise<PageSectionItem> {
    const res = await apiClient<{ success: boolean; section: PageSectionItem }>("/pages", {
      method: "POST",
      body: JSON.stringify({ targetType: "section", ...section }),
      token,
    });
    return res.section;
  },

  async savePageMeta(pageMeta: Partial<PageRecord>, token?: string): Promise<PageRecord> {
    const res = await apiClient<{ success: boolean; page: PageRecord }>("/pages", {
      method: "PUT",
      body: JSON.stringify({ targetType: "page", ...pageMeta }),
      token,
    });
    return res.page;
  },

  async reorderSections(pageKey: string, orderedIds: string[], token?: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean }>("/pages/reorder", {
      method: "POST",
      body: JSON.stringify({ page_key: pageKey, ordered_ids: orderedIds }),
      token,
    });
    return res.success;
  },

  async duplicatePage(sourceKey: string, newTitle: string, newSlug: string, newKey: string, token?: string): Promise<PageRecord> {
    const res = await apiClient<{ success: boolean; page: PageRecord }>("/pages/duplicate", {
      method: "POST",
      body: JSON.stringify({ sourceKey, newTitle, newSlug, newKey }),
      token,
    });
    return res.page;
  },

  async publishPage(pageKey: string, unpublish = false, token?: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean }>("/pages/publish", {
      method: "POST",
      body: JSON.stringify({ page_key: pageKey, unpublish }),
      token,
    });
    return res.success;
  },

  async deleteSection(id: string, token?: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean }>(`/pages?id=${id}`, {
      method: "DELETE",
      token,
    });
    return res.success;
  },
};
