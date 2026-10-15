/**
 * Sanitizes user input string against HTML tags and common injection patterns
 */
export function sanitizeString(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "") // strip html tags
    .replace(/[^\w\s\.,!?@\+\-\(\)\/:'"]/gi, "") // allow standard punctuation and characters
    .trim();
}

/** Allows local paths and safe web/contact URLs; rejects scriptable URL schemes. */
export function normalizeSafeUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  if (!value) return "";
  if (/[\\\u0000-\u001f\u007f]/.test(value) || value.startsWith("//") || /^(javascript|data|vbscript):/i.test(value)) return null;
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    if (!["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) return null;
    return value;
  } catch {
    return null;
  }
}
