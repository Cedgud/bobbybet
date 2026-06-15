import { saveMatchResultAction } from "@/lib/actions";

type MatchResultFormProps = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  winner?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
};

export function MatchResultForm({ matchId, homeTeam, awayTeam, winner, homeScore, awayScore }: MatchResultFormProps) {
  return (
    <form action={saveMatchResultAction} className="mt-3 grid gap-3 border-t border-surface-high pt-3">
      <input type="hidden" name="matchId" value={matchId} />
      <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
        Résultat
        <select className="field py-3 text-sm normal-case tracking-normal" name="winner" defaultValue={winner ?? "HOME"} required>
          <option value="HOME">{homeTeam}</option>
          <option value="DRAW">Match nul</option>
          <option value="AWAY">{awayTeam}</option>
        </select>
      </label>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
          Score
          <input className="score-input border border-surface-high bg-white px-3 py-2 text-center text-lg font-bold text-ink" name="homeScore" type="number" min={0} max={30} inputMode="numeric" defaultValue={homeScore ?? ""} />
        </label>
        <span className="pb-2 text-xs font-bold text-ink-soft">-</span>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
          Score
          <input className="score-input border border-surface-high bg-white px-3 py-2 text-center text-lg font-bold text-ink" name="awayScore" type="number" min={0} max={30} inputMode="numeric" defaultValue={awayScore ?? ""} />
        </label>
      </div>
      <button className="primary-button w-full" type="submit">
        Enregistrer le résultat
      </button>
    </form>
  );
}
