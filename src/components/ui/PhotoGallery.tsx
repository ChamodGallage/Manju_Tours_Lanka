"use client";

import React, { useState } from "react";
import { ZoomIn, Camera } from "lucide-react";
import SafeImage from "./SafeImage";
import ImageLightbox, { GalleryImageItem } from "./ImageLightbox";

interface PhotoGalleryProps {
  title?: string;
  subtitle?: string;
  images: GalleryImageItem[];
  category?: "destination" | "tour" | "experience";
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  title = "Real Sri Lanka Photo Moments",
  subtitle = "Captured through the eyes of our travelers and local chauffeur-guides.",
  images,
  category = "destination",
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="my-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0C5A70] mb-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Visual Showcase</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#17202A] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#5B6770] mt-1 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
        <span className="text-xs font-semibold text-[#5B6770]">
          {images.length} Photos • Click to expand
        </span>
      </div>

      {/* Grid of Photo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="group relative rounded-3xl overflow-hidden border border-[#E8E2D2] bg-white shadow-xs hover:shadow-xl transition-all duration-300 text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0C5A70]"
          >
            {/* Image Container with generous proportion and slow hover zoom */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4EFE6]">
              <SafeImage
                src={img.src}
                alt={img.alt}
                fallbackTitle={img.caption || img.alt}
                fallbackCategory={category}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                focalPoint={img.focalPoint}
              />

              {/* Light unobtrusive gradient only at the very bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-xs font-bold text-[#17202A] backdrop-blur-xs">
                  <ZoomIn className="w-3.5 h-3.5 text-[#0C5A70]" />
                  <span>Enlarge Photo</span>
                </span>
              </div>
            </div>

            {/* Natural Caption Card under photo */}
            {img.caption && (
              <div className="p-4 bg-white border-t border-[#E8E2D2]/60">
                <p className="text-xs font-medium text-[#17202A] line-clamp-2 leading-relaxed">
                  {img.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={images}
        currentIndex={activeIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  );
};

export default PhotoGallery;
