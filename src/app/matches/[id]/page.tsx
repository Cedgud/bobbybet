import { ArrowLeft, CalendarDays, Coins, Trophy, UsersRound } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BetForm } from "@/components/bet-form";
import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type MatchPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const [match, currentUser] = await Promise.all([
    prisma.match.findUnique({
      where: { id },
      include: {
        bets: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { id: true, pseudo: true, vibe: true, avatarUrl: true },
            },
          },
        },
      },
    }),
    session?.user?.id ? prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }) : Promise.resolve(null),
  ]);

  if (!match) {
    notFound();
  }

  const myBet = session?.user?.id ? match.bets.find((bet) => bet.userId === session.user.id) : null;

  return (
    <div className="min-h-screen bg-background pb-28 text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[920px] px-4 pt-24 sm:px-6">
        <Link className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-mint-deep" href="/#matchs">
          <ArrowLeft size={17} />
          Retour aux paris du jour
        </Link>

        <section className="surface-card bg-white p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="surface-chip bg-mint text-mint-deep">
              <Trophy size={15} />
              {match.groupName ?? match.competition}
            </span>
            <span className="flex items-center gap-2 text-sm font-bold text-ink-soft">
              <CalendarDays size={16} />
              {new Intl.DateTimeFormat("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              }).format(match.kickoffAt)}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <TeamName name={match.homeTeam} />
            <span className="text-3xl font-extrabold text-ink-soft/20">VS</span>
            <TeamName name={match.awayTeam} />
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="surface-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-ink">Parieurs</h1>
              <span className="flex items-center gap-2 bg-surface-low px-3 py-2 text-xs font-bold text-ink-soft">
                <UsersRound size={15} />
                {match.bets.length}
              </span>
            </div>

            {match.bets.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {match.bets.map((bet) => (
                  <BettorMiniProfile
                    key={bet.id}
                    pseudo={bet.user.pseudo}
                    vibe={bet.user.vibe}
                    avatarUrl={bet.user.avatarUrl}
                    stake={bet.stakeAmount}
                  />
                ))}
              </div>
            ) : (
              <p className="bg-surface-low p-4 text-sm font-semibold text-ink-soft">Personne n&apos;a encore parié sur ce match.</p>
            )}
          </div>

          <aside className="surface-card p-5">
            <h2 className="text-xl font-extrabold text-ink">Mon pari</h2>
            <p className="mb-5 mt-2 text-sm leading-6 text-ink-soft">
              Les scores joués restent privés. Les autres membres voient seulement ta présence et ta mise.
            </p>
            <BetForm
              matchId={match.id}
              disabled={!session?.user}
              homeScore={myBet?.predictedHomeScore}
              awayScore={myBet?.predictedAwayScore}
              stakeAmount={myBet?.stakeAmount}
              returnTo={`/matches/${match.id}`}
            />
          </aside>
        </section>
      </main>
      <BottomNav isAdmin={currentUser?.role === "ADMIN"} />
    </div>
  );
}

function TeamName({ name }: { name: string }) {
  return <span className={`px-2 py-1 text-lg font-extrabold sm:text-2xl ${teamColorClass(name)}`}>{name}</span>;
}

function BettorMiniProfile({ pseudo, vibe, avatarUrl, stake }: { pseudo: string; vibe: string; avatarUrl?: string | null; stake: number }) {
  const initials = pseudo
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="group relative flex items-center gap-3 bg-surface-low p-3" title={vibe || "Score parfait en vue"}>
      <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-peach text-sm font-extrabold text-peach-deep">
        {avatarUrl ? <Image src={avatarUrl} alt="" fill sizes="48px" className="object-cover" /> : <span>{initials}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-ink">{pseudo}</p>
        <p className="flex items-center gap-1 text-xs font-bold text-mint-deep">
          <Coins size={14} />
          {stake} jetons
        </p>
      </div>
      <p className="pointer-events-none absolute left-3 right-3 top-full z-10 mt-2 hidden bg-ink px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
        {vibe || "Score parfait en vue"}
      </p>
    </article>
  );
}

function teamColorClass(name: string) {
  const classes = [
    "bg-mint text-mint-deep",
    "bg-lavender text-lavender-deep",
    "bg-peach text-peach-deep",
    "bg-coral text-[#7a4b47]",
    "bg-[#d8ecff] text-[#315f78]",
    "bg-[#fff2b8] text-[#6c5d19]",
  ];
  const index = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % classes.length;
  return classes[index];
}
