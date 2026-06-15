"use client";

import clsx from "clsx";

export function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={clsx(
        "border px-3 py-2 text-sm",
        ok
          ? "border-surface-high bg-white text-ink"
          : "border-surface-high bg-white text-ink-soft",
      )}
    >
      {message}
    </p>
  );
}
