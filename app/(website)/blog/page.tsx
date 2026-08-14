import type { Metadata } from "next";
import Link from "next/link";
import { listBlogs } from "@/server/repositories/blogs.repository";
import { getPublishedPageBySlug } from "@/server/repositories/pages.repository";
import { getSiteContext } from "@/server/services/site";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { PageHero } from "@/components/website/PageHero";
import { CmsImage } from "@/components/website/CmsImage";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/cn";
import { pageBanner } from "@/lib/page-banner";
import { ArrowUpRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContext();
  return buildMetadata({
    seo: null,
    fallbackTitle: "TV Repair Blog",
    fallbackDescription: "Guides and advice on LED, OLED and Smart TV repair.",
    path: "/blog",
    settings: site.settings,
  });
}

export default async function BlogIndexPage() {
  const [{ data }, page] = await Promise.all([
    listBlogs({ publishedOnly: true, pageSize: 12 }),
    getPublishedPageBySlug("blog"),
  ]);
  return (
    <>
      <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }]} />
      <PageHero
        eyebrow="Journal"
        title="Advice from the bench"
        description="Practical guides from technicians who repair TVs every day."
        image={pageBanner(page)}
      />
      <section className="section-pad">
        <div className="container-wide grid gap-5 md:grid-cols-2">
          {data.map((post) => (
            <article key={post.id} className="card-surface overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft">
              <Link href={`/blog/${post.slug}`} className="relative block aspect-video overflow-hidden">
                <CmsImage src={post.image_url} alt={post.title} sizes="(max-width: 768px) 100vw, 50vw" />
              </Link>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{formatDate(post.published_at)}</p>
                <h2 className="mt-3 font-display text-xl sm:text-2xl">
                  <Link href={`/blog/${post.slug}`} className="hover:text-copper">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-muted">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-copper">
                  Read article <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
