"use client";

import { FileJson, Upload } from "lucide-react";
import { useActionState } from "react";

import { ActionMessage } from "@/components/action-message";
import { importMatchesAction } from "@/lib/actions";

const initialState = { ok: false, message: "" };

export function AdminImportForm() {
  const [state, formAction, pending] = useActionState(importMatchesAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
        Fichier JSON
        <span className="flex items-center gap-3 border-2 border-dashed border-surface-high bg-surface-low px-4 py-4 text-ink-soft">
          <FileJson size={18} />
          <input className="w-full text-sm" name="matchesFile" type="file" accept="application/json,.json" />
        </span>
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
        Ou contenu JSON
        <textarea
          className="field min-h-56 resize-y font-mono text-xs leading-6"
          name="matchesJson"
          placeholder='[{"competition":"Coupe du Monde 2026","homeTeam":"France","awayTeam":"Bresil","kickoffAt":"2026-06-18T19:00:00Z","group":"Groupe A"}]'
        />
      </label>
      <ActionMessage ok={state.ok} message={state.message} />
      <button className="primary-button" type="submit" disabled={pending}>
        <Upload size={17} />
        Importer
      </button>
    </form>
  );
}
