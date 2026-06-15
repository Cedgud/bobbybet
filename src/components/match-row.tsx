import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

type MatchRowProps = {
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  groupName?: string | null;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  action?: ReactNode;
};

export function MatchRow({ homeTeam, awayTeam, kickoffAt, groupName, status, homeScore, awayScore, action }: MatchRowProps) {
  const score = homeScore === null || homeScore === undefined ? null : `${homeScore} - ${awayScore ?? 0}`;

  return (
    <li className="grid gap-3 border-b border-surface-high py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-sm font-semibold">
          <span className={teamColorClass(homeTeam)}>{homeTeam}</span> <span className="text-ink-soft/45">vs</span>{" "}
          <span className={teamColorClass(awayTeam)}>{awayTeam}</span>
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
          <CalendarDays size={14} />
          {new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(kickoffAt)}
          {groupName ? <span>· {groupName}</span> : null}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="border border-surface-high bg-white px-3 py-1 font-medium text-ink-soft">{status}</span>
        {score ? <span className="border border-surface-high bg-white px-3 py-1 font-semibold text-ink">{score}</span> : null}
      </div>
      {action ? <div className="sm:col-span-2">{action}</div> : null}
    </li>
  );
}

function teamColorClass(name: string) {
  const classes = ["text-sky-deep", "text-mint-deep", "text-peach-deep", "text-coral-deep", "text-lavender-deep", "text-aqua-deep"];
  const index = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % classes.length;
  return classes[index];
}
