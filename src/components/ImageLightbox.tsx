"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  images: { path: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
};

export function ImageLightbox({ images, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  const current = images[index];

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Image — stop propagation so clicking it doesn't close */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={current.path}
            alt={current.alt}
            fill
            className="object-contain"
            sizes="90vw"
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/40 rounded-full w-9 h-9 flex items-center justify-center text-xl transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Prev */}
        {images.length > 1 && (
          <button
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors"
            aria-label="Previous"
          >
            ‹
          </button>
        )}

        {/* Next */}
        {images.length > 1 && (
          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors"
            aria-label="Next"
          >
            ›
          </button>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
