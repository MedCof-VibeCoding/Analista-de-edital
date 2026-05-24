"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="mc-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--mc-border-strong)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium mc-text-muted hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      title="Sair"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
      Sair
    </button>
  );
}
