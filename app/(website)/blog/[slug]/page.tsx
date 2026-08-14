import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogBySlug, relatedBlogs } from "@/server/repositories/blogs.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { getSiteContext } from "@/server/services/site";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { formatDate, siteUrl } from "@/lib/utils/cn";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { CmsImage } from "@/components/website/CmsImage";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [post, site] = await Promise.all([getBlogBySlug(slug), getSiteContext()]);
  if (!post) return { title: "Blog" };
  const seo = await getSeo("blog", post.id);
  return buildMetadata({
    seo,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt || "",
    path: `/blog/${post.slug}`,
    settings: site.settings,
    image: post.image_url,
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getBlogBySlug(slug), getSiteContext()]);
  if (!post) notFound();
  const related = await relatedBlogs(post.id, post.category_id);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href })))} />
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.excerpt || "",
          url: siteUrl(`/blog/${post.slug}`),
          image: post.image_url,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: post.author_name,
          settings: site.settings,
        })}
      />
      <Breadcrumb items={crumbs} />
      <article className="container-narrow pt-8 pb-16 sm:pt-12 sm:pb-20">
        <p className="text-sm text-muted">{formatDate(post.published_at)} · {post.author_name}</p>
        <h1 className="mt-2 wrap-break-word font-display text-2xl leading-snug sm:text-4xl md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
        {post.image_url ? (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
            <CmsImage src={post.image_url} alt={post.title} sizes="(max-width: 768px) 100vw, 760px" />
          </div>
        ) : null}
        <div className="prose-site mt-10" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || "") }} />
      </article>
      {related.length ? (
        <section className="container-wide pb-16">
          <h2 className="font-display text-2xl">Related reading</h2>
          <div className="mt-4 grid gap-3">
            {related.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="text-sm hover:text-copper">{item.title}</Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
