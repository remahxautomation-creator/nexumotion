import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Latin and Arabic letters survive so an Arabic-only title still gives a slug.
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[^a-z0-9ء-ي]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

/**
 * Blog publishing endpoint for the n8n content workflow.
 *
 *   GET  /api/blog          → recent slugs + titles (lets the workflow avoid repeats)
 *   POST /api/blog          → create or update a post by slug
 *
 * Both need `Authorization: Bearer <BLOG_API_TOKEN>`. With the secret unset the
 * endpoint is closed, so a deploy without it cannot be written to by anyone.
 */

function authorised(req: NextRequest): boolean {
  const secret = process.env.BLOG_API_TOKEN;
  if (!secret) return false;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

const str = (v: unknown, max: number) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { slug: true, titleAr: true, titleEn: true, status: true, publishedAt: true },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);

  const titleAr = str(body?.titleAr, 200);
  const excerptAr = str(body?.excerptAr, 400);
  const bodyAr = str(body?.bodyAr, 40_000);
  if (!titleAr || !excerptAr || !bodyAr) {
    return NextResponse.json({ error: "titleAr, excerptAr and bodyAr are required" }, { status: 400 });
  }

  const titleEn = str(body?.titleEn, 200);
  const slug = slugify(str(body?.slug, 120) ?? titleEn ?? titleAr);
  if (!slug) return NextResponse.json({ error: "Could not derive a slug" }, { status: 400 });

  const cover = str(body?.coverImage, 500);
  const status = body?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const data = {
    titleAr,
    titleEn,
    excerptAr,
    excerptEn: str(body?.excerptEn, 400),
    bodyAr,
    bodyEn: str(body?.bodyEn, 40_000),
    keywords: str(body?.keywords, 300),
    coverImage: cover && /^https:\/\//.test(cover) ? cover : null,
    status,
  };

  const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { publishedAt: true } });
  const publishedAt = status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : null;

  const post = await prisma.blogPost.upsert({
    where: { slug },
    create: { slug, ...data, publishedAt },
    update: { ...data, publishedAt },
    select: { slug: true, status: true, publishedAt: true },
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexumotion.com";
  return NextResponse.json({ ...post, url: `${base}/blog/${post.slug}` });
}
