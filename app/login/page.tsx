"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, LogIn, User } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(body.error || "Falha ao autenticar.");
        return;
      }

      const safeNext = nextPath.startsWith("/") ? nextPath : "/";
      router.replace(safeNext);
      router.refresh();
    } catch (cause) {
      setError(`Erro de rede: ${(cause as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--mc-border-red)] bg-[var(--mc-primary-soft)] p-8"
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-20 -right-14 h-52 w-52 rounded-full bg-[var(--mc-primary)]/6 blur-[56px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-14 h-52 w-52 rounded-full bg-[var(--mc-primary)]/4 blur-[64px]" />
      {/* Top identity line */}
      <div className="pointer-events-none absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--mc-primary)]/30 to-transparent" />

      {/* Logo + brand */}
      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-[var(--mc-primary)]/8 blur-lg" />
          <Image
            src="/medcof-logo.png"
            alt="MedCof"
            width={56}
            height={56}
            priority
            className="relative h-14 w-14 rounded-xl ring-1 ring-[var(--mc-border-red)]"
          />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black tracking-[-0.025em] text-[var(--mc-text)]">
            Med<span className="mc-gradient-text">Cof</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] mc-text-dim">
            Editor de Editais
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="relative mt-8 space-y-3.5">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
            Usuário
          </span>
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--mc-border-red)] bg-white/70 px-3.5 transition-colors focus-within:border-[var(--mc-primary-border)] focus-within:bg-white/90">
            <User className="h-4 w-4 shrink-0 text-[var(--mc-primary)]" />
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={busy}
              className="mc-focus-ring w-full bg-transparent py-2.5 text-sm text-[var(--mc-text)] outline-none placeholder:mc-text-dim"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest mc-text-muted">
            Senha
          </span>
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--mc-border-red)] bg-white/70 px-3.5 transition-colors focus-within:border-[var(--mc-primary-border)] focus-within:bg-white/90">
            <Lock className="h-4 w-4 shrink-0 text-[var(--mc-primary)]" />
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              className="mc-focus-ring w-full bg-transparent py-2.5 text-sm text-[var(--mc-text)] outline-none"
            />
          </div>
        </label>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mc-btn-primary mc-focus-ring mt-1 inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Autenticando…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Entrar
            </>
          )}
        </button>

        <p className="pt-1 text-center text-[11px] mc-text-dim">
          Ferramenta interna · acesso restrito
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
