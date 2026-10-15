import { getAdminSupabaseClient, getPublicSupabaseClient } from "../config/supabase.js";
import {
  getRuntimePages,
  getRuntimePage,
  updateRuntimePage,
  addRuntimePage,
  getRuntimeSections,
  upsertRuntimeSection,
  deleteRuntimeSection,
  reorderRuntimeSections,
  duplicateRuntimePage,
} from "../data/pages-cms-dataset.js";
import type { PageRecord, PageSectionItem } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

export const pagesService = {
  async getPages(): Promise<PageRecord[]> {
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("pages")
          .select("*")
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) {
          return data as PageRecord[];
        }
      } catch (err) {
        logger.warn("Supabase pages fetch error, using runtime CMS dataset:", err);
      }
    }
    return getRuntimePages();
  },

  async getPage(keyOrSlug: string): Promise<PageRecord | null> {
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("pages")
          .select("*")
          .or(`page_key.eq.${keyOrSlug},slug.eq.${keyOrSlug}`)
          .maybeSingle();
        if (!error && data) {
          return data as PageRecord;
        }
      } catch (err) {
        logger.warn(`Supabase getPage for '${keyOrSlug}' error:`, err);
      }
    }
    return getRuntimePage(keyOrSlug) || null;
  },

  async getPageSections(pageKey: string, publishedOnly = false): Promise<PageSectionItem[]> {
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        let query = client
          .from("page_sections")
          .select("*")
          .eq("page_key", pageKey)
          .order("display_order", { ascending: true });

        if (publishedOnly) {
          query = query.eq("is_visible", true).eq("status", "published");
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as PageSectionItem[];
        }
      } catch (err) {
        logger.warn(`Supabase getPageSections for '${pageKey}' error:`, err);
      }
    }

    const sections = getRuntimeSections(pageKey);
    if (publishedOnly) {
      return sections.filter((s) => s.is_visible && s.status === "published");
    }
    return sections;
  },

  async savePage(payload: Partial<PageRecord>): Promise<PageRecord> {
    const client = getAdminSupabaseClient();
    if (client && payload.page_key) {
      try {
        const { data, error } = await client
          .from("pages")
          .upsert(
            {
              ...payload,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "page_key" }
          )
          .select()
          .single();
        if (!error && data) {
          updateRuntimePage(payload.page_key, data as PageRecord);
          return data as PageRecord;
        }
      } catch (err) {
        logger.warn("Supabase page save error:", err);
      }
    }

    if (payload.page_key) {
      const existing = getRuntimePage(payload.page_key);
      if (existing) {
        const updated = updateRuntimePage(payload.page_key, payload);
        if (updated) return updated;
      } else {
        const newPage: PageRecord = {
          id: payload.id || `page-${Date.now()}`,
          slug: payload.slug || `/${payload.page_key}`,
          page_key: payload.page_key,
          title: payload.title || "New Page",
          navigation_label: payload.navigation_label || "",
          nav_location: payload.nav_location || "header",
          is_published: payload.is_published ?? true,
          status: payload.status || "published",
          seo_title: payload.seo_title || "",
          seo_description: payload.seo_description || "",
          seo_og_image: payload.seo_og_image || "",
          seo_keywords: payload.seo_keywords || "",
          is_template: payload.is_template || false,
          layout_type: payload.layout_type || "default",
          display_order: payload.display_order ?? getRuntimePages().length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        addRuntimePage(newPage);
        return newPage;
      }
    }

    throw new Error("Invalid page payload or missing page_key");
  },

  async saveSection(payload: Partial<PageSectionItem>): Promise<PageSectionItem> {
    const client = getAdminSupabaseClient();
    const sectionId = payload.id || `sec-${Date.now()}`;
    const sectionRecord: PageSectionItem = {
      id: sectionId,
      page_key: payload.page_key || "home",
      section_key: payload.section_key || `sec-${Date.now()}`,
      section_type: payload.section_type || "text-image",
      title: payload.title || "",
      subtitle: payload.subtitle || "",
      badge: payload.badge || "",
      content: payload.content || "",
      button_text: payload.button_text || "",
      button_url: payload.button_url || "",
      secondary_button_text: payload.secondary_button_text || "",
      secondary_button_url: payload.secondary_button_url || "",
      image_url: payload.image_url || "",
      secondary_image_url: payload.secondary_image_url || "",
      image_alt: payload.image_alt || "",
      background_style: payload.background_style || "default",
      background_color: payload.background_color || "",
      background_image: payload.background_image || "",
      text_align: payload.text_align || "left",
      layout_options: payload.layout_options || {},
      items: payload.items || [],
      is_visible: payload.is_visible ?? true,
      status: payload.status || "draft",
      display_order: payload.display_order ?? 0,
      updated_at: new Date().toISOString(),
    };

    if (client) {
      try {
        const { data, error } = await client
          .from("page_sections")
          .upsert(sectionRecord, { onConflict: "id" })
          .select()
          .single();
        if (!error && data) {
          upsertRuntimeSection(data as PageSectionItem);
          return data as PageSectionItem;
        }
      } catch (err) {
        logger.warn("Supabase section save error, syncing runtime store:", err);
      }
    }

    upsertRuntimeSection(sectionRecord);
    return sectionRecord;
  },

  async deleteSection(id: string): Promise<boolean> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        await client.from("page_sections").delete().eq("id", id);
      } catch (err) {
        logger.warn("Supabase section delete error:", err);
      }
    }
    return deleteRuntimeSection(id);
  },

  async reorderSections(pageKey: string, orderedIds: string[]): Promise<boolean> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const updates = orderedIds.map((id, index) =>
          client.from("page_sections").update({ display_order: index + 1 }).eq("id", id)
        );
        await Promise.allSettled(updates);
      } catch (err) {
        logger.warn("Supabase sections reorder error:", err);
      }
    }
    reorderRuntimeSections(pageKey, orderedIds);
    return true;
  },

  async duplicatePage(sourceKey: string, newTitle: string, newSlug: string, newKey: string): Promise<PageRecord | null> {
    const client = getAdminSupabaseClient();
    const duplicated = duplicateRuntimePage(sourceKey, newTitle, newSlug, newKey);

    if (client && duplicated) {
      try {
        await client.from("pages").insert(duplicated);
        const sections = getRuntimeSections(newKey);
        if (sections.length > 0) {
          await client.from("page_sections").insert(sections);
        }
      } catch (err) {
        logger.warn("Supabase page duplicate sync error:", err);
      }
    }

    return duplicated;
  },

  async publishPage(pageKey: string, unpublish = false): Promise<{ page: PageRecord | null; count: number }> {
    const client = getAdminSupabaseClient();
    const newStatus = unpublish ? "draft" : "published";
    const isPub = !unpublish;

    if (client) {
      try {
        await client.from("pages").update({ status: newStatus, is_published: isPub }).eq("page_key", pageKey);
        await client.from("page_sections").update({ status: newStatus }).eq("page_key", pageKey);
      } catch (err) {
        logger.warn("Supabase publish error:", err);
      }
    }

    const updated = updateRuntimePage(pageKey, { status: newStatus, is_published: isPub });
    const sections = getRuntimeSections(pageKey);
    sections.forEach((s) => {
      s.status = newStatus;
    });

    return { page: updated || null, count: sections.length };
  },
};
