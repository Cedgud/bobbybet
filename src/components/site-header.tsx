import { Shield, UserRound, Wallet } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { pseudo: true, vibe: true, avatarUrl: true, role: true },
      })
    : null;
  const pseudo = user?.pseudo ?? session?.user?.name ?? "Invite";
  const vibe = user?.vibe || "Pret(e) pour le score juste";
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
          <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-lavender text-sm font-extrabold text-lavender-deep soft-shadow">
            {user?.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="48px" className="object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">{pseudo}</p>
            <p className="max-w-[170px] truncate text-xs italic text-ink-soft">{vibe}</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <span className="hidden items-center gap-2 bg-mint px-4 py-2 text-xs font-bold text-mint-deep sm:inline-flex">
            <Wallet size={15} />
            1 250 jetons
          </span>
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
