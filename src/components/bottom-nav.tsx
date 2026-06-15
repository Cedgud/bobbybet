import { Home, Shield, Ticket, UserRound } from "lucide-react";
import Link from "next/link";

export function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <nav className="glass-bar fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] md:hidden">
      <Link className="flex flex-col items-center bg-mint px-5 py-1 text-xs font-bold text-mint-deep" href="/">
        <Home size={20} />
        Home
      </Link>
      <Link className="flex flex-col items-center px-5 py-1 text-xs font-bold text-ink-soft" href="/#matchs">
        <Ticket size={20} />
        Paris
      </Link>
      <Link className="flex flex-col items-center px-5 py-1 text-xs font-bold text-ink-soft" href={isAdmin ? "/admin" : "/account"}>
        {isAdmin ? <Shield size={20} /> : <UserRound size={20} />}
        {isAdmin ? "Admin" : "Profil"}
      </Link>
    </nav>
  );
}
