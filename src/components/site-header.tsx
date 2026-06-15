import { Home, Shield, UserRound, Wallet } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureDailyTokenGrant } from "@/lib/wallet";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await ensureDailyTokenGrant(session.user.id);
  }

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { pseudo: true, vibe: true, avatarUrl: true, role: true, walletBalance: true },
      })
    : null;
  const pseudo = user?.pseudo ?? session?.user?.name ?? "Invite";
  const vibe = user?.vibe || "Pret(e) pour le score juste";
  const userColor = userColorClass(pseudo);
  const initials = pseudo
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="glass-bar fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex min-h-20 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href={session?.user ? "/account" : "/auth"} className="flex min-w-0 items-center gap-3">
          <div className={`relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border bg-white text-sm font-extrabold soft-shadow ${userColor}`}>
            {user?.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="48px" className="object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <p className={`truncate text-base font-bold ${userColor}`}>{pseudo}</p>
            <p className="max-w-[170px] truncate text-xs italic text-ink-soft">{vibe}</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="icon-link">
            <Home size={16} />
            Accueil
          </Link>
          {user ? (
            <span className="hidden items-center gap-2 border border-surface-high bg-white px-4 py-2 text-xs font-bold text-ink-soft sm:inline-flex">
              <Wallet size={15} />
              {user.walletBalance} jetons
            </span>
          ) : null}
          {user?.role === "ADMIN" ? (
            <Link href="/admin" className="icon-link hidden sm:inline-flex">
              <Shield size={16} />
              Admin
            </Link>
          ) : null}
          {session?.user ? (
            <>
              <Link href="/account" className="icon-link">
                <UserRound size={16} />
                Profil
              </Link>
              <span className="hidden sm:inline-flex">
                <SignOutButton />
              </span>
            </>
          ) : (
            <Link href="/auth" className="primary-button h-10 px-4">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function userColorClass(seed: string) {
  const classes = [
    "border-sky text-sky-deep",
    "border-peach text-peach-deep",
    "border-coral text-coral-deep",
    "border-lavender text-lavender-deep",
    "border-mint text-mint-deep",
    "border-sky text-aqua-deep",
  ];
  const index = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % classes.length;
  return classes[index];
}
