import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Quotes" };

const BADGE: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  QUOTED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-slate-100 text-slate-600",
};

export default async function QuotesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/quotes");
  const { t, locale } = await getT();

  const quotes = await prisma.quoteRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#0A6286]" />
          <h1 className="text-2xl font-bold text-slate-900">{t("quotes.title")}</h1>
        </div>
        <Link href="/account" className="text-sm text-[#0A6286] font-medium">{t("nav.account")}</Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-sm text-slate-500">
          {t("quotes.none")}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {quotes.map((q) => (
            <Link key={q.id} href={`/account/quotes/${q.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
              <div>
                <div className="sku text-slate-700">Q-{q.id.slice(-8).toUpperCase()}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {q.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" })} · {q.items.length} {t("common.lines")}
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE[q.status] ?? BADGE.REQUESTED}`}>
                {t(`status.${q.status}` as never)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
