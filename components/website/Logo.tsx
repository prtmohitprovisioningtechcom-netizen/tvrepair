import Link from "next/link";
import { Tv } from "lucide-react";

export function Logo({
  light = false,
  name = "India LED TV Repair Center",
  src,
}: {
  light?: boolean;
  name?: string;
  src?: string | null;
}) {
  const photo = src?.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "") || "";
  return (
    <Link href="/" className="flex min-w-0 items-center" aria-label={name || "Home"}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name || "Logo"}
          className="h-10 w-auto max-h-10 max-w-44 object-contain object-left sm:h-12 sm:max-h-12 sm:max-w-52 lg:h-14 lg:max-h-14 lg:max-w-64"
        />
      ) : (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 lg:h-14 lg:w-14 ${
            light ? "bg-copper text-white" : "bg-navy text-white"
          }`}
        >
          <Tv size={18} strokeWidth={2.2} />
        </span>
      )}
    </Link>
  );
}
