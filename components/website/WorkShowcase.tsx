import Image from "next/image";
import { WORK_SHOTS } from "@/lib/site-images";

export function WorkShowcase() {
  return (
    <section className="section-pad bg-navy text-white">
      <div className="container-wide">
        <p className="eyebrow">Real work</p>
        <h2 className="mt-2 max-w-2xl wrap-break-word font-display text-2xl sm:text-3xl md:text-4xl">The job, not just a call centre</h2>
        <p className="mt-3 max-w-xl text-sm text-white/65 sm:mt-4 sm:text-base">
          Doorstep visits, board-level repair and workshop backup — the same discipline whether you are in Noida or South Delhi.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3 lg:grid-cols-4 lg:grid-rows-2">
          {WORK_SHOTS.map((shot, i) => {
            const wide = i === 0 || i === 4;
            return (
              <figure
                key={shot.label}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${wide ? "col-span-2 min-h-36 sm:min-h-56 lg:min-h-72" : "min-h-28 sm:min-h-44 lg:min-h-72"}`}
              >
                <Image
                  src={shot.src}
                  alt={shot.label}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes={wide ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                />
                <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4 lg:p-5">
                  <p className="font-display text-sm sm:text-lg">{shot.label}</p>
                  <p className="mt-0.5 hidden text-sm text-white/70 sm:block">{shot.caption}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
