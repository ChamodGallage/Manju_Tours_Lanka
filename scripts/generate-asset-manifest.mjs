import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const sourceDir = path.join(root, "src");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".bmp", ".tif", ".tiff", ".svg"]);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return files.flat();
}

const sourceFiles = (await walk(sourceDir)).filter((file) => sourceExtensions.has(path.extname(file).toLowerCase()));
const sourceText = await Promise.all(sourceFiles.map(async (file) => ({
  file: path.relative(root, file).replaceAll("\\", "/"),
  text: await readFile(file, "utf8"),
})));
const imageFiles = (await walk(publicDir)).filter((file) => imageExtensions.has(path.extname(file).toLowerCase()));

const assets = [];
for (const file of imageFiles) {
  const relativePath = path.relative(publicDir, file).replaceAll("\\", "/");
  const publicPath = `/${relativePath}`;
  const normalized = relativePath.toLowerCase();
  const directUsages = [];
  const dynamicUsages = [];

  for (const source of sourceText) {
    const lines = source.text.split(/\r?\n/);
    const matchedLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const normalizedLine = line.replaceAll("\\", "/").toLowerCase();
      if (normalizedLine.includes(normalized) || normalizedLine.includes(publicPath.toLowerCase())) {
        matchedLines.push(i + 1);
      } else if (line.includes("${")) {
        const imageStart = normalizedLine.indexOf("/images/");
        if (imageStart >= 0) {
          const templatePath = normalizedLine.slice(imageStart).split(/["'`\s)]+/, 1)[0];
          const pattern = new RegExp(`^${templatePath
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\\\$\{[^}]+\\\}/g, "[^/]+")}$`);
          if (pattern.test(publicPath.toLowerCase())) {
            dynamicUsages.push({ file: source.file, line: i + 1, kind: "dynamic-template" });
          }
        }
      }
    }
    if (matchedLines.length) directUsages.push({ file: source.file, lines: matchedLines });
  }

  const fileStat = await stat(file);
  let dimensions = null;
  if (path.extname(file).toLowerCase() !== ".svg") {
    try {
      const metadata = await sharp(file, { animated: true }).metadata();
      dimensions = { width: metadata.width ?? null, height: metadata.height ?? null, format: metadata.format ?? null };
    } catch {
      dimensions = { width: null, height: null, format: null };
    }
  } else {
    const svg = await readFile(file, "utf8");
    const size = svg.match(/<svg\b[^>]*\bviewBox=["']([^"']+)["']/i)?.[1];
    dimensions = { viewBox: size ?? null, format: "svg" };
  }

  const usageFiles = [...new Set([...directUsages.map((usage) => usage.file), ...dynamicUsages.map((usage) => usage.file)])];
  assets.push({
    path: publicPath,
    filename: path.basename(file),
    extension: path.extname(file).slice(1).toLowerCase(),
    sizeBytes: fileStat.size,
    dimensions,
    directUsages,
    dynamicUsages,
    usageFiles,
    status: usageFiles.length ? "referenced-or-dynamic" : "no-source-reference-found",
  });
}

assets.sort((a, b) => a.path.localeCompare(b.path));
const manifest = {
  generatedAt: new Date().toISOString(),
  scope: "Image assets in public/; direct and possible dynamic references scanned in src/",
  assetCount: assets.length,
  assets,
};
await writeFile(path.join(root, "asset-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const rows = assets.map((asset) => `| \`${asset.path}\` | ${asset.dimensions?.width ?? "—"} × ${asset.dimensions?.height ?? "—"} | ${(asset.sizeBytes / 1024).toFixed(1)} KB | ${asset.usageFiles.map((file) => `\`${file}\``).join(", ") || "No reference found"} |`);
const report = [
  "# Image Asset Inventory",
  "",
  `Generated ${manifest.generatedAt}. This inventory covers ${assets.length} raster and SVG assets under \`public/\`, with source references scanned under \`src/\`. `,
  "Direct references are exact text matches. Dynamic references are possible matches and need human review. CSS generated from data and remote URLs may require manual inspection.",
  "",
  "| Asset | Dimensions | Size | Source usage |",
  "|---|---:|---:|---|",
  ...rows,
  "",
  "The machine-readable inventory is in [asset-manifest.json](./asset-manifest.json). No assets were moved, uploaded, or deleted.",
  "",
].join("\n");
await writeFile(path.join(root, "ASSET_INVENTORY.md"), report);
console.log(`Wrote asset-manifest.json and ASSET_INVENTORY.md (${assets.length} assets).`);
