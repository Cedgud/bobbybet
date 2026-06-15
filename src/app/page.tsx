import { CalendarDays, Trophy, UsersRound, Wallet } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { MatchCard } from "@/components/match-card";
import { SiteHeader } from "@/components/site-header";
import { UserCard } from "@/components/user-card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const selectedDate = getParisDate();
  const dayStart = new Date(`${selectedDate}T00:00:00+02:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const session = await getServerSession(authOptions);
  const [users, matches, leaderboard, myBets] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, pseudo: true, vibe: true, avatarUrl: true, role: true },
    }),
    prisma.match.findMany({
      where: {
        kickoffAt: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      orderBy: { kickoffAt: "asc" },
      include: { _count: { select: { bets: true } } },
    }),
    prisma.user.findMany({
      orderBy: { pseudo: "asc" },
      select: {
        id: true,
        pseudo: true,
        bets: { select: { points: true } },
      },
    }),
    session?.user?.id
      ? prisma.bet.findMany({
          where: { userId: session.user.id },
          select: { matchId: true, predictedHomeScore: true, predictedAwayScore: true, stakeAmount: true },
        })
      : Promise.resolve([]),
  ]);

  const currentUser = users.find((user) => user.id === session?.user?.id);
  const betsByMatch = new Map(myBets.map((bet) => [bet.matchId, bet]));
  const ranking = leaderboard
    .map((user) => ({
      id: user.id,
      pseudo: user.pseudo,
      points: user.bets.reduce((total, bet) => total + (bet.points ?? 0), 0),
    }))
    .sort((a, b) => b.points - a.points);

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(dayStart);

  return (
    <div className="min-h-screen bg-background pb-28 text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] px-4 pt-24 sm:px-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-surface-high pb-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-mint-deep">
              <CalendarDays size={15} />
              {formattedDate}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">Paris du jour</h1>
          </div>
          <div className="flex items-center gap-2 bg-mint px-3 py-2 text-xs font-bold text-mint-deep">
            <Wallet size={15} />
            1 250 jetons
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div id="matchs">
            {matches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((match) => {
                  const bet = betsByMatch.get(match.id);

                  return (
                    <MatchCard
                      key={match.id}
                      id={match.id}
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                      kickoffAt={match.kickoffAt}
                      groupName={match.groupName}
                      disabled={!session?.user}
                      homeScore={bet?.predictedHomeScore}
                      awayScore={bet?.predictedAwayScore}
                      stakeAmount={bet?.stakeAmount}
                      bettorsCount={match._count.bets}
                      returnTo="/#matchs"
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState title="Aucun match aujourd'hui" text="Les paris plus anciens seront visibles depuis ton profil." />
            )}
          </div>

          <aside className="grid content-start gap-4">
            <section className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
                <Trophy size={19} />
                Classement
              </h2>
              <ol className="mt-4 grid gap-2">
                {ranking.slice(0, 6).map((user, index) => (
                  <li key={user.id} className="flex items-center justify-between bg-surface-low px-4 py-3">
                    <span className="text-sm font-bold text-ink">
                      {index + 1}. {user.pseudo}
                    </span>
                    <span className="text-sm font-extrabold text-mint-deep">{user.points}</span>
                  </li>
                ))}
                {ranking.length === 0 ? <li className="text-sm text-ink-soft">En attente des joueurs.</li> : null}
              </ol>
              <p className="mt-4 text-xs leading-5 text-ink-soft">Vainqueur: 1 pt. Score exact: +2 pts.</p>
            </section>

            <section className="surface-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
                  <UsersRound size={19} />
                  Joueurs
                </h2>
                <Link className="text-sm font-bold text-mint-deep" href="/account">
                  Profil
                </Link>
              </div>
              <div className="grid gap-3">
                {users.slice(0, 5).map((user) => (
                  <UserCard key={user.id} pseudo={user.pseudo} vibe={user.vibe} avatarUrl={user.avatarUrl} compact />
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
      <BottomNav isAdmin={currentUser?.role === "ADMIN"} />
    </div>
  );
}

function getParisDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
