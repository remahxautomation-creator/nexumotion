import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/i18n/server";
import { renderMarkdown } from "@/lib/markdown";
import { contact } from "@/content/site-content";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexumotion.com";

const getPost = cache((slug: string) =>
  prisma.blogPost.findFirst({ where: { slug: decodeURIComponent(slug), status: "PUBLISHED" } }),
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  const ar = (await getLocale()) === "ar";
  const title = ar ? post.titleAr : post.titleEn ?? post.titleAr;
  const description = ar ? post.excerptAr : post.excerptEn ?? post.excerptAr;
  return {
    title,
    description,
    keywords: post.keywords ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const ar = (await getLocale()) === "ar";
  const title = ar ? post.titleAr : post.titleEn ?? post.titleAr;
  const body = ar ? post.bodyAr : post.bodyEn ?? post.bodyAr;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: ar ? post.excerptAr : post.excerptEn ?? post.excerptAr,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: ar ? "ar" : "en",
    image: post.coverImage ?? undefined,
    mainEntityOfPage: `${BASE}/blog/${post.slug}`,
    author: { "@type": "Organization", name: "NexuMotion" },
    publisher: { "@type": "Organization", name: "NexuMotion", url: BASE },
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-slate-500 mb-4 flex gap-1.5">
        <Link href="/blog" className="hover:text-[#0A6286]">{ar ? "المدونة" : "Blog"}</Link>
        <span>/</span>
        <span className="text-slate-700 line-clamp-1">{title}</span>
      </nav>
      <h1 className="text-3xl font-bold text-slate-900 leading-tight">{title}</h1>
      {post.publishedAt && (
        <time className="mt-2 block text-sm text-slate-400 ltr-nums" dateTime={post.publishedAt.toISOString()}>
          {post.publishedAt.toISOString().slice(0, 10)}
        </time>
      )}
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt={title} className="mt-6 w-full rounded-lg border border-slate-200" />
      )}
      <div
        className="mt-8 space-y-4 leading-relaxed text-slate-800 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-6 [&_ol]:ps-6 [&_a]:text-[#0A6286] [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
      />
      <div className="mt-12 bg-white border border-slate-200 rounded-lg p-6">
        <p className="font-semibold text-slate-900">
          {ar ? "محتاج القطعة أو بديلها؟" : "Need this part or a replacement?"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {ar
            ? "ابعت رقم القطعة أو قائمة المواد ونرد بعرض سعر مكتوب خلال ٢٤ ساعة."
            : "Send the part number or your BOM — written quote within 24 hours."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
            className="bg-[#25D366] text-white font-semibold px-5 py-2.5 rounded-lg"
          >
            WhatsApp
          </a>
          <Link href="/quick-order" className="border border-slate-300 font-semibold px-5 py-2.5 rounded-lg">
            {ar ? "طلب سريع" : "Quick order"}
          </Link>
        </div>
      </div>
    </article>
  );
}
