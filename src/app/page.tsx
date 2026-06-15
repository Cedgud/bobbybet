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
import { ensureDailyTokenGrant } from "@/lib/wallet";

export default async function Home() {
  const now = new Date();

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await ensureDailyTokenGrant(session.user.id);
  }

  const [users, matches, resultedMatches, leaderboard, myBets] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, pseudo: true, vibe: true, avatarUrl: true, role: true, walletBalance: true },
    }),
    prisma.match.findMany({
      where: {
        kickoffAt: {
          gt: now,
        },
        status: { not: "FINISHED" },
        homeScore: null,
        awayScore: null,
        winner: null,
      },
      orderBy: { kickoffAt: "asc" },
      take: 3,
      include: { _count: { select: { bets: true } } },
    }),
    prisma.match.findMany({
      where: {
        OR: [{ status: "FINISHED" }, { homeScore: { not: null } }, { awayScore: { not: null } }, { winner: { not: null } }],
      },
      orderBy: { kickoffAt: "desc" },
      take: 6,
      include: { _count: { select: { bets: true } } },
    }),
    prisma.user.findMany({
      orderBy: { pseudo: "asc" },
      select: {
        id: true,
        pseudo: true,
        walletBalance: true,
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
      walletBalance: user.walletBalance,
      points: user.bets.reduce((total, bet) => total + (bet.points ?? 0), 0),
    }))
    .sort((a, b) => b.points - a.points || b.walletBalance - a.walletBalance);

  return (
    <div className="min-h-screen bg-background pb-28 text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] px-4 pt-24 sm:px-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-surface-high pb-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
              <CalendarDays size={15} />
              Les 3 prochains matchs
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">Paris à venir</h1>
          </div>
          {currentUser ? (
            <div className="flex items-center gap-2 border border-surface-high px-3 py-2 text-xs font-bold text-ink-soft">
              <Wallet size={15} />
              {currentUser.walletBalance} jetons
            </div>
          ) : null}
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div id="matchs" className="grid gap-6">
            <section>
              <div className="mb-3 flex items-center justify-between border-b border-surface-high pb-2">
                <h2 className="text-xl font-extrabold text-ink">À parier</h2>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">{matches.length}/3</span>
              </div>
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
                      locked={Boolean(bet)}
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
              <EmptyState title="Aucun match à venir" text="Les paris plus anciens restent visibles depuis ton profil." />
            )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between border-b border-surface-high pb-2">
                <h2 className="text-xl font-extrabold text-ink">Résultats renseignés</h2>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">{resultedMatches.length}</span>
              </div>
              {resultedMatches.length > 0 ? (
                <ul className="grid gap-3">
                  {resultedMatches.map((match) => (
                    <ResultMatchRow
                      key={match.id}
                      id={match.id}
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                      kickoffAt={match.kickoffAt}
                      groupName={match.groupName}
                      homeScore={match.homeScore}
                      awayScore={match.awayScore}
                      winner={match.winner}
                      bettorsCount={match._count.bets}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState title="Aucun résultat renseigné" text="Les matchs terminés apparaîtront ici." />
              )}
            </section>
          </div>

          <aside className="grid content-start gap-4">
            <section className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
                <Trophy size={19} />
                Classement
              </h2>
              <ol className="mt-4 grid gap-2">
                {ranking.slice(0, 6).map((user, index) => (
                  <li key={user.id} className="flex items-center justify-between border border-surface-high bg-white px-4 py-3">
                    <span className="text-sm font-bold text-ink">
                      {index + 1}. {user.pseudo}
                    </span>
                    <span className="text-sm font-extrabold text-ink">{user.points} pts</span>
                  </li>
                ))}
                {ranking.length === 0 ? <li className="text-sm text-ink-soft">En attente des joueurs.</li> : null}
              </ol>
              <p className="mt-4 text-xs leading-5 text-ink-soft">+100 jetons par jour. Vainqueur: 1 pt et mise x2. Score exact: 3 pts et mise x3.</p>
            </section>

            <section className="surface-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
                  <UsersRound size={19} />
                  Joueurs
                </h2>
                <Link className="text-sm font-bold text-ink-soft" href="/account">
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

function ResultMatchRow({
  id,
  homeTeam,
  awayTeam,
  kickoffAt,
  groupName,
  homeScore,
  awayScore,
  winner,
  bettorsCount,
}: {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  groupName?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  bettorsCount: number;
}) {
  return (
    <li className="border border-surface-high bg-white p-4">
      <Link className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center" href={`/matches/${id}`}>
        <div>
          <p className="text-sm font-bold text-ink-soft">{groupName ?? "Coupe du Monde"}</p>
          <p className="mt-2 text-base font-extrabold">
            <span className={teamColorClass(homeTeam)}>{homeTeam}</span>
            <span className="px-2 text-ink-soft/45">vs</span>
            <span className={teamColorClass(awayTeam)}>{awayTeam}</span>
          </p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">
            {new Intl.DateTimeFormat("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(kickoffAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-ink-soft sm:justify-end">
          <span className="border border-surface-high bg-white px-3 py-2 text-base font-extrabold text-ink">
            {homeScore ?? "-"} - {awayScore ?? "-"}
          </span>
          <span className="border border-surface-high bg-white px-3 py-2">{formatWinner(winner, homeTeam, awayTeam)}</span>
          <span className="border border-surface-high bg-white px-3 py-2">{bettorsCount} parieur{bettorsCount > 1 ? "s" : ""}</span>
        </div>
      </Link>
    </li>
  );
}

function formatWinner(winner: string | null, homeTeam: string, awayTeam: string) {
  if (winner === "HOME") {
    return homeTeam;
  }

  if (winner === "AWAY") {
    return awayTeam;
  }

  if (winner === "DRAW") {
    return "Nul";
  }

  return "Résultat";
}

function teamColorClass(name: string) {
  const classes = ["text-sky-deep", "text-mint-deep", "text-peach-deep", "text-coral-deep", "text-lavender-deep", "text-aqua-deep"];
  const index = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % classes.length;
  return classes[index];
}

