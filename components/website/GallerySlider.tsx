"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  image_url: string;
  alt_text?: string;
  caption?: string;
}

export function GallerySlider({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length, paused]);

  if (!images.length) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#1a0a00" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative w-full aspect-[16/7] md:aspect-[21/8] overflow-hidden">
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image_url}
              alt={img.alt_text || img.caption || "Gallery"}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {/* Dark overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {img.caption && (
              <div className="absolute bottom-12 left-0 right-0 z-20 text-center">
                <p className="text-white/80 text-sm font-medium tracking-wide">{img.caption}</p>
              </div>
            )}
          </div>
        ))}

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/55 hover:scale-110 border border-white/15"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/55 hover:scale-110 border border-white/15"
            >
              <ChevronRight size={22} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
