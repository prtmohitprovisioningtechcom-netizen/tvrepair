"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CmsImage } from "@/components/website/CmsImage";

export function OfferSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [images.length, paused]);

  if (!images || images.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full overflow-hidden bg-navy" style={{ minHeight: "340px", maxHeight: "620px", height: "56vw" }}>
        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* blurred bg fill */}
            <CmsImage src={img} alt="" sizes="100vw" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-3xl scale-125" />
            {/* main image — contained so nothing is cropped */}
            <CmsImage src={img} alt={`Slide ${i + 1}`} sizes="100vw" className="absolute inset-0 h-full w-full object-contain" priority={i === 0} />
          </div>
        ))}

        {images.length > 1 && (
          <>
            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-2 bg-white/40 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/50 hover:scale-110 border border-white/20"
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/50 hover:scale-110 border border-white/20"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
