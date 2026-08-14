import Image from "next/image";
import { resolveWorkImage } from "@/lib/site-images";

export function CmsImage({
  src,
  alt,
  className = "object-cover",
  sizes = "100vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const local = resolveWorkImage(src);
  if (!local) {
    return <span className="absolute inset-0 bg-navy-2" aria-hidden />;
  }
  return <Image src={local} alt={alt} fill className={className} sizes={sizes} priority={priority} />;
}
