import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BADGE: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  QUOTED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Quote Requests</h1>
      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {quotes.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No quote requests.</div>}
        {quotes.map((q) => (
          <Link key={q.id} href={`/admin/quotes/${q.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
            <div>
              <span className="sku text-slate-700">Q-{q.id.slice(-8).toUpperCase()}</span>
              <div className="text-xs text-slate-400 mt-0.5">
                {q.user.email} · {q.items.length} lines ·{" "}
                {q.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE[q.status] ?? BADGE.REQUESTED}`}>
              {q.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
