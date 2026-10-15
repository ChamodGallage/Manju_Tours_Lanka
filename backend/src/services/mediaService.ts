import { getAdminSupabaseClient, getPublicSupabaseClient } from "../config/supabase.js";
import { ENV } from "../config/env.js";
import { DEFAULT_SITE_IMAGES } from "../data/site-images-dataset.js";
import type { SiteImage } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

let runtimeImages: SiteImage[] = [...DEFAULT_SITE_IMAGES];

export const mediaService = {
  async getAll(filter?: {
    category?: string;
    destination?: string;
    pageKey?: string;
    sectionKey?: string;
  }): Promise<SiteImage[]> {
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        let query = client.from("site_images").select("*").eq("is_active", true);
        if (filter?.category) query = query.eq("category", filter.category);
        if (filter?.destination) query = query.eq("destination", filter.destination);
        if (filter?.pageKey) query = query.eq("page_key", filter.pageKey);
        if (filter?.sectionKey) query = query.eq("section_key", filter.sectionKey);

        const { data, error } = await query.order("display_order", { ascending: true });
        if (!error && data && data.length > 0) {
          return data as SiteImage[];
        }
      } catch (err) {
        logger.warn("Supabase site_images query error:", err);
      }
    }

    let results = runtimeImages.filter((img) => img.is_active);
    if (filter?.category) results = results.filter((img) => img.category === filter.category);
    if (filter?.destination) results = results.filter((img) => img.destination === filter.destination);
    if (filter?.pageKey) results = results.filter((img) => img.page_key === filter.pageKey);
    if (filter?.sectionKey) results = results.filter((img) => img.section_key === filter.sectionKey);

    return results.sort((a, b) => a.display_order - b.display_order);
  },

  async upload(
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    metadata: {
      title?: string;
      description?: string;
      pageKey?: string;
      sectionKey?: string;
      category?: string;
      destination?: string;
      altText?: string;
    }
  ): Promise<SiteImage> {
    const client = getAdminSupabaseClient();
    const ext = file.originalname.split(".").pop() || "webp";
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const storagePath = `uploads/${Date.now()}_${cleanName}.${ext}`;

    let imageUrl = `/images/uploads/${storagePath}`;

    if (client) {
      try {
        // Upload to Supabase Storage bucket
        const { error: uploadError } = await client.storage
          .from(ENV.SUPABASE_STORAGE_BUCKET)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          logger.warn("Supabase Storage upload warning:", uploadError.message);
        } else {
          // Get public URL
          const { data: publicUrlData } = client.storage
            .from(ENV.SUPABASE_STORAGE_BUCKET)
            .getPublicUrl(storagePath);
          if (publicUrlData?.publicUrl) {
            imageUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        logger.warn("Error uploading file to Supabase storage:", err);
      }
    }

    const imageRecord: SiteImage = {
      id: `img-${Date.now()}`,
      title: metadata.title || file.originalname,
      description: metadata.description || "",
      storage_path: storagePath,
      image_url: imageUrl,
      page_key: metadata.pageKey || "global",
      section_key: metadata.sectionKey || "gallery",
      category: metadata.category || "gallery",
      destination: metadata.destination || "",
      alt_text: metadata.altText || metadata.title || file.originalname,
      display_order: runtimeImages.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      original_filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
    };

    if (client) {
      try {
        const { data, error } = await client.from("site_images").insert(imageRecord).select().single();
        if (!error && data) {
          runtimeImages.push(data as SiteImage);
          return data as SiteImage;
        }
      } catch (err) {
        logger.warn("Supabase site_images insert error:", err);
      }
    }

    runtimeImages.push(imageRecord);
    return imageRecord;
  },

  async replace(
    id: string,
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number }
  ): Promise<SiteImage | null> {
    const existing = runtimeImages.find((img) => img.id === id);
    if (!existing) return null;

    const client = getAdminSupabaseClient();
    const storagePath = existing.storage_path || `uploads/${Date.now()}_${file.originalname}`;
    let imageUrl = existing.image_url;

    if (client) {
      try {
        await client.storage.from(ENV.SUPABASE_STORAGE_BUCKET).upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });
        const { data: publicUrlData } = client.storage.from(ENV.SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath);
        if (publicUrlData?.publicUrl) imageUrl = publicUrlData.publicUrl;

        await client
          .from("site_images")
          .update({
            image_url: imageUrl,
            size_bytes: file.size,
            mime_type: file.mimetype,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      } catch (err) {
        logger.warn("Error replacing image in Supabase:", err);
      }
    }

    existing.image_url = imageUrl;
    existing.size_bytes = file.size;
    existing.mime_type = file.mimetype;
    existing.updated_at = new Date().toISOString();
    return existing;
  },

  async delete(id: string): Promise<boolean> {
    const existing = runtimeImages.find((img) => img.id === id);
    const client = getAdminSupabaseClient();

    if (client && existing) {
      try {
        await client.storage.from(ENV.SUPABASE_STORAGE_BUCKET).remove([existing.storage_path]);
        await client.from("site_images").delete().eq("id", id);
      } catch (err) {
        logger.warn("Supabase image delete error:", err);
      }
    }

    const beforeLen = runtimeImages.length;
    runtimeImages = runtimeImages.filter((img) => img.id !== id);
    return runtimeImages.length < beforeLen;
  },
};
