import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const ar = (await getLocale()) === "ar";
  return {
    title: ar ? "مدونة الأتمتة الصناعية" : "Industrial Automation Blog",
    description: ar
      ? "أدلة عملية لمهندسي الصيانة ومصنّعي اللوحات: اختيار القطع، البدائل، وحل الأعطال."
      : "Practical guides for maintenance engineers and panel builders: part selection, replacements and fault-finding.",
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogIndex() {
  const ar = (await getLocale()) === "ar";
  const posts = await prisma.blogPost
    .findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 60,
      select: { slug: true, titleAr: true, titleEn: true, excerptAr: true, excerptEn: true, publishedAt: true },
    })
    .catch(() => []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">
        {ar ? "مدونة الأتمتة الصناعية" : "Industrial Automation Blog"}
      </h1>
      <p className="mt-2 text-slate-600">
        {ar
          ? "أدلة عملية لمهندسي الصيانة ومصنّعي اللوحات."
          : "Practical guides for maintenance engineers and panel builders."}
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-slate-500">{ar ? "لا توجد مقالات بعد." : "No articles yet."}</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-[#0A6286]">
              <Link href={`/blog/${p.slug}`} className="block">
                <h2 className="font-semibold text-lg text-slate-900">{ar ? p.titleAr : p.titleEn ?? p.titleAr}</h2>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                  {ar ? p.excerptAr : p.excerptEn ?? p.excerptAr}
                </p>
                {p.publishedAt && (
                  <time className="mt-3 block text-xs text-slate-400 ltr-nums" dateTime={p.publishedAt.toISOString()}>
                    {p.publishedAt.toISOString().slice(0, 10)}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
