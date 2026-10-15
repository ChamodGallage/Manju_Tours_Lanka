"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Camera, MapPin, Sparkles } from "lucide-react";

export interface SafeImageProps extends Omit<ImageProps, "onError"> {
  slotLabel?: string;
  fallbackTitle?: string;
  fallbackCategory?: "destination" | "tour" | "experience" | "team" | "general";
  focalPoint?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  slotLabel,
  fallbackTitle,
  fallbackCategory = "general",
  focalPoint,
  className = "",
  style,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const effectiveTitle = slotLabel || fallbackTitle || alt;

  // If no source is provided or source has failed
  if (!src || error) {
    return (
      <div
        className={`relative w-full h-full min-h-[160px] bg-[#F7F5EF] border border-[#E8E2D2] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden ${className}`}
        style={style}
        role="img"
        aria-label={effectiveTitle || "Sri Lanka Travel Photo Placeholder"}
      >
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#0C5A70_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-2 max-w-[85%]">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E2D2] text-[#0C5A70] flex items-center justify-center shadow-xs">
            {fallbackCategory === "destination" ? (
              <MapPin className="w-5 h-5 text-[#0C5A70]" />
            ) : fallbackCategory === "experience" ? (
              <Sparkles className="w-5 h-5 text-[#E06D53]" />
            ) : (
              <Camera className="w-5 h-5 text-[#0C5A70]" />
            )}
          </div>

          <span className="text-xs font-bold text-[#17202A] tracking-wide line-clamp-2 leading-snug">
            {effectiveTitle || "Authentic Sri Lanka Photography"}
          </span>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0C5A70]/70 bg-[#0C5A70]/8 px-2.5 py-0.5 rounded-full">
            Real Photo Slot Available
          </span>
        </div>
      </div>
    );
  }

  const customStyle: React.CSSProperties = {
    ...style,
    ...(focalPoint ? { objectPosition: focalPoint } : {}),
  };

  return (
    <Image
      src={src}
      alt={alt || fallbackTitle || "Manju Tours Lanka Sri Lanka"}
      onError={() => setError(true)}
      onLoad={() => setLoaded(true)}
      style={customStyle}
      className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-90"} ${className}`}
      {...props}
    />
  );
};

export default SafeImage;
