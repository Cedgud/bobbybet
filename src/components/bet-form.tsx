"use client";

import { Minus, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { saveBetAction } from "@/lib/actions";

export function BetForm({
  matchId,
  disabled,
  homeScore,
  awayScore,
  stakeAmount,
  returnTo,
}: {
  matchId: string;
  disabled: boolean;
  homeScore?: number;
  awayScore?: number;
  stakeAmount?: number;
  returnTo?: string;
}) {
  const [home, setHome] = useState(homeScore ?? 0);
  const [away, setAway] = useState(awayScore ?? 0);
  const [stake, setStake] = useState(stakeAmount ?? 100);

  if (disabled) {
    return (
      <Link className="primary-button justify-center" href={`/auth?callbackUrl=${encodeURIComponent(returnTo ?? "/")}`}>
        Se connecter pour parier
      </Link>
    );
  }

  return (
    <form action={saveBetAction} className="grid gap-4">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="returnTo" value={returnTo ?? "/#matchs"} />
      <input type="hidden" name="predictedHomeScore" value={home} />
      <input type="hidden" name="predictedAwayScore" value={away} />
      <input type="hidden" name="stakeAmount" value={stake} />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <ScoreControl label="Maison" value={home} onMinus={() => setHome((value) => Math.max(0, value - 1))} onPlus={() => setHome((value) => Math.min(30, value + 1))} />
        <span className="text-3xl font-extrabold text-mint-deep/25">VS</span>
        <ScoreControl label="Exterieur" value={away} onMinus={() => setAway((value) => Math.max(0, value - 1))} onPlus={() => setAway((value) => Math.min(30, value + 1))} />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft/70">Mise</span>
          <span className="text-sm font-extrabold text-mint-deep">{stake} jetons</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 150, 200].map((value) => (
            <button
              key={value}
              className={`active-scale border px-3 py-2 text-sm font-bold ${stake === value ? "border-mint bg-mint text-mint-deep" : "border-surface-high bg-white text-ink-soft"}`}
              type="button"
              onClick={() => setStake(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <button className="primary-button w-full" type="submit">
        <Save size={17} />
        Valider
      </button>
    </form>
  );
}

function ScoreControl({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="grid justify-items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft/70">{label}</span>
      <div className="flex items-center gap-2">
        <button className="active-scale grid size-11 place-items-center bg-surface-container text-mint-deep" type="button" onClick={onMinus} aria-label={`Reduire score ${label}`}>
          <Minus size={17} />
        </button>
        <span className="w-10 text-center text-4xl font-extrabold text-mint-deep">{value}</span>
        <button className="active-scale grid size-11 place-items-center bg-surface-container text-mint-deep" type="button" onClick={onPlus} aria-label={`Augmenter score ${label}`}>
          <Plus size={17} />
        </button>
      </div>
    </div>
  );
}
