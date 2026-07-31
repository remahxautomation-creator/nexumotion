import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim();
  const url = (body?.url as string | undefined)?.trim();

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Name required (max 120 chars)" }, { status: 400 });
  }
  // Only allow relative catalog URLs — never absolute/external
  if (!url || !/^\/(categories\/|search($|\?))/.test(url) || url.length > 2000) {
    return NextResponse.json({ error: "Invalid search URL" }, { status: 400 });
  }

  const count = await prisma.savedSearch.count({ where: { userId: session.user.id } });
  if (count >= 50) return NextResponse.json({ error: "Limit of 50 saved searches reached" }, { status: 400 });

  await prisma.savedSearch.create({ data: { userId: session.user.id, name, url } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.savedSearch.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.savedSearch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
