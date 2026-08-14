import Link from "next/link";
import { SiteLink } from "@/components/website/SiteLink";

export default function NotFound() {
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-3xl sm:text-5xl">Page not found</h1>
      <p className="mt-4 text-muted">The page you requested is unavailable or has been moved.</p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 min-[480px]:max-w-none min-[480px]:flex-row min-[480px]:justify-center">
        <Link href="/" className="btn-navy w-full min-[480px]:w-auto">Go home</Link>
        <SiteLink href="/book-service" className="btn-primary w-full min-[480px]:w-auto" source="404">
          Book a repair
        </SiteLink>
      </div>
    </div>
  );
}
