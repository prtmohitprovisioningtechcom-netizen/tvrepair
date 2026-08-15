import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CmsImage } from "@/components/website/CmsImage";
import { servicePhoto } from "@/lib/site-images";

export function ServiceCard({
  name,
  slug,
  description,
  image,
}: {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}) {
  return (
    <Link
      href={`/tv-repair/${slug}`}
      className="card-surface group flex h-full flex-col overflow-hidden transition duration-300 hover:border-copper/30 hover:shadow-soft sm:hover:-translate-y-1"
    >
      <span className="relative aspect-4/3 overflow-hidden sm:aspect-16/10">
        <CmsImage
          src={image || servicePhoto(slug)}
          alt={name}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
        />
        <span className="absolute inset-0 bg-linear-to-t from-navy/55 to-transparent" />
      </span>
      <span className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="font-display text-base leading-snug sm:text-xl">{name}</h3>
        {description ? (
          <p className="mt-1.5 line-clamp-2 flex-1 text-[0.8125rem] leading-5 text-muted sm:mt-2 sm:line-clamp-3 sm:text-sm sm:leading-6">
            {description}
          </p>
        ) : null}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-copper">
          View service
          <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </span>
    </Link>
  );
}
