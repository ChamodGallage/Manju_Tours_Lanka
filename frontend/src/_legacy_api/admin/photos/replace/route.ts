import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import * as path from "node:path";
import type { Database } from "@/types/database.types";

async function checkAdminUser() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;

  const authClient = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

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

function getPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations.");
  return createSupabaseClient(url, serviceKey);
}

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
    const id = formData.get("id") as string | null;
    const file = formData.get("file") as File | null;

    if (!id || !file) {
      return NextResponse.json(
        { error: "Photo ID and replacement image file are required." },
        { status: 400 }
      );
    }

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload JPG, PNG, WebP, or AVIF." },
        { status: 400 }
      );
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 12MB limit." }, { status: 400 });
    }

    const client = getPrivilegedClient();

    // 1. Fetch current record to get metadata and current storage_path
    const { data: existing, error: fetchErr } = await client
      .from("site_images")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Photo record not found." }, { status: 404 });
    }
    if (!/^[a-z0-9-]{1,50}$/i.test(existing.page_key) || !/^[a-z0-9-]{1,50}$/i.test(existing.category)) {
      return NextResponse.json({ error: "The media record has invalid page/category metadata. Update it before replacing the image." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageMetadata = await sharp(buffer).metadata();
    if (!imageMetadata.width || !imageMetadata.height || !["jpeg", "png", "webp", "avif"].includes(imageMetadata.format || "")) {
      return NextResponse.json({ error: "The uploaded file is not a supported image." }, { status: 400 });
    }

    // 2. Upload replacement file to a new, collision-safe Storage object
    const actualMime = imageMetadata.format === "jpeg" ? "image/jpeg" : `image/${imageMetadata.format}`;
    const actualExtension = imageMetadata.format === "jpeg" ? ".jpg" : `.${imageMetadata.format}`;
    const sanitizedName = `${path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 120)}${actualExtension}`;
    const newStoragePath = `uploads/${existing.page_key}/${existing.category}/${Date.now()}_${sanitizedName}`;

    const { error: uploadError } = await client.storage
      .from("site-images")
      .upload(newStoragePath, buffer, {
        contentType: actualMime,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 3. Get new public URL with cache-busting timestamp query parameter
    const { data: urlData } = client.storage
      .from("site-images")
      .getPublicUrl(newStoragePath);

    const newPublicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // 4. Update the database record
    const { data: updated, error: updateErr } = await client
      .from("site_images")
      .update({
        image_url: newPublicUrl,
        storage_path: newStoragePath,
        original_filename: file.name.slice(0, 255),
        mime_type: actualMime,
        width: imageMetadata.width,
        height: imageMetadata.height,
        size_bytes: file.size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: `Failed to update record: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // Preserve the old storage object as a rollback copy until its references are audited.

    // 6. On-demand cache invalidation across affected routes
    revalidatePath("/", "layout");
    revalidatePath("/destinations", "layout");
    revalidatePath("/tours", "layout");
    revalidatePath("/experiences", "layout");

    return NextResponse.json({
      success: true,
      message: "Photo file replaced successfully!",
      photo: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error replacing photo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
