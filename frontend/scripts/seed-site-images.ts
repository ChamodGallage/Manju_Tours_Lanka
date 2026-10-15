import { createHash } from "node:crypto";
import * as dotenv from "dotenv";
import * as path from "node:path";
import * as fs from "node:fs";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SITE_IMAGES } from "../src/lib/queries/site-images";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function migrateSiteImages() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: bucketError } = await supabase.storage.getBucket("site-images");
  if (bucketError) {
    throw new Error("The site-images bucket is not available. Apply the reviewed Storage migration before migrating files.");
  }

  const migratedByHash = new Map<string, { storagePath: string; publicUrl: string }>();
  const report: Array<{ title: string; status: string; path?: string }> = [];

  for (const item of DEFAULT_SITE_IMAGES) {
    const localPath = path.resolve(process.cwd(), "public", item.image_url.replace(/^\//, ""));
    if (!fs.existsSync(localPath) || !item.storage_path) {
      report.push({ title: item.title, status: "skipped: no matching local source file" });
      continue;
    }

    const existingQuery = await supabase
      .from("site_images")
      .select("id, storage_path, image_url")
      .eq("title", item.title)
      .eq("page_key", item.page_key)
      .eq("section_key", item.section_key)
      .limit(1)
      .maybeSingle();
    if (existingQuery.error) throw new Error(`Could not inspect metadata for ${item.title}: ${existingQuery.error.message}`);
    if (existingQuery.data?.storage_path && existingQuery.data.storage_path !== item.storage_path) {
      report.push({ title: item.title, status: "skipped: existing record uses a different Storage object; kept unchanged", path: existingQuery.data.storage_path });
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const image = await sharp(buffer).metadata();
    if (!image.width || !image.height || !["jpeg", "png", "webp", "avif"].includes(image.format || "")) {
      report.push({ title: item.title, status: "skipped: unsupported or invalid image" });
      continue;
    }

    const hash = sha256(buffer);
    let storagePath = item.storage_path;
    let publicUrl = "";
    const duplicate = migratedByHash.get(hash);

    if (duplicate) {
      storagePath = duplicate.storagePath;
      publicUrl = duplicate.publicUrl;
    } else {
      const folder = path.posix.dirname(storagePath) === "." ? "" : path.posix.dirname(storagePath);
      const filename = path.posix.basename(storagePath);
      const { data: existingFiles, error: listError } = await supabase.storage
        .from("site-images")
        .list(folder, { search: filename, limit: 100 });
      if (listError) throw new Error(`Could not inspect Storage object for ${item.title}: ${listError.message}`);

      const alreadyExists = existingFiles?.some((file) => file.name === filename) ?? false;
      const { data: initialUrl } = supabase.storage.from("site-images").getPublicUrl(storagePath);
      publicUrl = initialUrl.publicUrl;

      if (alreadyExists) {
        const response = await fetch(publicUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`Existing Storage object could not be retrieved for ${item.title} (HTTP ${response.status}).`);
        const storedBytes = Buffer.from(await response.arrayBuffer());
        if (sha256(storedBytes) !== hash) {
          report.push({ title: item.title, status: "skipped: Storage path already exists with different content; kept unchanged", path: storagePath });
          continue;
        }
      } else {
        const extension = path.extname(localPath).toLowerCase();
        const contentType = extension === ".webp" ? "image/webp" : extension === ".avif" ? "image/avif" : extension === ".png" ? "image/png" : "image/jpeg";
        const { error: uploadError } = await supabase.storage
          .from("site-images")
          .upload(storagePath, buffer, { contentType, upsert: false });
        if (uploadError) throw new Error(`Upload failed for ${item.title}: ${uploadError.message}`);

        const response = await fetch(publicUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`Uploaded image could not be retrieved for ${item.title} (HTTP ${response.status}).`);
        const storedBytes = Buffer.from(await response.arrayBuffer());
        if (sha256(storedBytes) !== hash) throw new Error(`Retrieved image does not match the local source for ${item.title}.`);
      }
      migratedByHash.set(hash, { storagePath, publicUrl });
    }

    const fileMetadata = {
      storage_path: storagePath,
      image_url: publicUrl,
      original_filename: path.basename(localPath),
      mime_type: image.format === "jpeg" ? "image/jpeg" : `image/${image.format}`,
      width: image.width,
      height: image.height,
      size_bytes: buffer.length,
      updated_at: new Date().toISOString(),
    };
    const write = existingQuery.data
      ? await supabase.from("site_images").update(fileMetadata).eq("id", existingQuery.data.id)
      : await supabase.from("site_images").insert({
          ...fileMetadata,
          title: item.title,
          description: item.description,
          page_key: item.page_key,
          section_key: item.section_key,
          category: item.category,
          destination: item.destination,
          alt_text: item.alt_text,
          display_order: item.display_order,
          is_active: item.is_active,
          focal_point: item.focal_point || "center",
        });
    if (write.error) throw new Error(`Metadata save failed for ${item.title}: ${write.error.message}`);
    report.push({ title: item.title, status: existingQuery.data ? "verified and metadata updated" : "uploaded, retrieved, and registered", path: storagePath });
  }

  console.table(report);
  console.log(`Finished: ${report.filter((row) => row.status.includes("registered") || row.status.includes("metadata updated")).length} records verified.`);
  console.log("Local assets were preserved. No existing Storage files were overwritten or deleted.");
}

migrateSiteImages().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Image migration failed.");
  process.exitCode = 1;
});
