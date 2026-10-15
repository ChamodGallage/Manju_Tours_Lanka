/**
 * Manju Tours Lanka - Image Auto-Optimization Script
 * Run with: npm run optimize-images
 * 
 * Auto-processes any raw photos dropped into /public/images/:
 * 1. Resizes massive camera photos (max 1920px for hero, 1200px for gallery)
 * 2. Generates ultra-fast WebP (quality 85)
 * 3. Generates modern AVIF (quality 80)
 * 4. Generates base64 blurDataURL for instant placeholder loading (no CLS)
 * 5. Saves a manifest in /public/images/blur-manifest.json
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_ROOT = path.join(process.cwd(), "public", "images");
const MANIFEST_PATH = path.join(IMAGES_ROOT, "blur-manifest.json");

const SUPPORTED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tiff"]);

interface ImageOptimizationStats {
  processed: number;
  webpCreated: number;
  avifCreated: number;
  blursGenerated: number;
}

const stats: ImageOptimizationStats = {
  processed: 0,
  webpCreated: 0,
  avifCreated: 0,
  blursGenerated: 0,
};

// Existing blur manifest
let blurManifest: Record<string, string> = {};
if (fs.existsSync(MANIFEST_PATH)) {
  try {
    blurManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    blurManifest = {};
  }
}

async function walkDir(dir: string, fileList: string[] = []): Promise<string[]> {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Skip logo files, favicon, and generated manifests
      if (
        SUPPORTED_EXTS.has(ext) &&
        !entry.name.startsWith("logo") &&
        !entry.name.endsWith(".blur.txt")
      ) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

async function processImage(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);

  const relativePath = "/" + path.relative(path.join(process.cwd(), "public"), filePath).replace(/\\/g, "/");

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) return;

    stats.processed++;

    // Determine max dimension based on folder
    const isHero = filePath.includes("hero") || baseName.includes("hero");
    const maxWidth = isHero ? 1920 : 1200;

    // 1. Generate WebP if not already webp
    const webpPath = path.join(dir, `${baseName}.webp`);
    if (!fs.existsSync(webpPath) || ext !== ".webp") {
      await sharp(filePath)
        .rotate() // auto-orient EXIF
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toFile(webpPath);
      stats.webpCreated++;
    }

    // 2. Generate AVIF
    const avifPath = path.join(dir, `${baseName}.avif`);
    if (!fs.existsSync(avifPath)) {
      await sharp(filePath)
        .rotate()
        .resize({ width: maxWidth, withoutEnlargement: true })
        .avif({ quality: 80, effort: 4 })
        .toFile(avifPath);
      stats.avifCreated++;
    }

    // 3. Generate tiny base64 Blur placeholder (16px)
    if (!blurManifest[relativePath]) {
      const blurBuffer = await sharp(filePath)
        .rotate()
        .resize(16, 16, { fit: "inside" })
        .webp({ quality: 20 })
        .toBuffer();
      const base64 = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
      blurManifest[relativePath] = base64;
      stats.blursGenerated++;
    }
  } catch (err) {
    console.warn(`[Image Optimizer] Warning processing ${filePath}:`, (err as Error).message);
  }
}

async function run() {
  console.log("🌴 Manju Tours Lanka - Auto Image Optimizer Running...\n");
  console.log(`Scanning: ${IMAGES_ROOT}`);

  const files = await walkDir(IMAGES_ROOT);
  console.log(`Found ${files.length} candidate photo(s). Optimizing...\n`);

  for (const file of files) {
    await processImage(file);
  }

  // Save blur manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(blurManifest, null, 2), "utf-8");

  console.log("\n✅ Optimization Complete!");
  console.log(`- Photos processed: ${stats.processed}`);
  console.log(`- WebP versions created: ${stats.webpCreated}`);
  console.log(`- AVIF versions created: ${stats.avifCreated}`);
  console.log(`- Blur placeholders created: ${stats.blursGenerated}`);
  console.log(`- Manifest saved: ${MANIFEST_PATH}`);
  console.log("\nYou can now drop any original photos directly into /public/images/ and run 'npm run optimize-images' anytime!");
}

run().catch((err) => {
  console.error("Fatal error during image optimization:", err);
  process.exit(1);
});
