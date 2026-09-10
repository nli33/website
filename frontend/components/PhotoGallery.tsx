"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";

const SLIDE_WIDTH = 70; // percent of the container each slide occupies
const TRANSITION_MS = 300;

type Role = "left" | "center" | "right";
const ROLE_OFFSET: Record<Role, number> = { left: -1, center: 0, right: 1 };

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const n = photos.length;

  const [index, setIndex] = useState(0); // settled photo index, drives caption/dots
  const [trackOffset, setTrackOffset] = useState(1); // 0, 1 (rest), or 2 (slide-width units)
  const [activeRole, setActiveRole] = useState<Role>("center");
  const [animate, setAnimate] = useState(true);

  // Guards against overlapping transitions. Driven by a single deterministic
  // timer (not the browser's transitionend event) so there's no race between
  // two different "unlock" signals -- that race is what could leave
  // trackOffset stuck at 0 or 2, silently no-opping further clicks in that
  // same direction (React skips a state update that doesn't change).
  const animatingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const settle = useCallback((direction: 1 | -1) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + direction + n) % n);
      setAnimate(false);
      setTrackOffset(1);
      setActiveRole("center");
      animatingRef.current = false;
    }, TRANSITION_MS);
  }, [n]);

  const next = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setAnimate(true);
    setActiveRole("right");
    setTrackOffset(2);
    settle(1);
  }, [settle]);

  const prev = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setAnimate(true);
    setActiveRole("left");
    setTrackOffset(0);
    settle(-1);
  }, [settle]);

  const goTo = useCallback(
    (i: number) => {
      if (animatingRef.current) return;
      const target = ((i % n) + n) % n;
      if (target === index) return;
      setIndex(target);
    },
    [n, index]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const roles: Role[] = ["left", "center", "right"];

  return (
    <div className="mx-auto w-full max-w-3xl select-none">
      <div className="relative h-[70vh] max-h-[600px] overflow-hidden">
        <div
          className={`flex h-full ${animate ? "transition-transform ease-out" : ""}`}
          style={{
            transform: `translateX(calc(${(100 - SLIDE_WIDTH) / 2}% - ${trackOffset * SLIDE_WIDTH}%))`,
            transitionDuration: animate ? `${TRANSITION_MS}ms` : undefined,
          }}
        >
          {roles.map((role) => {
            const photo = photos[(index + ROLE_OFFSET[role] + n) % n];
            const active = role === activeRole;
            return (
              <div
                key={role}
                className="flex h-full shrink-0 items-center justify-center px-3"
                style={{ width: `${SLIDE_WIDTH}%` }}
                onClick={() => {
                  if (role === "left") prev();
                  else if (role === "right") next();
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className={`max-h-full max-w-full rounded-xl border border-line object-contain shadow-sm ${
                    animate ? "transition-all" : ""
                  } ${active ? "opacity-100" : "cursor-pointer opacity-50 scale-95"}`}
                  style={{ transitionDuration: animate ? `${TRANSITION_MS}ms` : undefined }}
                />
              </div>
            );
          })}
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
