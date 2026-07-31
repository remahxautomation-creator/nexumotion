import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import NewProjectForm from "@/components/projects/NewProjectForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects / BOMs" };

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/projects");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-1">
        <FolderKanban className="w-6 h-6 text-[#0052CC]" />
        <h1 className="text-2xl font-bold text-slate-900">Projects / BOMs</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Save bills of materials, import them from CSV, and convert them to orders.
      </p>

      <NewProjectForm />

      <div className="mt-6 space-y-3">
        {projects.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-10 text-center text-sm text-slate-500">
            No projects yet — create one above.
          </div>
        )}
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}
            className="block bg-white rounded-lg border border-slate-200 px-5 py-4 hover:border-[#0052CC] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{p.name}</div>
                {p.description && <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>}
              </div>
              <div className="text-sm text-slate-500">{p._count.items} items</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
