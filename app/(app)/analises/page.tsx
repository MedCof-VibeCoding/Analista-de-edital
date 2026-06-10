"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  FileText,
  Loader2,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { AnalysisListResponse, AnalysisSummary } from "@/lib/types/api";

function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AnalysesPage() {
  const [items, setItems] = useState<AnalysisSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnalyses = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (term.trim()) params.set("search", term.trim());
      const response = await fetch(`/api/analyses?${params.toString()}`);
      const payload = (await response.json()) as AnalysisListResponse | { error: string };
      if (!response.ok || "error" in payload) {
        const message = "error" in payload ? payload.error : "Erro inesperado.";
        toast.error(message);
        return;
      }
      setItems(payload.items);
      setTotal(payload.total);
    } catch (cause) {
      toast.error(`Falha ao carregar análises: ${(cause as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchAnalyses(search), 300);
    return () => clearTimeout(timeout);
  }, [search, fetchAnalyses]);

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("Excluir esta análise permanentemente?")) return;
    setDeletingId(jobId);
    try {
      const response = await fetch(`/api/analyses/${jobId}`, { method: "DELETE" });
      const payload = (await response.json()) as { deleted?: boolean; error?: string };
      if (!response.ok || payload.error) {
        toast.error(payload.error ?? "Erro ao excluir.");
        return;
      }
      setItems((prev) => prev.filter((item) => item.jobId !== jobId));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success("Análise excluída.");
    } catch (cause) {
      toast.error(`Falha ao excluir: ${(cause as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <header className="mb-8 space-y-3">
        <div className="flex">
          <span className="mc-pill">
            <Sparkles className="h-2.5 w-2.5" />
            Análises salvas
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--mc-text)] lg:text-3xl">
          Consulta de análises de editais
        </h1>
        <p className="text-sm mc-text-muted">
          Visualize, edite e gerencie as análises de editais geradas pela IA e salvas no banco de dados.
        </p>
      </header>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 mc-text-dim" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por título ou instituição..."
          className="mc-focus-ring w-full rounded-xl border border-[var(--mc-border)] bg-white/70 dark:bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-[var(--mc-text)] placeholder:mc-text-dim"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 mc-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando análises...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--mc-border)] py-20 text-center mc-text-muted">
          <FileText className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p className="text-sm">
            {search.trim()
              ? "Nenhuma análise encontrada para a busca."
              : "Nenhuma análise salva ainda. Gere uma análise na página inicial."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs mc-text-dim">
            {total} análise{total === 1 ? "" : "s"} encontrada{total === 1 ? "" : "s"}
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.jobId}
                className="mc-glass mc-card-hover group relative flex flex-col gap-3 overflow-hidden p-5"
              >
                <Link href={`/analises/${item.jobId}`} className="flex flex-1 flex-col gap-3">
                  <h2 className="text-sm font-bold leading-snug text-[var(--mc-text)] line-clamp-3">
                    {item.title || "Sem título"}
                  </h2>
                  {item.institutions.length > 0 && (
                    <p className="flex items-start gap-1.5 text-xs mc-text-muted">
                      <Building2 className="mt-0.5 h-3 w-3 shrink-0" />
                      <span className="line-clamp-2">{item.institutions.join(", ")}</span>
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-[10px]">
                    <span className="inline-flex items-center gap-1 mc-text-dim">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="rounded-full bg-[var(--mc-primary-soft)] px-2 py-0.5 font-semibold text-[var(--mc-primary-light)]">
                      {item.providerUsed}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.jobId)}
                  disabled={deletingId === item.jobId}
                  title="Excluir análise"
                  className="mc-focus-ring absolute right-3 top-3 inline-flex items-center justify-center rounded-lg border border-[var(--mc-border)] bg-white/70 dark:bg-white/[0.05] p-1.5 text-red-600 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100 disabled:opacity-60"
                >
                  {deletingId === item.jobId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
