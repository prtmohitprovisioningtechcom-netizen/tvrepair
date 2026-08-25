import { resolveWorkImage } from "@/lib/site-images";
import { CmsImage } from "@/components/website/CmsImage";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string | null;
}) {
  const photo = resolveWorkImage(image);
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      {photo ? (
        <CmsImage src={photo} alt="" className="-z-10 hidden object-contain lg:block" priority />
      ) : null}
      <div className="page-hero-mesh pointer-events-none absolute inset-0" />
      {photo ? <div className="hero-photo-shade pointer-events-none absolute inset-0 hidden lg:block" /> : null}
      <div className="container-wide relative z-10 py-10 sm:py-16 lg:py-24">
        {eyebrow ? <p className="eyebrow text-white">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-3xl wrap-break-word font-display text-2xl leading-snug sm:text-4xl md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/80 sm:mt-4 sm:text-lg">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
