import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[560px] px-4 pt-28 sm:px-6">
        <section className="surface-card p-5 sm:p-6">
          <div className="mb-7 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">Les paris doux</p>
            <h1 className="mt-3 text-3xl font-extrabold text-ink">Connexion</h1>
          </div>
          <Suspense>
            <AuthForm />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
