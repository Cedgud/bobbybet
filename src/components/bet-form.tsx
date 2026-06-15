"use client";

import Link from "next/link";
import { useState } from "react";

import { saveBetAction } from "@/lib/actions";

export function BetForm({
  matchId,
  disabled,
  closed,
  locked,
  homeScore,
  awayScore,
  stakeAmount,
  returnTo,
}: {
  matchId: string;
  disabled: boolean;
  closed?: boolean;
  locked?: boolean;
  homeScore?: number;
  awayScore?: number;
  stakeAmount?: number;
  returnTo?: string;
}) {
  const [stake, setStake] = useState(stakeAmount ?? 100);

  if (locked) {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <ScoreValue value={homeScore ?? 0} />
          <span className="text-3xl font-extrabold text-ink-soft/25">VS</span>
          <ScoreValue value={awayScore ?? 0} />
        </div>
        <div className="flex items-center justify-between border border-surface-high bg-white px-3 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft/70">Pari enregistré</span>
          <span className="text-sm font-extrabold text-ink">{stakeAmount ?? 0} jetons</span>
        </div>
      </div>
    );
  }

  if (closed) {
    return <p className="border border-surface-high bg-white px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Paris fermés</p>;
  }

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
      <input type="hidden" name="stakeAmount" value={stake} />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <ScoreInput ariaLabel="score equipe 1" name="predictedHomeScore" defaultValue={homeScore ?? 0} />
        <span className="text-3xl font-extrabold text-ink-soft/25">VS</span>
        <ScoreInput ariaLabel="score equipe 2" name="predictedAwayScore" defaultValue={awayScore ?? 0} />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft/70">Mise</span>
          <span className="text-sm font-extrabold text-ink">{stake} jetons</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 150, 200].map((value) => (
            <button
              key={value}
              className={`active-scale border bg-white px-3 py-2 text-sm font-bold ${stake === value ? "border-ink text-ink" : "border-surface-high text-ink-soft"}`}
              type="button"
              onClick={() => setStake(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <button className="primary-button bet-submit-button w-full" type="submit">
        Valider
      </button>
    </form>
  );
}

function ScoreValue({ value }: { value: number }) {
  return <div className="h-14 border border-surface-high bg-white text-center text-4xl font-extrabold leading-[3.5rem] text-ink">{value}</div>;
}

function ScoreInput({
  ariaLabel,
  name,
  defaultValue,
}: {
  ariaLabel: string;
  name: string;
  defaultValue: number;
}) {
  return (
    <input
      aria-label={ariaLabel}
      className="score-input h-14 w-full border border-surface-high bg-white text-center text-4xl font-extrabold text-ink"
      defaultValue={defaultValue}
      inputMode="numeric"
      max={30}
      min={0}
      name={name}
      pattern="[0-9]*"
      required
      type="number"
    />
  );
}
