import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import * as path from "node:path";
import type { Database, SiteImage } from "@/types/database.types";
import { DEFAULT_SITE_IMAGES } from "@/lib/queries/site-images";

/**
 * Helper to get an authenticated Supabase server client from cookies
 */
async function getAuthClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return null;

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

/**
 * Verifies if the request is from an authenticated admin user.
 */
async function checkAdminUser() {
  const authClient = await getAuthClient();
  if (!authClient) return null;

  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return null;
  if (user.app_metadata?.role === "admin") return user;
  const { data: adminRow, error: adminError } = await authClient
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return adminError || !adminRow ? null : user;
}

/**
 * Gets an elevated client for performing operations if service-role key exists,
 * or fallback to authClient
 */
function getPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations.");
  return createSupabaseClient(url, serviceKey);
}

// ==============================================================================
// 1. GET: Fetch photos (with search & filters)
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !publishableKey) {
      // Fallback to default inventory if Supabase is not yet configured
      return NextResponse.json({
        photos: DEFAULT_SITE_IMAGES,
        warning: "Supabase not configured in .env.local; returning seed inventory",
      });
    }

    const client = getPrivilegedClient();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.toLowerCase();
    const pageKey = searchParams.get("page");
    const sectionKey = searchParams.get("section");
    const category = searchParams.get("category");
    const destination = searchParams.get("destination");
    const status = searchParams.get("status"); // 'all', 'active', 'inactive'

    let query = client.from("site_images").select("*");

    if (pageKey && pageKey !== "all") query = query.eq("page_key", pageKey);
    if (sectionKey && sectionKey !== "all") query = query.eq("section_key", sectionKey);
    if (category && category !== "all") query = query.eq("category", category);
    if (destination && destination !== "all") query = query.eq("destination", destination);
    if (status === "active") query = query.eq("is_active", true);
    if (status === "inactive") query = query.eq("is_active", false);

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error) {
      console.warn("Error fetching site_images:", error.message);
      return NextResponse.json({
        photos: DEFAULT_SITE_IMAGES,
        warning: "Supabase media rows could not be loaded. Showing the built-in source inventory; database changes are unavailable.",
      });
    }

    let photos = (data as SiteImage[]) || [];

    // If database table is empty, seed with DEFAULT_SITE_IMAGES
    let usingSeedInventory = false;
    if (photos.length === 0) {
      photos = DEFAULT_SITE_IMAGES;
      usingSeedInventory = true;
    }

    // Apply text search
    if (search) {
      photos = photos.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.alt_text.toLowerCase().includes(search) ||
          p.destination.toLowerCase().includes(search) ||
          p.page_key.toLowerCase().includes(search) ||
          p.section_key.toLowerCase().includes(search)
      );
    }

    const references = new Map<string, SiteImage[]>();
    for (const photo of photos) {
      const key = photo.storage_path || photo.image_url;
      references.set(key, [...(references.get(key) || []), photo]);
    }
    const withReferences = photos.map((photo) => {
      const group = references.get(photo.storage_path || photo.image_url) || [photo];
      return {
        ...photo,
        reference_count: group.length,
        referenced_sections: group.map((item) => `${item.page_key} › ${item.section_key}`),
      };
    });

    return NextResponse.json({
      photos: withReferences,
      ...(usingSeedInventory ? { warning: "No site_images rows are stored yet. Showing the built-in inventory; uploads and metadata changes require Supabase migrations and Storage." } : {}),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching photos";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ==============================================================================
// 2. POST: Upload & Add New Photo
// ==============================================================================
export async function POST(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const altText = (formData.get("alt_text") as string)?.trim() || title;
    const pageKey = (formData.get("page_key") as string)?.trim() || "home";
    const sectionKey = (formData.get("section_key") as string)?.trim() || "general";
    const category = (formData.get("category") as string)?.trim() || "general";
    const destination = (formData.get("destination") as string)?.trim() || "";
    const displayOrder = parseInt((formData.get("display_order") as string) || "0", 10);
    const isActive = formData.get("is_active") === "true";

    if (!/^[a-z0-9-]{1,50}$/i.test(pageKey) || !/^[a-z0-9-]{1,50}$/i.test(category)) {
      return NextResponse.json({ error: "Page and category values must use letters, numbers, and hyphens only." }, { status: 400 });
    }

    if (!file || !title) {
      return NextResponse.json(
        { error: "Image file and photo title are required." },
        { status: 400 }
      );
    }

    // Validate file type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload JPG, PNG, WebP, or AVIF." },
        { status: 400 }
      );
    }

    // Validate size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 12MB limit. Please upload an optimized photo." },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage bucket 'site-images'
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageMetadata = await sharp(buffer).metadata();
    if (!imageMetadata.width || !imageMetadata.height || !["jpeg", "png", "webp", "avif"].includes(imageMetadata.format || "")) {
      return NextResponse.json({ error: "The uploaded file is not a supported image." }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const actualMime = imageMetadata.format === "jpeg" ? "image/jpeg" : `image/${imageMetadata.format}`;
    const actualExtension = imageMetadata.format === "jpeg" ? ".jpg" : `.${imageMetadata.format}`;
    const sanitizedName = `${path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 120)}${actualExtension}`;
    const storagePath = `uploads/${pageKey}/${category}/${Date.now()}_${sanitizedName}`;

    const { error: uploadError } = await client.storage
      .from("site-images")
      .upload(storagePath, buffer, {
        contentType: actualMime,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from("site-images")
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Insert record into site_images table
    const { data: inserted, error: insertError } = await client
      .from("site_images")
      .insert({
        title,
        description,
        storage_path: storagePath,
        image_url: publicUrl,
        page_key: pageKey,
        section_key: sectionKey,
        category,
        destination,
        alt_text: altText,
        original_filename: file.name.slice(0, 255),
        mime_type: actualMime,
        width: imageMetadata.width,
        height: imageMetadata.height,
        size_bytes: file.size,
        focal_point: "center",
        display_order: displayOrder,
        is_active: isActive,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Trigger instant cache revalidation across affected routes
    revalidatePath("/", "layout");
    revalidatePath("/destinations", "layout");
    revalidatePath("/tours", "layout");
    revalidatePath("/experiences", "layout");

    return NextResponse.json({
      success: true,
      message: "Photo uploaded and assigned successfully!",
      photo: inserted,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error uploading photo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ==============================================================================
// 3. PUT: Edit Photo Details, Reorder, or Toggle Active
// ==============================================================================
export async function PUT(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (typeof updates.focal_point === "string" && !/^(center|left|right)( (?:[0-9]{1,3}%))?$/.test(updates.focal_point)) {
      return NextResponse.json({ error: "Choose a supported focal point." }, { status: 400 });
    }
    for (const field of ["page_key", "category"] as const) {
      if (field in updates && (typeof updates[field] !== "string" || !/^[a-z0-9-]{1,50}$/i.test(updates[field]))) {
        return NextResponse.json({ error: "Page and category values must use letters, numbers, and hyphens only." }, { status: 400 });
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    const editableFields = [
      "title", "description", "alt_text", "page_key", "section_key", "category",
      "destination", "display_order", "is_active", "focal_point",
    ] as const;
    const safeUpdates = Object.fromEntries(
      editableFields.filter((field) => field in updates).map((field) => [field, updates[field]])
    );

    const client = getPrivilegedClient();

    const { data: updated, error } = await client
      .from("site_images")
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Update failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Invalidate caches so update is immediately visible to public visitors
    revalidatePath("/", "layout");
    revalidatePath("/destinations", "layout");
    revalidatePath("/tours", "layout");
    revalidatePath("/experiences", "layout");

    return NextResponse.json({
      success: true,
      message: "Photo updated successfully!",
      photo: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating photo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ==============================================================================
// 4. DELETE: Remove Photo (Database & Storage)
// ==============================================================================
export async function DELETE(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    const client = getPrivilegedClient();

    // Keep the row and storage object so other sections can continue using the asset.
    const { data: existing } = await client
      .from("site_images")
      .select("id")
      .eq("id", id)
      .single();
    if (!existing) return NextResponse.json({ error: "Photo record not found." }, { status: 404 });

    const { error } = await client.from("site_images").update({
      is_active: false,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: `Delete failed: ${error.message}` },
        { status: 500 }
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/destinations", "layout");
    revalidatePath("/tours", "layout");
    revalidatePath("/experiences", "layout");

    return NextResponse.json({
      success: true,
      message: "Photo hidden from the website. The database record and storage file were preserved.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting photo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
