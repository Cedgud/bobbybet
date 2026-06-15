"use client";

import { Camera } from "lucide-react";
import { useActionState } from "react";

import { ActionMessage } from "@/components/action-message";
import { updateProfileAction } from "@/lib/actions";

const initialState = { ok: false, message: "" };

export function ProfileForm({
  pseudo,
  vibe,
}: {
  pseudo: string;
  vibe: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
        Pseudo
        <input className="field" name="pseudo" defaultValue={pseudo} required maxLength={32} />
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
        Phrase d&apos;ambiance
        <textarea className="field min-h-28 resize-none" name="vibe" defaultValue={vibe} maxLength={140} />
      </label>
      <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
        Avatar
        <span className="flex items-center gap-3 border-2 border-dashed border-surface-high bg-surface-low px-4 py-4 text-ink-soft">
          <Camera size={18} />
          <input className="w-full text-sm" name="avatar" type="file" accept="image/png,image/jpeg,image/webp" />
        </span>
      </label>
      <ActionMessage ok={state.ok} message={state.message} />
      <button className="primary-button" type="submit" disabled={pending}>
        Enregistrer
      </button>
    </form>
  );
}
