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
    <li className="grid gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {homeTeam} <span className="text-slate-300">vs</span> {awayTeam}
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={14} />
          {new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(kickoffAt)}
          {groupName ? <span> · {groupName}</span> : null}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="bg-mint px-3 py-1 font-medium text-emerald-900">{status}</span>
        {score ? <span className="bg-slate-100 px-3 py-1 font-semibold text-slate-700">{score}</span> : null}
      </div>
      {action ? <div className="sm:col-span-2">{action}</div> : null}
    </li>
  );
}
