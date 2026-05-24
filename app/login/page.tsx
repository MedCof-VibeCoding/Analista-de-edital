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
      className="mc-surface relative w-full max-w-md overflow-hidden rounded-3xl p-8 shadow-[0_30px_80px_-30px_rgba(230,0,38,0.45)]"
    >
      <div className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-[#e60026]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#ff1a3d]/15 blur-3xl" />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <Image
          src="/medcof-logo.png"
          alt="MedCof"
          width={56}
          height={56}
          priority
          className="h-14 w-14 rounded-xl"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Med<span className="mc-gradient-text">Cof</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.18em] mc-text-dim">
            Editor de Editais
          </p>
        </div>
      </div>

      <div className="relative mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider mc-text-muted">
            Usuário
          </span>
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--mc-border-strong)] bg-white/[0.03] px-3">
            <User className="h-4 w-4 text-[#ff4d6d]" />
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={busy}
              className="mc-focus-ring w-full bg-transparent py-2.5 text-sm outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider mc-text-muted">
            Senha
          </span>
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--mc-border-strong)] bg-white/[0.03] px-3">
            <Lock className="h-4 w-4 text-[#ff4d6d]" />
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              className="mc-focus-ring w-full bg-transparent py-2.5 text-sm outline-none"
            />
          </div>
        </label>

        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mc-btn-primary mc-focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
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

        <p className="text-center text-[11px] mc-text-dim">
          Ferramenta interna · acesso restrito
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
