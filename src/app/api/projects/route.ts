import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim();
  const description = (body?.description as string | undefined)?.trim() || null;
  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Project name required (max 120 chars)" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: { userId: session.user.id, name, description },
  });
  return NextResponse.json({ id: project.id });
}
