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
    <section className="section-pad">
      <div className="container-wide px-4">
        <div 
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-white p-2 shadow-2xl sm:p-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative aspect-[4/3] sm:aspect-video md:aspect-[21/9] overflow-hidden rounded-[1.5rem] bg-navy">
            {images.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <CmsImage src={img} alt="" sizes="100vw" className="absolute inset-0 h-full w-full object-cover opacity-40 blur-2xl scale-125" />
                <CmsImage src={img} alt={`Offer ${i + 1}`} sizes="(max-width: 1024px) 100vw, 1024px" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
              </div>
            ))}

            {images.length > 1 && (
              <>
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
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-110 shadow-lg border border-white/20"
                  onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-110 shadow-lg border border-white/20"
                  onClick={() => setActive((i) => (i + 1) % images.length)}
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
