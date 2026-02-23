"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "./ImageLightbox";

type Props = {
  images: { id: string; path: string; alt: string | null }[];
  title: string;
};

export function RecipeImageGrid({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const lightboxImages = images.map((img) => ({
    path: img.path,
    alt: img.alt || title,
  }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative h-52 rounded-xl overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <Image
              src={img.path}
              alt={img.alt || title}
              fill
              className="object-cover transition-transform duration-200 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
