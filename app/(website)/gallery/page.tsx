import type { Metadata } from "next";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { getSiteContext } from "@/server/services/site";
import { query } from "@/lib/db/query";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContext();
  return buildMetadata({
    fallbackTitle: "Gallery",
    fallbackDescription: "View our gallery of TV repair services.",
    path: `/gallery`,
    settings: site.settings,
  });
}

export default async function GalleryPage() {
  const images = await query<any>(`
    SELECT g.*, m.url as image_url, m.alt_text 
    FROM gallery_images g
    JOIN media m ON g.media_id = m.id
    WHERE g.is_visible = 1
    ORDER BY g.sort_order ASC, g.id DESC
  `);

  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Gallery", href: "/gallery" }]} />
      <div className="py-16 md:py-24 lg:py-32 bg-cream text-ink">
        <div className="container-wide">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow">Our Work</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-6xl">Gallery</h1>
            <p className="mt-4 text-lg text-muted">A showcase of our recent repairs and service centers.</p>
          </div>

          {images.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
              {images.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-soft break-inside-avoid">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img.image_url} 
                    alt={img.alt_text || img.caption || "Gallery image"} 
                    className="h-auto w-full transition duration-500 group-hover:scale-105" 
                    loading="lazy"
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 pt-12">
                      <p className="text-sm font-medium text-white">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-muted">
              <p>No images have been added to the gallery yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
