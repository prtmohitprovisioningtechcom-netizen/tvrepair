"use client";

import { useEffect, useState } from "react";
import { resolveWorkImage, SITE_IMAGES } from "@/lib/site-images";

export function CmsImage({
  src,
  alt,
  className = "object-cover",
  sizes: _sizes = "100vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const initial = resolveWorkImage(src) || SITE_IMAGES.hero;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    setCurrent(resolveWorkImage(src) || SITE_IMAGES.hero);
  }, [src]);

  return (
    // Hostinger cannot run Next.js /_next/image. Serve files directly.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={`absolute inset-0 h-full w-full ${className}`}
      loading={priority ? "eager" : "lazy"}
      onError={() => {
        if (current !== SITE_IMAGES.hero) setCurrent(SITE_IMAGES.hero);
      }}
    />
  );
}
