import { Database, Upload } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AdminImportForm } from "@/components/admin-import-form";
import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      orderBy: { kickoffAt: "asc" },
      take: 10,
    }),
    prisma.match.count(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-[960px] gap-6 px-4 pt-28 sm:px-6 lg:grid-cols-[1fr_0.85fr]">
        <section className="surface-card p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center bg-mint text-mint-deep">
              <Upload size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Importer les matchs</h1>
              <p className="text-sm text-ink-soft">JSON uniquement.</p>
            </div>
          </div>
          <AdminImportForm />
        </section>

        <section className="surface-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center bg-lavender text-lavender-deep">
                <Database size={18} />
              </span>
              <h2 className="text-xl font-extrabold text-ink">Base</h2>
            </div>
            <span className="surface-chip">{total} matchs</span>
          </div>
          <div className="grid gap-3">
            {matches.map((match) => (
              <div key={match.id} className="bg-surface-low px-4 py-3">
                <p className="text-sm font-bold text-ink">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">
                  {match.groupName} ·{" "}
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(match.kickoffAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav isAdmin />
    </div>
  );
}
