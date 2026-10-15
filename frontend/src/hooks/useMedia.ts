"use client";

import { useState, useEffect } from "react";
import { mediaService } from "../services/mediaService";
import type { SiteImage } from "@/types/database.types";

export function useMedia(category?: string) {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    mediaService
      .getAll(category ? { category } : undefined)
      .then((data) => {
        if (!ignore) {
          setImages(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load media");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [category]);

  return { images, loading, error };
}
