import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";
import { ProfileForm } from "@/components/profile-form";
import { SiteHeader } from "@/components/site-header";
import { UserCard } from "@/components/user-card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureDailyTokenGrant } from "@/lib/wallet";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth");
  }

  await ensureDailyTokenGrant(session.user.id);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      pseudo: true,
      vibe: true,
      avatarUrl: true,
      email: true,
      role: true,
      walletBalance: true,
      bets: {
        orderBy: { createdAt: "desc" },
        include: {
          match: {
            select: {
              homeTeam: true,
              awayTeam: true,
              kickoffAt: true,
              homeScore: true,
              awayScore: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background pb-28">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-[760px] gap-8 px-4 pt-28 sm:px-6">
        <section className="grid justify-items-center gap-4 text-center">
          <div className="w-full max-w-sm">
            <UserCard pseudo={user.pseudo} vibe={user.vibe} avatarUrl={user.avatarUrl} />
          </div>
          <p className="surface-chip">
            {user.email} · {user.role === "ADMIN" ? "admin" : "joueur"} · {user.walletBalance} jetons
          </p>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <ProfileForm pseudo={user.pseudo} vibe={user.vibe} />
        </section>

        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-xl font-extrabold text-ink">Mes paris</h2>
          <div className="mt-4 grid gap-3">
            {user.bets.map((bet) => (
              <article key={bet.id} className="grid gap-2 border border-surface-high bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-ink">
                    {bet.match.homeTeam} - {bet.match.awayTeam}
                  </p>
                  <p className="text-xs font-bold text-ink-soft">{bet.stakeAmount} jetons misés</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-ink-soft">
                  <span>
                    Pari: {bet.predictedHomeScore}-{bet.predictedAwayScore}
                  </span>
                  <span>
                    {bet.match.homeScore === null || bet.match.awayScore === null
                      ? "En attente"
                      : `Résultat: ${bet.match.homeScore}-${bet.match.awayScore}`}
                  </span>
                  <span>
                    {bet.points ?? 0} pts · {bet.rewardTokens ?? 0} jetons gagnés
                  </span>
                </div>
              </article>
            ))}
            {user.bets.length === 0 ? <p className="text-sm text-ink-soft">Aucun pari pour le moment.</p> : null}
          </div>
        </section>
      </main>
      <BottomNav isAdmin={user.role === "ADMIN"} />
    </div>
  );
}
