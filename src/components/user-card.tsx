import Image from "next/image";

type UserCardProps = {
  pseudo: string;
  vibe: string;
  avatarUrl?: string | null;
  compact?: boolean;
};

export function UserCard({ pseudo, vibe, avatarUrl, compact = false }: UserCardProps) {
  const initials = pseudo
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className={compact ? "bg-surface-low px-3 py-3 shadow-none" : "bg-white px-4 py-4 soft-shadow"}>
      <div className="flex items-center gap-3">
        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-peach text-sm font-extrabold text-peach-deep">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill sizes="48px" className="object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-ink">{pseudo}</h3>
          <p className="mt-1 truncate text-xs italic text-ink-soft">{vibe || "Score parfait en vue"}</p>
        </div>
      </div>
      {!compact ? <p className="mt-3 text-sm leading-6 text-ink-soft">{vibe || "Pret(e) a tenter le score parfait."}</p> : null}
    </article>
  );
}
