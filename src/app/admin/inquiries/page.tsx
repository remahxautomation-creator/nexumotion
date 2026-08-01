import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { systems } from "@/content/systems";
import { getT, getLocale } from "@/i18n/server";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"];

const BADGE: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  QUALIFIED: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-slate-100 text-slate-600",
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { t } = await getT();
  const locale = await getLocale();
  const filter = status && STATUSES.includes(status) ? status : undefined;

  const inquiries = await prisma.inquiry.findMany({
    where: filter ? { status: filter } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const systemName = (slug: string | null) => {
    if (!slug) return null;
    const s = systems.find((x) => x.slug === slug);
    if (!s) return slug;
    return (locale === "ar" ? s.ar : s.en).name;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t("admin.inquiries")}</h1>
        <div className="flex gap-1 flex-wrap">
          <Link href="/admin/inquiries"
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${!filter ? "bg-[#0052CC] text-white border-[#0052CC]" : "bg-white text-slate-600 border-slate-300"}`}>
            {t("admin.all")}
          </Link>
          {STATUSES.map((s) => (
            <Link key={s} href={`/admin/inquiries?status=${s}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${filter === s ? "bg-[#0052CC] text-white border-[#0052CC]" : "bg-white text-slate-600 border-slate-300"}`}>
              {t(`inqStatus.${s}` as never)}
            </Link>
          ))}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-sm text-slate-500">
          {t("admin.noInquiries")}
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div key={q.id} className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">
                    {q.name}
                    {q.company && <span className="text-slate-500 font-normal"> · {q.company}</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3" dir="ltr">
                    <a href={`mailto:${q.email}`} className="text-[#0052CC] hover:underline">{q.email}</a>
                    {q.phone && <a href={`tel:${q.phone}`} className="hover:underline">{q.phone}</a>}
                    {q.country && <span>{q.country}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE[q.status] ?? BADGE.NEW}`}>
                    {t(`inqStatus.${q.status}` as never)}
                  </span>
                  <InquiryStatusSelect id={q.id} value={q.status} options={STATUSES} />
                </div>
              </div>

              {q.systemSlug && (
                <Link
                  href={`/systems/${q.systemSlug}`}
                  className="inline-block mt-3 text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 rounded-md px-2 py-1 hover:bg-blue-100"
                >
                  {systemName(q.systemSlug)}
                </Link>
              )}

              <p className="text-sm text-slate-700 mt-3 leading-relaxed whitespace-pre-wrap">{q.message}</p>

              <div className="text-[11px] text-slate-400 mt-3">
                {q.createdAt.toLocaleString(locale === "ar" ? "ar-EG" : "en-GB", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
