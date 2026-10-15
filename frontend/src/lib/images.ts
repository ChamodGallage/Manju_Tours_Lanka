export interface ImageMedia {
  src: string;
  alt: string;
  caption?: string;
  focalPoint?: string;
  isStock?: boolean;
}

/**
 * Normalizes any database image field (string URL or JSON object) into a typed ImageMedia
 */
export function normalizeImageMedia(
  img: unknown,
  fallbackAlt: string = "Sri Lanka Travel Photo",
  fallbackCaption?: string
): ImageMedia {
  if (!img) {
    return {
      src: "",
      alt: fallbackAlt,
      caption: fallbackCaption,
    };
  }

  if (typeof img === "string") {
    return {
      src: img,
      alt: fallbackAlt,
      caption: fallbackCaption,
    };
  }

  if (typeof img === "object" && img !== null) {
    const obj = img as Record<string, unknown>;
    return {
      src: typeof obj.src === "string" ? obj.src : "",
      alt: typeof obj.alt === "string" && obj.alt.trim() ? obj.alt : fallbackAlt,
      caption: typeof obj.caption === "string" ? obj.caption : fallbackCaption,
      focalPoint: typeof obj.focalPoint === "string" ? obj.focalPoint : undefined,
      isStock: obj.isStock === true,
    };
  }

  return {
    src: "",
    alt: fallbackAlt,
    caption: fallbackCaption,
  };
}

/**
 * Normalizes a gallery field (array of strings or array of JSON objects)
 */
export function normalizeGallery(
  gallery: unknown,
  defaultBaseAlt: string
): ImageMedia[] {
  if (!gallery || !Array.isArray(gallery)) return [];
  return gallery.map((item, index) =>
    normalizeImageMedia(item, `${defaultBaseAlt} - View ${index + 1}`)
  );
}
