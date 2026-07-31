import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import DeleteSavedSearch from "@/components/search/DeleteSavedSearch";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved Searches" };

export default async function SavedSearchesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/searches");

  const searches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-[#0052CC]" />
          <h1 className="text-2xl font-bold text-slate-900">Saved Searches</h1>
        </div>
        <Link href="/account" className="text-sm text-[#0052CC] font-medium">← Account</Link>
      </div>

      {searches.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-sm text-slate-500">
          No saved searches yet. Use “Save search” on any category or search page.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {searches.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
              <Link href={s.url} className="min-w-0 hover:text-[#0052CC]">
                <div className="font-medium text-sm text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-400 truncate">{s.url}</div>
              </Link>
              <DeleteSavedSearch id={s.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
