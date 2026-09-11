"use client";

import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/photos";

const SLIDE_WIDTH = 70; // percent of the container each slide occupies

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex(((i % photos.length) + photos.length) % photos.length),
    [photos.length]
  );
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <div className="mx-auto w-full max-w-3xl select-none">
      <div className="relative h-[70vh] max-h-[600px] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(${(100 - SLIDE_WIDTH) / 2}% - ${index * SLIDE_WIDTH}%))`,
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              className="flex h-full shrink-0 items-center justify-center px-3"
              style={{ width: `${SLIDE_WIDTH}%` }}
              onClick={() => i !== index && goTo(i)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className={`max-h-full max-w-full rounded-xl border border-line object-contain shadow-sm transition-all duration-500 ${
                  i === index ? "opacity-100" : "cursor-pointer opacity-50 scale-95"
                }`}
              />
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/80 text-ink/70 shadow-sm hover:border-accent-400 hover:text-accent-600"
        >
          ←
        </button>
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/80 text-ink/70 shadow-sm hover:border-accent-400 hover:text-accent-600"
        >
          →
        </button>
      </div>

      <p key={index} className="caption-fade-in mt-4 text-center italic text-ink/70">
        {photos[index].caption}
      </p>

      <div className="mt-3 flex justify-center gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            onClick={() => goTo(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-accent-600" : "bg-line hover:bg-accent-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
