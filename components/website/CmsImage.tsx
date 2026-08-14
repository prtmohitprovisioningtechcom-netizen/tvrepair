import Image from "next/image";
import { resolveWorkImage } from "@/lib/site-images";

function isRemote(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//");
}

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
  if (isRemote(local)) {
    return (
      // Remote CMS URLs must not go through next/image hostname checks on deploy.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={local} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />
    );
  }
  return <Image src={local} alt={alt} fill className={className} sizes={sizes} priority={priority} />;
}
