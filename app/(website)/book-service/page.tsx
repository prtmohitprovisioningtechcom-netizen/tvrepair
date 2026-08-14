import type { Metadata } from "next";
import { getPublishedPageBySlug } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { PageRenderer } from "@/components/website/PageRenderer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { BookingForm } from "@/components/forms/BookingForm";
import { PageHero } from "@/components/website/PageHero";
import { buildMetadata } from "@/lib/seo/metadata";
import { hasSection, pageBanner } from "@/lib/page-banner";

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getPublishedPageBySlug("book-service"), getSiteContext()]);
  const seo = page ? await getSeo("page", page.id) : null;
  return buildMetadata({
    seo,
    fallbackTitle: "Book TV Repair",
    fallbackDescription: "Schedule a doorstep TV repair visit across Delhi NCR.",
    path: "/book-service",
    settings: site.settings,
  });
}

export default async function BookServicePage() {
  const [page, site] = await Promise.all([getPublishedPageBySlug("book-service"), getSiteContext()]);
  const showHero = !hasSection(page?.sections, "hero");
  const showForm = !hasSection(page?.sections, "booking_form");
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Book service", href: "/book-service" }]} />
      {showHero ? (
        <PageHero
          eyebrow="Same-day slots"
          title="Book a repair visit"
          description="Tell us the TV type and fault. A coordinator will confirm timing before the technician leaves."
          image={pageBanner(page)}
        />
      ) : null}
      {page ? (
        <PageRenderer
          sections={page.sections.filter((s) => (showHero ? s.type !== "text" : true))}
          extras={site}
        />
      ) : null}
      {showForm ? (
        <section className="section-pad">
          <div className="container-narrow">
            <div className="card-surface p-5 sm:p-6 lg:p-8">
              <BookingForm />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
