"use client";

import { LogIn, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";

import { signUpAction } from "@/lib/actions";
import { ActionMessage } from "@/components/action-message";

const initialState = { ok: false, message: "" };

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginMessage, setLoginMessage] = useState("");
  const [state, signUpFormAction, pending] = useActionState(signUpAction, initialState);

  async function handleLogin(formData: FormData) {
    setLoginMessage("");
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });

    if (result?.error) {
      setLoginMessage("Email ou mot de passe incorrect.");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-7">
      <div className="flex border border-slate-200 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex h-10 flex-1 items-center justify-center gap-2 text-sm font-bold transition ${
            mode === "login" ? "border-b-2 border-ink text-ink" : "text-ink-soft"
          }`}
        >
          <LogIn size={16} />
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex h-10 flex-1 items-center justify-center gap-2 text-sm font-bold transition ${
            mode === "signup" ? "border-b-2 border-ink text-ink" : "text-ink-soft"
          }`}
        >
          <UserPlus size={16} />
          Inscription
        </button>
      </div>

      {mode === "login" ? (
        <form action={handleLogin} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Email
            <input className="field" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Mot de passe
            <input className="field" name="password" type="password" autoComplete="current-password" required />
          </label>
          <ActionMessage ok={false} message={loginMessage} />
          <button className="primary-button" type="submit">
            Entrer
          </button>
        </form>
      ) : (
        <form action={signUpFormAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Pseudo
            <input className="field" name="pseudo" autoComplete="nickname" required maxLength={32} />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Email
            <input className="field" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Mot de passe
            <input className="field" name="password" type="password" autoComplete="new-password" required />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Phrase d&apos;ambiance
            <textarea className="field min-h-24 resize-none" name="vibe" maxLength={140} />
          </label>
          <ActionMessage ok={state.ok} message={state.message} />
          <button className="primary-button" type="submit" disabled={pending}>
            Creer mon compte
          </button>
        </form>
      )}
    </div>
  );
}
