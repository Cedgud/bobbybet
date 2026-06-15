"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="icon-link" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut size={16} />
      Sortir
    </button>
  );
}
