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
          className="h-9 w-auto max-h-9 max-w-40 object-contain object-left sm:h-10 sm:max-h-10 sm:max-w-48 lg:h-11 lg:max-h-11 lg:max-w-56"
        />
      ) : (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 lg:h-11 lg:w-11 ${
            light ? "bg-copper text-white" : "bg-navy text-white"
          }`}
        >
          <Tv size={18} strokeWidth={2.2} />
        </span>
      )}
    </Link>
  );
}
