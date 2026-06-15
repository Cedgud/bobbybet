import { CalendarDays, Trophy } from "lucide-react";
import Link from "next/link";

import { BetForm } from "@/components/bet-form";

type MatchCardProps = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  groupName?: string | null;
  disabled: boolean;
  homeScore?: number;
  awayScore?: number;
  stakeAmount?: number;
  bettorsCount?: number;
  returnTo?: string;
};

export function MatchCard({ id, homeTeam, awayTeam, kickoffAt, groupName, disabled, homeScore, awayScore, stakeAmount, bettorsCount = 0, returnTo }: MatchCardProps) {
  return (
    <article className="surface-card border-l-4 border-mint p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <Link className="block" href={`/matches/${id}`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-soft">
            <Trophy size={15} />
            {groupName ?? "Coupe du Monde"}
          </div>
          <div className="flex items-center gap-1 text-xs text-ink-soft/75">
            <CalendarDays size={14} />
            {new Intl.DateTimeFormat("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(kickoffAt)}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <TeamName name={homeTeam} />
          <span className="text-2xl font-extrabold text-ink-soft/20">VS</span>
          <TeamName name={awayTeam} />
        </div>

        <p className="mb-5 bg-surface-low px-3 py-2 text-center text-xs font-bold text-ink-soft">
          {bettorsCount} {bettorsCount > 1 ? "parieurs" : "parieur"} sur ce match
        </p>
      </Link>

      <BetForm matchId={id} disabled={disabled} homeScore={homeScore} awayScore={awayScore} stakeAmount={stakeAmount} returnTo={returnTo} />
    </article>
  );
}

function TeamName({ name }: { name: string }) {
  return (
    <span className={`px-2 py-1 text-base font-extrabold sm:text-lg ${teamColorClass(name)}`}>
      {name}
    </span>
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
